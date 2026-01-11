# Job Scheduler & Automation System

A professional full-stack job scheduling and automation dashboard built for Dotix Technologies' Full Stack Developer assessment. This system allows users to create, manage, and execute background tasks with real-time status tracking and webhook integrations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black)

## 🎯 Project Overview

The Job Scheduler & Automation System is a mini automation engine designed to handle background tasks such as sending emails, generating reports, and syncing data. It provides a clean, modern interface for creating jobs, monitoring their execution status, and tracking webhook notifications.

**Key Features:**
- ✨ Create and manage automation jobs with JSON payloads
- 🎯 Priority-based job organization (Low, Medium, High)
- 📊 Real-time dashboard with status tracking
- 🔄 Automatic job execution with 3-second simulation
- 🪝 Webhook integration for job completion notifications
- 📝 Comprehensive webhook logging
- 🎨 Professional, responsive UI with Tailwind CSS
- 🔍 Advanced filtering by status and priority
- 📈 Real-time statistics and analytics

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** Custom Shadcn-inspired components
- **Icons:** Lucide React
- **HTTP Client:** Axios
- **Fonts:** Inter (Google Fonts)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (with mysql2)
- **API Style:** RESTful
- **Environment:** dotenv
- **HTTP Client:** Axios (for webhooks)

### Development Tools
- **Package Manager:** npm
- **Version Control:** Git
- **Code Style:** ESLint
- **Auto-reload:** Nodemon (backend)

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Next.js App Router (React Components)              │   │
│  │  - Dashboard (Job List + Stats)                     │   │
│  │  - Create Job Page                                  │   │
│  │  - Job Detail Page                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  API Service Layer (Axios)                          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP/REST
┌─────────────────────────────────────────────────────────────┐
│                         Backend                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Express.js REST API                                │   │
│  │  └── Routes                                         │   │
│  │      └── Controllers                                │   │
│  │          └── Services (Business Logic)              │   │
│  │              └── Database (MySQL)                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                           ↓                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Webhook Service (Axios)                            │   │
│  │  └── Triggers on job completion                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP POST
┌─────────────────────────────────────────────────────────────┐
│              External Webhook Receiver                      │
│              (webhook.site or custom endpoint)              │
└─────────────────────────────────────────────────────────────┘
```

### Backend Architecture (Clean Architecture Pattern)

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   └── database.js   # Database connection pool
│   ├── routes/           # API route definitions
│   │   └── jobRoutes.js  # Job-related routes
│   ├── controllers/      # Request/Response handling
│   │   └── jobController.js
│   ├── services/         # Business logic layer
│   │   └── jobService.js # Core job operations
│   ├── db/               # Database schemas and initialization
│   │   ├── schema.sql    # MySQL schema
│   │   └── init.js       # Database setup script
│   ├── utils/            # Utility functions
│   │   ├── validation.js # Input validation
│   │   └── logger.js     # Logging utilities
│   └── server.js         # Express app entry point
```

**Key Design Principles:**
- **Separation of Concerns:** Routes → Controllers → Services → Database
- **Single Responsibility:** Each module has a clear, focused purpose
- **Dependency Injection:** Services are injected into controllers
- **Error Handling:** Centralized error handling with appropriate HTTP codes
- **Validation:** Input validation at controller level before processing

---

## 📊 Database Design

### Entity Relationship Diagram

```
┌─────────────────────────────────────┐
│             jobs                    │
├─────────────────────────────────────┤
│ PK id (INT, AUTO_INCREMENT)         │
│    taskName (VARCHAR(255))          │
│    payload (JSON)                   │
│    priority (ENUM: Low/Med/High)    │
│    status (ENUM: pending/...)       │
│    createdAt (TIMESTAMP)            │
│    updatedAt (TIMESTAMP)            │
│    completedAt (TIMESTAMP, NULL)    │
└─────────────────────────────────────┘
               │ 1
               │
               │ has many
               │
               │ *
┌─────────────────────────────────────┐
│         webhook_logs                │
├─────────────────────────────────────┤
│ PK id (INT, AUTO_INCREMENT)         │
│ FK jobId (INT)                      │
│    requestPayload (JSON)            │
│    responseStatus (INT)             │
│    responseData (TEXT)              │
│    success (BOOLEAN)                │
│    createdAt (TIMESTAMP)            │
└─────────────────────────────────────┘
```

