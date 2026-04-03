import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchSeoPageBySlug, fetchAllSeoPageSlugs, fetchExamBySlug, SITE_URL, fetchSeoPages } from '@/app/lib/api';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { LeaderboardAd, InFeedAd, SidebarAd } from '../components/AdUnits';
import { STATUS_LABELS, cleanLabel, formatDate, getTotalVacancies, SeoPage, stripHtml } from "@/app/lib/types";
import SeoExamPageLayout from '../components/SeoExamPageLayout';
import LatestArticlesSection from '../components/LatestArticlesSection';
import ArticleDetailClient from '../components/ArticleDetailClient';

interface Props {
  params: Promise<{ slug: string }>;
}


export async function generateStaticParams() {
  const slugs = await fetchAllSeoPageSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await fetchSeoPageBySlug(slug);

  if (page) {
    const canonical = page.canonicalUrl || `${SITE_URL}/${slug}`;
    const description = page.metaDescription || (page.content ? stripHtml(page.content).slice(0, 160) : '');

    return {
      title: page.metaTitle || `${page.title} | Exam Suchana`,
      description,
      keywords: page.keywords,
      alternates: { canonical },
      openGraph: {
        title: page.metaTitle || page.title,
        description,
        url: canonical,
        siteName: 'Exam Suchana',
        images: page.ogImage ? [{ url: page.ogImage }] : undefined,
        type: 'article',
        publishedTime: page.createdAt,
        modifiedTime: page.updatedAt,
      },
      twitter: {
        card: 'summary_large_image',
        title: page.metaTitle || page.title,
        description,
        images: page.ogImage ? [page.ogImage] : undefined,
      },
    };
  }

  return {
    title: 'Page Not Found | Exam Suchana',
  };
}


function buildBreadcrumbJsonLd(slug: string, title: string, parent?: { label: string; href: string }) {
  const items = [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
  ];
  if (parent) {
    items.push({ "@type": "ListItem", position: 2, name: parent.label, item: `${SITE_URL}${parent.href}` });
    items.push({ "@type": "ListItem", position: 3, name: title, item: `${SITE_URL}/${slug}` });
  } else {
    items.push({ "@type": "ListItem", position: 2, name: title, item: `${SITE_URL}/${slug}` });
  }

  return {
    "@type": "BreadcrumbList",
    "itemListElement": items
  };
}

function buildJobPostingJsonLd(exam: any) {
  const regEvent = exam.lifecycleEvents?.find((e: any) => e.stage === "REGISTRATION");
  const canonicalUrl = `${SITE_URL}/${exam.slug}`;
  return {
    "@type": "JobPosting",
    "@id": `${canonicalUrl}#job`,
    title: exam.title,
    description: stripHtml(exam.description) || `${exam.title} — Government recruitment by ${exam.conductingBody}.`,
    hiringOrganization: {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: exam.conductingBody || "Government Agency",
      url: exam.officialWebsite || SITE_URL,
    },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressCountry: "IN", addressRegion: exam.state ?? "India" },
    },
    employmentType: "FULL_TIME",
    validThrough: regEvent?.endsAt ?? undefined,
    datePosted: regEvent?.startsAt ?? new Date().toISOString(),
    url: canonicalUrl,
  };
}

function buildEventJsonLd(exam: any) {
  const examEvent = exam.lifecycleEvents?.find((e: any) => e.stage === "EXAM_DATE" || e.stage === "EXAM");
  if (!examEvent?.startsAt) return null;

  return {
    "@type": "Event",
    "name": exam.title,
    "startDate": examEvent.startsAt,
    "location": {
      "@type": "Place",
      "name": exam.state || "India",
      "address": { "@type": "PostalAddress", "addressCountry": "IN" }
    }
  };
}

export default async function DynamicSlugPage({ params }: Props) {
  const { slug } = await params;

  const page = await fetchSeoPageBySlug(slug);

  if (page) {
    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Article",
          "headline": page.title,
          "description": page.metaDescription,
          "image": page.ogImage,
          "datePublished": page.createdAt,
          "dateModified": page.updatedAt,
          "author": { "@type": "Organization", "name": "Exam Suchana" }
        },
        buildBreadcrumbJsonLd(
          page.slug,
          page.title,
          page.exam ? { label: page.exam.shortTitle || page.exam.title, href: `/exam/${page.exam.slug}` } : undefined
        ),
        page.exam ? buildJobPostingJsonLd(page.exam) : null,
        page.exam ? buildEventJsonLd(page.exam) : null,
      ].filter(Boolean)
    };

    if (page.exam) {
      return (
        <>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <SeoExamPageLayout
            exam={page.exam}
            seoPage={{
              ...page,
              title: page.title || page.exam.title
            } as SeoPage}
          />
        </>
      );
    }

    return (
      <ArticleDetailClient page={page} articleJsonLd={jsonLd} />
    );
  }

  notFound();
}

