# ===== backend/forms/urls.py =====

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import FormViewSet, SubmissionViewSet

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'forms', FormViewSet, basename='form')
router.register(r'submissions', SubmissionViewSet, basename='submission')

urlpatterns = [
    path('', include(router.urls)),
]
