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

from .serializers import UserSerializer, RegisterClientSerializer

logger = logging.getLogger(__name__)

# get_user_model() returns our CustomUser at runtime. We assign it here
# so the type checker also sees it as CustomUser, not the generic Manager.
from users.models import CustomUser
User = CustomUser


class _RegisterSerializer:
    """Inline validation — avoids importing DRF serializers at module level
    just for one endpoint."""
    pass


from rest_framework.decorators import throttle_classes

from drf_spectacular.utils import extend_schema, OpenApiResponse
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView

@extend_schema(request=RegisterClientSerializer, responses=UserSerializer)
class RegisterClientView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = []

    def post(self, request: Request) -> Response:
        serializer = RegisterClientSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        logger.info('New client registered: %s', user.email)
        return Response(
            {'message': 'Registration successful.', 'user': UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )

@extend_schema(responses=UserSerializer)
class MeView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user