'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Select, Textarea } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/contexts/toast-context';
import { createProject } from '@/lib/api';
import type { AuthType, CreateProjectRequest } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewProjectPage() {
  const { t } = useLanguage();
  const { showError, showSuccess } = useToast();
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
      showSuccess(t('success.projectCreated'));
      router.push(`/projects/${project.id}`);
    },
    onError: (error) => {
      showError(error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const authTypeOptions = [
    { value: 'NONE', label: t('project.authNone') },
    { value: 'BEARER_TOKEN', label: t('project.authBearer') },
    { value: 'API_KEY', label: t('project.authApiKey') },
    { value: 'BASIC_AUTH', label: t('project.authBasic') },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/projects" className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('project.backToProjects')}
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('project.createNew')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label={t('project.projectName')}
              placeholder={t('project.projectNamePlaceholder')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label={t('project.baseUrl')}
              placeholder={t('project.baseUrlPlaceholder')}
              value={formData.baseUrl}
              onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              required
            />

            <Textarea
              label={t('project.description')}
              placeholder={t('project.descriptionPlaceholder')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />

            <Input
              label={t('project.swaggerUrl')}
              placeholder={t('project.swaggerUrlPlaceholder')}
              value={formData.swaggerUrl}
              onChange={(e) => setFormData({ ...formData, swaggerUrl: e.target.value })}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-4">
              {t('project.swaggerHint')}
            </p>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{t('project.authentication')}</h3>

              <Select
                label={t('project.authType')}
                options={authTypeOptions}
                value={formData.authType}
                onChange={(e) => setFormData({ ...formData, authType: e.target.value as AuthType })}
              />

              {formData.authType !== 'NONE' && (
                <>
                  {formData.authType === 'API_KEY' && (
                    <div className="mt-4">
                      <Input
                        label={t('project.headerName')}
                        placeholder="X-API-Key"
                        value={formData.headerName}
                        onChange={(e) => setFormData({ ...formData, headerName: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="mt-4">
                    <Input
                      label={formData.authType === 'BEARER_TOKEN' ? t('project.token') : formData.authType === 'API_KEY' ? t('project.authApiKey') : t('project.credentials')}
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
                  {t('common.cancel')}
                </Button>
              </Link>
              <Button type="submit" loading={createMutation.isPending}>
                {t('project.createProject')}
              </Button>
            </div>

            {createMutation.isError && (
              <p className="text-red-500 text-sm">
                {t('project.createFailed')}
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
