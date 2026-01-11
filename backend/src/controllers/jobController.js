const jobService = require('../services/jobService');
const { validateJobPayload, sanitizeJobPayload, isValidId } = require('../utils/validation');
const logger = require('../utils/logger');

/**
 * Job Controller - Handles HTTP requests and responses
 */

class JobController {
  /**
   * Create a new job
   * POST /api/jobs
   */
  async createJob(req, res) {
    try {
      // Validate request body
      const validation = validateJobPayload(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Sanitize and create job
      const sanitizedData = sanitizeJobPayload(req.body);
      const job = await jobService.createJob(sanitizedData);

      res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: job
      });
    } catch (error) {
      logger.error('Error in createJob controller', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create job',
        error: error.message
      });
    }
  }

  /**
   * Get all jobs with optional filters
   * GET /api/jobs?status=pending&priority=High
   */
  async getAllJobs(req, res) {
    try {
      const { status, priority } = req.query;
      const filters = {};

      if (status) {
        const validStatuses = ['pending', 'running', 'completed', 'failed'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid status filter'
          });
        }
        filters.status = status;
      }

      if (priority) {
        const validPriorities = ['Low', 'Medium', 'High'];
        if (!validPriorities.includes(priority)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid priority filter'
          });
        }
        filters.priority = priority;
      }

      const jobs = await jobService.getAllJobs(filters);

      res.status(200).json({
        success: true,
        count: jobs.length,
        data: jobs
      });
    } catch (error) {
      logger.error('Error in getAllJobs controller', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch jobs',
        error: error.message
      });
    }
  }

  /**
   * Get job by ID
   * GET /api/jobs/:id
   */
  async getJobById(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid job ID'
        });
      }

      const job = await jobService.getJobById(id);

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found'
        });
      }

      res.status(200).json({
        success: true,
        data: job
      });
    } catch (error) {
      logger.error('Error in getJobById controller', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch job',
        error: error.message
      });
    }
  }

  /**
   * Execute a job
   * POST /api/run-job/:id
   */
  async runJob(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid job ID'
        });
      }

      const job = await jobService.executeJob(id);

      res.status(200).json({
        success: true,
        message: 'Job executed successfully',
        data: job
      });
    } catch (error) {
      logger.error('Error in runJob controller', error);
      
      // Handle specific errors
      if (error.message === 'Job not found') {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      if (error.message.includes('Cannot execute job')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to execute job',
        error: error.message
      });
    }
  }

  /**
   * Test webhook receiver (optional)
   * POST /api/webhook-test
   */
  async webhookTest(req, res) {
    try {
      logger.webhook('TEST', 'RECEIVED', req.body);
      
      res.status(200).json({
        success: true,
        message: 'Webhook received successfully',
        receivedData: req.body,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error in webhookTest controller', error);
      res.status(500).json({
        success: false,
        message: 'Webhook processing failed',
        error: error.message
      });
    }
  }

  /**
   * Get webhook logs for a job
   * GET /api/jobs/:id/webhooks
   */
  async getWebhookLogs(req, res) {
    try {
      const { id } = req.params;

      if (!isValidId(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid job ID'
        });
      }

      const logs = await jobService.getWebhookLogs(id);

      res.status(200).json({
        success: true,
        count: logs.length,
        data: logs
      });
    } catch (error) {
      logger.error('Error in getWebhookLogs controller', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch webhook logs',
        error: error.message
      });
    }
  }
}

module.exports = new JobController();
