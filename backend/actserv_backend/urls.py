# ===== backend/actserv_backend/urls.py =====
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from rest_framework_simplejwt.views import (TokenObtainPairView,
                                            TokenRefreshView)


# Simple health check endpoint
def health_check(request):
    return JsonResponse({
        "status": "ok",
        "message": "Welcome to ActServ API",
        "available_endpoints": ["/api/forms/", "/api/submissions/", "/admin/"]
    })


# URL patterns
urlpatterns = [
    path("", health_check, name="health_check"),
    path("admin/", admin.site.urls),
    path("api/", include("forms.urls")),
    path("api/auth/login/", TokenObtainPairView.as_view(),
         name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/", include("notifications.urls")),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)
