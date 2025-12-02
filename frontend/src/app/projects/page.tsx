'use client';

import { Badge, StatusBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { deleteProject, getProjects, syncProjectApis } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import type { Project } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ExternalLink, MoreVertical, Plus, RefreshCw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const syncMutation = useMutation({
    mutationFn: syncProjectApis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your API monitoring projects</p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {!projects?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
              <ExternalLink className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No projects yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
              Create your first project to start monitoring your Spring Boot APIs. You can import endpoints from Swagger/OpenAPI.
            </p>
            <Link href="/projects/new">
              <Button size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project: Project) => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between py-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {project.name}
                    </Link>
                    {!project.enabled && <Badge variant="warning">Disabled</Badge>}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{project.baseUrl}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>{project.endpointCount} endpoints</span>
                    <span>Updated {formatRelativeTime(project.updatedAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => syncMutation.mutate(project.id)}
                    disabled={syncMutation.isPending}
                    title="Sync APIs from Swagger"
                  >
                    <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                  </Button>

                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setOpenMenu(openMenu === project.id ? null : project.id)}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>

                    {openMenu === project.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 z-10">
                        <Link
                          href={`/projects/${project.id}`}
                          className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          View Details
                        </Link>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this project?')) {
                              deleteMutation.mutate(project.id);
                            }
                            setOpenMenu(null);
                          }}
                        >
                          <Trash2 className="w-4 h-4 inline mr-2" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
