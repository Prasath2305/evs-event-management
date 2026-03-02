// src/app/super-admin/events/page.tsx
import { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { EventListTable } from '@/components/admin/events/EventListTable';
import { ExportEventsButton } from '@/components/admin/events/ExportEventsButton';
import { Filter } from 'lucide-react';

export const metadata: Metadata = {
  title: 'All Events | Super Admin',
};

export default async function SuperAdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string; status?: string }>;
}) {
  const supabase = createAdminClient();
  const params = await searchParams;

  const { data: departments } = await supabase
    .from('departments')
    .select('id, name, code')
    .order('name');

  let query = supabase
    .from('events')
    .select('*, departments(name, code)')
    .order('created_at', { ascending: false });

  if (params.department) query = query.eq('department_id', params.department);
  if (params.status) query = query.eq('status', params.status as 'upcoming' | 'ongoing' | 'completed' | 'cancelled');

  const { data: events } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Events</h1>
          <p className="text-slate-500 mt-1">View and manage events across all departments</p>
        </div>
        <ExportEventsButton events={events || []} filename="all-events" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <form className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-slate-500">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          <select
            name="department"
            defaultValue={params.department || ''}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500"
          >
            <option value="">All Departments</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={params.status || ''}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-violet-500"
          >
            <option value="">All Statuses</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            type="submit"
            className="text-sm px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            Apply
          </button>
          {(params.department || params.status) && (
            <a
              href="/super-admin/events"
              className="text-sm text-slate-500 hover:text-slate-700 underline"
            >
              Clear
            </a>
          )}
        </form>
        <p className="text-xs text-slate-400 mt-3">
          Showing {events?.length || 0} event{events?.length !== 1 ? 's' : ''}
        </p>
      </div>

      <EventListTable events={events || []} />
    </div>
  );
}
