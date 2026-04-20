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
          "/*?page=",   // Block deep pagination if needed
          "/*.segments",
          "/*_tree.segment",
        ],
      },
      {
        userAgent: ["GPTBot", "CCBot", "ClaudeBot", "PerplexityBot"], // Block AI bots
        disallow: ["/"],
      },
      {
        userAgent: "Googlebot",
        allow: ["/", "/favicon.ico"],
        disallow: [
          "/api/", 
          "/admin/", 
          "/saved",
          "/*.segments",
          "/*_tree.segment",
        ],
        crawlDelay: 1,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
