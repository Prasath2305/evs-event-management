// src/components/super-admin/SuperAdminHeader.tsx
import Link from 'next/link';
import { LogOut, Bell, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SuperAdminHeaderProps {
  displayName: string;
}

export function SuperAdminHeader({ displayName }: SuperAdminHeaderProps) {

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-50">
      <Link href="/super-admin" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">EVS</span>
        </div>
        <span className="font-bold text-slate-800">Super Admin Portal</span>
      </Link>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-600">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-700">{displayName}</p>
            <p className="text-xs text-violet-600 flex items-center justify-end gap-1">
              <ShieldCheck className="w-3 h-3" />
              Super Administrator
            </p>
          </div>
          <form action="/auth/signout" method="post">
            <Button variant="ghost" size="sm" icon={LogOut}>
              Logout
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
