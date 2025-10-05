# Design Decisions

This document explains the key design choices made for the Creative Dynamic Onboarding Form System project.  
Each decision balances current assessment requirements with scalability, usability, and ACTSERV's long-term needs.

---

## 1. Database Strategy: SQLite (Development) → PostgreSQL (Production)

**Current Implementation:** SQLite for rapid development and assessment demonstration  
**Production Target:** PostgreSQL for enterprise-scale deployment

### Why This Approach:
- **Development Speed**: SQLite enables quick setup and testing without external dependencies
- **Assessment Focus**: Meets functional requirements while minimizing setup complexity
- **Production Ready**: Architecture designed for PostgreSQL migration when scaling

### Database Design:
- **Structured Relations**: Forms → Submissions → FileUploads relationships
- **JSONB Ready**: Field definitions use JSON format, ready for PostgreSQL JSONB optimization
- **Migration Path**: Django ORM ensures seamless transition from SQLite to PostgreSQL

### Why PostgreSQL for Production:
- **Enterprise Features**: Transactional consistency, compliance, and scalability
- **JSONB Support**: Efficient querying and indexing of dynamic field definitions
- **Financial Services**: Meets data integrity requirements for regulated environments

---

## 2. Field Configuration: JSON Schema

**JSON Schema** approach enables flexible, scalable form definitions without database migrations.

### Benefits:
- **No Migration Hell**: New fields can be added without database changes
- **Conditional Validation**: JSON Schema rules support complex logic (e.g., "require income proof if loan > X")
- **Backward Compatibility**: `schema_version` ensures old submissions remain valid
- **Admin Usability**: Hybrid approach (JSON schema + admin UI) serves both developers and non-technical admins

### Alternatives Considered:
- **Relational-Only Fields**: Inflexible and migration-heavy
- **UI-Only Builder**: Limits future extensibility and API capabilities

---

## 3. Notification Mechanism: Celery + Redis

**Celery with Redis** provides robust asynchronous task processing for notifications.

### Current Implementation:
- **Redis Dependency**: Required for Celery broker (running locally)
- **Console Emails**: Development setup uses email console backend
- **Production Ready**: Architecture supports SMTP, SendGrid, or AWS SES

### Why Celery:
- **Non-Blocking**: Submissions remain fast for clients
- **Retry Capability**: Failed notifications can be automatically retried
- **Extensible**: Easy to add SMS, Slack, webhooks in the future

---

## 4. Frontend Technology: Next.js (React)

**Next.js with React** delivers a modern, scalable frontend experience.

### Current Status:
- **Scaffold Ready**: Next.js 15 setup complete
- **API Integration**: Ready for form rendering and submission
- **TypeScript Ready**: Foundation for type-safe form handling

### Advantages:
- **Dynamic Form Rendering**: React components perfectly suit dynamic field types
- **Built-in Routing**: Next.js provides clean API integration
- **Industry Standard**: Aligns with modern web development practices

---

## 5. File Storage Strategy

**Development-First Approach** with production migration path.

### Current Implementation:
- **Local Storage**: Django FileField with `MEDIA_ROOT` for rapid development
- **Field Association**: Files linked to submissions with specific field keys

### Production Design:
- **Cloud Ready**: Architecture supports S3, GCP, or Azure Blob Storage
- **Security**: Encryption and access controls for financial data compliance
- **Scalability**: Handles large file volumes efficiently

---

## 6. Development vs Production Architecture

### Development Stack (Current):
SQLite → Django DRF → Celery/Redis → Local File Storage

text

### Production Stack (Designed):
PostgreSQL → Django DRF → Celery/Redis → Cloud Storage (S3/Azure/GCP)

text

### Migration Benefits:
- **Zero Code Changes**: Django ORM abstracts database differences
- **Proven Path**: Well-documented SQLite to PostgreSQL migration process
- **Assessment Focus**: Functional demo without production infrastructure overhead

---

## 7. Summary

The architecture demonstrates **pragmatic engineering** by:

✅ **Meeting Assessment Requirements**: Full functionality with SQLite  
✅ **Production Ready Design**: PostgreSQL migration path built-in  
✅ **Development Efficiency**: Rapid iteration during assessment period  
✅ **Enterprise Scalability**: Financial services compliance and growth capacity  

**Current Stack**: SQLite + Django + Celery + Next.js = Assessment Delivery  
**Production Vision**: PostgreSQL + Cloud Storage = Enterprise Scaling