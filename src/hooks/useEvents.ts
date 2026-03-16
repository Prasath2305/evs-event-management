// src/hooks/useEvents.ts
'use client';

import { useState, useCallback, useMemo } from 'react';
import { endOfMonth, endOfWeek, format, startOfMonth, startOfWeek } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { Event, EventFilters } from '@/types';

export function useEvents(initialFilters?: EventFilters) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const supabase = useMemo(() => createClient(), []);

  const fetchEvents = useCallback(async (filters: EventFilters = {}, page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

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
        const safeSearch = filters.searchQuery.replace(/[%,()]/g, ' ').trim();
        if (safeSearch) {
          query = query.or(`name.ilike.%${safeSearch}%,theme.ilike.%${safeSearch}%,venue.ilike.%${safeSearch}%`);
        }
      }

      if (filters.dateRange) {
        const today = new Date();
        const todayIso = format(today, 'yyyy-MM-dd');

        if (filters.dateRange === 'this-week') {
          const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
          const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
          query = query.gte('date', weekStart).lte('date', weekEnd);
        }

        if (filters.dateRange === 'this-month') {
          const monthStart = format(startOfMonth(today), 'yyyy-MM-dd');
          const monthEnd = format(endOfMonth(today), 'yyyy-MM-dd');
          query = query.gte('date', monthStart).lte('date', monthEnd);
        }

        if (filters.dateRange === 'upcoming') {
          query = query.gte('date', todayIso);
        }

        if (filters.dateRange === 'past') {
          query = query.lt('date', todayIso);
        }
      }

      const from = (page - 1) * 9;
      const to = from + 9 - 1;
      
      const { data, count, error: supabaseError } = await query.range(from, to);

      if (supabaseError) throw supabaseError;

      setEvents((data || []) as Event[]);
      setTotalCount(count || 0);
    } catch (err) {
      setEvents([]);
      setTotalCount(0);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  return { events, loading, error, totalCount, fetchEvents };
}

