# ===== backend/forms/serializers.py =====
from rest_framework import serializers

from .models import Field, FileUpload, Form, Submission


class FieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = Field
        fields = "__all__"
        read_only_fields = ("id",)


class FormSerializer(serializers.ModelSerializer):
    fields = FieldSerializer(many=True, read_only=True)
    submission_count = serializers.SerializerMethodField()

    class Meta:
        model = Form
        fields = "__all__"
        read_only_fields = ("id", "created_at", "updated_at")

    def get_submission_count(self, obj):
        return obj.submissions.count()


class FileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileUpload
        fields = "__all__"
        read_only_fields = ("id", "uploaded_at")


class SubmissionSerializer(serializers.ModelSerializer):
    files = FileUploadSerializer(many=True, read_only=True)

    class Meta:
        model = Submission
        fields = "__all__"
        read_only_fields = ("id", "created_at")