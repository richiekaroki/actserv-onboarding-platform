# backend/users/urls.py
from django.urls import path

from . import views

urlpatterns = [
    path('register/', views.register_client, name='register-client'),
    path('login/', views.register_client, name='login-client'),
]
