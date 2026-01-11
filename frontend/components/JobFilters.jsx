'use client';

import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Filter } from 'lucide-react';

export default function JobFilters({ filters, onFilterChange }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-gray-900">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status-filter">Status</Label>
          <Select
            id="status-filter"
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority-filter">Priority</Label>
          <Select
            id="priority-filter"
            value={filters.priority || ''}
            onChange={(e) => onFilterChange('priority', e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </Select>
        </div>
      </div>
    </div>
  );
}
