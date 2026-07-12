# backend/users/models.py
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('admin',  'Admin'),
        ('client', 'Client'),
    ]

    # Pyrefly reports bad-override here because AbstractUser.id is typed as int
    # in django-stubs, but UUID primary keys are a standard Django pattern.
    # This is a stub limitation — the code is correct.
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)  # pyrefly: ignore[bad-override]

    phone       = models.CharField(max_length=20,  blank=True)
    department  = models.CharField(max_length=100, blank=True)
    employee_id = models.CharField(max_length=50,  blank=True, unique=True, null=True)
    role        = models.CharField(max_length=20,  choices=ROLE_CHOICES, default='client')

    def __str__(self) -> str:
        return f"{self.email} ({self.get_role_display()})"