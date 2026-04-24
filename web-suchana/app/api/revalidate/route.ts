import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  try {
    // Check for secret to prevent unauthorized revalidations
    const secret = req.headers.get("x-revalidate-secret") || req.nextUrl.searchParams.get("secret");
    
    // Default to a fallback secret if not set in environment (for dev), but log a warning
    const expectedSecret = process.env.REVALIDATION_SECRET || "suchana-admin-secret-key-2026";
    
    if (secret !== expectedSecret) {
      return NextResponse.json({ message: "Unauthorized: Invalid secret" }, { status: 401 });
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
      return NextResponse.json({ revalidated: true, now: Date.now(), paths, tag });
    }

    if (path) {
      await revalidatePath(path, 'page');
      
      // Auto-revalidate common tags based on path
      const slug = path.startsWith('/') ? path.slice(1) : path;
      if (slug && !slug.includes('/')) {
        await revalidateTag(`seo-page-${slug}`, 'max');
      } else if (path.startsWith('/exam/')) {
        const examSlug = path.replace('/exam/', '');
        await revalidateTag(`exam-${examSlug}`, 'max');
      }

      return NextResponse.json({ revalidated: true, now: Date.now(), path, tag });
    }

    if (tag) {
      return NextResponse.json({ revalidated: true, now: Date.now(), tag });
    }

    return NextResponse.json(
      { message: "Missing required parameter 'path', 'paths', or 'tag'" }, 
      { status: 400 }
    );
  } catch (err: any) {
    console.error("Revalidation Error:", err);
    return NextResponse.json({ message: "Error revalidating", error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const secret = req.nextUrl.searchParams.get("secret") || req.headers.get("x-revalidate-secret");
    const expectedSecret = process.env.REVALIDATION_SECRET || "suchana-admin-secret-key-2026";

    if (secret !== expectedSecret) {
      return NextResponse.json({ message: "Unauthorized: Invalid secret" }, { status: 401 });
    }

    const path = req.nextUrl.searchParams.get("path");
    const tag = req.nextUrl.searchParams.get("tag");

    if (tag) {
      await revalidateTag(tag, 'max');
    }

    if (path) {
      await revalidatePath(path, 'page');

      // Auto-revalidate common tags based on path
      const slug = path.startsWith('/') ? path.slice(1) : path;
      if (slug && !slug.includes('/')) {
        await revalidateTag(`seo-page-${slug}`, 'max');
      } else if (path.startsWith('/exam/')) {
        const examSlug = path.replace('/exam/', '');
        await revalidateTag(`exam-${examSlug}`, 'max');
      }

      return NextResponse.json({ revalidated: true, now: Date.now(), path, tag });
    }

    if (tag) {
      return NextResponse.json({ revalidated: true, now: Date.now(), tag });
    }

    return NextResponse.json(
      { message: "Missing required query parameter 'path' or 'tag'" }, 
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json({ message: "Error revalidating", error: err.message }, { status: 500 });
  }
}
