# backend/users/urls.py
from django.urls import path

from . import views

urlpatterns = [
    # Register a new client account
    path('register/', views.register_client, name='register-client'),

    # Return current user's profile (requires JWT token)
    path('me/', views.me, name='user-me'),
]

# NOTE: Login is handled by rest_framework_simplejwt at /api/auth/login/
# (see actserv_backend/urls.py) — no need to duplicate it here.