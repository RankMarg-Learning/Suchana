import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to handle SEO and Routing security.
 * 1. Blocks internal Next.js segment files from being accessed.
 * 2. Implements security headers for performance and ranking stability.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. BLOCK INTERNAL NEXT.JS ROUTES
  // These routes can sometimes be exposed during builds or probes.
  // We explicitly return 404 to prevent indexing and resource waste.
  if (
    pathname.includes('.segments') ||
    pathname.includes('_tree.segment') ||
    pathname.endsWith('.map')
  ) {
    return new NextResponse(null, { status: 404 });
  }

  // 2. SEO & SECURITY HEADERS
  const response = NextResponse.next();

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Caching strategy for dynamic pages to reduce edge requests
  // For standard pages, we allow some stale-while-revalidate at the edge
  if (!pathname.startsWith('/api') && !pathname.startsWith('/admin')) {
    // This allows CDNs to cache for 60 seconds, and serve stale content for up to 1 hour
    // while revalidating in the background.
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=3600');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt, sitemap.xml
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json).*)',
  ],
};
