# REST API Endpoints - Freelance Job Board

## Base URL
```
http://localhost:3000/api
```

---

## Authentication

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "password": "string",
  "main_role": "Administrator | Management | Regular | Unregistered",
  "user_types": ["Employer", "Freelancer", "Reviewer", "Support"]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "token": "jwt_token"
  }
}
```

### POST /api/auth/login
Login with credentials.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user_id": 1,
    "token": "jwt_token"
  }
}
```

---

## Users

### GET /api/users
Get all users.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "user_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com",
      "main_role": "Regular",
      "status": "active",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/users/:id
Get user by ID.

### POST /api/users
Create a new user.

### PUT /api/users/:id
Update user.

### DELETE /api/users/:id
Delete user.

---

## Profiles

### GET /api/profiles
Get all profiles.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "profile_id": 1,
      "user_id": 1,
      "display_name": "John Doe",
      "headline": "Full Stack Developer",
      "description": "Experienced developer...",
      "photo_url": "https://...",
      "location": "New York, USA",
      "hourly_rate": 50.00,
      "availability_status": "available"
    }
  ]
}
```

### GET /api/profiles/:id
Get profile by ID.

### GET /api/profiles/user/:userId
Get profile by user ID.

### POST /api/profiles
Create a new profile.

**Request Body:**
```json
{
  "user_id": 1,
  "display_name": "string",
  "headline": "string",
  "description": "string",
  "photo_url": "string",
  "location": "string",
  "hourly_rate": 50.00,
  "availability_status": "available | partially_available | not_available"
}
```

### PUT /api/profiles/:id
Update profile.

### DELETE /api/profiles/:id
Delete profile.

---

## Skills

### GET /api/skills
Get all skills.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "skill_id": 1,
      "name": "JavaScript"
    }
  ]
}
```

### GET /api/skills/:id
Get skill by ID.

### POST /api/skills
Create a new skill.

**Request Body:**
```json
{
  "name": "string"
}
```

### PUT /api/skills/:id
Update skill.

### DELETE /api/skills/:id
Delete skill.

---

## Categories

### GET /api/categories
Get all categories.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "category_id": 1,
      "name": "Web Development",
      "description": "Web development projects",
      "manager_id": null
    }
  ]
}
```

### GET /api/categories/:id
Get category by ID.

### POST /api/categories
Create a new category.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "manager_id": 1
}
```

### PUT /api/categories/:id
Update category.

### DELETE /api/categories/:id
Delete category.

---

## Jobs

### GET /api/jobs
Get all jobs.

**Query Parameters:**
- `status` - Filter by status (Open, Assigned, In Progress, Completed, Cancelled)
- `category_id` - Filter by category
- `employer_id` - Filter by employer

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "job_id": 1,
      "employer_id": 1,
      "category_id": 1,
      "title": "Build a website",
      "description": "Need a responsive website...",
      "budget": 1000.00,
      "status": "Open",
      "deadline": "2024-12-31",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/jobs/:id
Get job by ID.

### POST /api/jobs
Create a new job.

**Request Body:**
```json
{
  "employer_id": 1,
  "category_id": 1,
  "title": "string",
  "description": "string",
  "budget": 1000.00,
  "deadline": "2024-12-31"
}
```

### PUT /api/jobs/:id
Update job.

**Request Body:**
```json
{
  "title": "string",
  "description": "string",
  "budget": 1000.00,
  "status": "Open | Assigned | In Progress | Completed | Cancelled",
  "deadline": "2024-12-31"
}
```

### DELETE /api/jobs/:id
Delete job.

---

## Job Applications

### GET /api/jobapplications
Get all job applications.

**Query Parameters:**
- `job_id` - Filter by job
- `freelancer_id` - Filter by freelancer
- `status` - Filter by status (Pending, Accepted, Rejected)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "application_id": 1,
      "job_id": 1,
      "freelancer_id": 2,
      "bid_amount": 800.00,
      "proposal_text": "I can build this for you...",
      "status": "Pending",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/jobapplications/:id
Get job application by ID.

### POST /api/jobapplications
Create a new job application.

**Request Body:**
```json
{
  "job_id": 1,
  "freelancer_id": 2,
  "bid_amount": 800.00,
  "proposal_text": "string"
}
```

### PUT /api/jobapplications/:id
Update job application.

**Request Body:**
```json
{
  "bid_amount": 900.00,
  "proposal_text": "string",
  "status": "Pending | Accepted | Rejected"
}
```

### DELETE /api/jobapplications/:id
Delete job application.

---

## Assignments

