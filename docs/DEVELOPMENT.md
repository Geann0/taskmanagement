# Development Guide

## Getting Started

### Prerequisites

- Node.js 18+ LTS
- npm or yarn
- Docker & Docker Compose
- Git

### Initial Setup

#### 1. Clone Repository

```bash
git clone https://github.com/your-repo/task-management-app.git
cd "Task Management App"
```

#### 2. Install Git Hooks

```bash
npm install husky --save-dev
npx husky install
```

#### 3. Start Services

```bash
docker-compose up -d
```

This starts MongoDB on port 27017 and Redis on port 6379.

#### 4. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
```

Backend runs on `http://localhost:3000`

#### 5. Frontend Setup (new terminal)

```bash
cd frontend

# Copy environment file
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs on `http://localhost:3001`

## Development Workflow

### Running Tests

**Backend:**

```bash
cd backend

# Run all tests
npm test

# Run in watch mode
npm run test:watch

# With coverage
npm test -- --coverage
```

**Frontend:**

```bash
cd frontend

# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# With coverage
npm test -- --coverage
```

### Code Quality

**Linting:**

```bash
cd backend
npm run lint
npm run lint:fix

cd ../frontend
npm run lint
npm run lint:fix
```

**Formatting:**

```bash
cd backend
npm run format

cd ../frontend
npm run format
```

### Database Management

**Connect to MongoDB:**

```bash
docker exec -it taskapp-mongodb mongosh
```

**View MongoDB data:**

```bash
# In mongo shell
use taskapp
db.users.find()
db.projects.find()
db.cards.find()
```

**Reset database:**

```bash
docker exec -it taskapp-mongodb mongosh --eval "db.dropDatabase()"
```

### Redis Management

**Connect to Redis:**

```bash
docker exec -it taskapp-redis redis-cli
```

**Clear cache:**

```bash
# In redis-cli
FLUSHALL
```

## API Testing

### Using curl

**Get projects:**

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/projects
```

**Create project:**

```bash
curl -X POST http://localhost:3000/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Project", "description": "Test"}'
```

### Using Postman

1. Import the Postman collection from `docs/postman-collection.json`
2. Set environment variables in Postman
3. Use pre-defined requests

### Using API Documentation

Visit `http://localhost:3000/api-docs` (once Swagger is configured)

## Socket.io Testing

**WebSocket connection:**

```javascript
const socket = io("http://localhost:3000", {
  auth: {
    token: "your_jwt_token",
  },
});

socket.on("connect", () => {
  console.log("Connected to server");
  socket.emit("joinProject", { projectId: "project_id" });
});

socket.on("cardMoved", (data) => {
  console.log("Card moved:", data);
});
```

## Debugging

### Backend Debugging

**VS Code:**

1. Add breakpoint in code
2. Open `Launch.json` and use Node debugger
3. Press F5 to start debugging

**Console logs:**

```typescript
console.info("Info message");
console.error("Error message");
console.warn("Warning message");
```

### Frontend Debugging

**React DevTools:**

1. Install React DevTools browser extension
2. Inspect components and state in DevTools

**Network Debugging:**

1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Monitor API calls
4. Check WebSocket frames in WS tab

## Environment Variables

### Backend Development

Create `backend/.env`:

```
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/taskapp
JWT_SECRET=dev-secret-key
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
REDIS_URL=redis://localhost:6379
```

### Frontend Development

Create `frontend/.env`:

```
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3000
REACT_APP_GOOGLE_CLIENT_ID=your_client_id
```

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type:**

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning
- `refactor`: Code change without feature/fix
- `perf`: Performance improvement
- `test`: Test-related changes
- `chore`: Build/dependency changes

**Examples:**

```
feat(cards): add drag-and-drop support
fix(auth): handle token refresh on 401
docs: update API endpoints
refactor(socket): simplify event handlers
test(projects): add comprehensive unit tests
```

### Pre-commit Hooks

Husky automatically runs linting and formatting on commits:

```bash
git commit -m "feat: new feature"
# Runs eslint and prettier automatically
```

## Troubleshooting

### MongoDB Connection Issues

**Error: connect ECONNREFUSED**

- Ensure Docker container is running: `docker-compose ps`
- Check MongoDB logs: `docker-compose logs mongodb`
- Restart services: `docker-compose restart mongodb`

### Redis Connection Issues

**Error: Redis connection refused**

- Verify Redis is running: `docker-compose ps`
- Check Redis logs: `docker-compose logs redis`
- Restart Redis: `docker-compose restart redis`

### Port Already in Use

**Error: EADDRINUSE :::3000**

```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or change port in .env
PORT=3001
```

### Token Expiration

If JWT token expires during development:

1. Delete token from localStorage
2. Log out and log in again via OAuth
3. New token will be generated

### Hot Reload Not Working

**Frontend:**

```bash
# Clear node modules and reinstall
rm -rf frontend/node_modules
npm install
npm start
```

**Backend:**

```bash
# Restart ts-node-dev
npm run dev
```

## Performance Tips

### Development

- Use Chrome DevTools for performance profiling
- Monitor Network tab for large bundle sizes
- Check React DevTools Profiler for re-renders

### Optimization

- Lazy load components for large apps
- Use React.memo for expensive components
- Implement pagination for large lists
- Cache API responses with TanStack Query

## Testing Best Practices

### Unit Tests

```typescript
describe("Card Service", () => {
  it("should create a card", async () => {
    const card = await cardService.create(mockData);
    expect(card._id).toBeDefined();
    expect(card.title).toBe(mockData.title);
  });
});
```

### Integration Tests

```typescript
describe("POST /cards", () => {
  it("should create a card", async () => {
    const response = await request(app)
      .post("/cards")
      .set("Authorization", `Bearer ${token}`)
      .send(mockCardData);

    expect(response.status).toBe(201);
    expect(response.body._id).toBeDefined();
  });
});
```

### Coverage Goals

- **Unit**: 85%+ coverage
- **Integration**: 80%+ coverage
- **E2E**: Critical user flows covered

## Common Tasks

### Creating a New Endpoint

1. Define TypeScript types in `src/types/`
2. Create Mongoose model in `src/models/`
3. Add controller logic in `src/controllers/`
4. Add service layer in `src/services/`
5. Create route in `src/routes/`
6. Write tests in `tests/`
7. Document in `docs/API.md`

### Adding a React Component

1. Create component in `src/components/`
2. Define types and props
3. Write component unit tests
4. Add to appropriate page
5. Update Storybook (if used)

### Database Migration

1. Update Mongoose schema
2. Create migration script if needed
3. Update tests
4. Document changes

## Resources

- [React 18 Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Socket.io Guide](https://socket.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## Getting Help

- Check existing GitHub issues
- Review architecture documentation
- Ask team members on Slack/Discord
- Check code comments and commits
