'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { jobsAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PlusCircle, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function CreateJob() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    taskName: '',
    payload: '{\n  "example": "value"\n}',
    priority: 'Medium',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.taskName.trim()) {
      newErrors.taskName = 'Task name is required';
    }

    try {
      JSON.parse(formData.payload);
    } catch {
      newErrors.payload = 'Payload must be valid JSON';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await jobsAPI.createJob({
        taskName: formData.taskName,
        payload: formData.payload,
        priority: formData.priority,
      });

      setSuccess(true);

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create job';
      const validationErrors = err.response?.data?.errors || [];

      if (validationErrors.length > 0) {
        const newErrors = {};
        validationErrors.forEach(error => {
          if (error.includes('taskName')) newErrors.taskName = error;
          if (error.includes('payload')) newErrors.payload = error;
          if (error.includes('priority')) newErrors.priority = error;
        });
        setErrors(newErrors);
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(formData.payload);
      const formatted = JSON.stringify(parsed, null, 2);
      setFormData(prev => ({ ...prev, payload: formatted }));
      setErrors(prev => ({ ...prev, payload: null }));
    } catch {
      setErrors(prev => ({ ...prev, payload: 'Invalid JSON format' }));
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Created Successfully!</h2>
            <p className="text-gray-600 mb-6">Redirecting to dashboard...</p>
            <Link href="/">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary to-purple-600 text-white">
          <CardTitle className="text-2xl flex items-center gap-2">
            <PlusCircle className="h-6 w-6" />
            Create New Job
          </CardTitle>
          <CardDescription className="text-blue-100">
            Define a new automation task to be executed
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-700">{errors.general}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="taskName">
                Task Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="taskName"
                placeholder="e.g., Send Welcome Email"
                value={formData.taskName}
                onChange={(e) => handleChange('taskName', e.target.value)}
                className={errors.taskName ? 'border-red-500' : ''}
              />
              {errors.taskName && (
                <p className="text-sm text-red-600">{errors.taskName}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="payload">
                  Payload (JSON) <span className="text-red-500">*</span>
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={formatJSON}
                >
                  Format JSON
                </Button>
              </div>
              <Textarea
                id="payload"
                rows={10}
                placeholder='{"key": "value"}'
                value={formData.payload}
                onChange={(e) => handleChange('payload', e.target.value)}
                className={`font-mono text-sm ${errors.payload ? 'border-red-500' : ''}`}
              />
              {errors.payload && (
                <p className="text-sm text-red-600">{errors.payload}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Enter valid JSON data that will be passed to the job processor
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Select
                id="priority"
                value={formData.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
                className={errors.priority ? 'border-red-500' : ''}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-600">{errors.priority}</p>
              )}
            </div>

            <div className="pt-4 flex gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create Job
                  </>
                )}
              </Button>

              <Link href="/" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use descriptive task names for easy identification</li>
          <li>• Payload must be valid JSON format</li>
          <li>• High priority jobs are recommended for time-sensitive tasks</li>
          <li>• Jobs start with "pending" status and can be executed from the dashboard</li>
        </ul>
      </div>
    </div>
  );
}
