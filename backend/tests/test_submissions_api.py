# backend/tests/test_submissions_api.py
from unittest.mock import patch

import pytest

from forms.models import Submission

SUBMISSIONS_URL = '/api/submissions/'


def submission_detail_url(pk):
    return f'/api/submissions/{pk}/'


@pytest.mark.django_db
@patch('notifications.tasks.notify_admin_new_submission.delay')
def test_anonymous_can_submit_form(mock_task, api_client, basic_form):
    response = api_client.post(SUBMISSIONS_URL, {
        'form': str(basic_form.id), 'responses': {'field1': 'answer1'},
    }, format='json')
    assert response.status_code == 201
    assert Submission.objects.count() == 1


@pytest.mark.django_db
@patch('notifications.tasks.notify_admin_new_submission.delay')
def test_submission_triggers_celery_task(mock_task, api_client, basic_form):
    api_client.post(SUBMISSIONS_URL, {'form': str(basic_form.id), 'responses': {}}, format='json')
    mock_task.assert_called_once()
    submission = Submission.objects.first()
    assert submission is not None
    mock_task.assert_called_with(str(submission.id))


@pytest.mark.django_db
@patch('notifications.tasks.notify_admin_new_submission.delay')
def test_submission_snapshots_schema_version(mock_task, api_client, basic_form):
    api_client.post(SUBMISSIONS_URL, {'form': str(basic_form.id), 'responses': {}}, format='json')
    submission = Submission.objects.first()
    assert submission is not None
    assert submission.schema_version == basic_form.schema_version


@pytest.mark.django_db
@patch('notifications.tasks.notify_admin_new_submission.delay')
def test_authenticated_submission_records_user(mock_task, auth_client, client_user, basic_form):
    auth_client.post(SUBMISSIONS_URL, {'form': str(basic_form.id), 'responses': {}}, format='json')
    submission = Submission.objects.first()
    assert submission is not None
    assert submission.submitted_by == client_user


@pytest.mark.django_db
def test_submission_missing_required_field_returns_400(api_client, kyc_form):
    response = api_client.post(SUBMISSIONS_URL, {
        'form': str(kyc_form.id), 'responses': {'notes': 'some optional text'},
    }, format='json')
    assert response.status_code == 400
    assert 'responses' in response.json()


@pytest.mark.django_db
@patch('notifications.tasks.notify_admin_new_submission.delay')
def test_submission_with_optional_field_missing_is_accepted(mock_task, api_client, kyc_form):
    response = api_client.post(SUBMISSIONS_URL, {
        'form': str(kyc_form.id),
        'responses': {'full_name': 'Jane Doe', 'id_number': '12345678'},
    }, format='json')
    assert response.status_code == 201


@pytest.mark.django_db
def test_unauthenticated_cannot_list_submissions(api_client):
    assert api_client.get(SUBMISSIONS_URL).status_code == 401


@pytest.mark.django_db
def test_client_user_cannot_list_submissions(auth_client):
    assert auth_client.get(SUBMISSIONS_URL).status_code == 403


@pytest.mark.django_db
@patch('notifications.tasks.notify_admin_new_submission.delay')
def test_admin_can_list_all_submissions(mock_task, admin_client, basic_form):
    Submission.objects.create(form=basic_form, schema_version=1, responses={'a': '1'})
    Submission.objects.create(form=basic_form, schema_version=1, responses={'a': '2'})
    response = admin_client.get(SUBMISSIONS_URL)
    assert response.status_code == 200
    assert response.json()['count'] == 2


@pytest.mark.django_db
@patch('notifications.tasks.notify_admin_new_submission.delay')
def test_admin_can_retrieve_submission_detail(mock_task, admin_client, basic_form):
    sub = Submission.objects.create(form=basic_form, schema_version=1, responses={'x': 'y'})
    response = admin_client.get(submission_detail_url(sub.id))
    assert response.status_code == 200
    assert response.json()['id'] == str(sub.id)