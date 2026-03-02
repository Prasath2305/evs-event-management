// src/app/api/admin/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

const createEventSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  date: z.string(),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  venue: z.string().min(3),
  theme: z.string().optional().nullable(),
  resource_person: z.string().min(2),
  resource_person_bio: z.string().optional().nullable(),
  department_id: z.string().uuid(),
  event_type: z.enum([
    'workshop', 'seminar', 'conference', 'webinar', 'competition',
    'field_visit', 'awareness_campaign', 'tree_plantation', 'cleanliness_drive', 'other'
  ]),
  expected_participants: z.number().min(1),
  is_featured: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify admin authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Fetch profile with role and department (admin client bypasses RLS)
    const { data: profile } = await createAdminClient()
      .from('profiles')
      .select('role, department_id')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
      return NextResponse.json({ message: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createEventSchema.parse(body);

    // For regular admins, enforce their own department
    if (profile.role === 'admin' && profile.department_id) {
      validatedData.department_id = profile.department_id;
    }

    const eventDate = new Date(validatedData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let status: 'upcoming' | 'ongoing' | 'completed' = 'upcoming';
    if (eventDate < today) {
      status = 'completed';
    } else if (eventDate.getTime() === today.getTime()) {
      status = 'ongoing';
    }

    const { data: event, error: insertError } = await createAdminClient()
      .from('events')
      .insert({
        ...validatedData,
        status,
        created_by: user.id,
        actual_participants: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { message: 'Failed to create event', error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(event, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation error', errors: error.issues }, { status: 400 });
    }
    console.error('Create event error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await createAdminClient()
      .from('profiles')
      .select('role, department_id')
      .eq('id', user.id)
      .single();

    if (!profile) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const department = searchParams.get('department');

    let query = supabase
      .from('events')
      .select('*, departments(name, code)')
      .order('created_at', { ascending: false });

    // Regular admins only see their own department's events
    if (profile.role === 'admin' && profile.department_id) {
      query = query.eq('department_id', profile.department_id);
    } else if (department) {
      query = query.eq('department_id', department);
    }

    if (status) query = query.eq('status', status as 'upcoming' | 'ongoing' | 'completed' | 'cancelled');

    const { data: events, error } = await query;
    if (error) throw error;

    return NextResponse.json(events || []);
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}