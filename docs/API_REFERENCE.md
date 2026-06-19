# API Reference

This document provides a concise overview of the public API endpoints exposed by the backend. All endpoints are prefixed with ``/api/``.

## Authentication

- **POST** ``/auth/login/`` – Obtain JWT access/refresh tokens. Body: ``{"username": "...", "password": "..."}``
- **POST** ``/auth/register/`` – Register a new client user. Body: ``{"email": "...", "password": "...", "first_name": "...", "last_name": "..."}``

## Users

- **GET** ``/users/me/`` – Retrieve the authenticated user's profile (requires JWT).

## Forms

- **GET** ``/forms/`` – List active forms (public).
- **POST** ``/forms/`` – Create a new form (admin only).
- **GET** ``/forms/{slug}/`` – Retrieve a specific form.
- **PATCH/DELETE** ``/forms/{slug}/`` – Update or delete a form (admin only).

## Fields (admin only, nested under a form)

- **GET** ``/forms/{form_slug}/fields/`` – List fields for a form.
- **POST** ``/forms/{form_slug}/fields/`` – Create a field for a form.

## Submissions

- **POST** ``/submissions/`` – Create a new submission (public or authenticated).
- **GET** ``/submissions/`` – List submissions (admin only).
- **GET** ``/submissions/{id}/`` – Retrieve a specific submission (admin only).
- **POST** ``/submissions/{id}/upload/`` – Upload files for a submission (authenticated).
- **PATCH** ``/submissions/{id}/status/`` – Update submission status (admin only).

## Notifications

- **GET** ``/notifications/`` – List notifications for the authenticated user.
- **GET** ``/notifications/{id}/`` – Retrieve a specific notification.
- **PATCH** ``/notifications/{id}/`` – Mark a notification as read.
- **POST** ``/notifications/mark_all_read/`` – Mark all unread notifications as read.

All write operations require appropriate permissions (admin or authenticated) as enforced by the viewsets.
