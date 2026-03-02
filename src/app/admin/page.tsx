// src/app/admin/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { CalendarDays, CalendarPlus, TrendingUp, Users, CheckCircle } from 'lucide-react';
import { ExportEventsButton } from '@/components/admin/events/ExportEventsButton';

export const metadata: Metadata = {
  title: 'Admin Dashboard | EVS Portal',
};

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await createAdminClient()
    .from('profiles')
    .select('full_name, role, department_id, departments(name, code)')
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/login');
  if (profile.role === 'super_admin') redirect('/super-admin');

  let query = supabase
    .from('events')
    .select('id, name, date, status, actual_participants, expected_participants, event_type, departments(name, code), flyer_url, venue, created_at, description, start_time, end_time, theme, resource_person, is_featured')
    .order('created_at', { ascending: false });

  if (profile?.role === 'admin' && profile?.department_id) {
    query = query.eq('department_id', profile.department_id);
  }

  const { data: events } = await query;

  const totalEvents = events?.length || 0;
  const totalParticipants = events?.reduce((s, e) => s + (e.actual_participants || 0), 0) || 0;
  const upcoming = events?.filter((e) => e.status === 'upcoming').length || 0;
  const completed = events?.filter((e) => e.status === 'completed').length || 0;

  const deptName = (profile?.departments as { name: string; code: string } | null)?.name;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome, {profile?.full_name || user?.email}!
          </h1>
          {deptName && (
            <p className="text-slate-500 mt-1">
              Managing events for <span className="font-semibold text-emerald-700">{deptName}</span>
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <ExportEventsButton events={(events || []) as Parameters<typeof ExportEventsButton>[0]['events']} filename={deptName?.replace(/\s+/g, '-').toLowerCase() || 'events'} />
          <Link
            href="/admin/events/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <CalendarPlus className="w-4 h-4" />
            Create Event
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Events', value: totalEvents, icon: CalendarDays, color: 'bg-emerald-100 text-emerald-700' },
          { label: 'Upcoming', value: upcoming, icon: TrendingUp, color: 'bg-sky-100 text-sky-700' },
          { label: 'Completed', value: completed, icon: CheckCircle, color: 'bg-slate-100 text-slate-700' },
          { label: 'Total Participants', value: totalParticipants, icon: Users, color: 'bg-amber-100 text-amber-700' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-500">{stat.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Recent Events</h2>
          <Link href="/admin/events" className="text-sm text-emerald-600 hover:underline">
            View all
          </Link>
        </div>
        {!events?.length ? (
          <div className="text-center py-12">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 mb-4">No events yet. Create your first event!</p>
            <Link
              href="/admin/events/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700"
            >
              <CalendarPlus className="w-4 h-4" />
              Create Event
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {events.slice(0, 8).map((event) => (
              <div key={event.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  {event.flyer_url ? (
                    <img src={event.flyer_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <CalendarDays className="w-5 h-5 text-emerald-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-800">{event.name}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(event.date).toLocaleDateString('en-IN')} · {event.actual_participants} participants
                    </p>
                  </div>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
