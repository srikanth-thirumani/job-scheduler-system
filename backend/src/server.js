const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const { testConnection } = require('./config/database');
const jobRoutes = require('./routes/jobRoutes');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.body
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Job Scheduler API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api', jobRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Job Scheduler & Automation System API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      createJob: 'POST /api/jobs',
      getAllJobs: 'GET /api/jobs',
      getJob: 'GET /api/jobs/:id',
      runJob: 'POST /api/run-job/:id',
      getWebhookLogs: 'GET /api/jobs/:id/webhooks',
      webhookTest: 'POST /api/webhook-test'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      logger.error('Failed to connect to database. Please check your configuration.');
      logger.info('Run "npm run init-db" to initialize the database.');
      process.exit(1);
    }

    app.listen(PORT, () => {
      logger.info(`Server started successfully on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API Documentation: http://localhost:${PORT}/`);
      logger.info(`Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
