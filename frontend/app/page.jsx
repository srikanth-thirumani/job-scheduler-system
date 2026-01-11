'use client';

import { useState, useEffect } from 'react';
import { jobsAPI } from '@/lib/api';
import JobCard from '@/components/JobCard';
import JobFilters from '@/components/JobFilters';
import Stats from '@/components/Stats';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [filters, setFilters] = useState({ status: '', priority: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = async () => {
    try {
      setError(null);
      const response = await jobsAPI.getAllJobs();
      setJobs(response.data || []);
      setFilteredJobs(response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch jobs');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchJobs();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = jobs;

    if (filters.status) {
      filtered = filtered.filter(job => job.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(job => job.priority === filters.priority);
    }

    setFilteredJobs(filtered);
  }, [filters, jobs]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRunJob = async (jobId) => {
    try {
      await jobsAPI.runJob(jobId);
      // Refresh jobs list
      await fetchJobs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to run job');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Jobs</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Dashboard</h1>
          <p className="text-gray-600">Monitor and manage your automation tasks</p>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Stats jobs={jobs} />

      <JobFilters filters={filters} onFilterChange={handleFilterChange} />

      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <div className="max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Jobs Found</h3>
            <p className="text-gray-600 mb-4">
              {jobs.length === 0 
                ? "Get started by creating your first job" 
                : "No jobs match your current filters"}
            </p>
            {jobs.length === 0 && (
              <Link href="/create">
                <Button>Create Your First Job</Button>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} onRunJob={handleRunJob} />
          ))}
        </div>
      )}
    </div>
  );
}
