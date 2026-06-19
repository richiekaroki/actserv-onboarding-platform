# Swagger / drf‑spectacular Warning Remediation Plan

## Overview
The recent access of `/api/schema/swagger/` produced several drf‑spectacular warnings:
1. **Function‑based views** (`register_client`, `me`, `mark_all_read`) lack a `serializer_class`.
2. **`FormSerializer.get_submission_count`** missing a return type hint.
3. **`FieldViewSet`** has an untyped URL path parameter `form_slug`.

These warnings do not break the API, but they prevent the OpenAPI spec from being fully accurate. The following plan resolves them while preserving existing behavior.

---

## 1. Convert function‑based views to class‑based views
### Affected endpoints
| URL | Current view | Issue |
|-----|-------------|-------|
| `POST /api/auth/register/` | `register_client` | No serializer → schema cannot infer request/response. |
| `GET /api/auth/me/` | `me` | Same issue. |
| `POST /api/notifications/mark-all-read/` | `mark_all_read` | Same issue. |

### Steps
1. **Create `RegisterClientSerializer`** in `backend/users/serializers.py` to validate `email`, `password`, optional names, and to implement `create()` (mirroring current view logic).
2. **Replace the three function views with class‑based views**:
   - `RegisterClientView(APIView)` – permission `AllowAny`, `serializer_class = RegisterClientSerializer`, use `@extend_schema` to document request & response.
   - `MeView(RetrieveAPIView)` – permission `IsAuthenticated`, `serializer_class = UserSerializer`, `get_object` returns `self.request.user`.
   - `MarkAllReadView(APIView)` – permission `IsAuthenticated`, implements the bulk‑update logic, returns a tiny response serializer (or an `OpenApiResponse`). Use `@extend_schema` for documentation.
3. **Update `backend/users/urls.py`** to route the new class‑based views via `.as_view()`.
4. **Update `backend/notifications/urls.py`** similarly for `mark_all_read`.

Result: Swagger can now display request bodies, response models, and proper authentication requirements for these endpoints.

---

## 2. Add type hint to `FormSerializer.get_submission_count`
- **File:** `backend/forms/serializers.py`
- **Change:**
```python
def get_submission_count(self, obj: Form) -> int:
    return obj.submissions.count()
```
Provides the return type (`int`) so drf‑spectacular knows the field is numeric.

---

## 3. Declare the `form_slug` path parameter in `FieldViewSet`
- **File:** `backend/forms/views.py`
- **Problem:** Router supplies `form_slug` but the viewset offers no type information.
- **Fix options:**
  - **Option A – `@extend_schema` with explicit `OpenApiParameter`** (recommended):
    ```python
    @extend_schema(
        parameters=[
            OpenApiParameter(
                name='form_slug',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.PATH,
                description='Slug of the parent Form'
            )
        ]
    )
    class FieldViewSet(viewsets.ModelViewSet):
        ...
    ```
    Also annotate uses of `self.kwargs['form_slug']` with `form_slug: str`.
  - **Option B – set `lookup_url_kwarg = 'form_slug'`** on the viewset and still add the `@extend_schema` parameter for the type.
- This makes the Swagger UI show `form_slug` as a required string path parameter.

---

## 4. (Optional) Formal response serializer for `mark_all_read`
Create a tiny serializer:
```python
class MarkAllReadResponseSerializer(serializers.Serializer):
    marked_read = serializers.IntegerField()
```
Reference it in `MarkAllReadView` via `@extend_schema(responses=MarkAllReadResponseSerializer)`.
If you prefer not to add a model, you can use `OpenApiResponse(description='{"marked_read": <int>}')`.

---

## 5. Validation & verification steps
1. **Run schema generation**: `python manage.py spectacular --file schema.yaml` – ensure no warnings remain.
2. **Open Swagger UI** (`/api/schema/swagger/`) and verify:
   - Register endpoint shows request fields and returns a `User` object.
   - Me endpoint returns a `User` object.
   - Mark‑all‑read returns a JSON with `marked_read`.
   - Field endpoints list `form_slug` as a string path parameter.
3. **Run the full test suite** (`pytest`). The functional behavior of the endpoints is unchanged, so all tests should still pass.

---

## 6. Summary of required file edits (to be applied later)
| File | Change |
|------|--------|
| `backend/users/serializers.py` | Add `RegisterClientSerializer` (and optional `MarkAllReadResponseSerializer`). |
| `backend/users/views.py` | Replace three function views with class‑based views; add `@extend_schema` decorators. |
| `backend/users/urls.py` | Point URLs to the new views (`.as_view()`). |
| `backend/notifications/views.py` | Convert `mark_all_read` to a class‑based view with serializer and schema decorations. |
| `backend/notifications/urls.py` | Update route to use the new class‑based view. |
| `backend/forms/serializers.py` | Add type hint to `get_submission_count`. |
| `backend/forms/views.py` | Add `@extend_schema` (or `lookup_url_kwarg`) to `FieldViewSet` and annotate `form_slug`. |
| (optional) `backend/notifications/serializers.py` | Add `MarkAllReadResponseSerializer`. |

Implementing these changes will eliminate the drf‑spectacular warnings, producing a complete, accurate Swagger/OpenAPI document while keeping the existing API behavior intact.
