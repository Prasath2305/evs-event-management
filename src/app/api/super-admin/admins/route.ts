// src/app/api/super-admin/admins/route.ts
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

  const supabase = createAdminClient();
  const { data: admins } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, department_id, created_at, departments(name, code)')
    .in('role', ['admin', 'super_admin'])
    .order('created_at');

  return NextResponse.json(admins || []);
}

export async function POST(request: NextRequest) {
  const currentUser = await verifySuperAdmin();
  if (!currentUser) return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  try {
    const { full_name, email, password, role, department_id } = await request.json();

    if (!email || !password || !role) {
      return NextResponse.json({ message: 'email, password, and role are required' }, { status: 400 });
    }

    if (!['admin', 'super_admin'].includes(role)) {
      return NextResponse.json({ message: 'Invalid role' }, { status: 400 });
    }

    if (role === 'admin' && !department_id) {
      return NextResponse.json({ message: 'department_id is required for admin role' }, { status: 400 });
    }

    const adminClient = createAdminClient();

    // Create auth user via admin API
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm email
      user_metadata: { full_name, role },
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { message: authError?.message || 'Failed to create user' },
        { status: 500 }
      );
    }

    // Upsert profile with role and department
    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert({
        id: authData.user.id,
        email,
        full_name: full_name || null,
        role,
        department_id: role === 'admin' ? department_id : null,
        created_at: new Date().toISOString(),
      });

    if (profileError) {
      // Rollback: delete the auth user
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { message: 'Failed to create profile: ' + profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: authData.user.id, email, role }, { status: 201 });
  } catch (err) {
    console.error('Create admin error:', err);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
