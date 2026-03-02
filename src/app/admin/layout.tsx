// src/app/(admin)/layout.tsx
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Use admin client to bypass RLS when reading profile
  const { data: profile } = await createAdminClient()
    .from('profiles')
    .select('role, full_name, department_id, departments(id, name, code)')
    .eq('id', user.id)
    .single();

  // Only 'admin' role can access /admin (super_admin has their own /super-admin section)
  if (!profile || profile.role !== 'admin') {
    if (profile?.role === 'super_admin') {
      redirect('/super-admin');
    }
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminHeader user={user} profile={profile} />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
