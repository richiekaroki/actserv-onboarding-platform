# backend/users/serializers.py
from typing import Any

from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import CustomUser


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user: CustomUser):  # type: ignore[override]
        token = super().get_token(user)
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['role'] = user.role
        token['is_staff'] = user.is_staff
        return token

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        data: dict[str, Any] = super().validate(attrs)
        # self.user is always set by super().validate() before we get here,
        # but djangorestframework-stubs types it as AbstractBaseUser | None.
        # We cast to our CustomUser so Pyrefly sees the right attributes.
        user: CustomUser = self.user  # type: ignore[assignment]
        data['user'] = {
            'id': str(user.id),
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'is_staff': user.is_staff,
        }
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:  # pyrefly: ignore[bad-override]
        model = CustomUser
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'role', 'phone', 'department', 'employee_id', 'is_staff',
        ]
        read_only_fields = fields