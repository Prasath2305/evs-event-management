import { Metadata } from 'next';
import { ShieldCheck, Database, HardDrive, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Settings | Super Admin',
};

const settingsCards = [
  {
    title: 'Platform Access',
    description: 'Super admin-only control panel with full system visibility.',
    icon: ShieldCheck,
    value: 'Enabled',
  },
  {
    title: 'Supabase Endpoint',
    description: 'Current project endpoint used by this deployment.',
    icon: Globe,
    value: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured',
  },
  {
    title: 'Storage Bucket',
    description: 'Bucket used for event flyer uploads.',
    icon: HardDrive,
    value: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'event-flyers',
  },
  {
    title: 'Database Role Key',
    description: 'Service role key presence check for privileged operations.',
    icon: Database,
    value: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configured' : 'Missing',
  },
];

export default function SuperAdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Configuration visibility for super admin operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {settingsCards.map((card) => (
          <div key={card.title} className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-slate-800">{card.title}</h2>
              <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-sm text-slate-500 mb-4">{card.description}</p>
            <p className="text-sm font-medium text-slate-800 break-all">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
