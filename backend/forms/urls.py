# ===== backend/forms/urls.py =====
from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import FieldViewSet, FormViewSet, SubmissionViewSet

router = DefaultRouter()
router.register(r'forms', FormViewSet, basename='form')
router.register(r'submissions', SubmissionViewSet, basename='submission')

# Nested: /api/forms/<form_slug>/fields/
# Allows admin to add/edit/remove fields on a specific form via the API
# without going through the Django admin UI
field_router = DefaultRouter()
field_router.register(r'fields', FieldViewSet, basename='form-field')

urlpatterns = [
    path('', include(router.urls)),
    path('forms/<slug:form_slug>/', include(field_router.urls)),
]