const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');

/**
 * Job Routes
 */

// Create a new job
router.post('/jobs', jobController.createJob.bind(jobController));

// Get all jobs (with optional filters)
router.get('/jobs', jobController.getAllJobs.bind(jobController));

// Get job by ID
router.get('/jobs/:id', jobController.getJobById.bind(jobController));

// Execute/run a job
router.post('/run-job/:id', jobController.runJob.bind(jobController));

// Get webhook logs for a job
router.get('/jobs/:id/webhooks', jobController.getWebhookLogs.bind(jobController));

// Test webhook receiver (optional)
router.post('/webhook-test', jobController.webhookTest.bind(jobController));

module.exports = router;
