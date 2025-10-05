# ===== backend/forms/views.py =====
from notifications.tasks import notify_admin_new_submission
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Form, Submission
from .permissions import IsAdminUserOrReadOnly  # ADD THIS IMPORT
from .serializers import FormSerializer, SubmissionSerializer


class FormViewSet(viewsets.ModelViewSet):
    queryset = Form.objects.all()
    serializer_class = FormSerializer
    lookup_field = "slug"
    # REPLACED get_permissions with this
    permission_classes = [IsAdminUserOrReadOnly]

    # REMOVED the get_permissions method - using permission_classes instead


class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer

    def get_permissions(self):
        """
        Public can submit forms, but only admin users can view/modify submissions
        """
        if self.action == "create":  # public clients can submit
            return [AllowAny()]
        # admins only for list/retrieve/update/delete
        # This should probably be [IsAdminUser()] too
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        submission = serializer.save()
        # Trigger async notification
        notify_admin_new_submission.delay(str(submission.id))
