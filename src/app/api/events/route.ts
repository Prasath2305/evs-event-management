// // // src/app/api/events/route.ts
// // import { NextRequest, NextResponse } from 'next/server';
// // import { createClient } from '@/lib/supabase/server';
// // import { z } from 'zod';

// // const eventSchema = z.object({
// //   name: z.string().min(3),
// //   description: z.string().optional(),
// //   date: z.string().datetime(),
// //   venue: z.string().min(3),
// //   theme: z.string().optional(),
// //   resource_person: z.string().optional(),
// //   department_id: z.string().uuid(),
// //   event_type: z.enum(['workshop', 'seminar', 'conference', 'webinar', 'competition', 'field_visit', 'awareness_campaign', 'tree_plantation', 'cleanliness_drive', 'other']),
// //   expected_participants: z.number().min(0).default(0),
// // });

// // export async function GET(request: NextRequest) {
// //   const supabase = createClient();
// //   const { searchParams } = new URL(request.url);
  
// //   let query = supabase
// //     .from('events')
// //     .select('*, departments(name, code)', { count: 'exact' })
// //     .order('date', { ascending: false });

// //   // Apply filters
// //   if (searchParams.has('department')) {
// //     query = query.eq('department_id', searchParams.get('department'));
// //   }
  
// //   if (searchParams.has('type')) {
// //     query = query.eq('event_type', searchParams.get('type'));
// //   }

// //   const page = parseInt(searchParams.get('page') || '1');
// //   const limit = 9;
// //   const from = (page - 1) * limit;
// //   const to = from + limit - 1;

// //   const { data, error, count } = await query.range(from, to);

// //   if (error) {
// //     return NextResponse.json({ error: error.message }, { status: 500 });
// //   }

// //   return NextResponse.json({ data, count, page, totalPages: Math.ceil((count || 0) / limit) });
// // }

// // export async function POST(request: NextRequest) {
// //   const supabase = createClient();
  
// //   // Check auth
// //   const { data: { user } } = await supabase.auth.getUser();
// //   if (!user) {
// //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
// //   }

// //   try {
// //     const body = await request.json();
// //     const validated = eventSchema.parse(body);
    
// //     const { data, error } = await supabase
// //       .from('events')
// //       .insert({ ...validated, created_by: user.id })
// //       .select()
// //       .single();

// //     if (error) throw error;

// //     return NextResponse.json(data, { status: 201 });
// //   } catch (error) {
// //     if (error instanceof z.ZodError) {
// //       return NextResponse.json({ error: error.errors }, { status: 400 });
// //     }
// //     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
// //   }
// // }


// // src/app/api/events/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { createClient } from '@/lib/supabase/server';
// import { z } from 'zod';

// const eventSchema = z.object({
//   name: z.string().min(3),
//   description: z.string().optional(),
//   date: z.string().datetime(),
//   venue: z.string().min(3),
//   theme: z.string().optional(),
//   resource_person: z.string().optional(),
//   department_id: z.string().uuid(),
//   event_type: z.enum(['workshop', 'seminar', 'conference', 'webinar', 'competition', 'field_visit', 'awareness_campaign', 'tree_plantation', 'cleanliness_drive', 'other']),
//   expected_participants: z.number().min(0).default(0),
// });

// export async function GET(request: NextRequest) {
//   const supabase = await createClient();
//   const { searchParams } = new URL(request.url);
  
//   let query = supabase
//     .from('events')
//     .select('*, departments(name, code)', { count: 'exact' })
//     .order('date', { ascending: false });

//   // Apply filters with null checks
//   const department = searchParams.get('department');
//   if (department) {
//     query = query.eq('department_id', department);
//   }
  
//   const eventType = searchParams.get('type');
//   if (eventType) {
//     // Type assertion to match the enum
//     query = query.eq('event_type', eventType as any);
//   }

//   const page = parseInt(searchParams.get('page') || '1');
//   const limit = 9;
//   const from = (page - 1) * limit;
//   const to = from + limit - 1;

//   const { data, error, count } = await query.range(from, to);

//   if (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }

//   return NextResponse.json({ data, count, page, totalPages: Math.ceil((count || 0) / limit) });
// }

// export async function POST(request: NextRequest) {
//   const supabase = await createClient();
  
//   // Check auth
//   const { data: { user } } = await supabase.auth.getUser();
//   if (!user) {
//     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//   }

//   try {
//     const body = await request.json();
//     const validated = eventSchema.parse(body);
    
//     const { data, error } = await supabase
//       .from('events')
//       .insert({ ...validated, created_by: user.id })
//       .select()
//       .single();

//     if (error) throw error;

//     return NextResponse.json(data, { status: 201 });
//   } catch (error) {
//     if (error instanceof z.ZodError) {
//       // Fix: Use error.format() or error.issues instead of error.errors
//       return NextResponse.json({ 
//         error: 'Validation failed', 
//         details: error.issues.map(issue => ({
//           path: issue.path.join('.'),
//           message: issue.message
//         }))
//       }, { status: 400 });
//     }
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }


import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const eventSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  date: z.string().min(1), // Accept plain date string "YYYY-MM-DD"
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  venue: z.string().min(3),
  theme: z.string().optional(),
  resource_person: z.string().optional(),
  resource_person_bio: z.string().optional(),
  department_id: z.string().uuid(),
  event_type: z.enum([
    'workshop', 'seminar', 'conference', 'webinar', 'competition',
    'field_visit', 'awareness_campaign', 'tree_plantation', 'cleanliness_drive', 'other'
  ]),
  expected_participants: z.number().min(0).default(0),
  is_featured: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin role from profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const validated = eventSchema.parse(body);

    const { data, error } = await supabase
      .from('events')
      .insert({ ...validated, created_by: user.id })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Validation failed',
        details: error.issues.map(issue => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
      }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}