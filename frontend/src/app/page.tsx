'use client';

import { ProjectsGrid } from '@/components/dashboard/projects-grid';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { Button } from '@/components/ui/button';
import { getDashboardOverview } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Plus, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardOverview,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">Failed to load dashboard data</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor your API health at a glance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/projects/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Project
            </Button>
          </Link>
        </div>
      </div>

      <StatsCards data={data} />

      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Projects</h2>
        <ProjectsGrid projects={data.projects} />
      </div>
    </div>
  );
}
