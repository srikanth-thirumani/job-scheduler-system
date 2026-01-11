import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  if (!date) return 'N/A';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

export function formatJSON(json) {
  try {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json;
    return JSON.stringify(parsed, null, 2);
  } catch {
    return json;
  }
}

export function getStatusColor(status) {
  const colors = {
    pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    running: 'text-blue-600 bg-blue-50 border-blue-200',
    completed: 'text-green-600 bg-green-50 border-green-200',
    failed: 'text-red-600 bg-red-50 border-red-200'
  };
  return colors[status] || colors.pending;
}

export function getPriorityColor(priority) {
  const colors = {
    Low: 'text-gray-600 bg-gray-50 border-gray-200',
    Medium: 'text-orange-600 bg-orange-50 border-orange-200',
    High: 'text-red-600 bg-red-50 border-red-200'
  };
  return colors[priority] || colors.Medium;
}
