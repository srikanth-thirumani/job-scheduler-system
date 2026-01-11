import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const jobsAPI = {
  // Create a new job
  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  // Get all jobs with optional filters
  getAllJobs: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    
    const response = await api.get(`/jobs?${params.toString()}`);
    return response.data;
  },

  // Get job by ID
  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  // Run/execute a job
  runJob: async (id) => {
    const response = await api.post(`/run-job/${id}`);
    return response.data;
  },

  // Get webhook logs for a job
  getWebhookLogs: async (id) => {
    const response = await api.get(`/jobs/${id}/webhooks`);
    return response.data;
  },
};

export default api;
