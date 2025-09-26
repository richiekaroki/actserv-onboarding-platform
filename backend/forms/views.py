# ===== backend/forms/views.py =====
from notifications.tasks import notify_admin_new_submission
from rest_framework import viewsets

from .models import Form, Submission
from .serializers import FormSerializer, SubmissionSerializer


# ViewSets define the view behavior.
class FormViewSet(viewsets.ModelViewSet):
    queryset = Form.objects.all()
    serializer_class = FormSerializer
    lookup_field = "slug"

# ViewSet for handling form submissions


class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer

    def perform_create(self, serializer):
        submission = serializer.save()
        # Trigger async notification
        notify_admin_new_submission.delay(str(submission.id))
