# Backend Improvement Plan

## 1. Security Hardenings
- **SECRET_KEY**: Remove default dev key; require env var and raise error if missing.
- **DEBUG flag**: Normalize string handling to avoid accidental truthy values.
- **Global DRF permissions**: Set default to `IsAuthenticated`; keep `AllowAny` only on safe endpoints (registration, token). 
- **HTTP security headers**: Enable `SECURE_BROWSER_XSS_FILTER`, `SECURE_CONTENT_TYPE_NOSNIFF`, `X_FRAME_OPTIONS='DENY'`.
- **CSRF**: Ensure `CsrfViewMiddleware` stays enabled; set `CSRF_COOKIE_SECURE` and `CSRF_COOKIE_HTTPONLY` for production.
- **Email sending**: Move `send_mail` to a Celery task to avoid blocking requests.

## 2. Configuration & Environment
- **Database fallback**: Raise clear error in production when `DATABASE_URL` missing.
- **Redis broker**: Validate presence of `REDIS_URL` when `DEBUG=False`.
- **CORS**: Keep explicit whitelist, enforce `CORS_ALLOW_ALL_ORIGINS=False`.
- **Logging**: Keep env‑controlled log level; optionally map `DEBUG=True` → `LOG_LEVEL=DEBUG`.

## 3. API Design & Permissions
- **FormViewSet**: Already uses `IsAdminUserOrReadOnly`.
- **SubmissionViewSet**: Add throttling (e.g., 10/min for anonymous) to mitigate abuse.
- **Notification endpoints**: Use `IsAuthenticated`; consider omitting `user` field from serializer output.
- **User registration**: Enforce stronger password validation via Django's `AUTH_PASSWORD_VALIDATORS`.
- **JWT payload**: Review fields; avoid unnecessary PII (`is_staff` if not needed).

## 4. Validation Enhancements
- **Submission required fields**: Add type‑specific validation (numeric, email, date) based on `Field.field_type`.
- **File uploads**: Enforce max file size and allowed MIME types per field definition.
- **Schema version conflict**: Reject submissions where client’s form version is stale (409 Conflict).
- **Duplicate response keys**: Validate uniqueness of keys in payload.

## 5. Testing Gaps & Recommendations
- Add permission tests for admin vs regular users.
- Test rate‑limit behavior on submission endpoint.
- Add field‑type validation tests (number, email, date).
- Mock SMTP failures to verify task retries.
- Test schema version conflict handling (expect 409).
- Test bulk notification task edge cases (no admins, large counts).

## 6. Observability & Logging
- Switch to structured JSON logs or key‑value pairs.
- Add request‑ID middleware for tracing.
- Log submission payload size for large uploads.
- Expose metrics: submissions per form, error rates (e.g., via `django‑prometheus`).

## 7. Deployment & Production Readiness
- Validate required env vars on startup; fail fast if missing.
- Ensure static files are collected (`collectstatic`).
- Add readiness endpoint checking DB & Celery connectivity.
- Use `gunicorn` in production; keep `runserver` for dev only.
- Store secrets in Railway env vars, not in `.env` committed to repo.
- Include DB migration step in CI/CD pipeline.
- Implement backup strategy for SQLite (dev) and PostgreSQL (prod).

## 8. Code Quality & Refactoring
- Remove unused imports; run linter (`ruff`/`flake8`).
- Keep `pyrefly` ignore comments only where necessary.
- Move hard‑coded email subjects to a `constants.py` module.
- Replace magic numbers (e.g., pagination size) with settings constants.
- Consider base serializer for shared fields if more models adopt similar patterns.

## Prioritization (Suggested Order)
1️⃣ Security basics (SECRET_KEY, DEBUG, global permissions) 
2️⃣ Rate limiting & validation on public submission endpoint 
3️⃣ Async email sending via Celery 
4️⃣ Expand test coverage (permissions, validation, throttling) 
5️⃣ Structured logging & request IDs 
6️⃣ Production config checks (env validation, broker) 
7️⃣ Refactoring & style cleanup 

---
**Next Steps**: Choose a priority area and let me know which implementation details you’d like to start with.
