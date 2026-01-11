'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, Loader, AlertCircle } from 'lucide-react';

export default function Stats({ jobs }) {
  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'pending').length,
    running: jobs.filter(j => j.status === 'running').length,
    completed: jobs.filter(j => j.status === 'completed').length,
    failed: jobs.filter(j => j.status === 'failed').length,
  };

  const statItems = [
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
    },
    {
      label: 'Running',
      value: stats.running,
      icon: Loader,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
    },
    {
      label: 'Failed',
      value: stats.failed,
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className={`border-l-4 ${stat.border} hover:shadow-md transition-shadow`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color} mt-2`}>{stat.value}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-full`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
