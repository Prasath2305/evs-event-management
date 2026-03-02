// src/app/super-admin/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { Building2, CalendarDays, Users, TrendingUp, UserPlus, Plus } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Super Admin Dashboard | EVS Portal',
};

export default async function SuperAdminDashboard() {
  const supabase = createAdminClient();

  // Fetch stats in parallel
  const [
    { count: totalEvents },
    { count: totalAdmins },
    { data: departments },
    { data: recentEvents },
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    supabase.from('departments').select('id, name, code'),
    supabase
      .from('events')
      .select('id, name, date, status, departments(name)')
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  // Dept-wise event counts
  const { data: deptStats } = await supabase
    .from('events')
    .select('department_id, departments(name, code)')
    .not('department_id', 'is', null);

  const deptCounts: Record<string, { name: string; code: string; count: number }> = {};
  deptStats?.forEach((e) => {
    const d = e.departments as { name: string; code: string } | null;
    if (e.department_id && d) {
      if (!deptCounts[e.department_id]) {
        deptCounts[e.department_id] = { name: d.name, code: d.code, count: 0 };
      }
      deptCounts[e.department_id].count++;
    }
  });

  const stats = [
    { label: 'Total Events', value: totalEvents || 0, icon: CalendarDays, color: 'bg-violet-100 text-violet-700', href: '/super-admin/events' },
    { label: 'Departments', value: departments?.length || 0, icon: Building2, color: 'bg-emerald-100 text-emerald-700', href: '/super-admin/departments' },
    { label: 'Dept. Coordinators', value: totalAdmins || 0, icon: Users, color: 'bg-sky-100 text-sky-700', href: '/super-admin/admins' },
    { label: 'Active Now', value: recentEvents?.filter(e => e.status === 'ongoing').length || 0, icon: TrendingUp, color: 'bg-amber-100 text-amber-700', href: '/super-admin/events' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Super Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage all departments, admins, and events</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/super-admin/admins/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Add Admin
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-slate-500">{stat.label}</span>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Event Counts */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-violet-600" />
            Events by Department
          </h2>
          {Object.keys(deptCounts).length === 0 ? (
            <p className="text-sm text-slate-400">No events recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(deptCounts)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([id, dept]) => (
                  <div key={id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{dept.name}</p>
                      <p className="text-xs text-slate-400">{dept.code}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-violet-500 h-2 rounded-full"
                          style={{ width: `${Math.min((dept.count / (totalEvents || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-slate-700 w-6 text-right">{dept.count}</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-violet-600" />
              Recent Events
            </h2>
            <Link href="/super-admin/events" className="text-sm text-violet-600 hover:underline">
              View all
            </Link>
          </div>
          {!recentEvents?.length ? (
            <p className="text-sm text-slate-400">No events yet.</p>
          ) : (
            <div className="space-y-3">
              {recentEvents.map((event) => {
                const dept = event.departments as { name: string } | null;
                return (
                  <div key={event.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-700">{event.name}</p>
                      <p className="text-xs text-slate-400">{dept?.name} · {new Date(event.date).toLocaleDateString('en-IN')}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      event.status === 'upcoming' ? 'bg-emerald-100 text-emerald-700' :
                      event.status === 'ongoing' ? 'bg-amber-100 text-amber-700' :
                      event.status === 'completed' ? 'bg-slate-100 text-slate-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
