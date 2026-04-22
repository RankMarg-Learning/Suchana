import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

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

    if (paths && Array.isArray(paths)) {
      paths.forEach((p) => revalidatePath(p));
      return NextResponse.json({ revalidated: true, now: Date.now(), paths });
    }

    if (path) {
      // e.g. path: "/exam/upsc-iesiss-examination-2026"
      // or path: "/" for homepage
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, now: Date.now(), path });
    }

    return NextResponse.json(
      { message: "Missing required parameter 'path' or 'paths'" }, 
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

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, now: Date.now(), path });
    }

    return NextResponse.json(
      { message: "Missing required query parameter 'path'" }, 
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json({ message: "Error revalidating", error: err.message }, { status: 500 });
  }
}
