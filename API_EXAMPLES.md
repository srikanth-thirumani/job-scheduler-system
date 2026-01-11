# API Usage Examples

Complete examples for testing the Job Scheduler API.

## Using cURL

### 1. Create Jobs

**High Priority Email Job:**
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "taskName": "Send Welcome Email",
    "payload": "{\"email\": \"user@example.com\", \"template\": \"welcome\", \"language\": \"en\"}",
    "priority": "High"
  }'
```

**Medium Priority Report Job:**
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "taskName": "Generate Monthly Report",
    "payload": "{\"month\": \"January\", \"year\": 2026, \"format\": \"PDF\", \"recipients\": [\"admin@company.com\"]}",
    "priority": "Medium"
  }'
```

**Low Priority Sync Job:**
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "taskName": "Sync Customer Data",
    "payload": "{\"source\": \"CRM\", \"destination\": \"Analytics\", \"recordCount\": 1500, \"incremental\": true}",
    "priority": "Low"
  }'
```

### 2. Get All Jobs

**No Filters:**
```bash
curl http://localhost:5000/api/jobs
```

**Filter by Status:**
```bash
# Pending jobs only
curl http://localhost:5000/api/jobs?status=pending

# Completed jobs only
curl http://localhost:5000/api/jobs?status=completed
```

**Filter by Priority:**
```bash
# High priority jobs
curl http://localhost:5000/api/jobs?priority=High

# Multiple filters (High priority, pending jobs)
curl http://localhost:5000/api/jobs?status=pending&priority=High
```

### 3. Get Job Details

```bash
# Replace 1 with actual job ID
curl http://localhost:5000/api/jobs/1
```

### 4. Run a Job

```bash
# Replace 1 with actual job ID
curl -X POST http://localhost:5000/api/run-job/1
```

### 5. Get Webhook Logs

```bash
# Replace 1 with actual job ID
curl http://localhost:5000/api/jobs/1/webhooks
```

## Using JavaScript (Frontend)

### Create Job
```javascript
const response = await fetch('http://localhost:5000/api/jobs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    taskName: 'Send Welcome Email',
    payload: JSON.stringify({
      email: 'user@example.com',
      template: 'welcome'
    }),
    priority: 'High'
  })
});

const data = await response.json();
console.log('Job created:', data);
```

### Get All Jobs with Filters
```javascript
const params = new URLSearchParams({
  status: 'pending',
  priority: 'High'
});

const response = await fetch(`http://localhost:5000/api/jobs?${params}`);
const data = await response.json();
console.log('Filtered jobs:', data);
```

### Run Job
```javascript
const jobId = 1;
const response = await fetch(`http://localhost:5000/api/run-job/${jobId}`, {
  method: 'POST'
});

const data = await response.json();
console.log('Job execution:', data);
```

## Using Python (requests)

### Install requests
```bash
pip install requests
```

### Create Job
```python
import requests
import json

url = 'http://localhost:5000/api/jobs'
payload = {
    'taskName': 'Send Welcome Email',
    'payload': json.dumps({
        'email': 'user@example.com',
        'template': 'welcome'
    }),
    'priority': 'High'
}

response = requests.post(url, json=payload)
print('Status:', response.status_code)
print('Response:', response.json())
```

### Get Jobs with Filters
```python
import requests

url = 'http://localhost:5000/api/jobs'
params = {
    'status': 'pending',
    'priority': 'High'
}

response = requests.get(url, params=params)
print('Jobs:', response.json())
```

### Run Job
```python
import requests

job_id = 1
url = f'http://localhost:5000/api/run-job/{job_id}'

response = requests.post(url)
print('Execution:', response.json())
```

## Using Postman

### Collection Setup

1. **Create Collection:** "Job Scheduler API"
2. **Set Base URL Variable:** `{{baseUrl}}` = `http://localhost:5000/api`

### Requests

**1. Create Job**
- Method: POST
- URL: `{{baseUrl}}/jobs`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "taskName": "Send Welcome Email",
  "payload": "{\"email\": \"user@example.com\", \"template\": \"welcome\"}",
  "priority": "High"
}
```

**2. Get All Jobs**
- Method: GET
- URL: `{{baseUrl}}/jobs`
- Params:
  - `status`: `pending` (optional)
  - `priority`: `High` (optional)

**3. Get Job by ID**
- Method: GET
- URL: `{{baseUrl}}/jobs/1`

**4. Run Job**
- Method: POST
- URL: `{{baseUrl}}/run-job/1`

**5. Get Webhook Logs**
- Method: GET
- URL: `{{baseUrl}}/jobs/1/webhooks`

## Common Payload Examples

### Email Job
```json
{
  "email": "user@example.com",
  "template": "welcome",
  "subject": "Welcome to our platform!",
  "variables": {
    "name": "John Doe",
    "activationLink": "https://example.com/activate/abc123"
  }
}
```

### Report Generation
```json
{
  "reportType": "sales",
  "period": {
    "start": "2026-01-01",
    "end": "2026-01-31"
  },
  "format": "PDF",
  "recipients": ["admin@company.com", "manager@company.com"],
  "includeCharts": true,
  "timezone": "America/New_York"
}
```

### Data Sync
```json
{
  "source": {
    "type": "CRM",
    "connection": "primary",
    "tables": ["customers", "orders"]
  },
  "destination": {
    "type": "Analytics",
    "connection": "warehouse",
    "schema": "production"
  },
  "mode": "incremental",
  "lastSyncDate": "2026-01-10T00:00:00Z"
}
```

### Notification
```json
{
  "type": "push",
  "recipients": ["user123", "user456"],
  "title": "New feature available",
  "body": "Check out our latest update!",
  "action": {
    "type": "deeplink",
    "url": "app://features/new"
  },
  "priority": "high"
}
```

## Error Response Examples

### Validation Error (400)
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

### Not Found (404)
```json
{
  "success": false,
  "message": "Job not found"
}
```

### Cannot Execute (400)
```json
{
  "success": false,
  "message": "Cannot execute job with status: completed"
}
```

## Testing Webhooks

### Setup webhook.site
```bash
# 1. Visit https://webhook.site
# 2. Copy your unique URL
# 3. Update backend/.env:
WEBHOOK_URL=https://webhook.site/your-unique-id

# 4. Restart backend
# 5. Run a job
# 6. View webhook call on webhook.site
```

### Local Webhook Testing
```bash
# Use built-in test endpoint
curl -X POST http://localhost:5000/api/webhook-test \
  -H "Content-Type: application/json" \
  -d '{
    "jobId": 1,
    "taskName": "Test",
    "priority": "High",
    "payload": {"test": true},
    "completedAt": "2026-01-11T10:30:00Z"
  }'
```

## Batch Testing Script

### Create Multiple Jobs (Bash)
```bash
#!/bin/bash

# Create 5 test jobs
for i in {1..5}; do
  curl -X POST http://localhost:5000/api/jobs \
    -H "Content-Type: application/json" \
    -d "{
      \"taskName\": \"Test Job $i\",
      \"payload\": \"{\\\"iteration\\\": $i}\",
      \"priority\": \"Medium\"
    }"
  echo ""
done
```

### Run All Pending Jobs (Bash)
```bash
#!/bin/bash

# Get all pending jobs
JOBS=$(curl -s http://localhost:5000/api/jobs?status=pending | jq -r '.data[].id')

# Run each job
for job_id in $JOBS; do
  echo "Running job $job_id..."
  curl -X POST http://localhost:5000/api/run-job/$job_id
  echo ""
  sleep 1
done
```

---

**Tip:** Use these examples as templates for your own job types and workflows!
