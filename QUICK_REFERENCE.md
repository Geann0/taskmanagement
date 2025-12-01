# Quick Reference Guide

## 🚀 Start Development (30 seconds)

```bash
# 1. Navigate to project
cd "Task Management App"

# 2. Start services
docker-compose up -d

# 3. Open two terminals

# Terminal 1: Backend
cd backend && npm install && npm run dev

# Terminal 2: Frontend
cd frontend && npm install && npm start
```

Access:

- 🎨 Frontend: http://localhost:3001
- 🔌 Backend: http://localhost:3000
- 📊 MongoDB: mongodb://localhost:27017
- ⚡ Redis: localhost:6379

## 📁 File Locations - Quick Map

### Backend Important Files

```
backend/
├── src/
│   ├── index.ts                 ← Server entry point
│   ├── models/
│   │   ├── User.ts              ← User schema
│   │   ├── Project.ts           ← Project schema
│   │   ├── Board.ts             ← Board schema
│   │   ├── Column.ts            ← Column schema
│   │   ├── Card.ts              ← Card schema
│   │   └── Notification.ts      ← Notification schema
│   ├── routes/
│   │   ├── auth.ts              ← Authentication
│   │   ├── projects.ts          ← Project endpoints
│   │   ├── cards.ts             ← Card endpoints
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.ts              ← JWT middleware
│   │   ├── validation.ts        ← Input validation
│   │   └── errorHandler.ts      ← Error handling
│   ├── sockets/
│   │   └── setup.ts             ← Socket.io events
│   └── utils/
│       ├── db.ts                ← MongoDB connection
│       ├── redis.ts             ← Redis connection
│       └── jwt.ts               ← JWT utilities
├── .env.example                 ← Copy to .env
├── package.json                 ← Dependencies
└── tsconfig.json                ← TypeScript config
```

### Frontend Important Files

```
frontend/
├── src/
│   ├── index.tsx                ← React root
│   ├── App.tsx                  ← Main component
│   ├── types/
│   │   └── index.ts             ← Type definitions
│   ├── components/
│   │   ├── Header.tsx           ← Header component
│   │   ├── Card.tsx             ← Card component
│   │   ├── Column.tsx           ← Column component
│   │   └── ...
│   ├── pages/
│   │   ├── LoginPage.tsx        ← Login page
│   │   └── Dashboard.tsx        ← Main dashboard
│   ├── services/
│   │   └── api.ts               ← API client
│   ├── lib/
│   │   ├── socket.ts            ← Socket.io client
│   │   └── store.ts             ← Zustand stores
│   └── styles/
│       └── index.css            ← Global styles
├── public/
│   └── index.html               ← HTML template
├── .env.example                 ← Copy to .env
├── package.json                 ← Dependencies
└── tsconfig.json                ← TypeScript config
```

## 🔧 Common Commands

### Backend

```bash
npm run dev           # Start with hot reload
npm run build         # Build for production
npm test              # Run tests
npm run lint          # Check code style
npm run lint:fix      # Fix style issues
npm run format        # Format with Prettier
```

### Frontend

```bash
npm start             # Start dev server
npm run build         # Build for production
npm test              # Run tests
npm run lint          # Check code style
npm run lint:fix      # Fix style issues
npm run format        # Format with Prettier
```

### Docker

```bash
docker-compose up -d      # Start services
docker-compose down       # Stop services
docker-compose logs       # View logs
docker-compose ps         # View running containers
```

## 🌐 API Quick Reference

### Authentication

```
POST /auth/oauth/google
Input: { code: string }
Output: { token: string, user: User }
```

### Projects

```
GET    /projects              List all projects
POST   /projects              Create project
GET    /projects/:id          Get project details
PUT    /projects/:id          Update project
DELETE /projects/:id          Delete project
```

### Cards

```
POST   /columns/:id/cards     Create card
GET    /cards/:id             Get card details
PUT    /cards/:id             Update card
DELETE /cards/:id             Delete card
POST   /cards/:id/move        Move to column
```

### Real-time (Socket.io)

```
Client → Server:
  socket.emit('joinProject', { projectId })
  socket.emit('cardMove', { cardId, toColumnId, position })
  socket.emit('commentCreate', { cardId, body })

Server → Client:
  socket.on('cardMoved', (data) => {})
  socket.on('cardCreated', (data) => {})
  socket.on('commentCreated', (data) => {})
```

