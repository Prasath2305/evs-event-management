// src/app/super-admin/analytics/page.tsx
import { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  BarChart3,
  CalendarDays,
  Users,
  Building2,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Activity,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Analytics | Super Admin',
};

export default async function AnalyticsPage() {
  const supabase = createAdminClient();

  const [
    { count: totalEvents },
    { count: totalAdmins },
    { count: totalDepts },
    { data: events },
    { data: monthlyStats },
    { data: deptStats },
    { data: registrations },
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    supabase.from('departments').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('status, event_type, actual_participants, expected_participants'),
    supabase.from('monthly_event_stats').select('*').order('month', { ascending: false }).limit(6),
    supabase.from('department_event_stats').select('*').order('total_events', { ascending: false }),
    supabase.from('event_registrations').select('*', { count: 'exact', head: true }),
  ]);

  // Status breakdown
  const statusCounts: Record<string, number> = { upcoming: 0, ongoing: 0, completed: 0, cancelled: 0 };
  events?.forEach((e) => { statusCounts[e.status] = (statusCounts[e.status] || 0) + 1; });

  // Event type breakdown
  const typeCounts: Record<string, number> = {};
  events?.forEach((e) => { typeCounts[e.event_type] = (typeCounts[e.event_type] || 0) + 1; });
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);

  // Participant totals
  const totalActual = events?.reduce((sum, e) => sum + (e.actual_participants || 0), 0) || 0;
  const totalExpected = events?.reduce((sum, e) => sum + (e.expected_participants || 0), 0) || 0;
  const attendanceRate = totalExpected > 0 ? Math.round((totalActual / totalExpected) * 100) : 0;

  const statusConfig = [
    { key: 'upcoming', label: 'Upcoming', icon: Clock, color: 'bg-emerald-100 text-emerald-700' },
    { key: 'ongoing', label: 'Ongoing', icon: Activity, color: 'bg-amber-100 text-amber-700' },
    { key: 'completed', label: 'Completed', icon: CheckCircle2, color: 'bg-sky-100 text-sky-700' },
    { key: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-600' },
  ];

  const maxDeptEvents = Math.max(...(deptStats?.map((d) => d.total_events || 0) || [1]));
  const maxMonthlyEvents = Math.max(...(monthlyStats?.map((m) => m.total_events || 0) || [1]));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-violet-600" />
          Analytics
        </h1>
        <p className="text-slate-500 mt-1">Portal-wide statistics and insights</p>
      </div>

      {/* Top-level KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: totalEvents || 0, icon: CalendarDays, color: 'bg-violet-100 text-violet-700' },
          { label: 'Total Participants', value: totalActual.toLocaleString(), icon: Users, color: 'bg-emerald-100 text-emerald-700' },
          { label: 'Departments', value: totalDepts || 0, icon: Building2, color: 'bg-sky-100 text-sky-700' },
          { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: TrendingUp, color: 'bg-amber-100 text-amber-700' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{kpi.label}</span>
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Events by Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusConfig.map(({ key, label, icon: Icon, color }) => (
            <div key={key} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-2 ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-slate-800">{statusCounts[key]}</p>
              <p className="text-sm text-slate-500">{label}</p>
              {totalEvents ? (
                <p className="text-xs text-slate-400 mt-0.5">
                  {Math.round((statusCounts[key] / totalEvents) * 100)}%
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Stats */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-violet-600" />
            Events by Department
          </h2>
          {!deptStats?.length ? (
            <p className="text-sm text-slate-400">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {deptStats.map((d, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700 truncate max-w-[180px]">{d.department_name}</span>
                    <div className="flex items-center gap-3 text-slate-500 text-xs shrink-0">
                      <span>{d.total_participants?.toLocaleString()} participants</span>
                      <span className="font-semibold text-slate-700">{d.total_events} events</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-violet-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.round(((d.total_events || 0) / maxDeptEvents) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Event Type Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-600" />
            Events by Type
          </h2>
          {!sortedTypes.length ? (
            <p className="text-sm text-slate-400">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {sortedTypes.map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 capitalize">{type.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-28 bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{ width: `${Math.round((count / (totalEvents || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600 w-6 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-violet-600" />
          Monthly Trends (last 6 months)
        </h2>
        {!monthlyStats?.length ? (
          <p className="text-sm text-slate-400">No monthly data available yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 pr-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Month</th>
                  <th className="text-right py-2 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Events</th>
                  <th className="text-right py-2 px-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Participants</th>
                  <th className="text-right py-2 pl-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Avg / Event</th>
                  <th className="w-40 py-2 pl-4 text-xs font-medium text-slate-500 uppercase tracking-wide">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {monthlyStats.map((m, i) => {
                  const month = m.month ? new Date(m.month + '-01').toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—';
                  return (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-3 pr-4 font-medium text-slate-700">{month}</td>
                      <td className="py-3 px-4 text-right text-slate-600">{m.total_events ?? 0}</td>
                      <td className="py-3 px-4 text-right text-slate-600">{m.total_participants?.toLocaleString() ?? 0}</td>
                      <td className="py-3 pl-4 text-right text-slate-600">
                        {m.avg_participants != null ? Math.round(m.avg_participants) : 0}
                      </td>
                      <td className="py-3 pl-4">
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-violet-400 h-2 rounded-full"
                            style={{ width: `${Math.round(((m.total_events || 0) / maxMonthlyEvents) * 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Coordinator Stats */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Dept. Coordinators (Admins)</p>
            <p className="text-2xl font-bold text-slate-800">{totalAdmins || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
