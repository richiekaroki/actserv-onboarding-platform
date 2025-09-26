# backend/forms/serializers.py
import jsonschema
from rest_framework import serializers

from .models import Field, FileUpload, Form, Submission


# Helper function to format responses for email
class FieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = Field
        fields = "__all__"


class FormSerializer(serializers.ModelSerializer):
    fields = FieldSerializer(many=True, read_only=True)

    class Meta:
        model = Form
        fields = [
            "id", "name", "slug", "description", "schema",
            "schema_version", "is_active", "created_at",
            "updated_at", "fields"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class FormCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Form
        fields = [
            "name", "slug", "description", "schema",
            "is_active"
        ]

    def create(self, validated_data):
        # Auto-increment schema_version for new forms
        validated_data['schema_version'] = 1
        return super().create(validated_data)

# Serializer for file uploads associated with submissions


class FileUploadSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()

    class Meta:
        model = FileUpload
        fields = ["id", "field_key", "file", "url", "uploaded_at", "meta"]
        read_only_fields = ["id", "uploaded_at"]

    def get_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None

# Serializer for creating submissions with file handling


class SubmissionCreateSerializer(serializers.ModelSerializer):
    # Handle files from multipart form data
    files = serializers.ListField(
        child=serializers.FileField(),
        write_only=True,
        required=False
    )
    # Handle file field mapping
    file_field_map = serializers.JSONField(
        write_only=True,
        required=False,
        help_text="Maps file indices to field keys: {'0': 'id_proof', '1': 'income_proof'}"
    )

    class Meta:
        model = Submission
        fields = [
            "id", "form", "client_identifier", "schema_version",
            "responses", "files", "file_field_map", "created_at"
        ]
        read_only_fields = ["id", "created_at"]

    def validate(self, data):
        # Validate responses against form's JSON schema
        form = data.get("form")
        if not form:
            raise serializers.ValidationError("Form is required")

        responses = data.get("responses", {})

        # Get validation schema from form
        form_schema = form.schema
        validation_schema = form_schema.get(
            "validation_schema") if form_schema else None

        if validation_schema:
            try:
                jsonschema.validate(instance=responses,
                                    schema=validation_schema)
            except jsonschema.ValidationError as e:
                raise serializers.ValidationError({
                    "responses": f"Schema validation error: {e.message}"
                })

        # Set schema version from form if not provided
        if not data.get("schema_version"):
            data["schema_version"] = form.schema_version

        return data

    def create(self, validated_data):
        files = validated_data.pop("files", [])
        file_field_map = validated_data.pop("file_field_map", {})

        # Create submission
        submission = Submission.objects.create(**validated_data)

        # Handle file uploads
        for idx, file_obj in enumerate(files):
            # Determine field key from mapping or use index
            field_key = file_field_map.get(str(idx), f"file_{idx}")

            FileUpload.objects.create(
                submission=submission,
                field_key=field_key,
                file=file_obj,
                meta={
                    "original_name": file_obj.name,
                    "size": file_obj.size,
                    "content_type": getattr(file_obj, 'content_type', 'unknown')
                }
            )

        return submission

# Serializer for detailed submission view with nested files


class SubmissionDetailSerializer(serializers.ModelSerializer):
    files = FileUploadSerializer(many=True, read_only=True)
    form_name = serializers.CharField(source='form.name', read_only=True)

    class Meta:
        model = Submission
        fields = [
            "id", "form", "form_name", "client_identifier",
            "schema_version", "responses", "status", "files",
            "created_at"
        ]
