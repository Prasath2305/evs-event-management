// src/app/api/super-admin/departments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

async function verifySuperAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const saSession = cookieStore.get('sa_session')?.value;
  const saPassword = process.env.SUPER_ADMIN_PASSWORD;
  return !!(saSession && saPassword && saSession === saPassword);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await verifySuperAdmin()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { id } = await params;

  const { error } = await createAdminClient()
    .from('departments')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
