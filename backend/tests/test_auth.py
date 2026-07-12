# backend/tests/test_auth.py
import pytest
from users.models import CustomUser

LOGIN_URL    = '/api/auth/login/'
REGISTER_URL = '/api/auth/register/'
ME_URL       = '/api/auth/me/'

User = CustomUser


@pytest.mark.django_db
def test_admin_login_returns_token_pair(api_client, admin_user):
    response = api_client.post(LOGIN_URL, {'username': admin_user.email, 'password': 'StrongPass123!'})
    assert response.status_code == 200
    data = response.json()
    assert 'access' in data
    assert 'refresh' in data


@pytest.mark.django_db
def test_login_response_includes_user_role(api_client, admin_user):
    response = api_client.post(LOGIN_URL, {'username': admin_user.email, 'password': 'StrongPass123!'})
    assert response.status_code == 200
    user_data = response.json().get('user', {})
    assert user_data['role'] == 'admin'
    assert user_data['is_staff'] is True


@pytest.mark.django_db
def test_login_wrong_password_returns_401(api_client, admin_user):
    response = api_client.post(LOGIN_URL, {'username': admin_user.email, 'password': 'wrongpassword'})
    assert response.status_code == 401


@pytest.mark.django_db
def test_register_creates_client_user(api_client):
    response = api_client.post(REGISTER_URL, {
        'email': 'newclient@test.com', 'password': 'StrongPass123!',
        'first_name': 'Jane', 'last_name': 'Doe',
    })
    assert response.status_code == 201
    assert User.objects.filter(email='newclient@test.com').exists()
    user: CustomUser = User.objects.get(email='newclient@test.com')
    assert user.role == 'client'
    assert user.is_staff is False


@pytest.mark.django_db
def test_register_duplicate_email_returns_400(api_client, client_user):
    response = api_client.post(REGISTER_URL, {'email': client_user.email, 'password': 'StrongPass123!'})
    assert response.status_code == 400


@pytest.mark.django_db
def test_register_missing_password_returns_400(api_client):
    response = api_client.post(REGISTER_URL, {'email': 'nopass@test.com'})
    assert response.status_code == 400


@pytest.mark.django_db
def test_register_short_password_returns_400(api_client):
    response = api_client.post(REGISTER_URL, {'email': 'short@test.com', 'password': 'abc'})
    assert response.status_code == 400


@pytest.mark.django_db
def test_me_returns_current_user_profile(auth_client, client_user):
    response = auth_client.get(ME_URL)
    assert response.status_code == 200
    data = response.json()
    assert data['email'] == client_user.email
    assert data['role'] == 'client'


@pytest.mark.django_db
def test_me_requires_authentication(api_client):
    response = api_client.get(ME_URL)
    assert response.status_code == 401