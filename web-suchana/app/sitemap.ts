import { MetadataRoute } from "next";
import { SITE_URL, fetchAllExamSlugs, fetchAllSeoPageSlugs } from "./lib/api";
import { EXAM_CATEGORIES } from "./lib/enums";
import { enumToSlug } from "./lib/types";

export const dynamic = "force-dynamic";


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [examSlugs, seoSlugs] = await Promise.all([
    fetchAllExamSlugs(),
    fetchAllSeoPageSlugs(),
  ]);

  const now = new Date().toISOString();

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "hourly", priority: 1.0 },
    { url: `${SITE_URL}/admit-card-released-today`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${SITE_URL}/upcoming-gov-exam-this-week`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${SITE_URL}/articles`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/article/news`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/state`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/topic/notification`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/topic/admit-card`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/topic/result`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/topic/syllabus`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/topic/answer-key`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/topic/books`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/topic/preparation-strategy`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/salary-calculator`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
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

  const statusPages: MetadataRoute.Sitemap = [
    "REGISTRATION_OPEN",
    "NOTIFICATION",
    "ADMIT_CARD_COMING_SOON",
    "ADMIT_CARD_OUT",
    "ANSWER_KEY_OUT",
    "RESULT_COMING_SOON",
    "RESULT_DECLARED",
  ].map((s) => ({
    url: `${SITE_URL}/s/${enumToSlug(s)}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  // const categoryPages: MetadataRoute.Sitemap = EXAM_CATEGORIES.map((c) => ({
  //   url: `${SITE_URL}/c/${enumToSlug(c)}`,
  //   lastModified: now,
  //   changeFrequency: "daily" as const,
  //   priority: 0.7,
  // }));



  return [
    ...staticPages,
    ...examPages,
    ...seoPages,
    ...statusPages,
    // ...categoryPages,
  ];
}
