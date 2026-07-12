"""End-to-end API test using Django test client (no HTTP needed)."""
import os
import django
from django.conf import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "actserv_backend.settings")
# Allow testserver host for Django test client
settings.ALLOWED_HOSTS = ["*"]
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model
from forms.models import Form, Field, Submission

User = get_user_model()
c = Client()
PASS = 0
FAIL = 0


def check(label, actual, expected):
    global PASS, FAIL
    if actual == expected:
        PASS += 1
        print(f"  PASS  {label}")
    else:
        FAIL += 1
        print(f"  FAIL  {label} — expected {expected}, got {actual}")


# Setup
admin, _ = User.objects.get_or_create(username="admin@test.com", defaults={"email": "admin@test.com", "role": "admin", "is_staff": True})
if not admin.check_password("TestPass123!"):
    admin.set_password("TestPass123!")
    admin.save()

# Clean up any leftover test data (order matters due to FK)
from forms.models import FileUpload, Submission, Field
FileUpload.objects.filter(submission__form__slug__in=["kyc-form", "temp-form"]).delete()
Submission.objects.filter(form__slug__in=["kyc-form", "temp-form"]).delete()
Field.objects.filter(form__slug__in=["kyc-form", "temp-form"]).delete()
User.objects.filter(email="jane@test.com").delete()
Form.objects.filter(slug__in=["kyc-form", "temp-form"]).delete()
print(f"Admin user: {admin.email}")


# ── 1. Health ────────────────────────────────────────────────────────────
print("\n=== 1. HEALTH CHECK ===")
r = c.get("/")
check("Health returns 200", r.status_code, 200)
check("Status is ok", r.json()["status"], "ok")


# ── 2. Login ─────────────────────────────────────────────────────────────
print("\n=== 2. LOGIN (admin) ===")
r = c.post("/api/auth/login/", {"username": "admin@test.com", "password": "TestPass123!"}, content_type="application/json")
check("Login returns 200", r.status_code, 200)
data = r.json()
access = data["access"]
refresh = data["refresh"]
check("Access token present", bool(access), True)
check("User role is admin", data["user"]["role"], "admin")


# ── 3. Register ──────────────────────────────────────────────────────────
print("\n=== 3. REGISTER (client) ===")
r = c.post("/api/auth/register/", {"email": "jane@test.com", "password": "TestPass123!", "first_name": "Jane"}, content_type="application/json")
check("Register returns 201", r.status_code, 201)
check("Registered user is client", r.json()["user"]["role"], "client")


# ── 4. Duplicate register ────────────────────────────────────────────────
print("\n=== 4. DUPLICATE REGISTER ===")
r = c.post("/api/auth/register/", {"email": "jane@test.com", "password": "TestPass123!"}, content_type="application/json")
check("Duplicate email returns 400", r.status_code, 400)


# ── 5. Token refresh ─────────────────────────────────────────────────────
print("\n=== 5. TOKEN REFRESH ===")
r = c.post("/api/auth/refresh/", {"refresh": refresh}, content_type="application/json")
check("Refresh returns 200", r.status_code, 200)
check("New access token", bool(r.json().get("access")), True)


# ── 6. Token verify ──────────────────────────────────────────────────────
print("\n=== 6. TOKEN VERIFY ===")
r = c.post("/api/auth/verify/", {"token": access}, content_type="application/json")
check("Verify returns 200", r.status_code, 200)


# ── 7. Me (authed) ───────────────────────────────────────────────────────
print("\n=== 7. ME (authenticated) ===")
r = c.get("/api/auth/me/", HTTP_AUTHORIZATION=f"Bearer {access}")
check("Me returns 200", r.status_code, 200)
check("Email matches", r.json()["email"], "admin@test.com")


# ── 8. Me (unauthed) ─────────────────────────────────────────────────────
print("\n=== 8. ME (unauthenticated) ===")
r = c.get("/api/auth/me/")
check("Unauthed me returns 401", r.status_code, 401)


