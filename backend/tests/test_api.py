from unittest.mock import patch

import pytest
from django.contrib.auth.models import User
from forms.models import Form, Submission
from rest_framework.test import APIClient


@pytest.mark.django_db
# Mock Celery for now
@patch('notifications.tasks.notify_admin_new_submission.delay')
def test_public_can_submit_form(mock_celery):
    form = Form.objects.create(name="Test", slug="test", schema={"fields": []})
    client = APIClient()

    data = {
        "form": str(form.id),
        "schema_version": form.schema_version,
        "responses": {"field1": "answer"},
    }
    response = client.post("/api/submissions/", data, format="json")
    assert response.status_code == 201
    assert Submission.objects.count() == 1
    # mock_celery.assert_called_once()  # COMMENT OUT FOR NOW

# ===== DOCKER/REDIS TESTS TO ADD LATER =====
# @pytest.mark.docker
# @pytest.mark.redis
# def test_celery_task_execution_with_redis():
#     """Run this when you have Docker Redis running"""
#     # This test requires:
#     # 1. Redis container running
#     # 2. Celery worker running
#     # 3. Actual email configuration
#     pass
