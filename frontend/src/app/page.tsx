'use client';

import { ProjectsGrid } from '@/components/dashboard/projects-grid';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/motion';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { SkeletonDashboard } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/language-context';
import { getDashboardOverview } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { t } = useLanguage();
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardOverview,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <PageHeader title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />
        <SkeletonDashboard />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <PageHeader title={t('dashboard.title')} subtitle={t('dashboard.subtitle')} />
        <FadeInUp>
          <div className="flex flex-col items-center justify-center h-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <p className="text-red-500 mb-4">{t('common.error')}</p>
            <Button onClick={() => refetch()}>{t('common.retry')}</Button>
          </div>
        </FadeInUp>
      </div>
    );
  }

  if (!data) return null;

  return (
    <StaggerContainer className="space-y-8">
      <StaggerItem>
        <PageHeader title={t('dashboard.title')} subtitle={t('dashboard.subtitle')}>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
          <Link href="/projects/new">
            <Button variant="gradient">
              <Plus className="w-4 h-4 mr-2" />
              {t('dashboard.addProject')}
            </Button>
          </Link>
        </PageHeader>
      </StaggerItem>

      <StaggerItem>
        <StatsCards data={data} />
      </StaggerItem>

      <StaggerItem>
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('dashboard.projectHealth')}
          </h2>
          <ProjectsGrid projects={data.projects} />
        </div>
      </StaggerItem>
    </StaggerContainer>
  );
}