### Schema Details

#### `jobs` Table
- **Primary Key:** `id` - Auto-incrementing identifier
- **taskName:** Human-readable task description
- **payload:** JSON data passed to job processor
- **priority:** Job importance level (Low, Medium, High)
- **status:** Current state (pending, running, completed, failed)
- **createdAt:** Job creation timestamp
- **updatedAt:** Last modification timestamp
- **completedAt:** Completion timestamp (NULL if not completed)

**Indexes:**
- `idx_status` - Fast filtering by status
- `idx_priority` - Fast filtering by priority
- `idx_created_at` - Chronological ordering
- `idx_status_priority` - Combined filtering optimization

#### `webhook_logs` Table
- **Primary Key:** `id` - Auto-incrementing identifier
- **Foreign Key:** `jobId` - References jobs(id) with CASCADE delete
- **requestPayload:** JSON sent to webhook
- **responseStatus:** HTTP response code
- **responseData:** Response body or error message
- **success:** Boolean flag for quick filtering
- **createdAt:** Log entry timestamp

**Indexes:**
- `idx_job_id` - Fast lookup by job
- `idx_created_at` - Chronological ordering

**Design Rationale:**
- **JSON payload** allows flexible, schema-less job data
- **ENUM types** enforce valid values at database level
- **Composite indexes** optimize common query patterns
- **Separate webhook logs** maintain audit trail without cluttering jobs table
- **Cascading deletes** maintain referential integrity

---

## 🔌 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### 1. Health Check
```http
GET /health
```
**Response:**
```json
{
  "success": true,
  "message": "Job Scheduler API is running",
  "timestamp": "2026-01-11T10:30:00.000Z",
  "uptime": 3600
}
```

---

#### 2. Create Job
```http
POST /api/jobs
```

**Request Body:**
```json
{
  "taskName": "Send Welcome Email",
  "payload": "{\"email\": \"user@example.com\", \"template\": \"welcome\"}",
  "priority": "High"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Job created successfully",
  "data": {
    "id": 1,
    "taskName": "Send Welcome Email",
    "payload": {"email": "user@example.com", "template": "welcome"},
    "priority": "High",
    "status": "pending",
    "createdAt": "2026-01-11T10:30:00.000Z",
    "updatedAt": "2026-01-11T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "taskName is required and must be a string",
    "payload must be valid JSON"
  ]
}
```

---

#### 3. Get All Jobs
```http
GET /api/jobs?status=pending&priority=High
```

