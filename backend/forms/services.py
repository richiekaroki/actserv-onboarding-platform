# backend/forms/services.py
"""
Service layer for forms app business logic.
Extracted from views/serializers for testability and separation of concerns.
"""
import logging

from django.db import transaction

from .models import Form, Submission

logger = logging.getLogger(__name__)


def create_submission(*, form: Form, responses: dict, submitted_by=None, client_identifier: str = '') -> Submission:
    """Create a submission with schema version snapshot and trigger notifications."""
    from notifications.tasks import notify_admin_new_submission

    with transaction.atomic():
        submission = Submission.objects.create(
            form=form,
            responses=responses,
            submitted_by=submitted_by,
            client_identifier=client_identifier,
            schema_version=form.schema_version,
        )

    logger.info(
        'Submission %s created for form "%s" by %s',
        submission.id, form.name, submitted_by or 'anonymous',
    )

    try:
        notify_admin_new_submission.delay(str(submission.id))
    except Exception:
        logger.exception('Failed to queue notification for submission %s', submission.id)

    return submission


def update_submission_status(*, submission: Submission, new_status: str) -> Submission:
    """Update submission status with validation and audit logging."""
    valid_statuses = [s[0] for s in Submission.STATUS_CHOICES]
    if new_status not in valid_statuses:
        raise ValueError(f'Invalid status. Choose from: {valid_statuses}')

    old_status = submission.status
    submission.status = new_status
    submission.save(update_fields=['status', 'updated_at'])

    logger.info(
        'Submission %s status changed: %s -> %s',
        submission.id, old_status, new_status,
    )
    return submission