# ── 9. List forms (empty) ────────────────────────────────────────────────
print("\n=== 9. LIST FORMS (empty) ===")
r = c.get("/api/forms/")
check("List forms returns 200", r.status_code, 200)
check("Results empty", len(r.json().get("results", [])), 0)


# ── 10. Create form ──────────────────────────────────────────────────────
print("\n=== 10. CREATE FORM (admin) ===")
r = c.post("/api/forms/", {"name": "KYC Form", "slug": "kyc-form", "description": "KYC", "schema": {"v": 1}, "is_active": True}, content_type="application/json", HTTP_AUTHORIZATION=f"Bearer {access}")
check("Create form returns 201", r.status_code, 201)
form_id = r.json()["id"]
form_slug = r.json()["slug"]
check("Slug is kyc-form", form_slug, "kyc-form")


# ── 11. List forms (1) ───────────────────────────────────────────────────
print("\n=== 11. LIST FORMS (has 1) ===")
r = c.get("/api/forms/")
check("List forms returns 200", r.status_code, 200)
check("Count is 1", r.json()["count"], 1)


# ── 12. Retrieve by slug ─────────────────────────────────────────────────
print("\n=== 12. RETRIEVE FORM BY SLUG ===")
r = c.get(f"/api/forms/{form_slug}/")
check("Retrieve returns 200", r.status_code, 200)
check("Name matches", r.json()["name"], "KYC Form")


# ── 13. Create fields ────────────────────────────────────────────────────
print("\n=== 13. CREATE FIELDS ===")
r = c.post(f"/api/forms/{form_slug}/fields/", {"key": "full_name", "label": "Full Name", "field_type": "text", "required": True, "order": 1}, content_type="application/json", HTTP_AUTHORIZATION=f"Bearer {access}")
check("Create field full_name returns 201", r.status_code, 201)

r = c.post(f"/api/forms/{form_slug}/fields/", {"key": "email", "label": "Email", "field_type": "email", "required": True, "order": 2}, content_type="application/json", HTTP_AUTHORIZATION=f"Bearer {access}")
check("Create field email returns 201", r.status_code, 201)


# ── 14. List fields ──────────────────────────────────────────────────────
print("\n=== 14. LIST FIELDS ===")
r = c.get(f"/api/forms/{form_slug}/fields/", HTTP_AUTHORIZATION=f"Bearer {access}")
check("List fields returns 200", r.status_code, 200)
field_keys = {f["key"] for f in r.json().get("results", r.json())}
check("Has full_name field", "full_name" in field_keys, True)
check("Has email field", "email" in field_keys, True)


# ── 15. Anonymous submission ─────────────────────────────────────────────
print("\n=== 15. ANONYMOUS SUBMISSION ===")
r = c.post("/api/submissions/", {"form": form_id, "responses": {"full_name": "John Doe", "email": "john@example.com"}}, content_type="application/json")
check("Anon submission returns 201", r.status_code, 201)
sub_id = r.json()["id"]
check("Status is submitted", r.json()["status"], "submitted")


# ── 16. List submissions (admin) ─────────────────────────────────────────
print("\n=== 16. LIST SUBMISSIONS (admin) ===")
r = c.get("/api/submissions/", HTTP_AUTHORIZATION=f"Bearer {access}")
check("List submissions returns 200", r.status_code, 200)
check("Count is 1", r.json()["count"], 1)


# ── 17. Retrieve submission ──────────────────────────────────────────────
print("\n=== 17. RETRIEVE SUBMISSION ===")
r = c.get(f"/api/submissions/{sub_id}/", HTTP_AUTHORIZATION=f"Bearer {access}")
check("Retrieve returns 200", r.status_code, 200)
check("Schema version is 1", r.json()["schema_version"], 1)


# ── 18. Update status ────────────────────────────────────────────────────
print("\n=== 18. UPDATE STATUS ===")
r = c.patch(f"/api/submissions/{sub_id}/status/", {"status": "approved"}, content_type="application/json", HTTP_AUTHORIZATION=f"Bearer {access}")
check("Update status returns 200", r.status_code, 200)
check("Status is approved", r.json()["status"], "approved")


