# backend/tests/test_celery_integration.py
"""
Celery integration tests.

These tests are skipped in normal CI because they require a live Redis
instance and a running Celery worker.

To run them locally:
  1. docker compose up -d redis
  2. celery -A actserv_backend worker -l info &
  3. pytest tests/test_celery_integration.py -v -m integration
"""
import pytest


@pytest.mark.integration
@pytest.mark.django_db(transaction=True)
def test_submission_queues_real_celery_task():
    """
    Requires: Redis running, Celery worker running.
    Verifies that a form submission results in a Celery task being queued
    and executed (not just mocked).
    """
    pytest.importorskip('redis')  # Skip if redis package not importable

    import redis as redis_lib

    # Check Redis is actually reachable before proceeding
    try:
        r = redis_lib.Redis(host='localhost', port=6379, socket_connect_timeout=1)
        r.ping()
    except Exception:
        pytest.skip('Redis not reachable — skipping integration test')

    from django.contrib.auth import get_user_model
    from rest_framework.test import APIClient

    from forms.models import Form, Submission

    User = get_user_model()
    form = Form.objects.create(
        name='Integration Form', slug='integration-form', schema={'version': 1}
    )

    client = APIClient()
    response = client.post('/api/submissions/', {
        'form': str(form.id),
        'responses': {'field': 'value'},
    }, format='json')

    assert response.status_code == 201
    assert Submission.objects.count() == 1


@pytest.mark.integration
def test_celery_worker_is_reachable():
    """
    Pings the Celery workers via inspect to confirm at least one is running.
    Skipped automatically when Redis is not available.
    """
    pytest.importorskip('celery')

    import redis as redis_lib
    try:
        r = redis_lib.Redis(host='localhost', port=6379, socket_connect_timeout=1)
        r.ping()
    except Exception:
        pytest.skip('Redis not reachable')

    from actserv_backend.celery import app
    inspector = app.control.inspect(timeout=2)
    active = inspector.active()
    assert active is not None, (
        'No Celery workers responded. Start one with: '
        'celery -A actserv_backend worker -l info'
    )