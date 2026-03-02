'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { EventCard } from '@/components/events/EventCard';
import { EventFilters } from '@/components/events/EventFilters';
import { Button } from '@/components/ui/Button';
import { useEvents } from '@/hooks/useEvents';
import { EventFilters as FilterType } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function EventsPage() {
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<FilterType>({});
  
  const { events, loading, error, totalCount, fetchEvents } = useEvents();
  const supabase = createClient();

  useEffect(() => {
    async function loadDepartments() {
      const { data } = await supabase.from('departments').select('id, name');
      if (data) setDepartments(data);
    }
    loadDepartments();
  }, []);

  useEffect(() => {
    fetchEvents(filters, page);
  }, [filters, page]);

  const totalPages = Math.ceil(totalCount / 9);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">All Events</h1>
        <p className="text-slate-600">Discover environmental initiatives and activities</p>
      </div>

      <EventFilters departments={departments} onFilterChange={setFilters} />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 bg-emerald-100/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : events.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No events found matching your criteria.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                icon={ChevronLeft}
              >
                Previous
              </Button>
              
              <span className="px-4 py-2 text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}