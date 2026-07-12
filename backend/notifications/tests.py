import pytest
from django.urls import reverse
from notifications.models import Notification

@pytest.mark.django_db
def test_mark_all_read(auth_client, client_user):
    # Create two unread notifications for the client_user
    Notification.objects.create(user=client_user, type='system', title='Test 1', message='msg 1')
    Notification.objects.create(user=client_user, type='system', title='Test 2', message='msg 2')
    # Another user’s notification should not be affected
    other = client_user.__class__.objects.create_user(username='other@test.com', email='other@test.com', password='Pass123!', role='client')
    Notification.objects.create(user=other, type='system', title='Other', message='other')
    url = reverse('notification-mark-all-read')
    resp = auth_client.post(url)
    assert resp.status_code == 200
    result = resp.json()
    assert result['marked_read'] == 2
    # Verify that the client_user notifications are now read
    assert Notification.objects.filter(user=client_user, is_read=False).count() == 0
    # Other user's notification remains unread
    assert Notification.objects.filter(user=other, is_read=False).count() == 1
