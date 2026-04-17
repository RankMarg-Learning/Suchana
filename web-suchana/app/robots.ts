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
          "/*?search=", // Block search result pages from crawling
          "/*?page=",   // Block deep pagination if needed, but maybe keep for SEO
        ],
      },
      {
        userAgent: ["GPTBot", "CCBot", "ClaudeBot"], // Block AI bots to save edge requests/bandwidth
        disallow: ["/"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/favicon.ico"],
        disallow: ["/api/", "/admin/", "/saved"],
        crawlDelay: 1,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