## 📚 Documentation Quick Links

```
README.md              ← Overview and setup
docs/API.md           ← Full API specification
docs/ARCHITECTURE.md  ← System design
docs/DEVELOPMENT.md   ← Dev workflow
docs/DEPLOYMENT.md    ← Production deployment
```

## 🔐 Environment Variables

### Backend .env

```
PORT=3000
MONGO_URI=mongodb://localhost:27017/taskapp
JWT_SECRET=dev-secret
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret
REDIS_URL=redis://localhost:6379
```

### Frontend .env

```
REACT_APP_API_URL=http://localhost:3000
REACT_APP_WS_URL=ws://localhost:3000
REACT_APP_GOOGLE_CLIENT_ID=your_id
```

## 🐛 Debugging Tips

### Backend

- Check logs: `npm run dev` console output
- Database issues: `docker logs taskapp-mongodb`
- Redis issues: `docker logs taskapp-redis`
- Test endpoint: `curl http://localhost:3000/health`

### Frontend

- Open DevTools: F12
- Check Network tab for API calls
- Check Console for errors
- React DevTools for component state

### Database

```bash
# Connect to MongoDB
docker exec -it taskapp-mongodb mongosh

# View collections
use taskapp
db.users.find()
db.projects.find()
db.cards.find()

# Clear all data
db.dropDatabase()
```

## 📊 Project Structure Overview

```
Frontend (React)          ← Localhost:3001
    ↓
API Calls (HTTP)
    ↓
Backend (Express)        ← Localhost:3000
    ↓
Database (MongoDB)       ← Localhost:27017
Cache (Redis)            ← Localhost:6379
```

## 🔄 Development Cycle

1. **Make Changes**

   - Edit code in `src/` folders
   - Hot reload happens automatically

2. **Test Locally**

   - Run tests: `npm test`
   - Test endpoints: Use Postman/curl
   - Check console for errors

3. **Commit Code**

   - Git hooks run automatically
   - Linting/formatting applied
   - Tests verified

4. **Push to GitHub**
   - CI/CD pipelines run
   - Tests executed
   - Build verified
   - Deploy on main branch

## 🎯 Key Features by Component

### User Authentication

- **Backend**: `src/routes/auth.ts`
- **Frontend**: `src/pages/LoginPage.tsx`
- **Service**: `src/services/api.ts` → `loginWithGoogle()`

### Project Management

- **Backend**: `src/routes/projects.ts`
- **Frontend**: `src/pages/Dashboard.tsx`
- **Store**: `src/lib/store.ts` → `useProjectStore`

### Real-time Sync

- **Backend**: `src/sockets/setup.ts`
- **Frontend**: `src/lib/socket.ts`
- **Events**: joinProject, cardMove, cardCreated, etc.

### Cards & Boards

- **Models**: `src/models/Card.ts`, `src/models/Board.ts`
- **Routes**: `src/routes/cards.ts`
- **Component**: `src/components/Card.tsx`

## 📈 Performance Tips

- Use React DevTools Profiler to find slow renders
- Check Network tab for large API responses
- Implement pagination for long lists
- Use code splitting for large components
- Enable compression in production

## 🚨 Common Issues & Solutions

### Port Already in Use

```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### MongoDB Connection Failed

```bash
# Restart MongoDB
docker-compose restart mongodb

# Check logs
docker logs taskapp-mongodb
```

### Dependencies Issue

```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm install
```

### Hot Reload Not Working

```bash
# Restart dev server
npm run dev

# Or full restart
docker-compose down
docker-compose up -d
```

## 📞 Getting Help

1. **Check Documentation**: See `/docs` folder
2. **Review Code Comments**: Well-documented codebase
3. **Check Git Logs**: Commit messages explain changes
4. **Search Issues**: GitHub issues for known problems
5. **Team Chat**: Discuss with team members

## ✨ Next Actions

```
1. npm install dependencies    [Backend & Frontend]
2. Copy .env.example → .env     [Both folders]
3. docker-compose up -d         [Start services]
4. npm run dev                  [Start Backend]
5. npm start                    [Start Frontend]
6. Open http://localhost:3001   [Test Frontend]
```

---

**You're all set! Happy coding! 🚀**
