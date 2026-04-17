import { cache } from 'react';
import { Exam, LifecycleEvent, SeoPage } from "./types";

export const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1").replace(/\/+$/, "");

export const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL || "https://examsuchana.in").replace(/\/+$/, "");

// ─── API Functions ────────────────────────────────────────────────────────────

export async function fetchTrendingContent(): Promise<{ exams: Exam[]; articles: SeoPage[] }> {
  try {
    const res = await fetch(`${API_BASE}/exams/trending`, {
      next: { revalidate: 600 },
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
      next: { revalidate: 300 },
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


export const fetchExamBySlug = cache(async (slug: string): Promise<Exam | null> => {
  try {
    const res = await fetch(`${API_BASE}/exams/slug/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
});

// ─── SEO Pages API ────────────────────────────────────────────────────────────

export const fetchSeoPageBySlug = cache(async (slug: string): Promise<SeoPage | null> => {
  try {
    const res = await fetch(`${API_BASE}/seo-pages/${encodeURIComponent(slug)}`, {
      next: { revalidate: 3600 }, // ISR: 1 hour
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
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
      next: { revalidate: 600 },
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
    const res = await fetch(`${API_BASE}/seo-pages`, {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) return [];
    
    const data = await res.json();
    const pages = data.data || data || [];
    
    return pages.map((p: any) => p.slug).filter(Boolean);
  } catch (err) {
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PHASE === 'phase-production-build') {
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
      const response = await fetch(`${API_BASE}/exams?page=${page}&limit=100&isPublished=true`, { 
        next: { revalidate: 3600 } 
      });
      if (!response.ok) break;
      const result = await response.json();
      const exams = result.data || result.exams || [];
      const slugs = exams.map((exam: any) => exam.slug);
      allSlugs = [...allSlugs, ...slugs];
      hasMore = exams.length === 100;
      page++;
    }
    return allSlugs;
  } catch (err) {
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PHASE === 'phase-production-build') {
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
      const response = await fetch(`${API_BASE}/exams?page=${page}&limit=100&isPublished=true`, { 
        next: { revalidate: 3600 } 
      });
      if (!response.ok) break;
      const result = await response.json();
      const exams = result.data || result.exams || [];
      const bodies = exams.map((e: any) => e.conductingBody).filter(Boolean);
      allBodies = [...allBodies, ...bodies];
      hasMore = exams.length === 100;
      page++;
    }
    return Array.from(new Set(allBodies));
  } catch (err) {
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PHASE === 'phase-production-build') {
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
