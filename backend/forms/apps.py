# ==== backend/forms/apps.py =====
from django.apps import AppConfig


class FormsConfig(AppConfig):
    name = 'forms'

    def ready(self):
        import forms.signals  # noqa: F401
