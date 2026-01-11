'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { jobsAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Play, RefreshCw, Clock, CheckCircle2, Circle, Loader2, ExternalLink } from 'lucide-react';
import { formatDate, getStatusColor, getPriorityColor } from '@/lib/utils';
import Link from 'next/link';

export default function JobDetail() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [webhookLogs, setWebhookLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [running, setRunning] = useState(false);

  const fetchJobDetails = async () => {
    try {
      setError(null);
      const [jobResponse, logsResponse] = await Promise.all([
        jobsAPI.getJobById(params.id),
        jobsAPI.getWebhookLogs(params.id).catch(() => ({ data: [] })),
      ]);

      setJob(jobResponse.data);
      setWebhookLogs(logsResponse.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch job details');
      console.error('Error fetching job:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();

    // Auto-refresh every 3 seconds
    const interval = setInterval(() => {
      fetchJobDetails();
    }, 3000);

    return () => clearInterval(interval);
  }, [params.id]);

  const handleRunJob = async () => {
    setRunning(true);
    try {
      await jobsAPI.runJob(params.id);
      await fetchJobDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to run job');
    } finally {
      setRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <Circle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The requested job does not exist'}</p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon = {
    pending: Clock,
    running: Loader2,
    completed: CheckCircle2,
    failed: Circle,
  }[job.status];

  const canRun = job.status === 'pending' && !running;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <Button onClick={fetchJobDetails} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card className="shadow-lg mb-6">
        <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">{job.taskName}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/20 text-white border-white/30">
                  <StatusIcon className={`h-3 w-3 mr-1 ${job.status === 'running' ? 'animate-spin' : ''}`} />
                  {job.status}
                </Badge>
                <Badge className="bg-white/20 text-white border-white/30">
                  {job.priority} Priority
                </Badge>
              </div>
            </div>

            {canRun && (
              <Button
                onClick={handleRunJob}
                disabled={running}
                className="bg-white text-primary hover:bg-gray-100"
              >
                {running ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Job
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Job ID</h3>
              <p className="text-lg font-mono">#{job.id}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Created At</h3>
              <p className="text-lg">{formatDate(job.createdAt)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
              <p className="text-lg">{formatDate(job.updatedAt)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Completed At</h3>
              <p className="text-lg">{job.completedAt ? formatDate(job.completedAt) : 'N/A'}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Payload</h3>
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto custom-scrollbar">
              <pre className="text-sm font-mono">
                {JSON.stringify(job.payload, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Logs */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Webhook Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {webhookLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ExternalLink className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No webhook calls recorded yet</p>
              <p className="text-sm mt-1">Webhook will be triggered when the job completes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {webhookLogs.map((log) => (
                <div
                  key={log.id}
                  className={`border rounded-lg p-4 ${
                    log.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={log.success ? 'default' : 'destructive'}>
                        {log.success ? 'Success' : 'Failed'}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        Status: {log.responseStatus || 'N/A'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Request Payload:</p>
                      <div className="bg-white rounded p-2 text-xs font-mono overflow-x-auto custom-scrollbar">
                        <pre>{JSON.stringify(log.requestPayload, null, 2)}</pre>
                      </div>
                    </div>

                    {log.responseData && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 mb-1">Response:</p>
                        <div className="bg-white rounded p-2 text-xs font-mono">
                          {log.responseData}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
