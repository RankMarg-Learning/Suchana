import { MetadataRoute } from "next";
import { SITE_URL, fetchAllExamSlugs } from "./lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch all exam slugs (falls back to mock data if API is down)
  const examSlugs = await fetchAllExamSlugs();

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

  const examPages: MetadataRoute.Sitemap = examSlugs.map((slug) => ({
    url: `${SITE_URL}/exam/${slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [...staticPages, ...examPages];
}
