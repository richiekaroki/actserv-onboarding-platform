# backend/forms/views.py

from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from .models import Form, Submission
from .serializers import (FormCreateSerializer, FormSerializer,
                          SubmissionCreateSerializer,
                          SubmissionDetailSerializer)


# ViewSets for Forms and Submissions
class FormViewSet(viewsets.ModelViewSet):
    queryset = Form.objects.filter(is_active=True)
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return FormCreateSerializer
        return FormSerializer

    def get_queryset(self):
        if self.action in ('list', 'retrieve'):
            # Public endpoint - only show active forms
            return Form.objects.filter(is_active=True)
        # Admin endpoints - show all forms
        return Form.objects.all()

    @action(detail=True, methods=['get'], url_path='submissions')
    def submissions(self, request, slug=None):
        """Get all submissions for a specific form"""
        form = self.get_object()
        submissions = form.submissions.all()
        serializer = SubmissionDetailSerializer(
            submissions, many=True, context={'request': request})
        return Response(serializer.data)


class SubmissionViewSet(viewsets.ModelViewSet):
    queryset = Submission.objects.select_related(
        'form').prefetch_related('files').all()
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_class(self):
        if self.action == 'create':
            return SubmissionCreateSerializer
        return SubmissionDetailSerializer

    def create(self, request, *args, **kwargs):
        """Handle multipart form submission with files"""
        # Extract form from request data
        form_identifier = request.data.get('form')
        if not form_identifier:
            return Response(
                {"error": "Form identifier is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get form by ID or slug
        try:
            if form_identifier.count('-') == 4:  # UUID format
                form = Form.objects.get(id=form_identifier, is_active=True)
            else:  # slug format
                form = Form.objects.get(slug=form_identifier, is_active=True)
        except Form.DoesNotExist:
            return Response(
                {"error": "Form not found or inactive"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Parse responses JSON
        responses_json = request.data.get('responses', '{}')
        if isinstance(responses_json, str):
            import json
            try:
                responses = json.loads(responses_json)
            except json.JSONDecodeError:
                return Response(
                    {"error": "Invalid responses JSON"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            responses = responses_json

        # Extract files and create file field mapping
        files = []
        file_field_map = {}

        # Handle files with field key naming convention: file__{field_key}
        for key, file_obj in request.FILES.items():
            if key.startswith('file__'):
                field_key = key[6:]  # Remove 'file__' prefix
                file_field_map[str(len(files))] = field_key
                files.append(file_obj)

        # Handle explicit file field map if provided
        explicit_map = request.data.get('file_field_map')
        if explicit_map:
            if isinstance(explicit_map, str):
                import json
                try:
                    file_field_map.update(json.loads(explicit_map))
                except json.JSONDecodeError:
                    pass

        # Prepare data for serializer
        submission_data = {
            'form': form.id,
            'client_identifier': request.data.get('client_identifier', ''),
            'responses': responses,
            'files': files,
            'file_field_map': file_field_map
        }

        serializer = self.get_serializer(data=submission_data)
        serializer.is_valid(raise_exception=True)
        submission = serializer.save()

        # Trigger async notification (import here to avoid circular imports)
        try:
            from notifications.tasks import notify_admin_new_submission
            notify_admin_new_submission.delay(str(submission.id))
        except ImportError:
            # Celery task not available yet - skip for now
            pass

        # Return detailed response
        response_serializer = SubmissionDetailSerializer(
            submission,
            context={'request': request}
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