**Query Parameters:**
- `status` (optional): pending | running | completed | failed
- `priority` (optional): Low | Medium | High

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "taskName": "Send Welcome Email",
      "payload": {"email": "user@example.com"},
      "priority": "High",
      "status": "pending",
      "createdAt": "2026-01-11T10:30:00.000Z",
      "updatedAt": "2026-01-11T10:30:00.000Z",
      "completedAt": null
    }
  ]
}
```

---

#### 4. Get Job by ID
```http
GET /api/jobs/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "taskName": "Send Welcome Email",
    "payload": {"email": "user@example.com"},
    "priority": "High",
    "status": "completed",
    "createdAt": "2026-01-11T10:30:00.000Z",
    "updatedAt": "2026-01-11T10:30:03.000Z",
    "completedAt": "2026-01-11T10:30:03.000Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "message": "Job not found"
}
```

---

#### 5. Run Job
```http
POST /api/run-job/:id
```

**Process:**
1. Validates job exists and status is "pending"
2. Updates status to "running"
3. Simulates processing (3 seconds)
4. Updates status to "completed"
5. Sets completedAt timestamp
6. Triggers webhook
7. Logs webhook call

**Response (200):**
```json
{
  "success": true,
  "message": "Job executed successfully",
  "data": {
    "id": 1,
    "taskName": "Send Welcome Email",
    "status": "completed",
    "completedAt": "2026-01-11T10:30:03.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Cannot execute job with status: completed"
}
```

---

#### 6. Get Webhook Logs
```http
GET /api/jobs/:id/webhooks
```

**Response (200):**
```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": 1,
      "jobId": 1,
      "requestPayload": {
        "jobId": 1,
        "taskName": "Send Welcome Email",
        "priority": "High",
        "payload": {"email": "user@example.com"},
        "completedAt": "2026-01-11T10:30:03.000Z"
      },
      "responseStatus": 200,
      "responseData": "OK",
      "success": true,
      "createdAt": "2026-01-11T10:30:03.100Z"
    }
  ]
}
```

---

#### 7. Webhook Test Receiver
```http
POST /api/webhook-test
```

**Purpose:** Local endpoint for testing webhooks without external service

**Response (200):**
```json
{
  "success": true,
  "message": "Webhook received successfully",
  "receivedData": {...},
  "timestamp": "2026-01-11T10:30:03.000Z"
}
```

---

## 🪝 Webhook Integration

### How It Works

When a job completes successfully:

1. **Trigger Point:** After job status changes to "completed"
2. **Payload Construction:** Creates webhook payload with job details
3. **HTTP POST:** Sends POST request to configured webhook URL
4. **Logging:** Records request and response in webhook_logs table
5. **Non-Blocking:** Webhook failures don't affect job completion

### Webhook Payload Structure

```json
{
  "jobId": 1,
  "taskName": "Send Welcome Email",
  "priority": "High",
  "payload": {
    "email": "user@example.com",
    "template": "welcome"
  },
  "completedAt": "2026-01-11T10:30:03.000Z"
}
```

### Configuration

Set webhook URL in backend `.env`:
```env
WEBHOOK_URL=https://webhook.site/your-unique-id
```

### Testing Webhooks

**Option 1: webhook.site**
1. Visit https://webhook.site
2. Copy your unique URL
3. Update WEBHOOK_URL in .env
4. Run a job and view the webhook call on webhook.site

**Option 2: Local Test Endpoint**
```bash
# Use the built-in test receiver
curl -X POST http://localhost:5000/api/webhook-test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Error Handling

- **Network Errors:** Logged but don't fail the job
- **Timeout:** 10-second timeout configured
- **Invalid URL:** Skips webhook call with warning
- **All Calls Logged:** Success or failure tracked in database

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MySQL >= 8.0

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your MySQL credentials:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=job_scheduler
DB_PORT=3306

WEBHOOK_URL=https://webhook.site/your-unique-id

ALLOWED_ORIGINS=http://localhost:3000
```

4. **Initialize database:**
```bash
npm run init-db
```

This will:
- Create the `job_scheduler` database
- Create `jobs` and `webhook_logs` tables
- Insert sample data for testing

5. **Start the server:**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run at: `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. **Start the development server:**
```bash
npm run dev
```

Frontend will run at: `http://localhost:3000`

5. **Build for production:**
```bash
npm run build
npm start
```

---

## 💻 Usage Guide

### Creating a Job

1. Navigate to the "Create Job" page
2. Fill in the form:
   - **Task Name:** Descriptive name (e.g., "Send Welcome Email")
   - **Payload:** Valid JSON data (e.g., `{"email": "user@example.com"}`)
   - **Priority:** Low, Medium, or High
3. Click "Create Job"
4. Redirected to dashboard with new job visible

### Running a Job

1. From the dashboard, locate your job
2. Click the "Run Job" button
3. Status changes: pending → running → completed
4. View real-time updates as job executes
5. Webhook automatically triggered on completion

### Monitoring Jobs

1. **Dashboard:** View all jobs with real-time stats
2. **Filters:** Filter by status and/or priority
3. **Auto-Refresh:** Dashboard updates every 5 seconds
4. **Details:** Click "Details" to view full job information

### Viewing Webhook Logs

1. Navigate to a job's detail page
2. Scroll to "Webhook Logs" section
3. View request payload, response status, and timestamps
4. Success/failure indicators for each webhook call

---

## 🤖 AI Usage Documentation

