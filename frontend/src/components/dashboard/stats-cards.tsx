'use client';

import { InteractiveCard } from '@/components/motion';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/language-context';
import type { DashboardOverview } from '@/types';
import { Activity, CheckCircle, Clock, Layers, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  data: DashboardOverview;
}

export function StatsCards({ data }: StatsCardsProps) {
  const { t } = useLanguage();

  const stats = [
    {
      name: t('dashboard.totalProjects'),
      value: data.totalProjects,
      icon: Layers,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      trend: null,
    },
    {
      name: t('dashboard.totalEndpoints'),
      value: data.totalEndpoints,
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      trend: null,
    },
    {
      name: t('dashboard.successRate'),
      value: `${data.overallSuccessRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: data.overallSuccessRate >= 90 ? 'text-green-500' : data.overallSuccessRate >= 70 ? 'text-amber-500' : 'text-red-500',
      bgColor: data.overallSuccessRate >= 90
        ? 'bg-green-100 dark:bg-green-900/30'
        : data.overallSuccessRate >= 70
          ? 'bg-amber-100 dark:bg-amber-900/30'
          : 'bg-red-100 dark:bg-red-900/30',
      trend: data.overallSuccessRate >= 90 ? 'up' : data.overallSuccessRate >= 70 ? 'neutral' : 'down',
    },
    {
      name: t('dashboard.avgResponseTime'),
      value: `${data.overallAvgResponseTimeMs}ms`,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      trend: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <InteractiveCard key={index} hoverScale={1.02}>
          <Card variant="elevated">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.trend === 'up' && (
                  <div className="flex items-center text-green-500 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>Good</span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.name}</p>
              </div>
            </CardContent>
          </Card>
        </InteractiveCard>
      ))}
    </div>
  );
}
