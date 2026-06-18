# ===== backend/actserv_backend/celery.py =====
import logging
import os

from celery import Celery
from celery.signals import task_failure, task_success

logger = logging.getLogger(__name__)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'actserv_backend.settings')

app = Celery('actserv_backend')

# Reads all CELERY_* keys from Django settings
app.config_from_object('django.conf:settings', namespace='CELERY')

# Auto-discover tasks in all INSTALLED_APPS
app.autodiscover_tasks()


# ── Task lifecycle signals (useful for monitoring / debugging) ────────────────

@task_success.connect
def on_task_success(sender, result, **kwargs):
    logger.debug("Task %s completed: %s", sender.name, result)


@task_failure.connect
def on_task_failure(sender, task_id, exception, traceback, **kwargs):
    logger.error(
        "Task %s (id=%s) failed: %s",
        sender.name, task_id, exception,
    )