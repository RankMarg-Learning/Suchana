import { MetadataRoute } from "next";
import { SITE_URL, fetchAllExamSlugs, fetchAllSeoPageSlugs } from "./lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [examSlugs, seoSlugs] = await Promise.all([
    fetchAllExamSlugs(),
    fetchAllSeoPageSlugs()
  ]);

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
  ];

  const examPages: MetadataRoute.Sitemap = examSlugs.flatMap((slug) => [
    {
      url: `${SITE_URL}/exam/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/jobs/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/results/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/admit-card/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
  ]);

  const seoPages: MetadataRoute.Sitemap = seoSlugs.map((slug) => ({
    url: `${SITE_URL}/${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  const { EXAM_STATUSES, EXAM_CATEGORIES } = await import("./lib/enums");
  const { enumToSlug } = await import("./lib/types");

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

  return [...staticPages, ...examPages, ...seoPages, ...statusPages, ...categoryPages];
}
