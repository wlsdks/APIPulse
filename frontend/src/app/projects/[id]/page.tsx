'use client';

import { MethodBadge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';
import {
  getEndpoints,
  getLatestResults,
  getProject,
  getTestStats,
  runProjectTests,
  syncProjectApis,
  testEndpoint,
} from '@/lib/api';
import { cn, formatRelativeTime } from '@/lib/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Play, RefreshCw, Zap } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endpoints', id] });
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
  });

  const runAllMutation = useMutation({
    mutationFn: () => runProjectTests(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latestResults', id] });
      queryClient.invalidateQueries({ queryKey: ['stats', id] });
    },
  });

  const testEndpointMutation = useMutation({
    mutationFn: (endpointId: string) => testEndpoint(id, endpointId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['latestResults', id] });
      queryClient.invalidateQueries({ queryKey: ['stats', id] });
    },
  });

  const getResultForEndpoint = (endpointId: string) => {
    return latestResults?.find((r) => r.endpointId === endpointId);
  };

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
          <Button onClick={() => runAllMutation.mutate()} disabled={runAllMutation.isPending}>
            <Zap className={cn('w-4 h-4 mr-2', runAllMutation.isPending && 'animate-spin')} />
            {t('project.runAllTests')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
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
        <CardHeader>
          <CardTitle>{t('project.endpoints')} ({endpoints?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!endpoints?.length ? (
            <div className="p-8 text-center text-gray-500">
              {t('project.noEndpoints')}
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
    </div>
  );
}
