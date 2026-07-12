# ===== backend/notifications/tasks.py =====
import logging

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail
from django.utils.timezone import now

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def notify_admin_new_submission(self, submission_id: str) -> str:
    try:
        from django.contrib.auth import get_user_model
        from forms.models import Submission
        from .models import Notification

        User = get_user_model()

        try:
            submission = Submission.objects.select_related('form').get(id=submission_id)
        except Submission.DoesNotExist:
            logger.warning("Submission %s not found — skipping notification", submission_id)
            return f"Submission {submission_id} not found"

        form = submission.form
        # submission.files is a reverse RelatedManager added by FileUpload(ForeignKey).
        # django-stubs doesn't model reverse accessors — the ignore below is correct.
        file_count = submission.files.count()  # pyrefly: ignore[missing-attribute]

        admin_users = User.objects.filter(is_staff=True)
        notifications = [
            Notification(
                user=user,
                type='submission',
                title='New Form Submission',
                message=f'A new submission for "{form.name}" requires review.',
                related_submission=submission,
            )
            for user in admin_users
        ]
        Notification.objects.bulk_create(notifications)

        subject = f"New {form.name} Submission Received"
        message = (
            f"A new form submission has been received.\n\n"
            f"Form:           {form.name}\n"
            f"Submission ID:  {submission.id}\n"
            f"Client:         {submission.client_identifier or 'Not provided'}\n"
            f"Submitted by:   {submission.submitted_by or 'Anonymous'}\n"
            f"Submitted at:   {submission.created_at:%Y-%m-%d %H:%M UTC}\n"
            f"Files attached: {file_count}\n"
            f"Schema version: {submission.schema_version}\n\n"
            f"Responses:\n{format_responses(submission.responses)}\n\n"
            f"Please review the submission in the admin dashboard."
        )

        admin_emails = getattr(settings, 'ADMIN_NOTIFICATION_EMAILS', ['admin@actserv.local'])
        # Offload email sending to a separate Celery task to avoid blocking the current task
        send_admin_email.delay(subject, message, admin_emails)

        logger.info(
            "Notifications sent for submission %s (%d admin(s) notified)",
            submission_id, len(notifications),
        )
        return f"Notification sent successfully for submission {submission_id}"

    except Exception as exc:
        logger.exception("Failed to send notifications for submission %s", submission_id)
        raise self.retry(exc=exc, countdown=60)


@shared_task
def cleanup_old_notifications(days_to_keep: int = 90) -> str:
    """Delete read notifications older than the specified number of days."""
    from datetime import timedelta
    from .models import Notification

    cutoff = now() - timedelta(days=days_to_keep)
    deleted_count, _ = Notification.objects.filter(
        is_read=True, created_at__lt=cutoff
    ).delete()
    logger.info("Cleaned up %d old read notifications (older than %d days)", deleted_count, days_to_keep)
    return f"Deleted {deleted_count} notifications"


def format_responses(responses: dict | None) -> str:
    """Format a submission's response dict for plain-text email display."""
    if not responses:
        return "No responses"
    return "\n".join(f"  {key}: {value}" for key, value in responses.items())


@shared_task(bind=True, max_retries=3)
def send_admin_email(self, subject: str, message: str, recipient_list: list[str]):
    """Send email to admins via Celery. Retries on failure with exponential backoff."""
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@actserv.local'),
            recipient_list=recipient_list,
            fail_silently=False,
        )
        logger.info("Admin notification email sent at %s", now())
        return "email_sent"
    except Exception as exc:
        logger.exception("Failed to send admin email")
        raise self.retry(exc=exc, countdown=60)
