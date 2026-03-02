// src/app/api/admin/events/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await createAdminClient()
    .from('profiles')
    .select('role, department_id')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  // Regular admins can only delete events from their own department
  if (profile.role === 'admin') {
    const { data: event } = await createAdminClient()
      .from('events')
      .select('department_id')
      .eq('id', id)
      .single();

    if (event?.department_id !== profile.department_id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
  }

  const { error } = await createAdminClient()
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
