# ===== backend/forms/urls.py =====

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

# Import viewsets
from .views import FormViewSet, SubmissionViewSet

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'forms', FormViewSet, basename='form')
router.register(r'submissions', SubmissionViewSet, basename='submission')

urlpatterns = [
    path('', include(router.urls)),
]

# backend/actserv_backend/urls.py (main project URLs)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('forms.urls')),
    # Add more app URLs here as needed
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