### AI Tools Used

This project was developed with assistance from **Claude 3.7 Sonnet** (Anthropic).

### Model Information
- **Model:** Claude 3.7 Sonnet
- **Provider:** Anthropic
- **Interface:** Claude.ai Web Interface

### Prompts Used

#### Initial Project Setup Prompt
```
I need realtime code with professional interface recruiter will impress 
with my interface implement complete without excluding a single project.

[Provided full project requirements document from Dotix Technologies]
```

### What AI Helped With

1. **Backend Architecture (60% AI-assisted)**
   - Clean architecture pattern implementation
   - Service layer design
   - Database schema optimization
   - Error handling patterns
   - Webhook integration logic

2. **Frontend Design (70% AI-assisted)**
   - Modern, professional UI component design
   - Tailwind CSS styling and gradients
   - Responsive layout patterns
   - Component composition
   - State management patterns

3. **Database Design (40% AI-assisted)**
   - Table schema creation
   - Index optimization
   - Foreign key relationships
   - Sample data generation

4. **API Design (50% AI-assisted)**
   - RESTful endpoint structure
   - Request/response formats
   - Validation logic
   - HTTP status code selection

5. **Documentation (80% AI-assisted)**
   - README structure
   - API documentation
   - Code comments
   - Setup instructions
   - Architecture diagrams

### Manual Contributions

1. **Custom Business Logic:**
   - Job execution simulation timing
   - Specific validation rules
   - Webhook payload structure

2. **UI Refinements:**
   - Color scheme selection
   - Animation timing
   - Layout spacing adjustments

3. **Integration:**
   - Environment configuration
   - Cross-component communication
   - Real-time refresh logic

### AI Collaboration Strategy

**Effective Patterns:**
- Provided complete requirements upfront
- Asked for production-ready, professional code
- Requested modular, clean architecture
- Specified modern UI/UX expectations

**What Worked Well:**
- AI understood complex system architecture
- Generated professional, recruiter-worthy code
- Followed clean code principles
- Created comprehensive documentation

**Learning Experience:**
- AI excels at boilerplate and structure
- Human oversight essential for business logic
- Iterative refinement improves output quality
- Clear requirements lead to better results

---

## 📁 Project Structure

```
job-scheduler-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   └── jobController.js
│   │   ├── db/
│   │   │   ├── init.js
│   │   │   └── schema.sql
│   │   ├── routes/
│   │   │   └── jobRoutes.js
│   │   ├── services/
│   │   │   └── jobService.js
│   │   ├── utils/
│   │   │   ├── logger.js
│   │   │   └── validation.js
│   │   └── server.js
│   ├── .env.example
│   ├── .gitignore
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── create/
│   │   │   └── page.jsx
│   │   ├── jobs/
│   │   │   └── [id]/
│   │   │       └── page.jsx
│   │   ├── globals.css
│   │   ├── layout.jsx
│   │   └── page.jsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── badge.jsx
│   │   │   ├── button.jsx
│   │   │   ├── card.jsx
│   │   │   ├── input.jsx
│   │   │   ├── label.jsx
│   │   │   ├── select.jsx
│   │   │   └── textarea.jsx
│   │   ├── JobCard.jsx
│   │   ├── JobFilters.jsx
│   │   ├── Navigation.jsx
│   │   └── Stats.jsx
│   ├── lib/
│   │   ├── api.js
│   │   └── utils.js
│   ├── .env.example
│   ├── .gitignore
│   ├── jsconfig.json
│   ├── next.config.js
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.js
│
└── README.md
```

---

## 🎨 UI/UX Features

### Design Philosophy
- **Modern & Clean:** Minimalist design with purposeful use of color
- **Professional:** Business-ready interface suitable for production
- **Responsive:** Works seamlessly on desktop, tablet, and mobile
- **Accessible:** High contrast, clear typography, logical navigation

### Visual Elements
- **Gradient Backgrounds:** Subtle gradients for depth
- **Card-Based Layout:** Organized content in clear sections
- **Status Indicators:** Color-coded badges for quick recognition
- **Loading States:** Smooth animations during async operations
- **Hover Effects:** Interactive feedback on user actions

