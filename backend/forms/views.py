# ===== backend/forms/views.py =====
import logging
from typing import cast

from notifications.tasks import notify_admin_new_submission
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny, IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiTypes

from .models import Field, FileUpload, Form, Submission
from .permissions import IsAdminUserOrReadOnly
from .serializers import (
    FieldSerializer,
    FileUploadSerializer,
    FormSerializer,
    SubmissionSerializer,
)

logger = logging.getLogger(__name__)


class FormViewSet(viewsets.ModelViewSet):
    # Disable throttling for public read endpoints
    throttle_classes = []

    # Gracefully handle protected deletion (forms with submissions)
    def destroy(self, request, *args, **kwargs):
        from django.db.models import ProtectedError

        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response({'detail': 'Cannot delete form with existing submissions.'}, status=status.HTTP_400_BAD_REQUEST)
    serializer_class = FormSerializer
    lookup_field = 'slug'
    permission_classes = [IsAdminUserOrReadOnly]

    def get_queryset(self):
        qs = Form.objects.prefetch_related('fields')
        # request.user is typed as AbstractBaseUser by django-stubs, which lacks
        # is_staff. We import CustomUser for the cast so Pyrefly resolves it correctly.
        from users.models import CustomUser
        user = cast(CustomUser | None, self.request.user if self.request.user.is_authenticated else None)
        if not (user and user.is_staff):
            qs = qs.filter(is_active=True)
        return qs

    def perform_create(self, serializer):
        form = serializer.save()
        logger.info('Form created: %s (slug=%s) by %s', form.name, form.slug, self.request.user)


@extend_schema(parameters=[OpenApiParameter(name='form_slug', type=OpenApiTypes.STR, location=OpenApiParameter.PATH, description='Slug of the parent Form')])
class FieldViewSet(viewsets.ModelViewSet):
    serializer_class = FieldSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return Field.objects.filter(form__slug=self.kwargs['form_slug'])

    def perform_create(self, serializer):
        form = Form.objects.get(slug=self.kwargs['form_slug'])
        serializer.save(form=form)


class SubmissionViewSet(viewsets.ModelViewSet):
    serializer_class = SubmissionSerializer

    def get_queryset(self):
        return (
            Submission.objects
            .select_related('form', 'submitted_by')
            .prefetch_related('files')
        )

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        if self.action == 'upload_file':
            return [IsAuthenticated()]
        return [IsAdminUser()]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        submission = serializer.save(submitted_by=user)

        logger.info(
            'Submission %s created for form "%s" by %s',
            submission.id, submission.form.name, user or 'anonymous',
        )

        try:
            notify_admin_new_submission.delay(str(submission.id))
        except Exception:
            logger.exception('Failed to queue notification for submission %s', submission.id)

    @action(detail=True, methods=['post'], url_path='upload',
            parser_classes=[MultiPartParser, FormParser])
    def upload_file(self, request, pk=None):
        submission = self.get_object()
        files = request.FILES.getlist('file')
        field_key = request.data.get('field_key', '')

        if not files:
            return Response({'detail': 'No files provided.'}, status=status.HTTP_400_BAD_REQUEST)
        if not field_key:
            return Response({'detail': 'field_key is required.'}, status=status.HTTP_400_BAD_REQUEST)

        created = []
        for f in files:
            fu = FileUpload.objects.create(
                submission=submission, field_key=field_key, file=f,
                original_filename=f.name, content_type=f.content_type or '', file_size=f.size,
            )
            created.append(FileUploadSerializer(fu).data)

        logger.info('%d file(s) uploaded to submission %s (field=%s)', len(created), submission.id, field_key)
        return Response(created, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], url_path='status', permission_classes=[IsAdminUser])
    def update_status(self, request, pk=None):
        submission = self.get_object()
        new_status = request.data.get('status')
        valid = [s[0] for s in Submission.STATUS_CHOICES]
        if new_status not in valid:
            return Response({'detail': f'Invalid status. Choose from: {valid}'}, status=status.HTTP_400_BAD_REQUEST)
        submission.status = new_status
        submission.save(update_fields=['status', 'updated_at'])
        logger.info('Submission %s status → "%s" by %s', submission.id, new_status, request.user)
        return Response(SubmissionSerializer(submission).data)