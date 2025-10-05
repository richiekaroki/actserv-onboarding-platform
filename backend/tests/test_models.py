import uuid

import pytest
from forms.models import Field, FileUpload, Form, Submission


@pytest.mark.django_db
class TestModelStringMethods:
    """Test the __str__ methods that are currently untested"""

    def test_form_str_method(self):
        form = Form.objects.create(
            name="Test Form",
            slug="test-form",
            schema={"version": 1}
        )
        assert str(form) == "Test Form"

    def test_field_str_method(self):
        form = Form.objects.create(
            name="Parent Form", slug="parent", schema={})
        field = Field.objects.create(
            form=form,
            key="test_field",
            label="Test Field",
            field_type="text"
        )
        assert str(field) == "Parent Form - Test Field"

    def test_submission_str_method(self):
        form = Form.objects.create(name="Test Form", slug="test", schema={})
        submission = Submission.objects.create(
            form=form,
            schema_version=1,
            responses={"test": "value"}
        )
        expected_str = f"Submission {submission.id} for Test Form"
        assert str(submission) == expected_str

    def test_file_upload_str_method(self):
        form = Form.objects.create(name="Test Form", slug="test", schema={})
        submission = Submission.objects.create(
            form=form,
            schema_version=1,
            responses={}
        )
        # Note: This won't actually save a file, but tests the string method
        file_upload = FileUpload.objects.create(
            submission=submission,
            field_key="test_file",
            file="uploads/test.txt"
        )
        expected_str = f"File for {submission.id} (test_file)"
        assert str(file_upload) == expected_str
