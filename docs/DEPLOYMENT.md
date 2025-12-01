# Deployment Guide

## Prerequisites

- Heroku account (backend)
- Netlify account (frontend)
- MongoDB Atlas account or managed MongoDB
- Redis provider (Heroku Redis, Redis Cloud, etc.)
- GitHub repository with main branch

## Backend Deployment (Heroku)

### 1. Create Heroku App

```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create app
heroku create task-management-api

# Check apps
heroku apps
```

### 2. Configure Environment Variables

```bash
# Set variables for production
heroku config:set PORT=80
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/taskapp
heroku config:set JWT_SECRET=your-long-random-secret
heroku config:set JWT_EXPIRES_IN=7d
heroku config:set JWT_REFRESH_EXPIRES_IN=30d
heroku config:set GOOGLE_CLIENT_ID=your_google_client_id
heroku config:set GOOGLE_CLIENT_SECRET=your_google_client_secret
heroku config:set GOOGLE_REDIRECT_URI=https://task-management-api.herokuapp.com/auth/oauth/google/callback
heroku config:set REDIS_URL=redis://...
heroku config:set VAPID_PUBLIC_KEY=your_vapid_public_key
heroku config:set VAPID_PRIVATE_KEY=your_vapid_private_key
heroku config:set SENTRY_DSN=your_sentry_dsn
```

### 3. Create Procfile

Create `backend/Procfile`:

```
web: npm start
worker: npm run worker
```

### 4. Deploy

**Option A: Via Git Push**

```bash
# Ensure backend directory is set as root (see git subtree below)
git push heroku main
```

**Option B: Using Git Subtree**

```bash
git subtree push --prefix backend heroku main
```

**Option C: GitHub Actions (Recommended)**

The `.github/workflows/deploy.yml` automatically deploys to Heroku on push to main.

Configure GitHub Secrets:

- `HEROKU_API_KEY`: Get from Heroku account settings
- `HEROKU_APP_NAME`: Your Heroku app name
- `HEROKU_EMAIL`: Your Heroku email

### 5. Verify Deployment

```bash
# Check logs
heroku logs --tail

# Test health endpoint
curl https://task-management-api.herokuapp.com/health

# Check environment
heroku config
```

### 6. Database Setup

**MongoDB Atlas:**

1. Create cluster at https://www.mongodb.com/cloud/atlas
2. Create database user
3. Get connection string
4. Whitelist Heroku IP addresses
5. Set `MONGO_URI` environment variable

**Redis Add-on:**

```bash
heroku addons:create heroku-redis:premium-0
```

## Frontend Deployment (Netlify)

### 1. Connect GitHub Repository

1. Go to https://app.netlify.com
2. Click "New site from Git"
3. Connect GitHub account
4. Select repository

### 2. Configure Build Settings

**Build command:**

```bash
npm run build
```

**Publish directory:**

```
frontend/build
```

**Environment variables:**
Add in Netlify Dashboard (Site settings → Build & deploy → Environment):

```
REACT_APP_API_URL=https://task-management-api.herokuapp.com
REACT_APP_WS_URL=wss://task-management-api.herokuapp.com
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_VAPID_PUBLIC_KEY=your_vapid_public_key
```

### 3. Deploy

Netlify auto-deploys on push to main branch.

### 4. Configure Custom Domain

1. Go to Site settings → Domain management
2. Add custom domain
3. Update DNS records (provided by Netlify)

## Database Setup (MongoDB Atlas)

### 1. Create Cluster

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create new project
3. Create M0 (free) or paid cluster
4. Choose region close to deployment location

### 2. Create Database User

1. Go to Database Access
2. Add database user with strong password
3. Set permissions (readWrite on target database)

### 3. Get Connection String

1. Go to Clusters → Connect
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<username>`, `<password>`, `<cluster>`
5. Set as `MONGO_URI` in Heroku

### 4. Network Access

1. Go to Network Access
2. Add IP Address
3. For development: 0.0.0.0/0 (not recommended for production)
4. For production: Whitelist Heroku IPs

**Get Heroku Dyno IPs:**

```bash
# These are not fixed, use Heroku IP ranges
# See: https://devcenter.heroku.com/articles/dyno-metadata
```

**Better approach:** Use MongoDB Atlas with any IP, rely on connection authentication.

## Redis Setup

### Option 1: Heroku Redis Add-on

```bash
heroku addons:create heroku-redis:premium-0
heroku config:get REDIS_URL
```

### Option 2: Redis Cloud

1. Sign up at https://redis.com/try-free/
2. Create database
3. Get connection URI
4. Set as `REDIS_URL` in Heroku

### Option 3: Self-hosted Redis on Heroku

Use a separate dyno or external provider.

## SSL/HTTPS

### Automatically Enabled

- **Heroku**: Free SSL certificate via Let's Encrypt
- **Netlify**: Free SSL certificate

### Custom Domain SSL

Both platforms provide free SSL for custom domains.

## Monitoring & Logging

### Heroku Logs

```bash
# View logs
heroku logs --tail

