export function slugify(text: string): string {
    return text
        .toString()
        .normalize('NFD')                   // separate diacritics from letters
        .replace(/[\u0300-\u036f]/g, '')    // remove diacritics
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')               // replace spaces with -
        .replace(/[^\w-]+/g, '')            // remove all non-word chars
        .replace(/--+/g, '-')               // replace multiple - with single -
        .replace(/^-+|-+$/g, '');           // trim - from ends
}
export function uniqueSlug(text: string): string {
    const base = slugify(text);
    const suffix = Math.random().toString(36).slice(2, 7);
    return `${base}-${suffix}`;
}
