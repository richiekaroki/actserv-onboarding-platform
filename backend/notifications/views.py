# backend/notifications/views.py
import logging

from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer

logger = logging.getLogger(__name__)


class NotificationListView(generics.ListAPIView):
    """
    GET /api/notifications/
    Returns all notifications for the authenticated user,
    most recent first.

    Notifications are created exclusively by Celery tasks —
    clients cannot POST to this endpoint.
    """
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


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_read(request):
    """
    POST /api/notifications/mark-all-read/
    Marks every unread notification for the current user as read.
    Returns the count of records updated.
    """
    updated = (
        Notification.objects
        .filter(user=request.user, is_read=False)
        .update(is_read=True)
    )
    logger.info("User %s marked %d notifications as read", request.user, updated)
    return Response({"marked_read": updated}, status=status.HTTP_200_OK)