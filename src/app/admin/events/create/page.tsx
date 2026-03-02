// src/app/admin/events/create/page.tsx
import { Metadata } from 'next';
import { CreateEventForm } from '@/components/admin/events/CreateEventForm';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: 'Create Event | EVS Admin',
  description: 'Create a new environmental studies event',
};

export default async function CreateEventPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await createAdminClient()
    .from('profiles')
    .select('role, department_id, departments(id, name, code)')
    .eq('id', user!.id)
    .single();

  // For regular admins, only show their department. Super admins see all.
  let departments: { id: string; name: string; code: string; created_at: string }[] = [];
  if (profile?.role === 'admin' && profile?.department_id) {
    const { data: deptData } = await supabase
      .from('departments')
      .select('id, name, code, created_at')
      .eq('id', profile.department_id)
      .single();
    if (deptData) {
      departments = [deptData as { id: string; name: string; code: string; created_at: string }];
    }
  } else {
    const { data } = await supabase
      .from('departments')
      .select('id, name, code, created_at')
      .order('name');
    departments = (data || []) as { id: string; name: string; code: string; created_at: string }[];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create New Event</h1>
        <p className="text-slate-500 mt-1">Fill in the details below to create a new environmental event</p>
      </div>
      
      <CreateEventForm
        departments={departments}
        lockedDepartmentId={profile?.role === 'admin' ? profile.department_id ?? null : null}
      />
    </div>
  );
}