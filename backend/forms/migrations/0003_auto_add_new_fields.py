# backend/forms/migrations/0003_auto_add_new_fields.py
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('forms', '0002_submission_submitted_by')]

    operations = [
        migrations.AddField(model_name='field', name='placeholder',
            field=models.CharField(blank=True, max_length=255)),
        migrations.AddField(model_name='field', name='help_text',
            field=models.CharField(blank=True, max_length=500)),
        migrations.AddField(model_name='submission', name='updated_at',
            field=models.DateTimeField(auto_now=True)),
        migrations.AlterField(model_name='submission', name='status',
            field=models.CharField(
                choices=[('submitted','Submitted'),('reviewed','Reviewed'),
                         ('approved','Approved'),('rejected','Rejected')],
                db_index=True, default='submitted', max_length=50)),
        migrations.AddIndex(model_name='submission',
            index=models.Index(fields=['form','status'], name='forms_submi_form_status_idx')),
        migrations.AddIndex(model_name='submission',
            index=models.Index(fields=['submitted_by','created_at'], name='forms_submi_submitter_idx')),
        migrations.AddField(model_name='fileupload', name='original_filename',
            field=models.CharField(blank=True, max_length=255)),
        migrations.AddField(model_name='fileupload', name='content_type',
            field=models.CharField(blank=True, max_length=100)),
        migrations.AddField(model_name='fileupload', name='file_size',
            field=models.PositiveIntegerField(blank=True, null=True)),
    ]