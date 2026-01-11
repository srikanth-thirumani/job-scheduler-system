-- Job Scheduler Database Schema
-- MySQL Database Design

-- Create database
CREATE DATABASE IF NOT EXISTS job_scheduler;
USE job_scheduler;

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    taskName VARCHAR(255) NOT NULL,
    payload JSON NOT NULL,
    priority ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
    status ENUM('pending', 'running', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completedAt TIMESTAMP NULL DEFAULT NULL,
    
    -- Indexes for better query performance
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_created_at (createdAt),
    INDEX idx_status_priority (status, priority)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Webhook logs table (optional, for tracking webhook calls)
CREATE TABLE IF NOT EXISTS webhook_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    jobId INT NOT NULL,
    requestPayload JSON NOT NULL,
    responseStatus INT,
    responseData TEXT,
    success BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE,
    INDEX idx_job_id (jobId),
    INDEX idx_created_at (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
INSERT INTO jobs (taskName, payload, priority, status) VALUES
    ('Send Welcome Email', '{"email": "user@example.com", "template": "welcome"}', 'High', 'pending'),
    ('Generate Monthly Report', '{"month": "January", "year": 2026, "format": "PDF"}', 'Medium', 'pending'),
    ('Sync Customer Data', '{"source": "CRM", "destination": "Analytics", "recordCount": 1500}', 'Low', 'pending');
