// src/app/(admin)/events/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EventListTable } from '@/components/admin/events/EventListTable';
import { ExportEventsButton } from '@/components/admin/events/ExportEventsButton';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: 'My Events | EVS Admin',
};

export default async function AdminEventsPage() {
  const supabase = await createClient();

  // Get the current user's profile to scope events
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await createAdminClient()
    .from('profiles')
    .select('role, department_id, departments(name)')
    .eq('id', user!.id)
    .single();

  let query = supabase
    .from('events')
    .select('*, departments(name, code)')
    .order('created_at', { ascending: false });

  if (profile?.role === 'admin' && profile?.department_id) {
    query = query.eq('department_id', profile.department_id);
  }

  const { data: events } = await query;
  const deptName = (profile?.departments as { name: string } | null)?.name;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {deptName ? `${deptName} Events` : 'Manage Events'}
          </h1>
          <p className="text-slate-500 mt-1">Create and manage your department's events</p>
        </div>
        <div className="flex gap-3">
          <ExportEventsButton events={events || []} filename={deptName ? deptName.replace(/\s+/g, '-').toLowerCase() : 'events'} />
          <Link href="/admin/events/create">
            <Button icon={Plus}>Create Event</Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200">
        <span className="text-sm text-slate-500">Total: {events?.length || 0} events</span>
      </div>

      <EventListTable
        events={events || []}
      />
    </div>
  );
}
