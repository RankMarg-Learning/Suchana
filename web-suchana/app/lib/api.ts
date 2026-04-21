import { cache } from 'react';
import { Exam, LifecycleEvent, SeoPage } from "./types";

export const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1").replace(/\/+$/, "");

export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || "https://examsuchana.in").replace(/\/+$/, "");

// ─── Build-Time Rate-Limit Helpers ────────────────────────────────────────────

/** True only during `next build` static generation. */
const IS_BUILD = process.env.NEXT_PHASE === 'phase-production-build';

/** Inter-request pause to stay within the backend rate-limit during build. */
const BUILD_PAGE_DELAY_MS = Number(process.env.BUILD_API_DELAY_MS ?? 400);

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Wrapper around native fetch that retries on 429.
 * - Reads `Retry-After` header when present.
 * - Falls back to exponential back-off (1 s → 2 s → 4 s).
 * - Only retries up to `maxRetries` times.
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit & { next?: NextFetchRequestConfig },
  maxRetries = 3,
): Promise<Response> {
  let attempt = 0;
  while (true) {
    const res = await fetch(url, options as RequestInit);
    if (res.status !== 429 || attempt >= maxRetries) return res;

    const retryAfter = res.headers.get('Retry-After');
    const waitMs = retryAfter
      ? Number(retryAfter) * 1000
      : Math.pow(2, attempt) * 1000;  // 1 s, 2 s, 4 s …

    console.warn(`[API] 429 received. Retrying in ${waitMs}ms (attempt ${attempt + 1}/${maxRetries}) → ${url}`);
    await sleep(waitMs);
    attempt++;
  }
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchTrendingContent(): Promise<{ exams: Exam[]; articles: SeoPage[] }> {
  try {
    const res = await fetch(`${API_BASE}/exams/trending`, {
      next: { revalidate: 900 }, // 15 mins - Fast enough for "Live" feel
    });
    if (!res.ok) return { exams: [], articles: [] };
    const json = await res.json();
    return json.data ?? { exams: [], articles: [] };
  } catch (err) {
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn("[API] Could not fetch trending content (Backend likely down). Skipping for build...");
    } else {
      console.error("Error fetching trending content:", err);
    }
    return { exams: [], articles: [] };
  }
}

export async function fetchExamsFromAPI(
  page = 1,
  limit = 10,
  category?: string,
  status?: string,
  search?: string,
  conductingBody?: string,
  state?: string,
  startDate?: string,
  endDate?: string
): Promise<{ exams: Exam[]; total: number }> {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  params.set("isPublished", "true");
  if (category && category !== "ALL") params.set("category", category);
  if (status && status !== "ALL") params.set("status", status);
  if (search) params.set("search", search);
  if (conductingBody && conductingBody !== "ALL") params.set("conductingBody", conductingBody);
  if (state && state !== "ALL") params.set("state", state);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);

  try {
    const res = await fetch(`${API_BASE}/exams?${params}`, {
      next: { revalidate: 1200 }, // 20 mins - Balance for list updates
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      let errorMsg = errorText;
      try {
        const errorJson = JSON.parse(errorText);
        errorMsg = errorJson.error?.message || errorJson.message || errorText;
      } catch { /* not json */ }

      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PHASE === 'phase-production-build') {
        console.warn(`[API] Exams fetch failed (${res.status}). Skipping for build...`);
      } else {
        console.error(`API Error on ${res.url}:`, errorMsg);
      }
      return { exams: [], total: 0 };
    }

    const data = await res.json();
    return {
      exams: data.data ?? data.exams ?? [],
      total: data.meta?.total ?? data.total ?? 0,
    };
  } catch (err) {
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn("[API] Could not fetch exams (Backend likely down). Skipping for build...");
    } else {
      console.error("Error fetching exams:", err);
    }
    return { exams: [], total: 0 };
  }
}