# View specific dyno logs
heroku logs --dyno=web

# View certain amount of logs
heroku logs --num=50
```

### Sentry Integration

1. Create Sentry account
2. Create project for Node.js
3. Get DSN
4. Set `SENTRY_DSN` in Heroku
5. Backend automatically sends errors to Sentry

### Application Performance Monitoring

Heroku Metrics:

```bash
heroku metrics
```

## Database Backups

### MongoDB Atlas

1. Go to Cluster → Backup
2. Enable automatic backups
3. Set retention policy
4. Download backups as needed

### Test Restore

Periodically test restoring from backup to ensure integrity.

## Scaling

### Vertical Scaling (Bigger Dyno)

```bash
# Upgrade dyno type
heroku dyno:type web standard-1x
heroku dyno:type worker standard-1x
```

### Horizontal Scaling (More Dynos)

```bash
# Add more web dynos
heroku ps:scale web=2
heroku ps:scale worker=2

# View dyno status
heroku ps
```

## Zero-downtime Deployments

Both Heroku and Netlify support zero-downtime deployments by default.

### Pre-deployment Checks

1. Run full test suite
2. Verify all linting passes
3. Check test coverage
4. Review code changes

## Rollback

### Heroku Rollback

```bash
# View releases
heroku releases

# Rollback to previous version
heroku rollback v123
```

### Netlify Rollback

1. Go to Deploys
2. Click on previous deploy
3. Click "Restore this deploy"

## Performance Optimization

### Frontend

- Enable gzip compression (automatic on Netlify)
- Optimize bundle size
- Use lazy loading
- Implement service workers

### Backend

- Database indexes optimized
- Connection pooling configured
- Response caching enabled
- Rate limiting in place

### Redis Caching

- Project metadata cached
- User sessions cached
- Socket.io presence cached

## Security Checklist

- [ ] All environment variables set
- [ ] HTTPS enforced
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] MongoDB user credentials strong
- [ ] Redis password set
- [ ] Sentry configured for error tracking
- [ ] Database backups enabled
- [ ] SSL certificates valid
- [ ] Firewall/IP whitelist configured

## Monitoring Alerts

Set up alerts for:

1. High error rate (>1% of requests)
2. Response time > 2 seconds
3. Database connection failures
4. Redis connection failures
5. Low disk space
6. Memory usage > 90%

## Maintenance Windows

- Database maintenance: Schedule during low traffic
- Dependency updates: Monthly security reviews
- Log rotation: Automated on both platforms
- Certificate renewal: Automatic

## Support & Troubleshooting

### Common Issues

**Cold start (first request is slow)**

- Use dyno wake-up service
- Pre-warm application

**Memory leaks**

- Monitor with Heroku metrics
- Check Node.js memory usage
- Restart dynos periodically

**Socket timeout**

- Increase timeout in Socket.io config
- Check Redis connection health
- Scale horizontally if needed

### Getting Help

- Heroku Support: https://help.heroku.com
- Netlify Support: https://docs.netlify.com
- MongoDB Support: https://www.mongodb.com/support
- GitHub Issues: Your repository

## Post-Deployment Checklist

- [ ] Test login with OAuth2
- [ ] Create project and add cards
- [ ] Test drag-and-drop
- [ ] Verify real-time sync on multiple clients
- [ ] Test notifications
- [ ] Download PDF reports
- [ ] Check error logs in Sentry
- [ ] Monitor performance metrics
- [ ] Test database backup/restore
- [ ] Document any issues discovered

## Cost Estimation

### Heroku

- Web dyno: $5-7/month (standard-1x with auto-scaling)
- Worker dyno: $5/month
- Postgres: $9-200+/month
- Redis: $15+/month
- **Total**: ~$35-40/month for hobby → $400+/month for production

### Netlify

- **Free** for up to 300 minutes/month builds
- Pro: $19/month for custom domains, extra builds

### MongoDB Atlas

- **Free**: M0 shared cluster (3GB)
- $57/month for M10 dedicated cluster

### Redis Cloud

- **Free**: 30MB database
- $10+/month for production instances

**Total Estimated Production Cost: $100-150/month**
