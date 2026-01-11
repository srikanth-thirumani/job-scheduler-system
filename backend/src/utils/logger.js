/**
 * Logger utility for structured logging
 */

const logger = {
  info: (message, data = {}) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, 
      Object.keys(data).length > 0 ? data : '');
  },

  error: (message, error = {}) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, 
      error.message || error);
  },

  warn: (message, data = {}) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, 
      Object.keys(data).length > 0 ? data : '');
  },

  debug: (message, data = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, 
        Object.keys(data).length > 0 ? data : '');
    }
  },

  webhook: (jobId, status, data = {}) => {
    console.log(`[WEBHOOK] Job #${jobId} - Status: ${status}`, data);
  }
};

module.exports = logger;
