# Task Management App

A collaborative, real-time Kanban board application with drag-and-drop functionality, built with React 18, TypeScript, Node.js/Express, MongoDB, and Socket.io.

## 🎯 Features

- **Collaborative Kanban Board**: Drag-and-drop cards between columns with real-time synchronization
- **Real-time Collaboration**: Multiple users can work on the same board simultaneously using Socket.io
- **Task Management**: Create, edit, and delete tasks with priorities, due dates, and assignments
- **Comments & Activity**: Add comments to cards and track activity logs
- **Notifications**: In-app and push notifications for task events
- **Google Calendar Integration**: Sync tasks with Google Calendar
- **Permissions**: Fine-grained access control (Owner, Admin, Editor, Commenter, Viewer)
- **PDF Reports**: Export project reports as PDF
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🏗️ Architecture

### Frontend

- **Framework**: React 18 + TypeScript
- **State Management**: Zustand + TanStack Query (React Query)
- **Real-time**: Socket.io client
- **Drag & Drop**: React DnD
- **Styling**: Tailwind CSS
- **Routing**: React Router v6

### Backend

- **Runtime**: Node.js (LTS)
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Real-time**: Socket.io
- **Authentication**: OAuth2 (Google) + JWT
- **Jobs**: Bull + Redis for background tasks
- **API Docs**: Swagger (OpenAPI 3.0)

### Infrastructure

- **Frontend Deploy**: Netlify
- **Backend Deploy**: Heroku
- **Cache & Pub/Sub**: Redis
- **Error Tracking**: Sentry
- **CI/CD**: GitHub Actions

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (LTS)
- npm or yarn
- Docker & Docker Compose (for local development)

### Local Development Setup

#### 1. Clone and Navigate to Project

```bash
cd "Task Management App"
```

#### 2. Start Database & Cache Services

```bash
docker-compose up -d
```

This starts MongoDB and Redis locally.

#### 3. Backend Setup

```bash
cd backend

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```

The backend runs on `http://localhost:3000`

#### 4. Frontend Setup (in a new terminal)

```bash
cd frontend

# Copy environment variables
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm start
```

The frontend runs on `http://localhost:3001`

### Environment Variables

#### Backend (.env)

```
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/taskapp
JWT_SECRET=your_jwt_secret_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
REDIS_URL=redis://localhost:6379
```

#### Frontend (.env)

```
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3000
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

See `.env.example` files for complete variable lists.

## 📁 Project Structure

```
Task Management App/
├── frontend/                    # React 18 + TypeScript frontend
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API client
│   │   ├── lib/                # Socket.io and state management
│   │   ├── types/              # TypeScript type definitions
│   │   ├── styles/             # Global styles
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .eslintrc.json
│   └── .env.example
│
├── backend/                     # Express + MongoDB backend
│   ├── src/
│   │   ├── routes/             # API route handlers
│   │   ├── controllers/        # Business logic
│   │   ├── services/           # Service layer
│   │   ├── models/             # Mongoose schemas
│   │   ├── middleware/         # Express middleware
│   │   ├── sockets/            # Socket.io event handlers
│   │   ├── jobs/               # Background job handlers
│   │   ├── utils/              # Utility functions
│   │   └── index.ts            # Server entry point
│   ├── tests/                  # Test files
│   ├── package.json
│   ├── tsconfig.json
│   ├── jest.config.js
│   ├── .eslintrc.json
│   └── .env.example
│
├── docs/                        # Documentation
├── docker-compose.yml          # Local development services
├── .gitignore
└── README.md                   # This file
```

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm test -- --coverage
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch
```

### E2E Tests

```bash
cd frontend

# Run Cypress tests (requires backend running)
npm run cypress:open
```

## 📝 Code Quality

### Linting

```bash
cd backend
npm run lint          # Check for linting errors
npm run lint:fix      # Fix linting errors

cd ../frontend
npm run lint
npm run lint:fix
```

### Code Formatting

```bash
cd backend
npm run format

cd ../frontend
npm run format
```

## 🔗 API Documentation

The API is documented using Swagger. Once the backend is running, visit:

```
http://localhost:3000/api-docs
```

### Key Endpoints

- `POST /auth/oauth/google` - OAuth2 login
- `GET/POST /projects` - Project management
- `GET/POST /projects/:projectId/boards` - Board management
- `GET/POST /columns/:columnId/cards` - Card management
- `GET/PUT /notifications` - Notifications
- `POST /projects/:projectId/calendar/sync` - Google Calendar sync

## 🔐 Security

- **HTTPS Only**: All production traffic is encrypted
- **CSRF Protection**: CSRF tokens for state-changing operations
- **XSS Prevention**: Input validation and output encoding
- **Rate Limiting**: API rate limiting on sensitive endpoints
- **JWT Auth**: Secure token-based authentication
- **Environment Secrets**: Sensitive data stored in environment variables

## 🚢 Deployment

### Frontend (Netlify)

```bash
cd frontend
npm run build
# Deployment handled by Netlify
```

### Backend (Heroku)

```bash
cd backend
npm run build
git push heroku main
```

See deployment guides in `/docs` for detailed instructions.

## 📊 Database Schema

### User

- email (unique)
- name
- avatarUrl
- providers (OAuth2 credentials)
- roles (per-project permissions)

### Project

- name
- description
- visibility (private, team, public)
- members (with roles)
- settings (calendar sync, default assignee)

### Board

- projectId
- name
- columnsOrder

### Column

- boardId
- title
- order
- limit (WIP limit, optional)

### Card

- columnId, boardId, projectId
- title, description
- assignees, tags
- priority, dueDate
- comments, activityLog
- attachments

### Notification

- userId
- type (task_assigned, task_moved, etc.)
- payload
- read status

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a pull request

## 📋 Development Checklist

- [ ] Set up local environment with Docker Compose
- [ ] Configure OAuth2 credentials
- [ ] Run backend and frontend servers
- [ ] Create test data in MongoDB
- [ ] Test drag-and-drop functionality
- [ ] Verify real-time synchronization
- [ ] Run test suite (target 85% coverage)
- [ ] Check linting and formatting
- [ ] Review API documentation

## 📅 Milestones

1. **Week 1-2**: Project setup, authentication, basic CRUD
2. **Week 3-4**: Kanban UI, drag-and-drop, real-time sync
3. **Week 5-6**: Notifications, calendar integration
4. **Week 7-8**: Reports, PDF export, testing
5. **Week 9**: Production hardening, deployment

## 📞 Support

For issues, questions, or suggestions, please open a GitHub issue or contact the development team.

## 📄 License

MIT License - See LICENSE file for details.
