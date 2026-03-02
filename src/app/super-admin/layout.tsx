// src/app/super-admin/layout.tsx
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { SuperAdminSidebar } from '@/components/super-admin/SuperAdminSidebar';
import { SuperAdminHeader } from '@/components/super-admin/SuperAdminHeader';

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const saSession = cookieStore.get('sa_session')?.value;
  const saPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!saSession || !saPassword || saSession !== saPassword) {
    redirect('/login');
  }

  const displayName = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL ?? 'Super Admin';

  return (
    <div className="min-h-screen bg-slate-50">
      <SuperAdminHeader displayName={displayName} />
      <div className="flex">
        <SuperAdminSidebar />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
