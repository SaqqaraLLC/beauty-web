import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/forms',
  '/reviews/write',
  '/companies',
  '/agents/register',
];

// Routes that require specific roles
const ROLE_ROUTES: Record<string, string[]> = {
  '/dashboard/admin':      ['Admin'],
  '/dashboard/moderation': ['Admin'],
  '/dashboard/artist':     ['Artist', 'Admin'],
  '/dashboard/company':    ['Company', 'Admin'],
  '/dashboard/agent':      ['Agent', 'Admin'],
};

// Routes only for guests (logged-in users get redirected away)
const GUEST_ONLY = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read auth cookie — the Identity cookie name set by ASP.NET Core
  const authCookie =
    request.cookies.get('.AspNetCore.Identity.Application') ||
    request.cookies.get('auth') ||
    request.cookies.get('token');

  const isAuthenticated = !!authCookie;

  // Redirect authenticated users away from guest-only pages
  if (isAuthenticated && GUEST_ONLY.some(p => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/dashboard/artist', request.url));
  }

  // Redirect unauthenticated users away from protected routes
  if (!isAuthenticated && PROTECTED_PREFIXES.some(p => pathname.startsWith(p))) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|assets|public|api).*)',
  ],
};
