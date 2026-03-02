'use client';

import { Trash2 } from 'lucide-react';

export function DeleteAdminButton({ adminId }: { adminId: string }) {
  return (
    <form action={`/api/super-admin/admins/${adminId}`} method="post">
      <input type="hidden" name="_method" value="DELETE" />
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm('Remove this admin? This will not delete their Supabase auth account.')) {
            e.preventDefault();
          }
        }}
        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Remove admin"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </form>
  );
}
