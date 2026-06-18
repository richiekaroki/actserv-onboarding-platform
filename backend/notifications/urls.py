# backend/notifications/urls.py
from django.urls import path

from . import views

urlpatterns = [
    path('notifications/',
         views.NotificationListView.as_view(),
         name='notification-list'),

    path('notifications/mark-all-read/',
         views.mark_all_read,
         name='notification-mark-all-read'),

    path('notifications/<uuid:pk>/',
         views.NotificationDetailView.as_view(),
         name='notification-detail'),
]