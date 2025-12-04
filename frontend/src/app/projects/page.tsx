'use client';

import { InteractiveCard, StaggerContainer, StaggerItem } from '@/components/motion';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SkeletonProjectCard } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';
import { useToast } from '@/contexts/toast-context';
import { deleteProject, getProjects, syncProjectApis } from '@/lib/api';
import { formatRelativeTime } from '@/lib/utils';
import type { Project } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, FolderKanban, MoreVertical, Plus, RefreshCw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ProjectsPage() {
  const { t, language } = useLanguage();
  const { showError, showSuccess } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: getProjects,
  });

  const syncMutation = useMutation({
    mutationFn: syncProjectApis,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      showSuccess(t('success.syncCompleted'));
    },
    onError: (error) => {
      showError(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      showSuccess(t('success.projectDeleted'));
    },
    onError: (error) => {
      showError(error);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title={t('projects.title')} subtitle={t('projects.subtitle')} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <SkeletonProjectCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('projects.title')} subtitle={t('projects.subtitle')}>
        <Link href="/projects/new">
          <Button variant="gradient">
            <Plus className="w-4 h-4 mr-2" />
            {t('projects.new')}
          </Button>
        </Link>
      </PageHeader>

      {!projects?.length ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6">
              <FolderKanban className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('projects.noProjects')}
            </h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              {t('projects.createDescription')}
            </p>
            <Link href="/projects/new">
              <Button variant="gradient" size="lg">
                <Plus className="w-5 h-5 mr-2" />
                {t('projects.new')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <StaggerContainer className="space-y-3">
          {projects.map((project: Project) => (
            <StaggerItem key={project.id}>
              <InteractiveCard hoverScale={1.005}>
                <Card
                  variant="elevated"
                  className="cursor-pointer"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <FolderKanban className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/projects/${project.id}`}
                              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-500 transition-colors truncate"
                            >
                              {project.name}
                            </Link>
                            {!project.enabled && (
                              <Badge variant="warning">{t('common.disabled')}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 truncate">{project.baseUrl}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 ml-12">
                        <span className="flex items-center gap-1">
                          <ExternalLink className="w-3.5 h-3.5" />
                          {project.endpointCount} {t('projects.endpoints')}
                        </span>
                        <span>{formatRelativeTime(project.updatedAt, language)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => syncMutation.mutate(project.id)}
                        disabled={syncMutation.isPending}
                        title={t('project.syncApis')}
                      >
                        <RefreshCw
                          className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`}
                        />
                      </Button>

                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setOpenMenu(openMenu === project.id ? null : project.id)}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>

                        <AnimatePresence>
                          {openMenu === project.id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -5 }}
                              transition={{ duration: 0.15 }}
                              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
                            >
                              <Link
                                href={`/projects/${project.id}`}
                                className="block px-4 py-2.5 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              >
                                {t('common.edit')}
                              </Link>
                              <button
                                className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                                onClick={() => {
                                  if (confirm(t('common.confirmDelete'))) {
                                    deleteMutation.mutate(project.id);
                                  }
                                  setOpenMenu(null);
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                                {t('common.delete')}
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </InteractiveCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
    </div>
  );
}
