// src/hooks/useEvents.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Event, EventFilters } from '@/types';
import { filterEventsByDateRange } from '@/lib/utils/helpers';

export function useEvents(initialFilters?: EventFilters) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  
  const supabase = createClient();

  const fetchEvents = useCallback(async (filters: EventFilters = {}, page: number = 1) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('events')
        .select('*, departments(name, code)', { count: 'exact' })
        .order('date', { ascending: false });

      if (filters.department) {
        query = query.eq('department_id', filters.department);
      }
      
      if (filters.eventType) {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters.searchQuery) {
        query = query.or(`name.ilike.%${filters.searchQuery}%,theme.ilike.%${filters.searchQuery}%,venue.ilike.%${filters.searchQuery}%`);
      }

      const from = (page - 1) * 9;
      const to = from + 9 - 1;
      
      const { data, count, error: supabaseError } = await query.range(from, to);

      if (supabaseError) throw supabaseError;

      let filteredData = data || [];
      
      if (filters.dateRange) {
        filteredData = filterEventsByDateRange(filteredData, filters.dateRange);
      }

      setEvents(filteredData as Event[]);
      setTotalCount(count || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, []);

  return { events, loading, error, totalCount, fetchEvents };
}

