# backend/tests/test_models.py
"""
Unit tests for model __str__ methods, defaults, and constraints.
No HTTP — purely ORM-level.
"""
import pytest
from django.db import IntegrityError

from forms.models import Field, FileUpload, Form, Submission


@pytest.mark.django_db
class TestFormModel:
    def test_str(self, basic_form):
        assert str(basic_form) == 'Basic Form'

    def test_default_schema_version_is_1(self, basic_form):
        assert basic_form.schema_version == 1

    def test_default_is_active(self, basic_form):
        assert basic_form.is_active is True

    def test_slug_must_be_unique(self, basic_form):
        with pytest.raises(IntegrityError):
            Form.objects.create(name='Duplicate', slug='basic-form', schema={})


@pytest.mark.django_db
class TestFieldModel:
    def test_str(self, kyc_form):
        field = kyc_form.fields.get(key='full_name')
        assert str(field) == 'KYC Form - Full Name'

    def test_field_key_unique_per_form(self, basic_form):
        Field.objects.create(
            form=basic_form, key='email', label='Email',
            field_type='text',
        )
        with pytest.raises(IntegrityError):
            Field.objects.create(
                form=basic_form, key='email', label='Email Again',
                field_type='text',
            )

    def test_same_key_allowed_on_different_forms(self, basic_form, kyc_form):
        """Edge case from the spec: two forms can share field names."""
        Field.objects.create(
            form=basic_form, key='full_name', label='Full Name',
            field_type='text',
        )
        # kyc_form already has 'full_name' — no IntegrityError expected
        assert kyc_form.fields.filter(key='full_name').exists()
        assert basic_form.fields.filter(key='full_name').exists()


@pytest.mark.django_db
class TestSubmissionModel:
    def test_str(self, basic_form):
        sub = Submission.objects.create(
            form=basic_form, schema_version=1, responses={'a': 'b'}
        )
        assert str(sub) == f'Submission {sub.id} for Basic Form'

    def test_default_status_is_submitted(self, basic_form):
        sub = Submission.objects.create(
            form=basic_form, schema_version=1, responses={}
        )
        assert sub.status == 'submitted'

    def test_schema_version_snapshot(self, basic_form):
        """
        schema_version on the submission must reflect the form's version
        at the time of creation so future form edits don't break old records.
        """
        sub = Submission.objects.create(
            form=basic_form, schema_version=basic_form.schema_version, responses={}
        )
        assert sub.schema_version == basic_form.schema_version

    def test_form_deletion_blocked_when_submissions_exist(self, basic_form):
        """PROTECT prevents accidental deletion of forms that have responses."""
        Submission.objects.create(
            form=basic_form, schema_version=1, responses={}
        )
        from django.db.models import ProtectedError
        with pytest.raises(ProtectedError):
            basic_form.delete()


@pytest.mark.django_db
class TestFileUploadModel:
    def test_str(self, basic_form):
        sub = Submission.objects.create(
            form=basic_form, schema_version=1, responses={}
        )
        fu = FileUpload.objects.create(
            submission=sub, field_key='passport', file='uploads/test.pdf'
        )
        assert str(fu) == f'File for {sub.id} (passport)'