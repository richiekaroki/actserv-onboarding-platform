# backend/users/admin.py
from typing import cast

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser

# UserAdmin.fieldsets is a tuple; cast tells type checker it's a tuple
_base_fieldsets = cast(tuple, UserAdmin.fieldsets or ())

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'is_staff', 'department')
    list_filter = ('is_staff', 'is_superuser', 'role', 'department')
    search_fields = ('email', 'first_name', 'last_name', 'employee_id')

    fieldsets = _base_fieldsets + (
        ('Mr.Wam Profile', {
            'fields': ('role', 'phone', 'department', 'employee_id')
        }),
    )