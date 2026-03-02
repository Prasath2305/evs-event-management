// src/app/api/super-admin/departments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

async function verifySuperAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const saSession = cookieStore.get('sa_session')?.value;
  const saPassword = process.env.SUPER_ADMIN_PASSWORD;
  return !!(saSession && saPassword && saSession === saPassword);
}

export async function GET() {
  if (!await verifySuperAdmin()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const { data: departments } = await createAdminClient()
    .from('departments')
    .select('id, name, code, created_at')
    .order('name');

  return NextResponse.json(departments || []);
}

export async function POST(request: NextRequest) {
  if (!await verifySuperAdmin()) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const body = await request.json();
  const { name, code } = body;

  if (!name?.trim() || !code?.trim()) {
    return NextResponse.json({ message: 'Name and code are required' }, { status: 400 });
  }

  const { data, error } = await createAdminClient()
    .from('departments')
    .insert({ name: name.trim(), code: code.trim().toUpperCase() })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ message: 'A department with that name or code already exists' }, { status: 409 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
