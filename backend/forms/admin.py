# ===== backend/forms/admin.py =====
from django.contrib import admin

from .models import Field, FileUpload, Form, Submission


@admin.register(Form)
class FormAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "created_at", "updated_at")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    list_filter = ("is_active", "created_at")


@admin.register(Field)
class FieldAdmin(admin.ModelAdmin):
    list_display = ("label", "key", "field_type", "form", "required", "order")
    search_fields = ("label", "key", "form__name")
    list_filter = ("field_type", "required")
    ordering = ("form", "order")


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ("id", "form", "client_identifier", "status", "created_at")
    search_fields = ("id", "client_identifier", "form__name")
    list_filter = ("status", "created_at")
    readonly_fields = ("created_at",)


@admin.register(FileUpload)
class FileUploadAdmin(admin.ModelAdmin):
    list_display = ("submission", "field_key", "file", "uploaded_at")
    search_fields = ("field_key", "submission__id")
    list_filter = ("uploaded_at",)
    readonly_fields = ("uploaded_at",)