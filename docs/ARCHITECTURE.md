# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           React 18 + TypeScript Frontend                │   │
│  │  - Kanban UI with Drag & Drop                           │   │
│  │  - Real-time Sync via Socket.io                         │   │
│  │  - State Management (Zustand + TanStack Query)          │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────┬─────────────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │                   │
    HTTPS REST API      WebSocket
    Requests           (Socket.io)
         │                   │
         └─────────┬─────────┘
                   │
┌──────────────────▼─────────────────────────────────────────────┐
│                    Backend (Heroku)                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Express.js + Socket.io Server                          │  │
│  │  ┌───────────────┐      ┌──────────────────────────┐    │  │
│  │  │  API Routes   │      │  Socket.io Event        │    │  │
│  │  │  - Auth       │      │  Handlers               │    │  │
│  │  │  - Projects   │      │  - Card events          │    │  │
│  │  │  - Boards     │      │  - Comment events       │    │  │
│  │  │  - Cards      │      │  - Presence updates     │    │  │
│  │  │  - Notif.     │      │  - Notifications        │    │  │
│  │  │  - Reports    │      │  - Activity logs        │    │  │
│  │  └───────────────┘      └──────────────────────────┘    │  │
│  │         │                         │                      │  │
│  │    ┌────▼──────────┬──────────────▼────┐                │  │
│  │    │  Controllers  │  Services Layer   │                │  │
│  │    │  Middleware   │  - Auth Service   │                │  │
│  │    │  Validation   │  - Project Service│                │  │
│  │    │               │  - Card Service   │                │  │
│  │    │               │  - Notification S.│                │  │
│  │    └────┬──────────┴────────┬──────────┘                │  │
│  └─────────┼───────────────────┼──────────────────────────┘  │
└────────────┼───────────────────┼──────────────────────────────┘
             │                   │
     ┌───────▼────────┐  ┌──────▼──────────┐
     │  MongoDB       │  │  Redis          │
     │  - Users       │  │  - Pub/Sub      │
     │  - Projects    │  │  - Cache        │
     │  - Boards      │  │  - Sessions     │
     │  - Cards       │  │  - Socket Adapter
     │  - Comments    │  │  - Job Queue    │
     │  - Notif.      │  │                 │
     └────────────────┘  └─────────────────┘
```

## Component Architecture

### Frontend Layers

**1. Presentation Layer**

- React components (Header, Card, Column, Board)
- Pages (Login, Dashboard, Project)
- Responsive UI with Tailwind CSS

**2. State Management Layer**

- Zustand stores for global state (auth, projects)
- TanStack Query for server state and caching
- Local component state for UI-only data

**3. Service Layer**

- API client (axios with interceptors)
- Socket.io client for real-time updates
- Local storage for token persistence

**4. Type Layer**

- TypeScript interfaces for all domain models
- Compile-time type safety

### Backend Layers

**1. Route Layer** (`src/routes/`)

- Express route handlers
- Route definitions and HTTP method mapping

**2. Controller Layer** (`src/controllers/`)

- Request/response handling
- Parameter validation
- Error handling

**3. Service Layer** (`src/services/`)

- Business logic implementation
- Database operations via Mongoose
- External API integration

**4. Model Layer** (`src/models/`)

- Mongoose schemas and models
- Data validation rules
- Database indexes

**5. Socket Layer** (`src/sockets/`)

- Socket.io event handlers
- Room management
- Real-time event broadcasting

**6. Job Layer** (`src/jobs/`)

- Background job processing
- Scheduled tasks
- Long-running operations

**7. Middleware Layer** (`src/middleware/`)

- Authentication (JWT)
- Authorization (RBAC)
- Validation
- Error handling

**8. Utility Layer** (`src/utils/`)

- Database connection
- Redis client
- JWT token generation
- Helper functions

## Data Flow

### Creating a Card

```
1. User fills form in Card Create Modal (Frontend)
   ↓
2. Frontend validates input (Zod schema)
   ↓
3. Frontend calls POST /cards (API)
   ↓
4. Backend receives request
   ↓
5. Middleware authenticates user (JWT)
   ↓
6. Controller validates input
   ↓
7. Service checks permissions
   ↓
8. Service creates card in MongoDB
   ↓
9. Service emits Socket.io event 'cardCreated'
   ↓
10. All connected clients in room receive 'cardCreated'
    ↓
11. Clients update local state optimistically
    ↓
12. Frontend re-renders UI with new card
```

### Moving a Card (Real-time Collaboration)

```
1. User drags card from Column A to Column B (Frontend)
   ↓
2. Frontend emits 'cardMove' socket event with optimistic update
   ↓
