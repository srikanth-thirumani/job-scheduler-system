'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Eye, Clock, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { formatDate, getStatusColor, getPriorityColor } from '@/lib/utils';
import Link from 'next/link';

export default function JobCard({ job, onRunJob }) {
  const [isRunning, setIsRunning] = useState(false);

  const handleRunJob = async () => {
    setIsRunning(true);
    try {
      await onRunJob(job.id);
    } finally {
      // Keep loading state for a bit to show feedback
      setTimeout(() => setIsRunning(false), 1000);
    }
  };

  const canRun = job.status === 'pending' && !isRunning;

  const StatusIcon = {
    pending: Circle,
    running: Loader2,
    completed: CheckCircle2,
    failed: Circle,
  }[job.status];

  return (
    <Card className="hover:shadow-lg transition-all duration-300 group animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
              {job.taskName}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(job.status)}>
                <StatusIcon className={`h-3 w-3 mr-1 ${job.status === 'running' ? 'animate-spin' : ''}`} />
                {job.status}
              </Badge>
              <Badge className={getPriorityColor(job.priority)}>
                {job.priority}
              </Badge>
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDate(job.createdAt)}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-3 mb-4">
          <pre className="text-xs text-gray-600 dark:text-gray-300 overflow-x-auto custom-scrollbar">
            {JSON.stringify(job.payload, null, 2)}
          </pre>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleRunJob}
            disabled={!canRun}
            className="flex-1"
            size="sm"
          >
            {isRunning ? (
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

          <Link href={`/jobs/${job.id}`}>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
