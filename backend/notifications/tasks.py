# ===== backend/notifications/tasks.py =====
import logging

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3)
def notify_admin_new_submission(self, submission_id):
    """
    Comprehensive notification: Both email AND internal notifications
    """
    try:
        from django.contrib.auth import get_user_model
        from forms.models import Submission

        from .models import Notification

        User = get_user_model()
        submission = Submission.objects.select_related(
            'form').get(id=submission_id)
        form = submission.form

        # 1. CREATE INTERNAL DATABASE NOTIFICATIONS
        admin_users = User.objects.filter(is_staff=True)
        for user in admin_users:
            Notification.objects.create(
                user=user,
                type='submission',
                title='New Form Submission',
                message=f'A new submission for "{form.name}" requires review',
                related_submission=submission
            )

        # 2. SEND EMAIL NOTIFICATIONS
        subject = f"New {form.name} Submission Received"
        file_count = submission.files.count()

        message = f"""
        A new form submission has been received:
        
        Form: {form.name}
        Submission ID: {submission.id}
        Client Identifier: {submission.client_identifier or 'Not provided'}
        Submitted at: {submission.created_at}
        Files attached: {file_count}
        Schema Version: {submission.schema_version}
        
        Responses:
        {format_responses(submission.responses)}
        
        Please review the submission in the admin dashboard.
        """

        admin_emails = getattr(settings, 'ADMIN_NOTIFICATION_EMAILS', [
            'admin@actserv.local'
        ])

        send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL',
                               'no-reply@actserv.local'),
            recipient_list=admin_emails,
            fail_silently=False
        )

        logger.info(f"Notifications sent for submission {submission_id}")
        return f"Created {admin_users.count()} internal notifications and sent emails for submission {submission_id}"

    except Exception as exc:
        logger.error(
            f"Failed to send notifications for submission {submission_id}: {exc}")
        raise self.retry(exc=exc, countdown=60)


def format_responses(responses):
    """Format response dictionary for email display"""
    if not responses:
        return "No responses"

    formatted = []
    for key, value in responses.items():
        formatted.append(f"  {key}: {value}")

    return "\n".join(formatted)


@shared_task
def notify_admin_bulk_submissions(form_id, count):
    """
    Notify admin of bulk submissions (for future use)
    """
    try:
        from forms.models import Form
        form = Form.objects.get(id=form_id)

        subject = f"Bulk Submissions Alert - {form.name}"
        message = f"""
        Alert: {count} submissions received for {form.name} in a short time period.
        
        Please review for potential issues or high volume processing needs.
        """

        admin_emails = getattr(settings, 'ADMIN_NOTIFICATION_EMAILS', [
            'admin@actserv.local'
        ])

        send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL',
                               'no-reply@actserv.local'),
            recipient_list=admin_emails,
            fail_silently=True
        )

    except Exception as exc:
        logger.error(f"Failed to send bulk notification: {exc}")