3. UI updates immediately (optimistic)
   ↓
4. Backend receives socket event
   ↓
5. Middleware authenticates socket connection
   ↓
6. Service validates move (permissions, constraints)
   ↓
7. Service persists card position in MongoDB
   ↓
8. Service broadcasts 'cardMoved' to all clients in project room
   ↓
9. If optimistic update matched server state: no action
   ↓
10. If optimistic update was wrong: frontend reconciles state
```

## Real-time Synchronization

### Socket.io Adapter Pattern

For scaling with multiple server instances:

```
Client 1 ─┐
          ├─→ Server Instance 1
Client 2 ─┘   (Redis Adapter)
             │
Client 3 ─┐  ├─→ Redis Pub/Sub
          ├─→ Server Instance 2
Client 4 ─┘   (Redis Adapter)
             │
             ├─→ Server Instance 3
               (Redis Adapter)
```

Each server connects to Redis and subscribes to the same channels.
When a socket event is emitted, it's published to Redis and delivered to all instances.

## Authentication & Authorization Flow

```
User Starts
    ↓
Clicks "Sign in with Google"
    ↓
Google OAuth Consent Screen
    ↓
Redirects with Authorization Code
    ↓
Frontend sends code to /auth/oauth/google
    ↓
Backend exchanges code for Google tokens
    ↓
Backend creates/updates user in MongoDB
    ↓
Backend generates JWT token
    ↓
Backend returns JWT + User data
    ↓
Frontend stores JWT in localStorage/httpOnly cookie
    ↓
Frontend includes JWT in all API requests
    ↓
Middleware validates JWT signature
    ↓
Middleware extracts userId
    ↓
Service checks project permissions
    ↓
Request proceeds or returns 403 Forbidden
```

### Role-Based Access Control (RBAC)

```
Project Member Roles:
├── Owner
│   └── Can: delete project, manage members, all edits
├── Admin
│   └── Can: manage members, all edits
├── Editor
│   └── Can: create/edit cards and columns
├── Commenter
│   └── Can: add comments only
└── Viewer
    └── Can: view only, no modifications
```

## Database Design

### Collections & Relationships

```
Users (1) ──┬─→ (N) Projects (as member)
            └─→ (N) Cards (as assignee/commenter)

Projects (1) ─→ (N) Boards
           ├─→ (N) Members (User refs)
           ├─→ (N) Cards (project-level ref)
           └─→ Settings

Boards (1) ─→ (N) Columns
       └─→ (N) Cards (board-level ref)

Columns (1) ─→ (N) Cards

Cards ├─→ User (creator, comments, assignees)
      ├─→ Comments []
      ├─→ Attachments []
      ├─→ Activity Logs []
      └─→ Notifications []

Notifications (N) ─→ (1) User
```

## Caching Strategy

**Redis Cache Layers:**

1. **Session Cache**: User authentication tokens
2. **Project Cache**: Frequently accessed project data
3. **Presence Cache**: Active users per project
4. **Message Queue**: Background jobs (Bull)

**Cache Invalidation:**

- Write-through: Update DB, then update cache
- TTL: 24 hours for project metadata
- Event-based: Invalidate on data changes

## Deployment Architecture

### Frontend (Netlify)

```
GitHub Push
    ↓
GitHub Actions CI/CD
    ↓
npm run build (React)
    ↓
Run tests & linting
    ↓
Deploys to Netlify
    ↓
CDN distribution
```

### Backend (Heroku)

```
GitHub Push
    ↓
GitHub Actions CI/CD
    ↓
npm run build (TypeScript)
    ↓
Run tests
    ↓
Deploy to Heroku
    ↓
Dyno running Node.js
    ↓
Environment variables loaded
    ↓
Connected to MongoDB Atlas + Redis Add-on
```

## Scalability Considerations

### Horizontal Scaling

1. **Frontend**: Served via CDN, scales automatically
2. **Backend**: Multiple Heroku dynos with load balancing
3. **Database**: MongoDB Atlas replica set
4. **Cache/Messaging**: Managed Redis with clustering

### Performance Optimizations

1. **Database**: Indexes on frequently queried fields
2. **API**: Response pagination, field filtering
3. **Frontend**: Code splitting, lazy loading components
4. **Caching**: Redis for hot data, HTTP cache headers
5. **Images**: Stored in S3, served via CDN

## Monitoring & Observability

```
Application Logs
    ↓
Structured JSON logging
    ↓
Sentry (error tracking)
Prometheus (metrics)
ELK/LogDNA (centralized logs)
```

**Metrics Tracked:**

- API response times
- Socket.io message throughput
- Database operation latency
- Error rates and exceptions
- User activity patterns
