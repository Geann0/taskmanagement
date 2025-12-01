# API Specification

## Overview

The Task Management API is a RESTful service for managing collaborative Kanban boards. All responses are JSON formatted.

## Authentication

### OAuth2 + JWT Flow

1. User clicks "Sign in with Google"
2. Backend exchanges authorization code for tokens
3. Backend issues a JWT token to the client
4. Client includes JWT in `Authorization: Bearer <token>` header for subsequent requests

## Base URL

```
http://localhost:3000
```

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Endpoints

### Authentication

#### POST /auth/oauth/google

Exchange Google OAuth code for JWT token.

**Request:**

```json
{
  "code": "string"
}
```

**Response (200):**

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "avatarUrl": "https://..."
  }
}
```

#### POST /auth/logout

Logout (client-side operation with JWT).

**Response (200):**

```json
{
  "message": "Logged out"
}
```

---

### Projects

#### GET /projects

List all projects the user has access to.

**Query Parameters:**

- `limit` (default: 20) - Number of results
- `offset` (default: 0) - Pagination offset
- `visibility` - Filter by visibility (private, team, public)

**Response (200):**

```json
[
  {
    "_id": "project_id",
    "name": "Project Name",
    "description": "Project description",
    "visibility": "private",
    "members": [
      {
        "userId": "user_id",
        "role": "owner",
        "joinedAt": "2023-01-01T00:00:00Z"
      }
    ],
    "settings": {
      "enableCalendarSync": false,
      "defaultAssignee": null
    },
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
]
```

#### POST /projects

Create a new project.

**Request:**

```json
{
  "name": "New Project",
  "description": "Project description",
  "visibility": "private"
}
```

**Response (201):**

```json
{
  "_id": "project_id",
  "name": "New Project",
  "description": "Project description",
  "visibility": "private",
  "members": [
    {
      "userId": "user_id",
      "role": "owner",
      "joinedAt": "2023-01-01T00:00:00Z"
    }
  ],
  "settings": {
    "enableCalendarSync": false
  },
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

#### GET /projects/:projectId

Get project details with members and boards.

**Response (200):**

```json
{
  "_id": "project_id",
  "name": "Project Name",
  "description": "Project description",
  "visibility": "private",
  "members": [...],
  "settings": {...},
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

#### PUT /projects/:projectId

Update project (owner/admin only).

**Request:**

```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "visibility": "team"
}
```

**Response (200):** Updated project object

#### DELETE /projects/:projectId

Delete project (owner only).

**Response (204):** No content

---

### Boards

#### POST /projects/:projectId/boards

Create a new board in a project.

**Request:**

```json
{
  "name": "Board Name"
}
```

**Response (201):**

```json
{
  "_id": "board_id",
  "projectId": "project_id",
  "name": "Board Name",
  "columnsOrder": [],
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

#### GET /projects/:projectId/boards

Get all boards in a project.

**Response (200):**

```json
[
  {
    "_id": "board_id",
    "projectId": "project_id",
    "name": "Board Name",
    "columnsOrder": ["column_id_1", "column_id_2"],
    "createdAt": "2023-01-01T00:00:00Z",
    "updatedAt": "2023-01-01T00:00:00Z"
  }
]
```

#### PUT /boards/:boardId

Update board.

**Request:**

```json
{
  "name": "Updated Board Name",
  "columnsOrder": ["column_id_1", "column_id_2"]
}
```

**Response (200):** Updated board object

#### DELETE /boards/:boardId

Delete board.

**Response (204):** No content

---

### Columns

#### POST /boards/:boardId/columns

Create a column in a board.

**Request:**

```json
{
  "title": "To Do",
  "order": 0,
  "limit": 10
}
```

**Response (201):**

```json
{
  "_id": "column_id",
  "boardId": "board_id",
  "title": "To Do",
  "order": 0,
  "limit": 10,
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

#### PUT /columns/:columnId

Update column.

**Request:**

```json
{
  "title": "In Progress",
  "order": 1,
  "limit": 5
}
```

**Response (200):** Updated column object

#### DELETE /columns/:columnId

Delete column.

**Response (204):** No content

---

### Cards

#### POST /columns/:columnId/cards

Create a card.

**Request:**

```json
{
  "title": "Task title",
  "description": "Task description",
  "priority": "high",
  "assignees": ["user_id_1"],
  "dueDate": "2023-12-31T23:59:59Z",
  "tags": ["bug", "urgent"]
}
```

**Response (201):**

```json
{
  "_id": "card_id",
  "columnId": "column_id",
  "boardId": "board_id",
  "projectId": "project_id",
  "title": "Task title",
  "description": "Task description",
  "priority": "high",
  "assignees": ["user_id_1"],
  "dueDate": "2023-12-31T23:59:59Z",
  "tags": ["bug", "urgent"],
  "comments": [],
  "activityLog": [],
  "attachments": [],
  "status": "open",
  "createdAt": "2023-01-01T00:00:00Z",
  "updatedAt": "2023-01-01T00:00:00Z"
}
```

#### GET /cards/:cardId

Get card details.

**Response (200):** Card object

#### PUT /cards/:cardId

Update card.

**Request:**

```json
{
  "title": "Updated title",
  "priority": "medium",
  "assignees": ["user_id_1", "user_id_2"]
}
```

**Response (200):** Updated card object

#### DELETE /cards/:cardId

Delete card.

**Response (204):** No content

#### POST /cards/:cardId/move

Move card to another column.

**Request:**

```json
{
  "targetColumnId": "column_id",
  "position": 2
}
```

**Response (200):**

```json
{
  "cardId": "card_id",
  "fromColumnId": "old_column_id",
  "toColumnId": "column_id",
  "position": 2
}
```

---

### Comments

#### POST /cards/:cardId/comments

Add comment to card.

**Request:**

```json
{
  "body": "Comment text"
}
```

**Response (201):**

```json
{
  "authorId": "user_id",
  "body": "Comment text",
  "createdAt": "2023-01-01T00:00:00Z"
}
```

#### DELETE /cards/:cardId/comments/:commentId

Delete comment (author or admin only).

**Response (204):** No content

---

### Notifications

#### GET /notifications

Get user notifications.

**Query Parameters:**

- `limit` (default: 20)
- `offset` (default: 0)

**Response (200):**

```json
[
  {
    "_id": "notification_id",
    "userId": "user_id",
    "type": "task_assigned",
    "payload": {
      "cardId": "card_id",
      "cardTitle": "Task title"
    },
    "read": false,
    "createdAt": "2023-01-01T00:00:00Z"
  }
]
```

#### PUT /notifications/:id/read

Mark notification as read.

**Response (200):** Updated notification object

---

### Calendar

#### POST /projects/:projectId/calendar/sync

Enable calendar sync for project.

**Response (200):**

```json
{
  "message": "Calendar sync enabled",
  "syncStarted": true
}
```

#### DELETE /projects/:projectId/calendar/sync

Disable calendar sync.

**Response (204):** No content

---

### Reports

#### GET /projects/:projectId/reports

Generate project report.

**Query Parameters:**

- `from` - Start date (ISO 8601)
- `to` - End date (ISO 8601)
- `format` - Output format (json, pdf) - default: json

**Response (200):**

```json
{
  "projectId": "project_id",
  "projectName": "Project Name",
  "totalCards": 50,
  "completedCards": 30,
  "overdueTasks": 5,
  "tasksByPriority": {
    "low": 10,
    "medium": 20,
    "high": 15,
    "urgent": 5
  },
  "reportPeriod": {
    "from": "2023-01-01",
    "to": "2023-12-31"
  },
  "generatedAt": "2023-01-01T00:00:00Z"
}
```

---

## Socket.io Events

### Client → Server

#### joinProject

Join a project room for real-time updates.

```javascript
socket.emit("joinProject", { projectId: "project_id" });
```

#### leaveProject

Leave a project room.

```javascript
socket.emit("leaveProject", { projectId: "project_id" });
```

#### cardMove

Move a card to another column.

```javascript
socket.emit("cardMove", {
  cardId: "card_id",
  projectId: "project_id",
  fromColumnId: "old_column_id",
  toColumnId: "new_column_id",
  position: 2,
});
```

---

### Server → Client

#### cardCreated

A new card was created.

```javascript
socket.on("cardCreated", (data) => {
  // { cardId, columnId, boardId, projectId, title, ... }
});
```

#### cardUpdated

A card was updated.

```javascript
socket.on("cardUpdated", (data) => {
  // { cardId, changes: { title, priority, ... } }
});
```

#### cardMoved

A card was moved to a different column.

```javascript
socket.on("cardMoved", (data) => {
  // { cardId, fromColumnId, toColumnId, position }
});
```

#### commentCreated

A comment was added to a card.

```javascript
socket.on("commentCreated", (data) => {
  // { cardId, author, body, createdAt }
});
```

---

## Error Response Format

All errors follow this format:

```json
{
  "error": "Error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Field-specific error"
    }
  ]
}
```

## Rate Limiting

- General endpoints: 100 requests per 15 minutes
- Auth endpoints: 10 requests per 15 minutes
- Socket events: 50 events per minute per user

Rate limit headers are included in responses:

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Pagination

List endpoints support pagination via:

- `limit`: Number of results (default: 20, max: 100)
- `offset`: Number of records to skip (default: 0)

Response includes:

```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

## Versioning

Current API version: v1.0.0

Version is not required in URL. Breaking changes will be communicated in advance.
