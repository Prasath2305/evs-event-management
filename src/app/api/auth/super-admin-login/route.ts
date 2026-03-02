import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const password = process.env.SUPER_ADMIN_PASSWORD;
  const loginUrl = new URL('/login', request.url);

  if (!password) {
    loginUrl.searchParams.set('error', 'Super admin credentials not configured.');
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const response = NextResponse.redirect(new URL('/super-admin', request.url), { status: 303 });
  response.cookies.set('sa_session', password, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 8, // 8 hours
    sameSite: 'lax',
  });
  return response;
}