export const fetchExamBySlug = cache(async (slug: string): Promise<Exam | null | { error: boolean }> => {
  try {
    const res = await fetch(`${API_BASE}/exams/slug/${encodeURIComponent(slug)}`, {
      next: { revalidate: 1800 }, // 30 mins
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      return { error: true };
    }
    const json = await res.json();
    return json.data ?? json;
  } catch (err) {
    console.error(`[API] Error fetching exam ${slug}:`, err);
    return { error: true };
  }
});

// ─── SEO Pages API ────────────────────────────────────────────────────────────

export const fetchSeoPageBySlug = cache(async (slug: string): Promise<SeoPage | null | { error: boolean }> => {
  try {
    const res = await fetch(`${API_BASE}/seo-pages/${encodeURIComponent(slug)}`, {
      next: { revalidate: 43200 }, // 12 hours
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      return { error: true };
    }
    const json = await res.json();
    return json.data ?? json;
  } catch (err) {
    console.error(`[API] Error fetching SEO page ${slug}:`, err);
    return { error: true };
  }
});

export async function fetchSeoPages(
  page = 1,
  limit = 10,
  category?: string,
  search?: string,
  isTrending?: boolean
): Promise<{ pages: SeoPage[]; total: number }> {
  try {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (category && category !== "ALL") params.set("category", category);
    if (search) params.set("search", search);
    if (isTrending !== undefined) params.set("isTrending", String(isTrending));

    const res = await fetch(`${API_BASE}/seo-pages/list?${params}`, {
      next: { revalidate: 3600 }, // 1 hour
    });

    if (!res.ok) return { pages: [], total: 0 };

    const data = await res.json();
    const result = data.data ?? data;

    return {
      pages: result.pages ?? [],
      total: result.total ?? 0,
    };
  } catch (err) {
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn("[API] Could not fetch SEO pages (Backend likely down). Skipping for build...");
    } else {
      console.error("Error fetching SEO pages:", err);
    }
    return { pages: [], total: 0 };
  }
}

export async function fetchAllSeoPageSlugs(): Promise<string[]> {
  try {
    const res = await fetchWithRetry(
      `${API_BASE}/seo-pages`,
      { next: { revalidate: 3600 } } as RequestInit & { next: NextFetchRequestConfig },
    );

    if (!res.ok) {
      console.warn(`[API] SEO slugs fetch failed (${res.status}). Skipping for build...`);
      return [];
    }

    const data = await res.json();
    const pages = data.data || data || [];

    return pages.map((p: any) => p.slug).filter(Boolean);
  } catch (err) {
    if (IS_BUILD || process.env.NODE_ENV === 'development') {
      console.warn("[API] Could not fetch SEO slugs (Backend likely down). Skipping for build...");
    } else {
      console.error("Error fetching SEO slugs:", err);
    }
    return [];
  }
}

export async function fetchAllExamSlugs(): Promise<string[]> {
  try {
    let allSlugs: string[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 50) { // Limit to 50 pages (5000 slugs)
      const response = await fetchWithRetry(
        `${API_BASE}/exams?page=${page}&limit=100&isPublished=true`,
        { next: { revalidate: 3600 } } as RequestInit & { next: NextFetchRequestConfig },
      );
      if (!response.ok) {
        console.warn(`[API] Exams fetch failed (${response.status}). Skipping for build...`);
        break;
      }
      const result = await response.json();
      const exams = result.data || result.exams || [];
      const slugs = exams.map((exam: any) => exam.slug);
      allSlugs = [...allSlugs, ...slugs];
      hasMore = exams.length === 100;
      page++;
      // Throttle between pages during build to avoid rate-limiting.
      if (hasMore && IS_BUILD) await sleep(BUILD_PAGE_DELAY_MS);
    }
    return allSlugs;
  } catch (err) {
    if (IS_BUILD || process.env.NODE_ENV === 'development') {
      console.warn("[API] Could not fetch Exam slugs (Backend likely down). Skipping for build...");
    } else {
      console.error("Error fetching Exam slugs:", err);
    }
    return [];
  }
}

export async function fetchAllConductingBodies(): Promise<string[]> {
  try {
    let allBodies: string[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore && page <= 10) {
      const response = await fetchWithRetry(
        `${API_BASE}/exams?page=${page}&limit=100&isPublished=true`,
        { next: { revalidate: 3600 } } as RequestInit & { next: NextFetchRequestConfig },
      );
      if (!response.ok) {
        console.warn(`[API] Conducting bodies fetch failed (${response.status}). Stopping pagination.`);
        break;
      }
      const result = await response.json();
      const exams = result.data || result.exams || [];
      const bodies = exams.map((e: any) => e.conductingBody).filter(Boolean);
      allBodies = [...allBodies, ...bodies];
      hasMore = exams.length === 100;
      page++;
      if (hasMore && IS_BUILD) await sleep(BUILD_PAGE_DELAY_MS);
    }
    return Array.from(new Set(allBodies));
  } catch (err) {
    if (IS_BUILD || process.env.NODE_ENV === 'development') {
      console.warn("[API] Could not fetch conducting bodies (Backend likely down). Skipping for build...");
    } else {
      console.error("Error fetching conducting bodies:", err);
    }
    return [];
  }
}

export async function fetchSavedExams(userId: string): Promise<Exam[]> {
  try {
    const res = await fetch(`${API_BASE}/exams/saved/${encodeURIComponent(userId)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function toggleSavedExam(userId: string, examId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(userId)}/saved-exams`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ examId }),
  });
  const data = await res.json();
  return data.data;
}

export async function getPersonalizedExams(
  id: string,
  page = 1,
  limit = 20
): Promise<{ exams: Exam[]; total: number }> {
  try {
    const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}/exams?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    return {
      exams: data.exams ?? data.data ?? [],
      total: data.total ?? data.meta?.total ?? 0
    };
  } catch {
    return { exams: [], total: 0 };
  }
}

export async function getUser(id: string): Promise<any> {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`);
  const data = await res.json();
  return data.data;
}

export async function updateUser(id: string, payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return data.data;
}

export async function registerUser(payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to register");
  }
  const data = await res.json();
  return data.data;
}

export async function checkUserByPhone(phone: string): Promise<any> {
  const res = await fetch(`${API_BASE}/users/phone/${encodeURIComponent(phone)}`);
  if (!res.ok) return { isRegistered: false, data: null };
  const data = await res.json();
  return data;
}
