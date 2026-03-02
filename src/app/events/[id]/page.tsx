import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { EventReport } from '@/components/reports/EventReport';
import { formatDate, formatTime } from '@/lib/utils/helpers';

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: event } = await supabase
    .from('events')
    .select('*, departments(name, code)')
    .eq('id', params.id)
    .single();

  if (!event) notFound();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <EventReport event={event as any} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
            <h3 className="font-bold text-slate-800 mb-4">Quick Info</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Department</dt>
                <dd className="font-medium text-slate-800">{event.departments?.name}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Event Type</dt>
                <dd className="font-medium text-slate-800 capitalize">{event.event_type.replace('_', ' ')}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd className="font-medium text-slate-800 capitalize">{event.status}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}