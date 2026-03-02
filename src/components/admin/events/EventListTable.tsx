// src/components/admin/events/EventListTable.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  MapPin,
} from 'lucide-react';
import { EventWithDepartment } from '@/types/supabase';
import { formatDate, getEventStatusColor } from '@/lib/utils/helpers';
import { Badge } from '@/components/ui/Badge';

interface EventListTableProps {
  events: EventWithDepartment[];
  onDelete?: (id: string) => void;
}

export function EventListTable({ events, onDelete }: EventListTableProps) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        onDelete?.(id);
        router.refresh();
      } else {
        alert('Failed to delete event');
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Event Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Date & Venue
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Department
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {events.map((event) => (
            <tr key={event.id} className="hover:bg-slate-50">
              <td className="px-6 py-4">
                <div className="flex items-center">
                  {event.flyer_url ? (
                    <img
                      src={event.flyer_url}
                      alt=""
                      className="h-10 w-10 rounded-lg object-cover mr-3"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center mr-3">
                      <Calendar className="w-5 h-5 text-emerald-600" />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-900">{event.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{event.event_type.replace('_', ' ')}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-slate-900">{formatDate(event.date)}</div>
                <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {event.venue}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-slate-900">
                  {event.departments?.name || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4">
                <Badge className={getEventStatusColor(event.status)}>
                  {event.status}
                </Badge>
                {event.is_featured && (
                  <Badge variant="warning" className="ml-2 text-xs">
                    Featured
                  </Badge>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/events/${event.id}`}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

