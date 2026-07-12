import pytest
from django.urls import reverse

@pytest.mark.django_db
def test_register_success(api_client):
    url = reverse('register-client')
    data = {
        'email': 'newuser@example.com',
        'password': 'StrongPass123!',
        'first_name': 'New',
        'last_name': 'User',
    }
    resp = api_client.post(url, data, format='json')
    assert resp.status_code == 201
    json = resp.json()
    assert json['message'] == 'Registration successful.'
    assert 'user' in json
    assert json['user']['email'] == 'newuser@example.com'

@pytest.mark.django_db
def test_register_existing(api_client, client_user):
    url = reverse('register-client')
    data = {
        'email': client_user.email,
        'password': 'AnotherPass123!',
    }
    resp = api_client.post(url, data, format='json')
    assert resp.status_code == 400
    assert 'email' in resp.json()

@pytest.mark.django_db
def test_me_endpoint(auth_client, client_user):
    url = reverse('user-me')
    resp = auth_client.get(url)
    assert resp.status_code == 200
    json = resp.json()
    assert json['email'] == client_user.email
