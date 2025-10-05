import pytest
from django.contrib.auth.models import User
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_admin_can_login_and_get_token():
    User.objects.create_user(username="admin", password="admin123")
    client = APIClient()

    # Use the correct URL from your urls.py
    response = client.post(
        "/api/auth/login/", {"username": "admin", "password": "admin123"})

    assert response.status_code == 200
    assert "access" in response.json()


@pytest.mark.django_db
def test_public_cannot_list_submissions():
    client = APIClient()
    response = client.get("/api/submissions/")
    assert response.status_code == 401  # Unauthorized
