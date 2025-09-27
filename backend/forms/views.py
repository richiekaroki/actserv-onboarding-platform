# ===== backend/forms/views.py =====
from notifications.tasks import notify_admin_new_submission
from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated

from .models import Form, Submission
from .serializers import FormSerializer, SubmissionSerializer


class FormViewSet(viewsets.ModelViewSet):
    queryset = Form.objects.all()
    serializer_class = FormSerializer
    lookup_field = "slug"

    def get_permissions(self):
        """
        Public can view forms, but only authenticated users can modify
        """
        if self.action in ["list", "retrieve"]:  # public endpoints
            return [AllowAny()]
        return [IsAuthenticated()]  # create/update/delete requires auth


class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer

    def get_permissions(self):
        """
        Public can submit forms, but only authenticated users can view/modify submissions
        """
        if self.action == "create":  # public clients can submit
            return [AllowAny()]
        # admins only for list/retrieve/update/delete
        return [IsAuthenticated()]

    def perform_create(self, serializer):
        submission = serializer.save()
        # Trigger async notification
        notify_admin_new_submission.delay(str(submission.id))
