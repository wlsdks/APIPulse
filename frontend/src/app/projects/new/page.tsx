'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Select, Textarea } from '@/components/ui/input';
import { createProject } from '@/lib/api';
import type { AuthType, CreateProjectRequest } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewProjectPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: '',
    baseUrl: '',
    description: '',
    swaggerUrl: '',
    authType: 'NONE',
    authValue: '',
    headerName: '',
  });

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: (project) => {
      router.push(`/projects/${project.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const authTypeOptions = [
    { value: 'NONE', label: 'No Authentication' },
    { value: 'BEARER_TOKEN', label: 'Bearer Token' },
    { value: 'API_KEY', label: 'API Key' },
    { value: 'BASIC_AUTH', label: 'Basic Auth' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/projects" className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Project Name"
              placeholder="My API Project"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Base URL"
              placeholder="https://api.example.com"
              value={formData.baseUrl}
              onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              required
            />

            <Textarea
              label="Description"
              placeholder="Describe your project..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />

            <Input
              label="Swagger/OpenAPI URL"
              placeholder="https://api.example.com/v3/api-docs"
              value={formData.swaggerUrl}
              onChange={(e) => setFormData({ ...formData, swaggerUrl: e.target.value })}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-4">
              If provided, endpoints will be automatically imported from the OpenAPI specification.
            </p>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Authentication</h3>

              <Select
                label="Authentication Type"
                options={authTypeOptions}
                value={formData.authType}
                onChange={(e) => setFormData({ ...formData, authType: e.target.value as AuthType })}
              />

              {formData.authType !== 'NONE' && (
                <>
                  {formData.authType === 'API_KEY' && (
                    <div className="mt-4">
                      <Input
                        label="Header Name"
                        placeholder="X-API-Key"
                        value={formData.headerName}
                        onChange={(e) => setFormData({ ...formData, headerName: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="mt-4">
                    <Input
                      label={formData.authType === 'BEARER_TOKEN' ? 'Token' : formData.authType === 'API_KEY' ? 'API Key' : 'Credentials (base64)'}
                      placeholder={formData.authType === 'BEARER_TOKEN' ? 'eyJhbGciOiJIUzI1NiIs...' : ''}
                      type="password"
                      value={formData.authValue}
                      onChange={(e) => setFormData({ ...formData, authValue: e.target.value })}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/projects">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={createMutation.isPending}>
                Create Project
              </Button>
            </div>

            {createMutation.isError && (
              <p className="text-red-500 text-sm">
                Failed to create project. Please try again.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
