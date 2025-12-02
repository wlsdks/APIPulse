'use client';

import { Badge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { runProjectTests } from '@/lib/api';
import type { ProjectSummary } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, Play, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface ProjectsGridProps {
  projects: ProjectSummary[];
}

export function ProjectsGrid({ projects }: ProjectsGridProps) {
  const queryClient = useQueryClient();

  const runTestsMutation = useMutation({
    mutationFn: runProjectTests,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <ExternalLink className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No projects yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Add your first project to start monitoring APIs</p>
          <Link href="/projects/new">
            <Button>Add Project</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <Card key={project.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold truncate">{project.name}</CardTitle>
            <StatusBadge status={project.healthStatus} />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-4">{project.baseUrl}</p>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Endpoints</p>
                <p className="text-lg font-semibold">{project.endpointCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Success</p>
                <p className="text-lg font-semibold text-green-500">{project.successCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Failed</p>
                <p className="text-lg font-semibold text-red-500">{project.failedCount}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="info">{project.avgResponseTimeMs}ms avg</Badge>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => runTestsMutation.mutate(project.id)}
                  disabled={runTestsMutation.isPending}
                >
                  {runTestsMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <Link href={`/projects/${project.id}`}>
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
