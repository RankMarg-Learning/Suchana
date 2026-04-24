import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

// CORS Headers Configuration
const getCorsHeaders = (origin: string | null) => {
  // Define allowed origins
  const allowedOrigins = [
    "https://admin.examsuchana.in",
    "http://localhost:3001", // Local admin dev
    "http://localhost:3000"  // Local frontend dev
  ];

  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-revalidate-secret",
  };

  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
  } else if (process.env.NODE_ENV === 'development') {
    headers["Access-Control-Allow-Origin"] = "*";
  } else {
    headers["Access-Control-Allow-Origin"] = "https://admin.examsuchana.in";
  }

  return headers;
};

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get("origin");
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  try {
    // Check for secret to prevent unauthorized revalidations
    const secret = req.headers.get("x-revalidate-secret") || req.nextUrl.searchParams.get("secret");
    const expectedSecret = process.env.REVALIDATION_SECRET || "suchana-admin-secret-key-2026";

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid secret" },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await req.json().catch(() => ({}));
    const path = body.path || req.nextUrl.searchParams.get("path");
    const tag = body.tag || req.nextUrl.searchParams.get("tag");
    const paths = body.paths; // Array of paths

    if (tag) {
      await revalidateTag(tag, 'max');
    }

    if (paths && Array.isArray(paths)) {
      for (const p of paths) {
        await revalidatePath(p, 'page');
      }
      return NextResponse.json(
        { revalidated: true, now: Date.now(), paths, tag },
        { headers: corsHeaders }
      );
    }

    if (path) {
      await revalidatePath(path, 'page');

      const slug = path.startsWith('/') ? path.slice(1) : path;
      if (slug && !slug.includes('/')) {
        await revalidateTag(`seo-page-${slug}`, 'max');
      } else if (path.startsWith('/exam/')) {
        const examSlug = path.replace('/exam/', '');
        await revalidateTag(`exam-${examSlug}`, 'max');
      }

      return NextResponse.json(
        { revalidated: true, now: Date.now(), path, tag },
        { headers: corsHeaders }
      );
    }

    if (tag) {
      return NextResponse.json(
        { revalidated: true, now: Date.now(), tag },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { message: "Missing required parameter 'path', 'paths', or 'tag'" },
      { status: 400, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("Revalidation Error:", err);
    return NextResponse.json(
      { message: "Error revalidating", error: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function GET(req: NextRequest) {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  try {
    const secret = req.nextUrl.searchParams.get("secret") || req.headers.get("x-revalidate-secret");
    const expectedSecret = process.env.REVALIDATION_SECRET || "suchana-admin-secret-key-2026";

    if (secret !== expectedSecret) {
      return NextResponse.json(
        { message: "Unauthorized: Invalid secret" },
        { status: 401, headers: corsHeaders }
      );
    }

    const path = req.nextUrl.searchParams.get("path");
    const tag = req.nextUrl.searchParams.get("tag");

    if (tag) {
      await revalidateTag(tag, 'max');
    }

    if (path) {
      await revalidatePath(path, 'page');

      const slug = path.startsWith('/') ? path.slice(1) : path;
      if (slug && !slug.includes('/')) {
        await revalidateTag(`seo-page-${slug}`, 'max');
      } else if (path.startsWith('/exam/')) {
        const examSlug = path.replace('/exam/', '');
        await revalidateTag(`exam-${examSlug}`, 'max');
      }

      return NextResponse.json(
        { revalidated: true, now: Date.now(), path, tag },
        { headers: corsHeaders }
      );
    }

    if (tag) {
      return NextResponse.json(
        { revalidated: true, now: Date.now(), tag },
        { headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { message: "Missing required query parameter 'path' or 'tag'" },
      { status: 400, headers: corsHeaders }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: "Error revalidating", error: err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