### Color Scheme
- **Primary:** Blue gradient (#667eea → #764ba2)
- **Status Colors:**
  - Pending: Yellow
  - Running: Blue (with pulse animation)
  - Completed: Green
  - Failed: Red
- **Priority Colors:**
  - Low: Gray
  - Medium: Orange
  - High: Red

### Animations
- Page transitions with fade-in
- Button hover effects
- Loading spinners
- Pulse animation for running jobs
- Smooth status updates

---

## 🔒 Production Readiness

### Security Features
- Input validation on all endpoints
- SQL injection prevention (parameterized queries)
- JSON payload validation
- CORS configuration
- Environment-based secrets

### Performance Optimizations
- Database connection pooling
- Indexed queries for fast lookups
- Auto-refresh with debouncing
- Efficient React re-renders
- Lazy loading of job details

### Error Handling
- Global error handlers
- Graceful degradation
- User-friendly error messages
- Comprehensive logging
- Webhook failure tolerance

### Scalability Considerations
- Modular service architecture
- Stateless API design
- Database indexes for growth
- Async job processing
- Webhook queue-ready structure

---

## 🧪 Testing

### Manual Testing Checklist

**Backend:**
- [x] Create job with valid data
- [x] Create job with invalid JSON
- [x] Create job with missing fields
- [x] Get all jobs (no filters)
- [x] Get jobs filtered by status
- [x] Get jobs filtered by priority
- [x] Get job by valid ID
- [x] Get job by invalid ID
- [x] Run pending job
- [x] Try to run completed job
- [x] Verify webhook triggers
- [x] Check webhook logs

**Frontend:**
- [x] Dashboard loads correctly
- [x] Create job form validation
- [x] JSON formatter works
- [x] Filters apply correctly
- [x] Job cards display properly
- [x] Run job button states
- [x] Real-time updates
- [x] Detail page navigation
- [x] Mobile responsiveness

### API Testing with cURL

```bash
# Create a job
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "taskName": "Test Job",
    "payload": "{\"test\": true}",
    "priority": "High"
  }'

# Get all jobs
curl http://localhost:5000/api/jobs

# Run a job
curl -X POST http://localhost:5000/api/run-job/1

# Get job details
curl http://localhost:5000/api/jobs/1
```

---

## 🚢 Deployment

### Backend Deployment (Railway/Render)

1. **Prepare for deployment:**
```bash
# Ensure all dependencies are in package.json
npm install

# Test production build
NODE_ENV=production npm start
```

2. **Configure environment variables on platform:**
- PORT (automatically set by platform)
- DB_HOST, DB_USER, DB_PASSWORD, DB_NAME
- WEBHOOK_URL
- ALLOWED_ORIGINS

3. **Deploy:**
- Connect GitHub repository
- Set build command: `npm install`
- Set start command: `npm start`
- Add MySQL addon or external database

### Frontend Deployment (Vercel)

1. **Prepare for deployment:**
```bash
npm run build
```

2. **Configure on Vercel:**
- Connect GitHub repository
- Framework: Next.js
- Build command: `npm run build`
- Environment variable: `NEXT_PUBLIC_API_URL`

3. **Deploy:**
```bash
# Using Vercel CLI
npx vercel --prod
```

---

## 📝 Environment Variables Reference

### Backend (.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=job_scheduler
DB_PORT=3306

# Webhook
WEBHOOK_URL=https://webhook.site/your-unique-id

# CORS
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🤝 Contributing

This is a showcase project for Dotix Technologies assessment. For improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - feel free to use this project for learning and reference.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- **Dotix Technologies** - For the comprehensive assessment project
- **Anthropic (Claude)** - AI assistance in development
- **Shadcn UI** - Design inspiration for components
- **Next.js Team** - Excellent framework documentation
- **MySQL** - Robust database system

---

## 📞 Support

For questions or issues:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Contact via email with [Job Scheduler] in subject

---

**Built with ❤️ using Next.js, Express, and MySQL**

*Last Updated: January 11, 2026*
