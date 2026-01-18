# REST Endpoints Documentation - Update Summary

## Changes Made to REST_endpoints.md

### 1. Authentication Section Updated
- **Register endpoint**: Updated to reflect actual implementation
  - Changed `main_role` to `type_name` (Employer | Freelancer only)
  - Added detailed response with full user object
  - Added error responses (400, 409)
  
- **Login endpoint**: Updated response format
  - Added full user object in response
  - Added brute-force protection error (429)
  - Added 3-strike lockout details (5 minute cooldown)

### 2. New Admin Section Added
Complete API endpoints for Admin functionality:
- **Stats Endpoints** (Manager+):
  - GET `/api/admin/stats/overview`
  - GET `/api/admin/stats/revenue`
  - GET `/api/admin/stats/users`
  - GET `/api/admin/stats/jobs`

- **User Management** (Manager+):
  - GET `/api/admin/users`
  - PATCH `/api/admin/users/:id/role`
  - PATCH `/api/admin/users/:id/block` (Admin only)
  - PATCH `/api/admin/users/:id/unblock` (Admin only)
  - POST `/api/admin/users/bulk/block`
  - POST `/api/admin/users/bulk/unblock`
  - POST `/api/admin/users/bulk/role`

- **Job Moderation** (Support+):
  - GET `/api/admin/jobs/flags/pending`
  - GET `/api/admin/jobs/hidden`
  - POST `/api/admin/jobs/flags`
  - POST `/api/admin/jobs/:id/hide`
  - POST `/api/admin/jobs/:id/restore`
  - GET `/api/admin/audit-logs`

### 3. Users Section Updated
- Clarified Admin-only endpoints
- Added actual request/response bodies
- Removed non-implemented POST endpoint

### 4. Jobs Section Updated
- Added search functionality (`q` parameter)
- Added pagination (`limit`, `offset`)
- Added `GET /api/jobs/employer/:employerId`
- Updated with actual implementation details
- Added `required_skills` to POST request

### 5. Skills Section Updated
- Added role requirements (Manager+ only for create/delete)
- Removed non-existent PUT endpoint
- Clarified GET is public

### 6. New Authentication & Authorization Section Added
- JWT token format and expiry details
- User roles and their permissions table
- Brute-force protection explanation

### 7. Enhanced Error Responses Section
- Added error response format with `code` and `details` fields
- Added more granular HTTP status codes (409, 429)
- Added common error code descriptions
- Examples: `WEAK_PASSWORD`, `LOCKED`, `INVALID_TOKEN`, etc.

---

## What Still Needs Manual Updates

To convert this to the PDF (REST_endpoints_WAD.pdf), you need to:

1. **Open the updated REST_endpoints.md** in your preferred Markdown to PDF converter:
   - Option A: Use [Markdown to PDF online converter](https://md2pdf.netlify.app/)
   - Option B: Use VS Code with extension (Markdown PDF)
   - Option C: Use Pandoc: `pandoc REST_endpoints.md -o REST_endpoints.pdf`

2. **Apply formatting in the PDF**:
   - Add project logo/header
   - Use consistent colors and fonts
   - Add page numbers and table of contents
   - Ensure code blocks are syntax-highlighted

3. **Review for accuracy**:
   - Test each endpoint during demo
   - Verify role requirements match your implementation
   - Check that all query parameters are documented

---

## Key Sections to Verify

### ✅ Verified & Updated
- Authentication (register/login)
- Admin APIs (stats, user management, moderation)
- Jobs API (full CRUD with filters)
- Skills API (role-based access)
- Error responses (with codes)

### ⚠️ Partially Documented (Manual Verification Needed)
- **Profiles API** - Verify all endpoints exist and match implementation
- **Categories API** - Check if category creation requires Manager role
- **Messages API** - Verify all endpoints (especially `/api/messages/read-all`)
- **Reviews API** - Ensure all endpoints match controllers
- **Payments API** - Check if all CRUD operations are implemented
- **Support Tickets API** - Verify special endpoints like `/escalate`, `/assign`, `/notes`
- **Job Applications API** - Check endpoint paths and filtering options
- **Assignments API** - Verify status values and transitions

---

## Authentication Headers

**Important**: All endpoints (except login/register) require:

```
Authorization: Bearer <jwt_token>
```

Example curl request:
```bash
curl -X GET http://localhost:3000/api/admin/stats/overview \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Role-Based Access Control

| Endpoint Type | Required Role | Default Behavior |
|---------------|--------------|------------------|
| Public (Jobs, Categories, Skills) | None | GET only |
| User Profile | Authenticated | Own profile only |
| Admin Stats | Manager+ | Dashboard access |
| User Management | Manager+ | View/modify users |
| Block/Unblock | Admin | Critical operations |
| Support Tickets | Support+ | Support team only |
| Audit Logs | Admin | Compliance records |

---

## Testing the API

### 1. Register a user:
```json
POST /api/auth/register
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "type_name": "Freelancer"
}
```

### 2. Login:
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

### 3. Use token for admin endpoints:
```
GET /api/admin/stats/overview
Authorization: Bearer <token_from_login>
```

---

## Password Requirements

Passwords must contain:
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ At least one special character (!@#$%^&*)

Example valid password: `MyPassword123!`

---

**Last Updated**: January 18, 2026
**Documentation Version**: 2.0
