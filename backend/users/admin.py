# backend/users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'first_name', 'last_name',
                    'is_staff', 'department')
    list_filter = ('is_staff', 'is_superuser', 'department')
    search_fields = ('email', 'first_name', 'last_name', 'employee_id')

    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('phone', 'department', 'employee_id', 'role')
        }),
    )
