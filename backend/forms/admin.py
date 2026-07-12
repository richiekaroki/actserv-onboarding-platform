# ===== backend/forms/admin.py =====
import json

from django.contrib import admin, messages
from django.utils.html import format_html

from .models import Field, FileUpload, Form, Submission


class FieldInline(admin.TabularInline):
    """
    Show all fields for a form directly on the Form edit page.
    This is how an assessor will actually use the admin — they shouldn't
    have to navigate to a separate screen to see what fields a form has.
    """
    model = Field
    extra = 1
    fields = ('order', 'key', 'label', 'field_type', 'required', 'options', 'validation')
    ordering = ('order',)


class FileUploadInline(admin.TabularInline):
    model = FileUpload
    extra = 0
    readonly_fields = ('field_key', 'file', 'uploaded_at', 'meta')
    can_delete = False


@admin.register(Form)
class FormAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'field_count', 'submission_count', 'is_active', 'schema_version', 'updated_at')
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}
    list_filter = ('is_active', 'created_at')
    readonly_fields = ('id', 'schema_version', 'created_at', 'updated_at')
    inlines = [FieldInline]

    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related('fields', 'submissions')

    @admin.display(description='Fields')
    def field_count(self, obj):
        return obj.fields.count()

    @admin.display(description='Submissions')
    def submission_count(self, obj):
        return obj.submissions.count()


@admin.register(Field)
class FieldAdmin(admin.ModelAdmin):
    list_display = ('label', 'key', 'field_type', 'form', 'required', 'order')
    search_fields = ('label', 'key', 'form__name')
    list_filter = ('field_type', 'required', 'form')
    ordering = ('form', 'order')


@admin.action(description='Mark selected submissions as reviewed')
def mark_reviewed(modeladmin, request, queryset):
    updated = queryset.update(status='reviewed')
    messages.success(request, f'{updated} submission(s) marked as reviewed.')


@admin.action(description='Mark selected submissions as approved')
def mark_approved(modeladmin, request, queryset):
    updated = queryset.update(status='approved')
    messages.success(request, f'{updated} submission(s) marked as approved.')


@admin.action(description='Mark selected submissions as rejected')
def mark_rejected(modeladmin, request, queryset):
    updated = queryset.update(status='rejected')
    messages.success(request, f'{updated} submission(s) marked as rejected.')


@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = (
        'short_id', 'form', 'submitted_by', 'client_identifier',
        'status', 'schema_version', 'created_at',
    )
    search_fields = ('id', 'client_identifier', 'form__name', 'submitted_by__email')
    list_filter = ('status', 'form', 'created_at')
    readonly_fields = ('id', 'form', 'submitted_by', 'schema_version', 'created_at', 'pretty_responses')
    actions = [mark_reviewed, mark_approved, mark_rejected]
    inlines = [FileUploadInline]
    autocomplete_fields = ('form', 'submitted_by')

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('form', 'submitted_by')

    # Show 'responses' as pretty-printed JSON, not a raw textarea
    fields = (
        'id', 'form', 'submitted_by', 'client_identifier',
        'status', 'schema_version', 'created_at', 'pretty_responses',
    )

    @admin.display(description='ID')
    def short_id(self, obj):
        return str(obj.id)[:8] + '…'

    @admin.display(description='Responses')
    def pretty_responses(self, obj):
        formatted = json.dumps(obj.responses, indent=2, ensure_ascii=False)
        return format_html('<pre style="white-space:pre-wrap;">{}</pre>', formatted)


@admin.register(FileUpload)
class FileUploadAdmin(admin.ModelAdmin):
    list_display = ('submission', 'field_key', 'file_link', 'uploaded_at')
    search_fields = ('field_key', 'submission__id')
    list_filter = ('uploaded_at',)
    readonly_fields = ('uploaded_at',)

    @admin.display(description='File')
    def file_link(self, obj):
        if obj.file:
            return format_html('<a href="{}" target="_blank">{}</a>', obj.file.url, obj.file.name)
        return '—'