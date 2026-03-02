// src/components/super-admin/SuperAdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Building2,
  UserPlus,
  BarChart3,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

const navItems = [
  { href: '/super-admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/super-admin/events', label: 'All Events', icon: CalendarDays },
  { href: '/super-admin/admins', label: 'Manage Admins', icon: Users },
  { href: '/super-admin/departments', label: 'Departments', icon: Building2 },
  { href: '/super-admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/super-admin/settings', label: 'Settings', icon: Settings },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)]">
      <nav className="p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-violet-50 text-violet-700 border-r-2 border-violet-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive ? 'text-violet-600' : 'text-slate-400')} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-slate-200">
        <div className="bg-violet-50 rounded-lg p-4">
          <p className="text-xs font-medium text-violet-800 mb-1">Super Admin Mode</p>
          <p className="text-xs text-violet-600">Full access across all departments</p>
        </div>
      </div>
    </aside>
  );
}
