// src/app/super-admin/admins/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/admin';
import { UserPlus, Mail, Building2, ShieldCheck, Shield } from 'lucide-react';
import { DeleteAdminButton } from './DeleteAdminButton';

export const metadata: Metadata = {
  title: 'Manage Admins | Super Admin',
};

export default async function AdminsListPage() {
  const supabase = createAdminClient();

  const { data: admins } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, department_id, created_at, departments(name, code)')
    .in('role', ['admin', 'super_admin'])
    .order('role')
    .order('created_at');

  const adminUsers = admins?.filter((a) => a.role === 'admin') || [];
  const superAdmins = admins?.filter((a) => a.role === 'super_admin') || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Admins</h1>
          <p className="text-slate-500 mt-1">Add department coordinators and super admins</p>
        </div>
        <Link
          href="/super-admin/admins/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add New Admin
        </Link>
      </div>

      {/* Super Admins */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-violet-600" />
          Super Administrators ({superAdmins.length})
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {superAdmins.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">No super admins found.</div>
          ) : (
            <table className="w-full">
              <thead className="bg-violet-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Added On</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {superAdmins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4 text-violet-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-800">{admin.full_name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <Mail className="w-3 h-3" />
                        {admin.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(admin.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DeleteAdminButton adminId={admin.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Department Coordinators */}
      <div>
        <h2 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" />
          Department Coordinators ({adminUsers.length})
        </h2>
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {adminUsers.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">
              No coordinators added yet.{' '}
              <Link href="/super-admin/admins/create" className="text-violet-600 hover:underline">
                Add one now.
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Added On</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {adminUsers.map((admin) => {
                  const dept = admin.departments as { name: string; code: string } | null;
                  return (
                    <tr key={admin.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-emerald-600" />
                          </div>
                          <span className="text-sm font-medium text-slate-800">{admin.full_name || '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <Mail className="w-3 h-3" />
                          {admin.email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {dept ? (
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span className="text-sm text-slate-700">{dept.name}</span>
                            <span className="text-xs text-slate-400">({dept.code})</span>
                          </div>
                        ) : (
                          <span className="text-sm text-red-500">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(admin.created_at).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DeleteAdminButton adminId={admin.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