# ── 19. Notifications ────────────────────────────────────────────────────
print("\n=== 19. LIST NOTIFICATIONS ===")
r = c.get("/api/notifications/", HTTP_AUTHORIZATION=f"Bearer {access}")
check("List notifications returns 200", r.status_code, 200)
check("Has notifications", len(r.json()) > 0, True)


# ── 20. Mark all read ────────────────────────────────────────────────────
print("\n=== 20. MARK ALL READ ===")
r = c.post("/api/notifications/mark-all-read/", HTTP_AUTHORIZATION=f"Bearer {access}")
check("Mark all read returns 200", r.status_code, 200)
check("marked_read > 0", r.json()["marked_read"] > 0, True)


# ── 21. Schema ───────────────────────────────────────────────────────────
print("\n=== 21. API SCHEMA ===")
r = c.get("/api/schema/", HTTP_AUTHORIZATION=f"Bearer {access}")
check("Schema returns 200", r.status_code, 200)
check("Returns openapi content", "openapi" in r.content.decode(), True)


# ── 22. Delete form with submissions ─────────────────────────────────────
print("\n=== 22. DELETE FORM WITH SUBMISSIONS ===")
r = c.delete(f"/api/forms/{form_slug}/", HTTP_AUTHORIZATION=f"Bearer {access}")
check("Delete blocked returns 400", r.status_code, 400)


# ── 23. Create + delete empty form ───────────────────────────────────────
print("\n=== 23. CREATE + DELETE EMPTY FORM ===")
r = c.post("/api/forms/", {"name": "Temp", "slug": "temp-form", "schema": {}}, content_type="application/json", HTTP_AUTHORIZATION=f"Bearer {access}")
check("Create temp returns 201", r.status_code, 201)
r = c.delete("/api/forms/temp-form/", HTTP_AUTHORIZATION=f"Bearer {access}")
check("Delete empty returns 204", r.status_code, 204)


# ── 24. Wrong password ───────────────────────────────────────────────────
print("\n=== 24. WRONG PASSWORD ===")
r = c.post("/api/auth/login/", {"username": "admin@test.com", "password": "wrong"}, content_type="application/json")
check("Wrong password returns 401", r.status_code, 401)


# ── 25. Client cannot create form ────────────────────────────────────────
print("\n=== 25. CLIENT CANNOT CREATE FORM ===")
r = c.post("/api/auth/login/", {"username": "jane@test.com", "password": "TestPass123!"}, content_type="application/json")
client_token = r.json().get("access", "")
r = c.post("/api/forms/", {"name": "X", "slug": "x", "schema": {}}, content_type="application/json", HTTP_AUTHORIZATION=f"Bearer {client_token}")
check("Client create form returns 403", r.status_code, 403)


# ── 26. Anon cannot list submissions ─────────────────────────────────────
print("\n=== 26. ANON CANNOT LIST SUBMISSIONS ===")
r = c.get("/api/submissions/")
check("Anon list submissions returns 401", r.status_code, 401)


# ── 27. Missing required field ───────────────────────────────────────────
print("\n=== 27. MISSING REQUIRED FIELD ===")
r = c.post("/api/submissions/", {"form": form_id, "responses": {"email": "x@x.com"}}, content_type="application/json")
check("Missing required returns 400", r.status_code, 400)


# ── 28. Bad email ────────────────────────────────────────────────────────
print("\n=== 28. BAD EMAIL FORMAT ===")
r = c.post("/api/submissions/", {"form": form_id, "responses": {"full_name": "X", "email": "not-email"}}, content_type="application/json")
check("Bad email returns 400", r.status_code, 400)


# ── Summary ──────────────────────────────────────────────────────────────
print(f"\n{'='*50}")
print(f"RESULTS: {PASS} passed, {FAIL} failed out of {PASS+FAIL} tests")
print(f"{'='*50}")
