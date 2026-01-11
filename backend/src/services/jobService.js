const { pool } = require('../config/database');
const logger = require('../utils/logger');
const axios = require('axios');

/**
 * Job Service - Contains all business logic for job operations
 */
/**
 * Safely parse JSON payload from database
 */
const parsePayload = (payload) => {
  if (!payload) return {};
  
  // If already an object, return it
  if (typeof payload === 'object' && !Buffer.isBuffer(payload)) {
    return payload;
  }
  
  // If it's a buffer, convert to string first
  if (Buffer.isBuffer(payload)) {
    payload = payload.toString('utf8');
  }
  
  // If it's a string, parse it
  if (typeof payload === 'string') {
    try {
      return JSON.parse(payload);
    } catch (error) {
      logger.warn('Failed to parse payload, returning as-is', { payload });
      return payload;
    }
  }
  
  return payload;
};
class JobService {
  /**
   * Create a new job
   */
  async createJob(jobData) {
    const { taskName, payload, priority } = jobData;
    
    try {
      const [result] = await pool.query(
        'INSERT INTO jobs (taskName, payload, priority, status) VALUES (?, ?, ?, ?)',
        [taskName, payload, priority, 'pending']
      );

      logger.info('Job created successfully', { jobId: result.insertId, taskName });

      return {
        id: result.insertId,
        taskName,
        payload: JSON.parse(payload),
        priority,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      logger.error('Failed to create job', error);
      throw new Error('Database error while creating job');
    }
  }

  /**
   * Get all jobs with optional filters
   */
  async getAllJobs(filters = {}) {
    try {
      let query = 'SELECT * FROM jobs WHERE 1=1';
      const params = [];

      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }

      if (filters.priority) {
        query += ' AND priority = ?';
        params.push(filters.priority);
      }

      query += ' ORDER BY createdAt DESC';

      const [jobs] = await pool.query(query, params);

      // Parse JSON payload for each job
      return jobs.map(job => ({
        ...job,
        payload: typeof job.payload === 'string' ? parsePayload(job.payload) : job.payload
      }));
    } catch (error) {
      logger.error('Failed to fetch jobs', error);
      throw new Error('Database error while fetching jobs');
    }
  }

  /**
   * Get job by ID
   */
  async getJobById(id) {
    try {
      const [jobs] = await pool.query('SELECT * FROM jobs WHERE id = ?', [id]);

      if (jobs.length === 0) {
        return null;
      }

      return {
        ...jobs[0],
        payload: parsePayload(jobs[0].payload)
      };
    } catch (error) {
      logger.error('Failed to fetch job', error);
      throw new Error('Database error while fetching job');
    }
  }

  /**
   * Update job status
   */
  async updateJobStatus(id, status, completedAt = null) {
    try {
      const updateData = completedAt 
        ? [status, completedAt, id]
        : [status, id];
      
      const query = completedAt
        ? 'UPDATE jobs SET status = ?, completedAt = ? WHERE id = ?'
        : 'UPDATE jobs SET status = ? WHERE id = ?';

      const [result] = await pool.query(query, updateData);

      if (result.affectedRows === 0) {
        return null;
      }

      logger.info('Job status updated', { jobId: id, status });
      return await this.getJobById(id);
    } catch (error) {
      logger.error('Failed to update job status', error);
      throw new Error('Database error while updating job');
    }
  }

  /**
   * Execute job - simulates background processing
   */
  async executeJob(id) {
    const job = await this.getJobById(id);

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.status !== 'pending') {
      throw new Error(`Cannot execute job with status: ${job.status}`);
    }

    try {
      // Step 1: Update status to running
      logger.info('Starting job execution', { jobId: id, taskName: job.taskName });
      await this.updateJobStatus(id, 'running');

      // Step 2: Simulate processing (3 seconds)
      await this.simulateProcessing(3000);

      // Step 3: Update status to completed
      const completedAt = new Date();
      await this.updateJobStatus(id, 'completed', completedAt);

      // Step 4: Trigger webhook
      const updatedJob = await this.getJobById(id);
      await this.triggerWebhook(updatedJob);

      logger.info('Job execution completed', { jobId: id });

      return updatedJob;
    } catch (error) {
      // If execution fails, mark as failed
      await this.updateJobStatus(id, 'failed');
      logger.error('Job execution failed', error);
      throw error;
    }
  }

  /**
   * Simulate async processing
   */
  async simulateProcessing(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
  }

  /**
   * Trigger outbound webhook when job completes
   */
  async triggerWebhook(job) {
    const webhookUrl = process.env.WEBHOOK_URL;

    if (!webhookUrl || webhookUrl.includes('your-unique-id')) {
      logger.warn('Webhook URL not configured properly, skipping webhook call');
      return;
    }

    const webhookPayload = {
      jobId: job.id,
      taskName: job.taskName,
      priority: job.priority,
      payload: job.payload,
      completedAt: job.completedAt
    };

    try {
      logger.webhook(job.id, 'SENDING', { url: webhookUrl });
      logger.debug('Webhook request payload', webhookPayload);

      const response = await axios.post(webhookUrl, webhookPayload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      logger.webhook(job.id, 'SUCCESS', { 
        statusCode: response.status,
        statusText: response.statusText
      });

      // Log webhook call to database
      await this.logWebhookCall(job.id, webhookPayload, response.status, response.data, true);

      return {
        success: true,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      logger.webhook(job.id, 'FAILED', { 
        error: error.message,
        code: error.code
      });

      // Log failed webhook call
      await this.logWebhookCall(
        job.id, 
        webhookPayload, 
        error.response?.status || 0, 
        error.message, 
        false
      );

      // Don't throw error - webhook failure shouldn't fail the job
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Log webhook calls to database
   */
  async logWebhookCall(jobId, requestPayload, responseStatus, responseData, success) {
    try {
      await pool.query(
        'INSERT INTO webhook_logs (jobId, requestPayload, responseStatus, responseData, success) VALUES (?, ?, ?, ?, ?)',
        [
          jobId,
          JSON.stringify(requestPayload),
          responseStatus,
          typeof responseData === 'string' ? responseData : JSON.stringify(responseData),
          success
        ]
      );
    } catch (error) {
      logger.error('Failed to log webhook call', error);
    }
  }

  /**
   * Get webhook logs for a job
   */
  async getWebhookLogs(jobId) {
    try {
      const [logs] = await pool.query(
        'SELECT * FROM webhook_logs WHERE jobId = ? ORDER BY createdAt DESC',
        [jobId]
      );

      return logs.map(log => ({
        ...log,
        requestPayload: parsePayload(log.requestPayload)
      }));
    } catch (error) {
      logger.error('Failed to fetch webhook logs', error);
      return [];
    }
  }
}

module.exports = new JobService();
