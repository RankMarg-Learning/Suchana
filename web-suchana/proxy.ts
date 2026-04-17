import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * 
   * We also specifically exclude any internal/bot requests ending in:
   * - .segment
   * - .segments
   * 
   * This prevents these Next.js internal flight data / prefetch requests
   * from invoking the Vercel Edge Function, which fixes the execution leaks
   * in your Vercel Edge Request billing tab.
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.segment|.*\\.segments).*)',
  ],
};
