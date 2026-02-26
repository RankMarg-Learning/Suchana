// ============================================================
// src/utils/slugify.ts  — URL slug generator
// ============================================================

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')   // strip non-word chars
        .replace(/[\s_-]+/g, '-')  // spaces/underscores → dash
        .replace(/^-+|-+$/g, '');  // trim leading/trailing dashes
}

/** Append a short random suffix to ensure uniqueness */
export function uniqueSlug(text: string): string {
    const base = slugify(text);
    const suffix = Math.random().toString(36).slice(2, 7);
    return `${base}-${suffix}`;
}
