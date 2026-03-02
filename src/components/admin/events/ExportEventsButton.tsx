'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  event_type: string;
  status: string;
  expected_participants: number;
  actual_participants: number;
  resource_person?: string | null;
  theme?: string | null;
  description?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  is_featured?: boolean;
  flyer_url?: string | null;
  created_at: string;
  departments?: { name: string; code: string } | null;
}

interface ExportEventsButtonProps {
  events: Event[];
  filename?: string;
}

export function ExportEventsButton({ events, filename = 'events' }: ExportEventsButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = () => {
    if (events.length === 0) {
      alert('No events to export.');
      return;
    }

    setLoading(true);
    try {
      const rows = events.map((e, index) => ({
        'S.No': index + 1,
        'Event Name': e.name,
        'Date': new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }),
        'Start Time': e.start_time || '—',
        'End Time': e.end_time || '—',
        'Venue': e.venue,
        'Department': (e.departments as { name: string; code: string } | null)?.name || '—',
        'Dept. Code': (e.departments as { name: string; code: string } | null)?.code || '—',
        'Event Type': e.event_type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        'Theme': e.theme || '—',
        'Resource Person': e.resource_person || '—',
        'Expected Participants': e.expected_participants,
        'Actual Participants': e.actual_participants,
        'Status': e.status.charAt(0).toUpperCase() + e.status.slice(1),
        'Featured': e.is_featured ? 'Yes' : 'No',
        'Flyer URL': e.flyer_url || '—',
        'Description': e.description || '—',
        'Created At': new Date(e.created_at).toLocaleDateString('en-IN'),
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);

      // Set column widths
      worksheet['!cols'] = [
        { wch: 6 },  // S.No
        { wch: 35 }, // Event Name
        { wch: 20 }, // Date
        { wch: 12 }, // Start Time
        { wch: 12 }, // End Time
        { wch: 25 }, // Venue
        { wch: 30 }, // Department
        { wch: 12 }, // Dept Code
        { wch: 22 }, // Event Type
        { wch: 30 }, // Theme
        { wch: 25 }, // Resource Person
        { wch: 22 }, // Expected
        { wch: 20 }, // Actual
        { wch: 12 }, // Status
        { wch: 10 }, // Featured
        { wch: 60 }, // Flyer URL
        { wch: 50 }, // Description
        { wch: 14 }, // Created At
      ];

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Events');

      // Add summary sheet
      const totalParticipants = events.reduce((s, e) => s + (e.actual_participants || 0), 0);
      const summaryData = [
        ['EVS Events Export Summary', ''],
        ['Generated On', new Date().toLocaleString('en-IN')],
        ['Total Events', events.length],
        ['Total Participants', totalParticipants],
        ['Upcoming', events.filter((e) => e.status === 'upcoming').length],
        ['Ongoing', events.filter((e) => e.status === 'ongoing').length],
        ['Completed', events.filter((e) => e.status === 'completed').length],
        ['Cancelled', events.filter((e) => e.status === 'cancelled').length],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      summarySheet['!cols'] = [{ wch: 25 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      const dateStr = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `${filename}-${dateStr}.xlsx`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading || events.length === 0}
      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      title={events.length === 0 ? 'No events to export' : `Export ${events.length} events to Excel`}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      Export Excel ({events.length})
    </button>
  );
}
