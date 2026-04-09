import { Exam, LifecycleEvent, SeoPage } from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://examsuchana.in";

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
    console.error("Error fetching trending content:", err);
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

    console.error(`API Error on ${res.url}:`, errorMsg);
    throw new Error(`API error (${res.status}): ${errorMsg}`);
  }

  const data = await res.json();
  return {
    exams: data.data ?? data.exams ?? [],
    total: data.meta?.total ?? data.total ?? 0,
  };
}

export async function fetchExamBySlug(slug: string): Promise<Exam | null> {
  try {
    const res = await fetch(`${API_BASE}/exams/slug/${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

// ─── SEO Pages API ────────────────────────────────────────────────────────────

export async function fetchSeoPageBySlug(slug: string): Promise<SeoPage | null> {
  try {
    const res = await fetch(`${API_BASE}/seo-pages/${slug}`, {
      next: { revalidate: 3600 }, // ISR: 1 hour
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch {
    return null;
  }
}

export async function fetchSeoPages(
  page = 1,
  limit = 10,
  category?: string,
  search?: string
): Promise<{ pages: SeoPage[]; total: number }> {
  try {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (category && category !== "ALL") params.set("category", category);
    if (search) params.set("search", search);

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
    console.error("Error fetching SEO pages:", err);
    return { pages: [], total: 0 };
  }
}

export async function fetchAllSeoPageSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/seo-pages?limit=1000`, {
      cache: 'no-store'
    });
    if (!res.ok) {
      console.error(`Failed to fetch SEO slugs: ${res.status}`);
      return [];
    }
    const data = await res.json();
    const items = data.data ?? data.seoPages ?? [];
    return items.map((p: any) => p.slug).filter(Boolean);
  } catch (err) {
    console.error("Error fetching SEO slugs:", err);
    return [];
  }
}


export async function fetchAllExamSlugs(): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/exams?limit=100`, {
      cache: 'no-store'
    });
    if (!res.ok) {
      console.error(`Failed to fetch exam slugs: ${res.status}`);
      return [];
    }
    const data = await res.json();
    const items = data.data ?? data.exams ?? [];
    return items.map((e: any) => e.slug).filter(Boolean);
  } catch (err) {
    console.error("Error fetching exam slugs:", err);
    return [];
  }
}

export async function fetchSavedExams(userId: string): Promise<Exam[]> {
  try {
    const res = await fetch(`${API_BASE}/exams/saved/${userId}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function toggleSavedExam(userId: string, examId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/users/${userId}/saved-exams`, {
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
    const res = await fetch(`${API_BASE}/users/${id}/exams?page=${page}&limit=${limit}`);
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
  const res = await fetch(`${API_BASE}/users/${id}`);
  const data = await res.json();
  return data.data;
}

export async function updateUser(id: string, payload: any): Promise<any> {
  const res = await fetch(`${API_BASE}/users/${id}`, {
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
  const res = await fetch(`${API_BASE}/users/phone/${phone}`);
  if (!res.ok) return { isRegistered: false, data: null };
  const data = await res.json();
  return data;
}
