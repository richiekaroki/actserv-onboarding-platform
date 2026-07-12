# ===== backend/forms/models.py =====
import uuid

from django.conf import settings
from django.db import models


class SoftDeleteManager(models.Manager):
    """Manager that excludes soft-deleted records by default."""
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)


class Form(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(blank=True)
    schema = models.JSONField()
    schema_version = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Explicit -> str annotation tells Pyrefly this returns str at runtime,
    # not the CharField descriptor it sees from the class body.
    def __str__(self) -> str:
        return str(self.name)

    class Meta:
        ordering = ['-created_at']


class Field(models.Model):
    FIELD_TYPES = [
        ('text',     'Text'),
        ('email',    'Email'),
        ('phone',    'Phone'),
        ('number',   'Number'),
        ('currency', 'Currency'),
        ('date',     'Date'),
        ('textarea', 'Text Area'),
        ('dropdown', 'Dropdown'),
        ('checkbox', 'Checkbox'),
        ('file',     'File Upload'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    form = models.ForeignKey(Form, related_name='fields', on_delete=models.CASCADE)
    key = models.CharField(max_length=150)
    label = models.CharField(max_length=250)
    field_type = models.CharField(max_length=50, choices=FIELD_TYPES)
    options = models.JSONField(blank=True, null=True)
    required = models.BooleanField(default=False)
    validation = models.JSONField(blank=True, null=True)
    order = models.IntegerField(default=0)
    placeholder = models.CharField(max_length=255, blank=True)
    help_text = models.CharField(max_length=500, blank=True)

    def __str__(self) -> str:
        return f'{self.form.name} - {self.label}'

    class Meta:
        unique_together = ('form', 'key')
        ordering = ['order']


class Submission(models.Model):
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('reviewed',  'Reviewed'),
        ('approved',  'Approved'),
        ('rejected',  'Rejected'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    form = models.ForeignKey(
        Form, related_name='submissions', on_delete=models.PROTECT
    )
    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='submissions',
    )
    client_identifier = models.CharField(max_length=200, blank=True, null=True)
    schema_version = models.IntegerField()
    responses = models.JSONField()
    status = models.CharField(
        max_length=50, choices=STATUS_CHOICES, default='submitted', db_index=True
    )
    is_deleted = models.BooleanField(default=False, db_index=True)
    deleted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    def soft_delete(self):
        from django.utils.timezone import now
        self.is_deleted = True
        self.deleted_at = now()
        self.save(update_fields=['is_deleted', 'deleted_at', 'updated_at'])

    def __str__(self) -> str:
        return f'Submission {self.id} for {self.form.name}'

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['form', 'status']),
            models.Index(fields=['submitted_by', 'created_at']),
        ]


class FileUpload(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(
        Submission, related_name='files', on_delete=models.CASCADE
    )
    field_key = models.CharField(max_length=150)
    file = models.FileField(upload_to='uploads/%Y/%m/%d/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
    original_filename = models.CharField(max_length=255, blank=True)
    content_type = models.CharField(max_length=100, blank=True)
    file_size = models.PositiveIntegerField(null=True, blank=True)
    meta = models.JSONField(blank=True, null=True)

    def __str__(self) -> str:
        return f'File for {self.submission.id} ({self.field_key})'

    class Meta:
        ordering = ['-uploaded_at']