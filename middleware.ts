import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

function isSuperAdmin(request: NextRequest): boolean {
  const saSession = request.cookies.get('sa_session')?.value;
  const saPassword = process.env.SUPER_ADMIN_PASSWORD;
  return !!(saSession && saPassword && saSession === saPassword);
}

async function getAdminProfileRole(userId: string): Promise<string | null> {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data } = await admin.from('profiles').select('role').eq('id', userId).single();
  return data?.role ?? null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Super-admin: simple cookie check, no Supabase needed
  if (pathname.startsWith('/super-admin')) {
    if (!isSuperAdmin(request)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // For /admin and /login: use Supabase session
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (pathname === '/login') {
    if (isSuperAdmin(request)) {
      return NextResponse.redirect(new URL('/super-admin', request.url));
    }
    if (user) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    const role = await getAdminProfileRole(user.id);
    if (!role || role === 'super_admin') {
      return NextResponse.redirect(new URL('/super-admin', request.url));
    }
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/login', '/admin/:path*', '/super-admin/:path*'],
};
