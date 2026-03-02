// // src/hooks/useAnalytics.ts
// 'use client';

// import { useState, useEffect } from 'react';
// import { createClient } from '@/lib/supabase/client';
// import { AnalyticsData } from '@/types';

// export function useAnalytics() {
//   const [data, setData] = useState<AnalyticsData | null>(null);
//   const [loading, setLoading] = useState(true);
  
//   const supabase = createClient();

//   useEffect(() => {
//     async function fetchAnalytics() {
//       try {
//         // Fetch total events
//         const { count: totalEvents } = await supabase
//           .from('events')
//           .select('*', { count: 'exact', head: true });

//         // Fetch total participants
//         const { data: participantData } = await supabase
//           .from('events')
//           .select('actual_participants')
//           .eq('status', 'completed');

//         const totalParticipants = participantData?.reduce((sum, e) => sum + (e.actual_participants || 0), 0) || 0;

//         // Fetch monthly trends
//         const { data: monthlyData } = await supabase
//           .from('monthly_event_stats')
//           .select('*')
//           .limit(12);

//         // Fetch department stats
//         const { data: deptData } = await supabase
//           .from('department_event_stats')
//           .select('*');

//         // Fetch event type distribution
//         const { data: typeData } = await supabase
//           .from('events')
//           .select('event_type')
//           .eq('status', 'completed');

//         const typeDistribution = typeData?.reduce((acc: any, curr) => {
//           acc[curr.event_type] = (acc[curr.event_type] || 0) + 1;
//           return acc;
//         }, {});

//         setData({
//           totalEvents: totalEvents || 0,
//           totalParticipants,
//           monthlyTrends: monthlyData?.map(m => ({
//             month: m.month,
//             count: m.total_events,
//             participants: m.total_participants,
//           })) || [],
//           departmentStats: deptData?.map(d => ({
//             name: d.department_name,
//             events: d.total_events,
//             participants: d.total_participants,
//           })) || [],
//           eventTypeDistribution: Object.entries(typeDistribution || {}).map(([type, count]) => ({
//             type,
//             count: count as number,
//           })),
//         });
//       } catch (error) {
//         console.error('Analytics error:', error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchAnalytics();
//   }, []);

//   return { data, loading };
// }



// src/hooks/useAnalytics.ts
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AnalyticsData } from '@/types';

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        // Fetch total events
        const { count: totalEvents } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true });

        // Fetch total participants
        const { data: participantData } = await supabase
          .from('events')
          .select('actual_participants')
          .eq('status', 'completed');

        const totalParticipants = participantData?.reduce((sum, e) => sum + (e.actual_participants || 0), 0) || 0;

        // Fetch monthly trends
        const { data: monthlyData } = await supabase
          .from('monthly_event_stats')
          .select('*')
          .limit(12);

        // Fetch department stats
        const { data: deptData } = await supabase
          .from('department_event_stats')
          .select('*');

        // Fetch event type distribution
        const { data: typeData } = await supabase
          .from('events')
          .select('event_type')
          .eq('status', 'completed');

        const typeDistribution = typeData?.reduce((acc: any, curr) => {
          acc[curr.event_type] = (acc[curr.event_type] || 0) + 1;
          return acc;
        }, {});

        // Transform the data with proper null handling
        const monthlyTrends = (monthlyData || []).map(m => ({
          month: m.month || '', // Convert null to empty string
          count: m.total_events || 0, // Convert null to 0
          participants: m.total_participants || 0, // Convert null to 0
        }));

        const departmentStats = (deptData || []).map(d => ({
          name: d.department_name || '', // Convert null to empty string
          events: d.total_events || 0, // Convert null to 0
          participants: d.total_participants || 0, // Convert null to 0
        }));

        const eventTypeDistribution = Object.entries(typeDistribution || {}).map(([type, count]) => ({
          type,
          count: count as number,
        }));

        setData({
          totalEvents: totalEvents || 0,
          totalParticipants,
          monthlyTrends,
          departmentStats,
          eventTypeDistribution,
        });
      } catch (error) {
        console.error('Analytics error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  return { data, loading };
}