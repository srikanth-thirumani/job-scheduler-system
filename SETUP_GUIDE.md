# Quick Setup Guide

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed (`node --version`)
- ✅ npm 9+ installed (`npm --version`)
- ✅ MySQL 8+ installed and running
- ✅ Git installed

## 5-Minute Quick Start

### Step 1: Clone Repository
```bash
git clone <your-repo-url>
cd job-scheduler-system
```

### Step 2: Backend Setup (2 minutes)
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MySQL credentials
npm run init-db
npm run dev
```

**Verify:** Visit http://localhost:5000/health

### Step 3: Frontend Setup (2 minutes)
```bash
# Open new terminal
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

**Verify:** Visit http://localhost:3000

### Step 4: Configure Webhook (1 minute)
1. Go to https://webhook.site
2. Copy your unique URL
3. Update `WEBHOOK_URL` in `backend/.env`
4. Restart backend server

## Common Issues & Solutions

### MySQL Connection Failed
```bash
# Check MySQL is running
sudo service mysql status  # Linux
brew services list         # macOS

# Test MySQL connection
mysql -u root -p
```

### Port Already in Use
```bash
# Backend (port 5000)
lsof -ti:5000 | xargs kill -9

# Frontend (port 3000)
lsof -ti:3000 | xargs kill -9
```

### Database Initialization Failed
```bash
# Manually create database
mysql -u root -p
> CREATE DATABASE job_scheduler;
> exit

# Then run init script
npm run init-db
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Verify Installation

### Test Backend
```bash
# Health check
curl http://localhost:5000/health

# Create test job
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "taskName": "Test Job",
    "payload": "{\"test\": true}",
    "priority": "High"
  }'
```

### Test Frontend
1. Open http://localhost:3000
2. Navigate to "Create Job"
3. Fill in the form and submit
4. Return to Dashboard
5. Click "Run Job"
6. Check webhook.site for webhook call

## Next Steps

1. ✅ Create your first job
2. ✅ Run it and watch the status change
3. ✅ Check webhook logs on webhook.site
4. ✅ Explore filters on the dashboard
5. ✅ View job details page

## Need Help?

- 📖 Read the full README.md
- 🐛 Check GitHub Issues
- 💬 Contact maintainer

---

**Setup Time:** ~5 minutes  
**Difficulty:** Beginner-friendly  
**Status:** Ready for development
