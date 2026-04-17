# Smart Visitor Guidance System API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

### Common Headers

- `Authorization: Bearer <token>` for protected routes
- `Content-Type: application/json`

### Health Check

- `GET /api/health`
- Response:
  - `200 OK`
  - `{ "status": "ok" }`

## Auth Endpoints

### Register User

- `POST /api/auth/register`
- Protected: `ADMIN`
- Request body:
  - `name` (string, required)
  - `email` (string, valid email, required)
  - `password` (string, min 6 chars, required)
  - `role` (string, required) — must be `general_manager` or `department_manager`
  - `departmentId` (string, MongoDB ObjectId, required when role is `department_manager`)
- Response:
  - `201 Created`
  - `{ success: true, message, data: { user } }`

### Login

- `POST /api/auth/login`
- Request body:
  - `email` (string, valid email, required)
  - `password` (string, required)
- Response:
  - `200 OK`
  - `{ success: true, message, token, user }`

### Get Current User

- `GET /api/auth/me`
- Protected: any authenticated user
- Response:
  - `200 OK`
  - `{ success: true, data: { user } }`

### List Users

- `GET /api/auth/users`
- Protected: `ADMIN`
- Response:
  - `200 OK`
  - `{ success: true, users }`

### Update User (Admin)

- `PATCH /api/auth/users/:userId`
- Protected: `ADMIN`
- Request body (at least one):
  - `password` (string, min 6 chars)
  - `isActive` (boolean)
  - `departmentId` (string, MongoDB ObjectId)
- Response:
  - `200 OK`
  - `{ success: true, message, user }`

## Department Endpoints

### Get Public Departments

- `GET /api/departments/public`
- Public endpoint
- Response:
  - `200 OK`
  - `{ success: true, departments }`

### Filter Departments

- `GET /api/departments/filter`
- Public endpoint
- Query parameters may be used for filtering
- Response:
  - `200 OK`
  - `{ success: true, departments }`

### Get Departments

- `GET /api/departments`
- Optional auth
- Response:
  - `200 OK`
  - `{ success: true, departments }`

### Get Department by ID

- `GET /api/departments/:departmentId`
- Optional auth
- Response:
  - `200 OK`
  - `{ success: true, department }`

### Create Department

- `POST /api/departments`
- Protected: `ADMIN`
- Request body:
  - `name` (string, required)
  - `sector` (string, required)
  - `building` (string, required) — `A` or `B`
  - `floor` (integer, required) — `1` to `7`
  - `officeNumber` (string, required)
  - `specialIdentifier` (string, optional)
  - `departmentEmail` (string, optional)
  - `departmentContactNo` (string, optional)
  - `services` (array, optional)
  - `departmentManager` (object, required)
    - `name` (string, required)
    - `image` (string, required)
    - `contactNo` (string, required)
    - `services` (array, optional)
- Response:
  - `201 Created`
  - `{ success: true, message, department }`

### Update Department

- `PUT /api/departments/:departmentId`
- Protected: `ADMIN`
- Request body: same as create department
- Response:
  - `200 OK`
  - `{ success: true, message, department }`

### Delete Department

- `DELETE /api/departments/:departmentId`
- Protected: `ADMIN`
- Response:
  - `200 OK`
  - `{ success: true, message }`

## Feedback Endpoints

### Submit Feedback

- `POST /api/feedback`
- Optional auth
- Request body:
  - `departmentId` (string, MongoDB ObjectId, required)
  - `rating` (number, required) — `1` to `5`
  - `comment` (string, required, min 3 chars)
  - `userName` (string, optional)
- Response:
  - `201 Created`
  - `{ success: true, message, feedback }`

### Get Feedback for User

- `GET /api/feedback`
- Protected: `ADMIN`, `GENERAL_MANAGER`, `DEPARTMENT_MANAGER`
- Response:
  - `200 OK`
  - `{ success: true, feedback }`

### Get All Feedback

- `GET /api/feedback/all`
- Protected: `ADMIN`, `GENERAL_MANAGER`
- Response:
  - `200 OK`
  - `{ success: true, feedback }`

### Get Feedback by Department

- `GET /api/feedback/department/:departmentId`
- Protected: `ADMIN`, `GENERAL_MANAGER`, `DEPARTMENT_MANAGER`
- Response:
  - `200 OK`
  - `{ success: true, feedback }`

### Feedback Summary Analytics

- `GET /api/feedback/analytics/summary`
- Protected: `ADMIN`, `GENERAL_MANAGER`, `DEPARTMENT_MANAGER`
- Response:
  - `200 OK`
  - `{ success: true, analytics }`

