# backend/forms/signals.py
import logging

from django.db.models.signals import pre_save
from django.dispatch import receiver

from .models import Submission

logger = logging.getLogger(__name__)


@receiver(pre_save, sender=Submission)
def log_submission_status_change(sender, instance, **kwargs):
    """Log submission status transitions for audit trail."""
    if instance.pk:
        try:
            old = Submission.all_objects.get(pk=instance.pk)
            if old.status != instance.status:
                logger.info(
                    'Submission %s status changed: %s -> %s',
                    instance.pk, old.status, instance.status,
                )
        except Submission.DoesNotExist:
            pass
