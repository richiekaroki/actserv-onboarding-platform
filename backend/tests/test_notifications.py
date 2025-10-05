import uuid
from unittest.mock import MagicMock, patch

import pytest
from forms.models import Form, Submission
from notifications.tasks import (format_responses,
                                 notify_admin_bulk_submissions,
                                 notify_admin_new_submission)


@pytest.mark.django_db
class TestNotificationTasks:
    """Test the Celery tasks in notifications"""

    @patch('notifications.tasks.send_mail')
    def test_notify_admin_new_submission_success(self, mock_send_mail):
        """Test successful email notification"""
        form = Form.objects.create(name="Test Form", slug="test", schema={})
        submission = Submission.objects.create(
            form=form,
            schema_version=1,
            responses={"name": "John Doe", "email": "john@example.com"}
        )

        # Call the task directly
        result = notify_admin_new_submission(str(submission.id))

        # Verify email was sent
        mock_send_mail.assert_called_once()
        call_args = mock_send_mail.call_args
        assert "New Test Form Submission Received" in call_args[1]['subject']
        assert "John Doe" in call_args[1]['message']
        assert result == f"Notification sent successfully for submission {submission.id}"

    @patch('notifications.tasks.send_mail')
    def test_notify_admin_new_submission_with_files(self, mock_send_mail):
        """Test notification with file attachments count"""
        form = Form.objects.create(name="Test Form", slug="test", schema={})
        submission = Submission.objects.create(
            form=form,
            schema_version=1,
            responses={"name": "Jane Doe"}
        )

        # Call the task
        result = notify_admin_new_submission(str(submission.id))

        # Verify file count is mentioned
        mock_send_mail.assert_called_once()
        call_args = mock_send_mail.call_args
        assert "Files attached: 0" in call_args[1]['message']

    def test_notify_admin_new_submission_not_found(self):
        """Test handling of non-existent submission"""
        fake_id = uuid.uuid4()
        result = notify_admin_new_submission(str(fake_id))

        assert result == f"Submission {fake_id} not found"

    @patch('notifications.tasks.send_mail')
    def test_notify_admin_new_submission_retry_on_failure(self, mock_send_mail):
        """Test retry mechanism when email fails"""
        mock_send_mail.side_effect = Exception("SMTP error")
        form = Form.objects.create(name="Test Form", slug="test", schema={})
        submission = Submission.objects.create(
            form=form,
            schema_version=1,
            responses={}
        )

        # This should raise retry exception
        with pytest.raises(Exception):
            notify_admin_new_submission(str(submission.id))

    def test_format_responses_function(self):
        """Test the response formatting helper"""
        # Test with data
        responses = {"name": "John", "age": 30, "email": "john@test.com"}
        formatted = format_responses(responses)

        assert "name: John" in formatted
        assert "age: 30" in formatted
        assert "email: john@test.com" in formatted

        # Test empty responses
        empty_formatted = format_responses({})
        assert empty_formatted == "No responses"

        # Test None
        none_formatted = format_responses(None)
        assert none_formatted == "No responses"

    @patch('notifications.tasks.send_mail')
    def test_notify_admin_bulk_submissions(self, mock_send_mail):
        """Test bulk submission notification"""
        form = Form.objects.create(name="Bulk Form", slug="bulk", schema={})

        # Call bulk notification
        result = notify_admin_bulk_submissions(str(form.id), 5)

        # Verify email was sent
        mock_send_mail.assert_called_once()
        call_args = mock_send_mail.call_args
        assert "Bulk Submissions Alert - Bulk Form" in call_args[1]['subject']
        assert "5 submissions received" in call_args[1]['message']
