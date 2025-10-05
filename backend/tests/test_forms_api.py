import pytest
from django.contrib.auth.models import User
from forms.models import Form
from rest_framework.test import APIClient


@pytest.mark.django_db
def test_public_can_list_forms():
    client = APIClient()
    Form.objects.create(name="Test Form", slug="test-form",
                        description="Test", schema={"version": 1})
    response = client.get("/api/forms/")
    assert response.status_code == 200
    assert len(response.json()) > 0


@pytest.mark.django_db
def test_admin_can_create_form():
    user = User.objects.create_superuser(
        "admin", "admin@test.com", "password123")
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post("/api/forms/", {
        "name": "Admin Form",
        "slug": "admin-form",
        "description": "Created by admin",
        "schema": {"version": 1},
        "is_active": True
    }, format="json")

    assert response.status_code == 201
    assert Form.objects.filter(slug="admin-form").exists()


@pytest.mark.django_db
def test_public_cannot_create_form():
    """Test that non-admin users cannot create forms"""
    user = User.objects.create_user(
        "regular_user", "user@test.com", "password123")
    client = APIClient()
    client.force_authenticate(user=user)

    response = client.post("/api/forms/", {
        "name": "User Form",
        "slug": "user-form",
        "schema": {"version": 1},
    }, format="json")

    assert response.status_code == 403  # Forbidden - not admin
