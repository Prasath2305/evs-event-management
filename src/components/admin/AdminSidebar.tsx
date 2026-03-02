// src/components/admin/AdminSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CalendarPlus, 
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils/helpers';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/events', label: 'My Events', icon: List },
  { href: '/admin/events/create', label: 'Create Event', icon: CalendarPlus },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)] relative">
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
                  ? 'bg-emerald-50 text-emerald-700 border-r-2 border-emerald-600' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon className={cn('w-5 h-5', isActive ? 'text-emerald-600' : 'text-slate-400')} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4 border-t border-slate-200">
        <div className="bg-emerald-50 rounded-lg p-4">
          <p className="text-xs font-medium text-emerald-800 mb-1">Dept. Coordinator</p>
          <p className="text-xs text-emerald-600">Manage your department's events</p>
        </div>
      </div>
    </aside>
  );
}


