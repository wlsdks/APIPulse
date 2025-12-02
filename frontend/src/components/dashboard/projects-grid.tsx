'use client';

import { InteractiveCard, StaggerContainer, StaggerItem } from '@/components/motion';
import { Badge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/contexts/toast-context';
import { runProjectTests } from '@/lib/api';
import type { ProjectSummary } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Play, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface ProjectsGridProps {
  projects: ProjectSummary[];
}

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  const { t } = useLanguage();
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();

  const runTestsMutation = useMutation({
    mutationFn: runProjectTests,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      showSuccess(t('success.testCompleted'));
    },
    onError: (error) => {
      showError(error);
    },
  });

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
            <ExternalLink className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('dashboard.noProjects')}
          </h3>
          <p className="text-gray-500 mb-6">{t('dashboard.createFirst')}</p>
          <Link href="/projects/new">
            <Button variant="gradient">{t('dashboard.addProject')}</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const getStatusForHealth = (status: string): 'healthy' | 'warning' | 'error' | 'unknown' => {
    switch (status) {
      case 'HEALTHY':
        return 'healthy';
      case 'UNHEALTHY':
        return 'error';
      default:
        return 'unknown';
    }
  };

  return (
    <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <StaggerItem key={project.id}>
          <InteractiveCard>
            <Card
              variant="status"
              status={getStatusForHealth(project.healthStatus)}
              className="h-full"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="flex-1 min-w-0 pr-3">
                  <CardTitle className="text-base font-semibold truncate">
                    {project.name}
                  </CardTitle>
                  <p className="text-sm text-gray-500 truncate mt-1">
                    {project.baseUrl}
                  </p>
                </div>
                <StatusBadge status={project.healthStatus} />
              </CardHeader>
              <CardContent className="pt-0">
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3 mb-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {project.endpointCount}
                    </p>
                    <p className="text-xs text-gray-500">{t('projects.endpoints')}</p>
                  </div>
                  <div className="text-center border-x border-gray-200 dark:border-gray-700">
                    <p className="text-lg font-bold text-green-500">{project.successCount}</p>
                    <p className="text-xs text-gray-500">{t('common.success')}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-500">{project.failedCount}</p>
                    <p className="text-xs text-gray-500">{t('common.failed')}</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <Badge variant="default" className="font-mono">
                    {project.avgResponseTimeMs}ms
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => runTestsMutation.mutate(project.id)}
                      disabled={runTestsMutation.isPending}
                      title={t('project.runTests')}
                    >
                      {runTestsMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <Link href={`/projects/${project.id}`}>
                      <Button size="sm" variant="outline">
                        {t('common.edit')}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </InteractiveCard>
        </StaggerItem>
      ))}
    </StaggerContainer>
  );
}
