Design Decisions

This document explains the key design choices made for the Creative Dynamic Onboarding Form System project. Each decision balances current assessment requirements with scalability, usability, and ACTSERV’s long-term needs.

1. Database Choice: PostgreSQL

PostgreSQL was selected as the primary database because it provides the best balance between relational integrity and flexible JSON storage. The platform requires structured relations (Forms → Submissions → FileUploads) and dynamic, evolving field definitions (Form.schema and Submission.responses).

PostgreSQL’s JSONB support allows efficient storage, querying, and indexing of JSON data, enabling advanced use cases such as conditional validation and backward compatibility.

Alternatives considered:

SQLite: suitable for quick prototyping but limited for production.

MySQL/MariaDB: JSON support exists but is weaker (fewer operators, indexing options).

MongoDB: strong JSON handling but lacks transactional consistency and relational modeling.

PostgreSQL is also the recommended production DB for Django, widely adopted in enterprise environments, and aligns with ACTSERV’s financial services needs for data integrity, compliance, and scalability.

2. Field Configuration: JSON Schema

Field definitions are stored as JSON schemas inside each form. This makes the system flexible, scalable, and backward-compatible:

New fields or rules can be added without database migrations.

Conditional validation is supported using JSON Schema rules (e.g., require proof of income if loan amount > X).

schema_version is stored with each submission, ensuring old submissions remain valid after schema updates.

Alternatives considered:

Relational-only fields: inflexible and migration-heavy.

API-first JSON editing: reduces usability for non-technical admins.

UI-only builder without schema: limits future extensibility.

The hybrid solution (JSON schema + admin UI builder) gives both developer flexibility and admin usability.

3. Notification Mechanism: Celery

Celery with Redis was chosen for asynchronous notifications when a client submits a form. This ensures:

Submissions are fast for clients (notifications do not block requests).

Notifications can be retried if they fail.

The system can scale to other channels (SMS, Slack, webhooks) in the future.

Alternatives considered:

Synchronous notifications: risk slowing down submissions.

Custom background threads: lack reliability and monitoring.

Celery is widely used with Django and provides a production-ready, extensible foundation for ACTSERV’s future growth.

4. Frontend Technology: Next.js (React)

The frontend uses Next.js with React for dynamic form rendering and admin form creation.

React’s component model is ideal for rendering different field types dynamically.

Next.js adds routing, SSR/CSR options, and clean API integration.

TypeScript improves type safety for form schemas and submissions.

Alternatives considered:

Plain React: lacks built-in routing and SSR.

Angular/Vue: strong frameworks but not in scope per assessment.

Next.js ensures a modern, professional frontend aligned with industry best practices and ACTSERV’s focus on innovation.

5. File Storage Strategy

During development, files are stored locally via Django’s FileField in MEDIA_ROOT. Each file is linked to the submission and the specific field key it belongs to.

For production, the system is designed to use cloud object storage (e.g., Amazon S3, GCP, Azure Blob) with secure access controls and encryption. This ensures compliance with financial data regulations.

Alternatives considered:

Storing files in DB: inefficient for large binary data.

Direct client-to-cloud uploads: possible but adds complexity at MVP stage.

The chosen approach balances MVP simplicity with enterprise scalability.

6. Scalability & Future-Proofing

Scalability was a key driver in the design:

Unbounded forms: JSON schema ensures new fields don’t break old submissions.

Evolving rules: schema versioning keeps old submissions valid.

Large dataset readiness: PostgreSQL handles relational + JSON queries efficiently.

Async workflows: Celery scales horizontally with worker nodes.

Frontend flexibility: Next.js supports future features like role-based dashboards, analytics, or multi-tenancy.

This architecture ensures the onboarding platform can grow with ACTSERV’s needs across business units and countries.

7. Summary

The design choices reflect a balance of current requirements (per assessment) and future readiness for ACTSERV’s context in financial services. PostgreSQL + JSON schemas + Celery + Next.js provide a professional, scalable foundation while remaining lightweight enough to deliver within the 11-day timeline.