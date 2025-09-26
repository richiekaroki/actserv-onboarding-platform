# ===== backend/notifications/tasks.py =====
import logging

from celery import shared_task
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

# Task to notify admin of new form submission


@shared_task(bind=True, max_retries=3)
def notify_admin_new_submission(self, submission_id):
    """
    Send notification to admin when new form submission is received
    """
    try:
        from forms.models import Submission
        submission = Submission.objects.select_related(
            'form').get(id=submission_id)
    except Submission.DoesNotExist:
        logger.error(f"Submission {submission_id} not found")
        return f"Submission {submission_id} not found"

    form = submission.form

    # Prepare email content
    subject = f"New {form.name} Submission Received"

    # Count files
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

    # Get admin emails from settings
    admin_emails = getattr(settings, 'ADMIN_NOTIFICATION_EMAILS', [
        'admin.example@actserv-africa.com'
    ])

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL',
                               'no-reply@actserv.local'),
            recipient_list=admin_emails,
            fail_silently=False
        )

        logger.info(f"Notification sent for submission {submission_id}")
        return f"Notification sent successfully for submission {submission_id}"

    except Exception as exc:
        logger.error(
            f"Failed to send notification for submission {submission_id}: {exc}")
        # Retry the task
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
            'admin.example@actserv-africa.com'
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
