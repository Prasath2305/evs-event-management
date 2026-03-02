import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

async function handleSignout(request: NextRequest) {
  const loginUrl = new URL('/login', request.url);
  const response = NextResponse.redirect(loginUrl, { status: 303 });

  // Clear super-admin session cookie if present
  if (request.cookies.get('sa_session')) {
    response.cookies.delete('sa_session');
    return response;
  }

  // Otherwise sign out from Supabase
  const supabase = await createClient();
  await supabase.auth.signOut();
  return response;
}

export async function GET(request: NextRequest) {
  return handleSignout(request);
}

export async function POST(request: NextRequest) {
  return handleSignout(request);
}
