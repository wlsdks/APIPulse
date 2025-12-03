'use client';

import { FadeInUp } from '@/components/motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Select, Textarea } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/contexts/toast-context';
import { createProject } from '@/lib/api';
import type { AuthType } from '@/types';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Key, Link as LinkIcon, Lock, Plus, Shield, Trash2, Unlock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface FormData {
  name: string;
  baseUrl: string;
  description: string;
  swaggerUrls: string[];
  authType: AuthType;
  authValue: string;
  headerName: string;
}

export default function NewProjectPage() {
  const { t } = useLanguage();
  const { showError, showSuccess } = useToast();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    baseUrl: '',
    description: '',
    swaggerUrls: [''],
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
    const filteredUrls = formData.swaggerUrls.filter((url) => url.trim() !== '');
    createMutation.mutate({
      ...formData,
      swaggerUrls: filteredUrls.length > 0 ? filteredUrls : undefined,
    });
  };

  const addSwaggerUrl = () => {
    setFormData({ ...formData, swaggerUrls: [...formData.swaggerUrls, ''] });
  };

  const removeSwaggerUrl = (index: number) => {
    const newUrls = formData.swaggerUrls.filter((_, i) => i !== index);
    setFormData({ ...formData, swaggerUrls: newUrls.length > 0 ? newUrls : [''] });
  };

  const updateSwaggerUrl = (index: number, value: string) => {
    const newUrls = [...formData.swaggerUrls];
    newUrls[index] = value;
    setFormData({ ...formData, swaggerUrls: newUrls });
  };

  const authTypeOptions = [
    { value: 'NONE', label: t('project.authNone') },
    { value: 'BEARER_TOKEN', label: t('project.authBearer') },
    { value: 'API_KEY', label: t('project.authApiKey') },
    { value: 'BASIC_AUTH', label: t('project.authBasic') },
  ];

  const getAuthIcon = (type: AuthType) => {
    switch (type) {
      case 'NONE':
        return Unlock;
      case 'BEARER_TOKEN':
        return Shield;
      case 'API_KEY':
        return Key;
      case 'BASIC_AUTH':
        return Lock;
    }
  };

  const AuthIcon = getAuthIcon(formData.authType);

  return (
    <FadeInUp className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/projects"
          className="inline-flex items-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('project.backToProjects')}
        </Link>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="text-xl">{t('project.createNew')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
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
            </div>

            {/* Swagger/OpenAPI */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-900 dark:text-white">OpenAPI</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addSwaggerUrl}
                  className="text-blue-500 hover:text-blue-600"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  {t('project.addUrl')}
                </Button>
              </div>

              <div className="space-y-3">
                {formData.swaggerUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        placeholder={t('project.swaggerUrlPlaceholder')}
                        value={url}
                        onChange={(e) => updateSwaggerUrl(index, e.target.value)}
                      />
                    </div>
                    {formData.swaggerUrls.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSwaggerUrl(index)}
                        className="text-red-500 hover:text-red-600 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-500 mt-3">{t('project.swaggerHint')}</p>
            </div>

            {/* Authentication */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <AuthIcon className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('project.authentication')}
                </h3>
              </div>

              <Select
                label={t('project.authType')}
                options={authTypeOptions}
                value={formData.authType}
                onChange={(e) =>
                  setFormData({ ...formData, authType: e.target.value as AuthType })
                }
              />

              {formData.authType !== 'NONE' && (
                <div className="mt-4 space-y-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 animate-fade-in">
                  {formData.authType === 'API_KEY' && (
                    <Input
                      label={t('project.headerName')}
                      placeholder="X-API-Key"
                      value={formData.headerName}
                      onChange={(e) => setFormData({ ...formData, headerName: e.target.value })}
                    />
                  )}

                  <Input
                    label={
                      formData.authType === 'BEARER_TOKEN'
                        ? t('project.token')
                        : formData.authType === 'API_KEY'
                          ? t('project.authApiKey')
                          : t('project.credentials')
                    }
                    placeholder={
                      formData.authType === 'BEARER_TOKEN'
                        ? 'eyJhbGciOiJIUzI1NiIs...'
                        : formData.authType === 'BASIC_AUTH'
                          ? 'dXNlcm5hbWU6cGFzc3dvcmQ='
                          : ''
                    }
                    type="password"
                    value={formData.authValue}
                    onChange={(e) => setFormData({ ...formData, authValue: e.target.value })}
                  />
                  {formData.authType === 'BASIC_AUTH' && (
                    <p className="text-sm text-gray-500">{t('project.basicAuthHint')}</p>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link href="/projects">
                <Button type="button" variant="outline">
                  {t('common.cancel')}
                </Button>
              </Link>
              <Button type="submit" variant="gradient" loading={createMutation.isPending}>
                {t('project.createProject')}
              </Button>
            </div>

            {createMutation.isError && (
              <p className="text-red-500 text-sm animate-fade-in">{t('project.createFailed')}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </FadeInUp>
  );
}
