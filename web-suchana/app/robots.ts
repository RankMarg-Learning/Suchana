import { MetadataRoute } from "next";
import { SITE_URL } from "./lib/api";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/favicon.ico"],
        disallow: [
          "/api/",
          "/_next/",
          "/admin/",
          "/saved",
          "/onboarding",
          "/*?search=",
          "/*?page=",
          "/*.segments",
          "/*_tree.segment",
        ],
      }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
