import { MetadataRoute } from "next";
import { SITE_URL, API_BASE, fetchAllExamSlugs, fetchAllSeoPageSlugs } from "./lib/api";
import { EXAM_STATUSES, EXAM_CATEGORIES } from "./lib/enums";
import { enumToSlug } from "./lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [examSlugs, seoSlugs, examsResponse] = await Promise.all([
    fetchAllExamSlugs(),
    fetchAllSeoPageSlugs(),
    fetch(`${API_BASE}/exams?limit=200`, { cache: 'no-store' }).then(res => res.json()).catch(() => ({ data: [] }))
  ]);

  const exams = examsResponse.data || examsResponse.exams || [];
  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/articles`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/state`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/syllabus`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/admit-card-released-today`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/upcoming-gov-exam-this-week`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.8,
    }
  ];

  const examPages: MetadataRoute.Sitemap = examSlugs.map((slug) => ({
    url: `${SITE_URL}/exam/${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  const seoPages: MetadataRoute.Sitemap = seoSlugs.map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const statusPages: MetadataRoute.Sitemap = EXAM_STATUSES.map((s) => ({
    url: `${SITE_URL}/s/${enumToSlug(s)}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const categoryPages: MetadataRoute.Sitemap = EXAM_CATEGORIES.map((c) => ({
    url: `${SITE_URL}/c/${enumToSlug(c)}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
    "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Chandigarh",
    "Puducherry", "Ladakh"
  ];

  const statePages: MetadataRoute.Sitemap = STATES.map(state => ({
    url: `${SITE_URL}/state/${state.toLowerCase().replace(/ /g, "-")}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  const bodies = Array.from(new Set(exams.map((e: any) => e.conductingBody).filter(Boolean)));
  const conductPages: MetadataRoute.Sitemap = bodies.map((body: any) => ({
    url: `${SITE_URL}/conduct/${body.toLowerCase().replace(/ /g, "-")}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...examPages,
    ...seoPages,
    ...statusPages,
    ...categoryPages,
    ...statePages,
    ...conductPages
  ];
}
