'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { DashboardOverview } from '@/types';
import { Activity, CheckCircle, Clock, Layers } from 'lucide-react';

interface StatsCardsProps {
  data: DashboardOverview;
}

export function StatsCards({ data }: StatsCardsProps) {
  const stats = [
    {
      name: 'Total Projects',
      value: data.totalProjects,
      icon: Layers,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      name: 'Total Endpoints',
      value: data.totalEndpoints,
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    {
      name: 'Success Rate',
      value: `${data.overallSuccessRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: data.overallSuccessRate >= 90 ? 'text-green-500' : 'text-yellow-500',
      bgColor: data.overallSuccessRate >= 90 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    {
      name: 'Avg Response',
      value: `${data.overallAvgResponseTimeMs}ms`,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.name}>
          <CardContent className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
