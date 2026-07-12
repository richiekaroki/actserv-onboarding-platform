# backend/users/views.py
import logging

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from .serializers import UserSerializer, RegisterClientSerializer

logger = logging.getLogger(__name__)

from users.models import CustomUser

from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from drf_spectacular.utils import extend_schema


@extend_schema(request=RegisterClientSerializer, responses=UserSerializer)
@method_decorator(csrf_exempt, name='dispatch')
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