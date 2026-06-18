# backend/users/views.py
import logging
from typing import Any

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password, ValidationError
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from .serializers import UserSerializer

logger = logging.getLogger(__name__)

# get_user_model() returns our CustomUser at runtime. We assign it here
# so the type checker also sees it as CustomUser, not the generic Manager.
from users.models import CustomUser
User = CustomUser


class _RegisterSerializer:
    """Inline validation — avoids importing DRF serializers at module level
    just for one endpoint."""
    pass


@api_view(['POST'])
@permission_classes([AllowAny])
def register_client(request: Request) -> Response:
    """
    POST /api/auth/register/
    Register a new client account.
    Body: { email, password, first_name?, last_name? }
    """
    data: dict[str, Any] = request.data  # type: ignore[assignment]

    email: str = data.get('email', '').strip().lower()
    password: str = data.get('password', '')
    first_name: str = data.get('first_name', '')
    last_name: str = data.get('last_name', '')

    # Validate required fields
    errors: dict[str, str] = {}
    if not email:
        errors['email'] = 'Email is required.'
    if not password:
        errors['password'] = 'Password is required.'
    else:
        try:
            # Leverage Django's built‑in validators (including common password list)
            validate_password(password)
        except ValidationError as ve:
            errors['password'] = '; '.join(ve.messages)

    if not errors and User.objects.filter(email=email).exists():
        errors['email'] = 'A user with this email already exists.'

    if errors:
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(  # type: ignore[union-attr]
        username=email,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        role='client',
    )
    logger.info('New client registered: %s', user.email)

    return Response(
        {'message': 'Registration successful.', 'user': UserSerializer(user).data},
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request: Request) -> Response:
    """
    GET /api/auth/me/
    Returns the profile of the currently authenticated user.
    """
    return Response(UserSerializer(request.user).data)