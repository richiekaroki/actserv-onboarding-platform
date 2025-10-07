# ===== backend/forms/views.py =====
from notifications.tasks import notify_admin_new_submission
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response

from .models import Form, Submission
from .permissions import IsAdminUserOrReadOnly
from .serializers import FormSerializer, SubmissionSerializer


class FormViewSet(viewsets.ModelViewSet):
    queryset = Form.objects.all()
    serializer_class = FormSerializer
    lookup_field = "slug"
    permission_classes = [IsAdminUserOrReadOnly]

    def create(self, request, *args, **kwargs):
        print("=== FORM CREATION REQUEST ===")
        print("Request data:", request.data)
        print("User:", request.user)
        print("=============================")
        return super().create(request, *args, **kwargs)


class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer

    def get_permissions(self):
        """
        Public can submit forms, but only admin users can view/modify submissions
        """
        if self.action == "create":
            return [AllowAny()]
        return [IsAdminUser()]

    def create(self, request, *args, **kwargs):
        print("=== SUBMISSION CREATE REQUEST ===")
        print("Request data:", request.data)
        print("User:", request.user if request.user.is_authenticated else "Anonymous")
        print("=================================")

        try:
            response = super().create(request, *args, **kwargs)
            print("=== SUBMISSION CREATED SUCCESSFULLY ===")
            return response
        except Exception as e:
            print("=== SUBMISSION CREATION FAILED ===")
            print("Error:", str(e))
            print("=================================")
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_create(self, serializer):
        submission = serializer.save()
        print(f"=== SUBMISSION SAVED: {submission.id} ===")

        # Trigger async notification
        try:
            notify_admin_new_submission.delay(str(submission.id))
            print("=== NOTIFICATION TASK TRIGGERED ===")
        except Exception as e:
            print(f"=== NOTIFICATION TASK FAILED: {e} ===")
