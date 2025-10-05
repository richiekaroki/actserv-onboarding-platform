# ActServ Onboarding Platform — Assessment Notes

## 1. Project Overview

- **Goal:** Creative Dynamic Onboarding Form System for a financial services firm.
- **Tech Stack:**

  - Backend: Django REST Framework (DRF)
  - Frontend: Next.js (scaffold running, not yet implemented)
  - Async tasks: Celery + Redis
  - Database: SQLite (local demo; easily swappable for PostgreSQL)

- **Architecture:**

  - Client → API (DRF) → DB
  - On submission → Celery Task → Redis Queue → Email Notification

---

## 2. Backend Design Decisions

- **API-first Approach:** Forms defined and consumed via REST API, using JSON schemas for flexibility.
- **Dynamic Forms:** Admins create forms with fields stored as JSON + related `Field` models.
- **Submissions:** Clients submit data + file uploads. Stored in DB, linked to form version.
- **Authentication:** JWT-based auth with role-based permissions:

  - Public → can list forms and submit.
  - Admins → full CRUD + access submissions.

- **Async Tasks:** Celery + Redis handle notifications (currently via console email backend).
- **Scalability:**

  - Unlimited forms supported.
  - Schema versioning ensures backward compatibility.
  - Supports small (2–3 fields) to large (20+ fields) forms.
  - Multiple file uploads handled.

---

## 3. Frontend Status

- **Next.js 15.5.4 running successfully.**
- Accessible at:

  - Local: [http://localhost:3000](http://localhost:3000)
  - Network: container IP

- **Note:** Frontend features (Admin UI + Client UI) not yet developed. Currently focusing on backend completeness per assessment priorities.

---

## 4. Notifications & Async Tasks

- Implemented with **Celery** + **Redis**.
- On submission, task `notify_admin_new_submission` is triggered.
- Console backend prints simulated email notifications (can later integrate with Gmail/SendGrid).

---

## 5. Scalability Considerations

- **Unlimited Forms:** Admins can add any number of forms.
- **Schema Versioning:** Ensures old submissions remain valid even if forms change.
- **Multiple File Uploads:** Handled via `FileUpload` model.
- **Optional Fields:** Supported (blank=True, null=True).
- **Conditional Validation:** Designed for extension with schema rules.

---

## 6. Assessment Mapping

| Requirement                                    | Status                             | Proof                                                                                        |
| ---------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------------- |
| Admin can create forms                         | ✅ Complete                        | POST /api/forms/ (201 Created)                                                               |
| Configure fields                               | ✅ Complete                        | `Field` model linked to `Form`                                                               |
| Clients view forms                             | ✅ Complete                        | GET /api/forms/ (200 OK)                                                                     |
| Clients submit forms                           | ✅ Complete                        | POST /api/submissions/ (201 Created)                                                         |
| Notifications on submission                    | ✅ Complete                        | Celery task logs in console                                                                  |
| Handle scalability & schema evolution          | ✅ Designed                        | JSON schema + versioning                                                                     |
| File uploads                                   | ✅ Complete                        | `FileUpload` model + media support                                                           |
| Edge cases (optional fields, multiple uploads) | ✅ Supported                       | DB + schema design                                                                           |
| Unit tests                                     | ⏳ Pending                         | Next step with pytest                                                                        |
| API documentation (Swagger/Redoc)              | ✅ Complete                        | [http://localhost:8000/api/schema/swagger-ui/](http://localhost:8000/api/schema/swagger-ui/) |
| Video walkthrough                              | ⏳ Pending                         | To be recorded                                                                               |
| Documentation                                  | ✅ This file (ASSESSMENT_NOTES.md) |                                                                                              |

---

## 7. Demo Script

1. **Login as admin** → `POST /api/auth/login/` → get JWT.
2. **Create a new form** → `POST /api/forms/` with schema.
3. **Submit as client** → `POST /api/submissions/` (no auth needed).
4. **Show Celery log** → Console shows admin notification.
5. **List submissions as admin** → `GET /api/submissions/` (auth required).
6. **View API Docs** → Swagger UI at [http://localhost:8000/api/schema/swagger-ui/](http://localhost:8000/api/schema/swagger-ui/).

---

## 8. Deliverables

- **GitHub Repo:** [https://github.com/richiekaroki/actserv-onboarding-platform](https://github.com/richiekaroki/actserv-onboarding-platform)
- **Video Walkthrough:** (to be recorded)
- **Documentation:** This file

---

✅ **Backend Complete and Demo-Ready**
⚠️ **Frontend still to be developed** (Admin + Client interfaces)
📌 **Next Steps:** Add tests, refine docs, record demo
