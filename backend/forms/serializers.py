# ===== backend/forms/serializers.py =====
from rest_framework import serializers

from .models import Field, FileUpload, Form, Submission


# Serializers define the API representation.
class FieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = Field
        fields = "__all__"
        read_only_fields = ("id",)

# Serializer for Form model with nested fields


class FormSerializer(serializers.ModelSerializer):
    fields = FieldSerializer(many=True, read_only=True)

    class Meta:
        model = Form
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")

# Serializer for FileUpload model


class FileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileUpload
        fields = "__all__"
        read_only_fields = ("id", "uploaded_at")

# Serializer for Submission model with nested file uploads


class SubmissionSerializer(serializers.ModelSerializer):
    files = FileUploadSerializer(many=True, read_only=True)

    class Meta:
        model = Submission
        fields = "__all__"
        read_only_fields = ("id", "created_at")
