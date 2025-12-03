'use client';

import { MethodBadge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input, Select, Textarea } from '@/components/ui/input';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/contexts/toast-context';
import {
  createEndpoint,
  getEndpoints,
  getLatestResults,
  getProject,
  getTestStats,
  runProjectTests,
  syncProjectApis,
  testEndpoint,
} from '@/lib/api';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { CreateEndpointRequest, HttpMethod } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Link as LinkIcon, Play, Plus, RefreshCw, X, Zap } from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { t, language } = useLanguage();
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [endpointForm, setEndpointForm] = useState<CreateEndpointRequest>({
    path: '',
    method: 'GET',
    summary: '',
    description: '',
    expectedStatusCode: 200,
  });

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => getProject(id),
  });

  const { data: endpoints } = useQuery({
    queryKey: ['endpoints', id],
    queryFn: () => getEndpoints(id),
  });

  const { data: latestResults } = useQuery({
    queryKey: ['latestResults', id],
    queryFn: () => getLatestResults(id),
  });

  const { data: stats } = useQuery({
    queryKey: ['stats', id],
    queryFn: () => getTestStats(id),
  });

  const syncMutation = useMutation({
    mutationFn: () => syncProjectApis(id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['endpoints', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      showSuccess(t('success.syncCompleted'));
    },
    onError: (error) => {
      showError(error);
    },
  });

  const runAllMutation = useMutation({
    mutationFn: () => runProjectTests(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latestResults', id] });
      queryClient.invalidateQueries({ queryKey: ['stats', id] });
      showSuccess(t('success.testsCompleted'));
    },
    onError: (error) => {
      showError(error);
    },
  });

  const testEndpointMutation = useMutation({
    mutationFn: (endpointId: string) => testEndpoint(id, endpointId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latestResults', id] });
      queryClient.invalidateQueries({ queryKey: ['stats', id] });
    },
    onError: (error) => {
      showError(error);
    },
  });

  const createEndpointMutation = useMutation({
    mutationFn: (data: CreateEndpointRequest) => createEndpoint(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoints', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
      showSuccess(t('success.endpointCreated'));
      setShowAddModal(false);
      setEndpointForm({
        path: '',
        method: 'GET',
        summary: '',
        description: '',
        expectedStatusCode: 200,
      });
    },
    onError: (error) => {
      showError(error);
    },
  });

  const getResultForEndpoint = (endpointId: string) => {
    return latestResults?.find((r) => r.endpointId === endpointId);
  };

  const handleAddEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    createEndpointMutation.mutate(endpointForm);
  };

  const hasSwaggerUrls = project?.swaggerUrls && project.swaggerUrls.length > 0 && project.swaggerUrls.some(url => url.trim() !== '');

  if (projectLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-gray-500 mb-4">{t('project.notFound')}</p>
        <Link href="/projects">
          <Button>{t('project.backToProjects')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/projects" className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">{project.baseUrl}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
            <RefreshCw className={cn('w-4 h-4 mr-2', syncMutation.isPending && 'animate-spin')} />
            {t('project.syncApis')}
          </Button>
          <Button onClick={() => runAllMutation.mutate()} disabled={runAllMutation.isPending || !endpoints?.length}>
            <Zap className={cn('w-4 h-4 mr-2', runAllMutation.isPending && 'animate-spin')} />
            {t('project.runAllTests')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && stats.totalTests > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">{t('project.totalTests')}</p>
              <p className="text-2xl font-bold">{stats.totalTests}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">{t('project.successRate')}</p>
              <p className={cn('text-2xl font-bold', stats.successRate >= 90 ? 'text-green-500' : 'text-yellow-500')}>
                {stats.successRate.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">{t('project.failed')}</p>
              <p className="text-2xl font-bold text-red-500">{stats.failedCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-500">{t('project.avgResponse')}</p>
              <p className="text-2xl font-bold">{stats.averageResponseTimeMs}ms</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Endpoints */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('project.endpoints')} ({endpoints?.length || 0})</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('project.addEndpoint')}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {!endpoints?.length ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <LinkIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {t('project.noEndpointsTitle')}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {hasSwaggerUrls ? t('project.noEndpointsWithSwagger') : t('project.noEndpointsWithoutSwagger')}
              </p>
              <div className="flex justify-center gap-3">
                {hasSwaggerUrls && (
                  <Button variant="outline" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
                    <RefreshCw className={cn('w-4 h-4 mr-2', syncMutation.isPending && 'animate-spin')} />
                    {t('project.syncApis')}
                  </Button>
                )}
                <Button variant="gradient" onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('project.addEndpoint')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {endpoints.map((endpoint) => {
                const result = getResultForEndpoint(endpoint.id);
                return (
                  <div
                    key={endpoint.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <MethodBadge method={endpoint.method} />
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm truncate">{endpoint.path}</p>
                        {endpoint.summary && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{endpoint.summary}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {result && (
                        <div className="flex items-center gap-3">
                          <StatusBadge status={result.status} />
                          <span className="text-sm text-gray-500">{result.responseTimeMs}ms</span>
                          <span className="text-xs text-gray-400">{formatRelativeTime(result.executedAt, language)}</span>
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => testEndpointMutation.mutate(endpoint.id)}
                        disabled={testEndpointMutation.isPending}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Endpoint Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {t('project.addEndpoint')}
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleAddEndpoint} className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Select
                    label={t('project.method')}
                    options={HTTP_METHODS.map((m) => ({ value: m, label: m }))}
                    value={endpointForm.method}
                    onChange={(e) => setEndpointForm({ ...endpointForm, method: e.target.value as HttpMethod })}
                  />
                  <div className="col-span-2">
                    <Input
                      label={t('project.path')}
                      placeholder="/api/users"
                      value={endpointForm.path}
                      onChange={(e) => setEndpointForm({ ...endpointForm, path: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Input
                  label={t('project.summary')}
                  placeholder={t('project.summaryPlaceholder')}
                  value={endpointForm.summary || ''}
                  onChange={(e) => setEndpointForm({ ...endpointForm, summary: e.target.value })}
                />

                <Textarea
                  label={t('project.description')}
                  placeholder={t('project.descriptionPlaceholder')}
                  value={endpointForm.description || ''}
                  onChange={(e) => setEndpointForm({ ...endpointForm, description: e.target.value })}
                  rows={2}
                />

                <Input
                  type="number"
                  label={t('project.expectedStatus')}
                  placeholder="200"
                  value={endpointForm.expectedStatusCode || 200}
                  onChange={(e) => setEndpointForm({ ...endpointForm, expectedStatusCode: parseInt(e.target.value) || 200 })}
                />

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" variant="gradient" loading={createEndpointMutation.isPending}>
                    {t('project.addEndpoint')}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