### Feedback Trend Analytics

- `GET /api/feedback/analytics/trends`
- Protected: `ADMIN`, `GENERAL_MANAGER`, `DEPARTMENT_MANAGER`
- Response:
  - `200 OK`
  - `{ success: true, analytics }`

### Respond to Feedback

- `PATCH /api/feedback/:feedbackId/respond`
- Protected: `GENERAL_MANAGER`, `DEPARTMENT_MANAGER`
- Request body:
  - `response` (string, required)
- Response:
  - `200 OK`
  - `{ success: true, message, feedback }`

### Respond to Feedback (Alias)

- `PUT /api/feedback/respond/:id`
- Protected: `GENERAL_MANAGER`, `DEPARTMENT_MANAGER`
- Request body:
  - `response` (string, required)
- Response:
  - `200 OK`
  - `{ success: true, message, feedback }`

## QR Endpoints

### Get QR Data for Department

- `GET /api/qr/:departmentId`
- Public endpoint
- Response:
  - `200 OK`
  - `{ success: true, ... }`

## Sector Endpoints

### Get Sectors

- `GET /api/sectors`
- Public endpoint
- Response:
  - `200 OK`
  - `{ success: true, sectors }`

### Create Sector

- `POST /api/sectors`
- Protected: `ADMIN`
- Request body:
  - `name` (string, required)
- Response:
  - `201 Created`
  - `{ success: true, message, sector }`

## Settings Endpoints

### Get Public Settings

- `GET /api/settings/public`
- Public endpoint
- Response:
  - `200 OK`
  - `{ success: true, settings }`

### Get Settings

- `GET /api/settings`
- Protected: `ADMIN`
- Response:
  - `200 OK`
  - `{ success: true, settings }`

### Update Settings

- `PUT /api/settings`
- Protected: `ADMIN`
- Request body may include:
  - `appName` (string)
  - `supportEmail` (string, valid email)
  - `defaultTheme` (string) — `light`, `dark`, `system`
  - `allowPublicFeedback` (boolean)
  - `announcement` (string)
  - `announcementStartAt` (ISO date string)
  - `announcementEndAt` (ISO date string)
  - `announcementPriority` (string) — `low`, `normal`, `high`
  - `lastBackupAt` (ISO date string)
- Response:
  - `200 OK`
  - `{ success: true, message, settings }`

## Admin Endpoints

> All admin endpoints require `ADMIN` role.

### System Status

- `GET /api/admin/system-status`
- Response:
  - `200 OK`
  - `{ success: true, status }`

### SLA Overview

- `GET /api/admin/sla`
- Query parameters:
  - `slaHours` (number, optional)
- Response:
  - `200 OK`
  - `{ success: true, slaHours, overdueCount, overdueItems }`

### Assign SLA Feedback

- `POST /api/admin/sla/:feedbackId/assign`
- Request body:
  - `departmentId` (string, MongoDB ObjectId, required)
- Response:
  - `200 OK`
  - `{ success: true, message, feedback }`

### Follow-Up SLA Feedback

- `POST /api/admin/sla/:feedbackId/follow-up`
- Request body:
  - `note` (string, optional)
- Response:
  - `200 OK`
  - `{ success: true, message, feedback }`

### Department Health

- `GET /api/admin/department-health`
- Response:
  - `200 OK`
  - `{ success: true, health }`

### Audit Logs

- `GET /api/admin/audit-logs`
- Response:
  - `200 OK`
  - `{ success: true, ...result }`

### Export Report

- `GET /api/admin/export/:type`
- Path parameter:
  - `type` — one of `department-performance`, `feedback-trends`, `manager-response-stats`
- Query parameter:
  - `format` — `csv` (default) or `pdf`
- Response:
  - `200 OK`
  - File download with `Content-Disposition` header

## Error Responses

The API returns errors in a consistent format:

- `success: false`
- `message` — error description
- `details` — optional validation or additional error details
- `stack` — included only when `NODE_ENV` is not `production`

Example:

```json
{
  "success": false,
  "message": "Unauthorized: token missing",
  "details": null
}
```

## Notes

- Auth-protected routes require a valid JWT in the `Authorization` header.
- `verifyTokenOptional` routes accept a request without authentication but will attach user data if a valid token is provided.
- Department and feedback IDs must be valid MongoDB ObjectIds.
- Admin-only endpoints are guarded by role checks and return `403 Forbidden` for insufficient permissions.
