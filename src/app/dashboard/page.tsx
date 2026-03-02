'use client';

import { useAnalytics } from '@/hooks/useAnalytics';
import { StatsCard } from '@/components/analytics/StatsCard';
import { MonthlyTrendsChart } from '@/components/analytics/MonthlyTrendsChart';
import { DepartmentDistribution } from '@/components/analytics/DepartmentDistribution';
import { Calendar, Users, TreePine, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { data, loading } = useAnalytics();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-emerald-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-emerald-100 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Analytics Dashboard</h1>
        <p className="text-slate-600">Insights and statistics for EVS events</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Events"
          value={data?.totalEvents || 0}
          change={12}
          icon={Calendar}
          color="emerald"
        />
        <StatsCard
          title="Total Participants"
          value={data?.totalParticipants || 0}
          change={8}
          icon={Users}
          color="sky"
        />
        <StatsCard
          title="Tree Plantations"
          value={data?.eventTypeDistribution.find(t => t.type === 'tree_plantation')?.count || 0}
          icon={TreePine}
          color="amber"
        />
        <StatsCard
          title="Avg. Participation"
          value={Math.round((data?.totalParticipants || 0) / (data?.totalEvents || 1))}
          icon={TrendingUp}
          color="rose"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {data?.monthlyTrends && (
          <MonthlyTrendsChart data={data.monthlyTrends} />
        )}
        {data?.departmentStats && (
          <DepartmentDistribution data={data.departmentStats} />
        )}
      </div>

      {/* Recent Activity Table could go here */}
    </div>
  );
}