### GET /api/assignments
Get all assignments.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "assignment_id": 1,
      "job_id": 1,
      "freelancer_id": 2,
      "status": "Active",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/assignments/:id
Get assignment by ID.

### POST /api/assignments
Create a new assignment.

**Request Body:**
```json
{
  "job_id": 1,
  "freelancer_id": 2,
  "status": "Active | Completed | Terminated"
}
```

### PUT /api/assignments/:id
Update assignment.

### DELETE /api/assignments/:id
Delete assignment.

---

## Reviews

### GET /api/reviews
Get all reviews.

**Query Parameters:**
- `job_id` - Filter by job
- `reviewer_id` - Filter by reviewer
- `reviewee_id` - Filter by reviewee

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "review_id": 1,
      "job_id": 1,
      "reviewer_id": 1,
      "reviewee_id": 2,
      "rating": 5,
      "feedback": "Great work!",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/reviews/:id
Get review by ID.

### GET /api/reviews/user/:userId
Get reviews for a user with stats.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "reviews": [...],
    "stats": {
      "average_rating": 4.5,
      "review_count": 10
    }
  }
}
```

### GET /api/reviews/user/:userId/rating
Get user's rating summary.

### POST /api/reviews
Create a new review.

**Request Body:**
```json
{
  "job_id": 1,
  "reviewer_id": 1,
  "reviewee_id": 2,
  "rating": 5,
  "feedback": "string"
}
```

### PUT /api/reviews/:id
Update review.

### DELETE /api/reviews/:id
Delete review.

---

## Payments

### GET /api/payments
Get all payments.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "payment_id": 1,
      "job_id": 1,
      "payer_id": 1,
      "payee_id": 2,
      "amount": 800.00,
      "status": "completed",
      "created_at": "2024-01-01T00:00:00.000Z",
      "completed_at": "2024-01-02T00:00:00.000Z"
    }
  ]
}
```

### GET /api/payments/:id
Get payment by ID.

### POST /api/payments
Create a new payment.

**Request Body:**
```json
{
  "job_id": 1,
  "payer_id": 1,
  "payee_id": 2,
  "amount": 800.00,
  "status": "pending | completed | failed | refunded"
}
```

### PUT /api/payments/:id
Update payment.

### DELETE /api/payments/:id
Delete payment.

---

## Messages

### GET /api/messages
Get all messages.

### GET /api/messages/user/:userId
Get all messages for a user (sent and received).

### GET /api/messages/user/:userId/unread
Get unread message count for a user.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "unread_count": 5
  }
}
```

### GET /api/messages/conversation/:userId1/:userId2
Get conversation between two users.

### GET /api/messages/job/:jobId
Get messages related to a job.

### GET /api/messages/:id
Get message by ID.

### POST /api/messages
Send a new message.

**Request Body:**
```json
{
  "sender_id": 1,
  "receiver_id": 2,
  "job_id": 1,
  "body": "Hello, I'm interested in your project..."
}
```

### PATCH /api/messages/:id/read
Mark a message as read.

### POST /api/messages/read-all
Mark all messages from a sender as read.

**Request Body:**
```json
{
  "receiver_id": 1,
  "sender_id": 2
}
```

### DELETE /api/messages/:id
Delete message.

---

## Support Tickets

### GET /api/supporttickets
Get all support tickets.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "ticket_id": 1,
      "user_id": 1,
      "support_id": null,
      "subject": "Payment issue",
      "message": "I have a problem with...",
      "status": "Open",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /api/supporttickets/:id
Get support ticket by ID.

### POST /api/supporttickets
Create a new support ticket.

**Request Body:**
```json
{
  "user_id": 1,
  "subject": "string",
  "message": "string"
}
```

### PUT /api/supporttickets/:id
Update support ticket.

**Request Body:**
```json
{
  "support_id": 3,
  "status": "Open | In Progress | Resolved | Closed"
}
```

### DELETE /api/supporttickets/:id
Delete support ticket.

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

### Common HTTP Status Codes:
- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Database Schema (Simplified)

| Table | Description |
|-------|-------------|
| usertypes | User types (Employer, Freelancer, Reviewer, Support) |
| users | User accounts |
| user_usertypes | Many-to-many user-type relations |
| skills | Available skills |
| profiles | Freelancer profiles |
| profile_skills | Profile skills (many-to-many) |
| categories | Job categories |
| jobs | Job listings |
| job_skills | Job required skills (many-to-many) |
| jobapplications | Freelancer applications for jobs |
| assignments | Job-to-freelancer assignments |
| reviews | Bidirectional reviews |
| payments | Payment records |
| messages | Direct messages between users |
| supporttickets | Support tickets |
