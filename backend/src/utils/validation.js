/**
 * Validation utility functions
 */

const validateJobPayload = (data) => {
  const errors = [];

  // Validate taskName
  if (!data.taskName || typeof data.taskName !== 'string') {
    errors.push('taskName is required and must be a string');
  } else if (data.taskName.trim().length === 0) {
    errors.push('taskName cannot be empty');
  } else if (data.taskName.length > 255) {
    errors.push('taskName cannot exceed 255 characters');
  }

  // Validate payload
  if (!data.payload) {
    errors.push('payload is required');
  } else {
    try {
      // If payload is string, try to parse it
      if (typeof data.payload === 'string') {
        JSON.parse(data.payload);
      } else if (typeof data.payload !== 'object') {
        errors.push('payload must be a valid JSON object or string');
      }
    } catch (error) {
      errors.push('payload must be valid JSON');
    }
  }

  // Validate priority
  const validPriorities = ['Low', 'Medium', 'High'];
  if (!data.priority) {
    errors.push('priority is required');
  } else if (!validPriorities.includes(data.priority)) {
    errors.push('priority must be one of: Low, Medium, High');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const sanitizeJobPayload = (data) => {
  return {
    taskName: data.taskName.trim(),
    payload: typeof data.payload === 'string' ? data.payload : JSON.stringify(data.payload),
    priority: data.priority
  };
};

const isValidId = (id) => {
  const numId = parseInt(id, 10);
  return !isNaN(numId) && numId > 0;
};

module.exports = {
  validateJobPayload,
  sanitizeJobPayload,
  isValidId
};
