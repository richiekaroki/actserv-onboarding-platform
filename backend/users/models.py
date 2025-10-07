# backend/users/models.py
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('client', 'Client'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=100, blank=True)
    employee_id = models.CharField(max_length=50, blank=True, unique=True, null=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='client')
    
    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"
    
    def is_admin(self):
        return self.role == 'admin' or self.is_staff
    
    def is_client(self):
        return self.role == 'client'