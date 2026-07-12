# backend/notifications/views.py
import logging

from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer, MarkAllReadResponseSerializer

logger = logging.getLogger(__name__)


class NotificationListView(generics.ListAPIView):
    """
    GET /api/notifications/
    Returns all notifications for the authenticated user,
    most recent first.

    Notifications are created exclusively by Celery tasks —
    clients cannot POST to this endpoint.
    """
    # Return plain list without pagination for API consistency
    pagination_class = None
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            Notification.objects
            .filter(user=self.request.user)
            .select_related('related_submission')
        )


class NotificationDetailView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/notifications/<uuid>/   — retrieve one notification
    PATCH /api/notifications/<uuid>/  — mark as read ({ "is_read": true })

    Only the owning user can access their own notifications.
    DELETE is intentionally disabled — notifications are a log.
    """
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


from drf_spectacular.utils import extend_schema
from rest_framework.views import APIView

@extend_schema(responses=MarkAllReadResponseSerializer)
class MarkAllReadView(APIView):
    serializer_class = MarkAllReadResponseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        updated = (
            Notification.objects
            .filter(user=request.user, is_read=False)
            .update(is_read=True)
        )
        logger.info("User %s marked %d notifications as read", request.user, updated)
        return Response({"marked_read": updated}, status=status.HTTP_200_OK)