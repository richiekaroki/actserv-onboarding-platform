# backend/notifications/serializers.py
from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:  # pyrefly: ignore[bad-override]
        model = Notification
        fields = [
            'id', 'user', 'type', 'title', 'message',
            'related_submission', 'is_read', 'created_at',
        ]
        read_only_fields = (
            'id', 'user', 'type', 'title', 'message',
            'related_submission', 'created_at',
        )