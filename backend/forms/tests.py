import pytest
from django.urls import reverse
from forms.models import Field

@pytest.mark.django_db
def test_field_list(auth_client, basic_form):
    # Create a couple of fields for the form
    f1 = Field.objects.create(form=basic_form, key='name', label='Name', field_type='text', required=True, order=1)
    f2 = Field.objects.create(form=basic_form, key='email', label='Email', field_type='email', required=False, order=2)
    url = reverse('form-field-list', kwargs={'form_slug': basic_form.slug})
    resp = auth_client.get(url)
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    returned_keys = {item['key'] for item in data}
    assert {'name', 'email'} == returned_keys

@pytest.mark.django_db
def test_field_detail(auth_client, basic_form):
    field = Field.objects.create(form=basic_form, key='age', label='Age', field_type='number', required=False, order=1)
    url = reverse('form-field-detail', kwargs={'form_slug': basic_form.slug, 'pk': field.id})
    resp = auth_client.get(url)
    assert resp.status_code == 200
    json = resp.json()
    assert json['key'] == 'age'
    assert json['field_type'] == 'number'