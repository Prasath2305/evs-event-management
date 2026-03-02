// src/app/super-admin/departments/page.tsx
import { Metadata } from 'next';
import { createAdminClient } from '@/lib/supabase/admin';
import { DepartmentsClient } from './DepartmentsClient';

export const metadata: Metadata = {
  title: 'Departments | Super Admin',
};

export default async function DepartmentsPage() {
  const supabase = createAdminClient();

  const [{ data: departments }, { data: eventCounts }] = await Promise.all([
    supabase.from('departments').select('id, name, code, created_at').order('name'),
    supabase.from('events').select('department_id').not('department_id', 'is', null),
  ]);

  // Build event count map
  const countMap: Record<string, number> = {};
  eventCounts?.forEach((e) => {
    if (e.department_id) {
      countMap[e.department_id] = (countMap[e.department_id] || 0) + 1;
    }
  });

  const depts = (departments || []).map((d) => ({
    ...d,
    event_count: countMap[d.id] || 0,
  }));

  return <DepartmentsClient departments={depts} />;
}
