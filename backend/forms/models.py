# ==== backend/forms/models.py =====
import uuid

from django.db import models


# Models for dynamic forms and submissions
class Form(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    schema = models.JSONField()  # Django 3.1+ built-in JSONField works with SQLite
    schema_version = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['-created_at']


# Model for individual form fields
class Field(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    form = models.ForeignKey(
        Form, related_name="fields", on_delete=models.CASCADE)
    key = models.CharField(max_length=150)
    label = models.CharField(max_length=250)
    # text, number, date, dropdown, checkbox, file
    field_type = models.CharField(max_length=50)
    options = models.JSONField(blank=True, null=True)
    required = models.BooleanField(default=False)
    validation = models.JSONField(blank=True, null=True)
    order = models.IntegerField(default=0)

    class Meta:
        unique_together = ("form", "key")
        ordering = ["order"]

    def __str__(self):
        return f"{self.form.name} - {self.label}"

# Model for form submissions


class Submission(models.Model):
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('reviewed', 'Reviewed'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    form = models.ForeignKey(
        Form, related_name="submissions", on_delete=models.PROTECT)
    client_identifier = models.CharField(max_length=200, blank=True, null=True)
    schema_version = models.IntegerField()
    responses = models.JSONField()
    status = models.CharField(
        max_length=50, choices=STATUS_CHOICES, default="submitted")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Submission {self.id} for {self.form.name}"

    class Meta:
        ordering = ['-created_at']

# Model for file uploads associated with submissions


class FileUpload(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(
        Submission, related_name="files", on_delete=models.CASCADE)
    field_key = models.CharField(max_length=150)
    file = models.FileField(upload_to="uploads/%Y/%m/%d/")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    meta = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"File for {self.submission.id} ({self.field_key})"

    class Meta:
        ordering = ['-uploaded_at']
