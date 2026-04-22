import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchSeoPageBySlug, SITE_URL, fetchSeoPages } from '@/app/lib/api';
import { SeoPage, stripHtml } from "@/app/lib/types";
import SeoExamPageLayout from '../components/SeoExamPageLayout';
import ArticleDetailClient from '../components/ArticleDetailClient';
import ExamListingClient from '../components/ExamListingClient';

interface Props {
  params: Promise<{ slug: string }>;
}


export const revalidate = 3600; // Revalidate every hour
export const dynamicParams = true;

export async function generateStaticParams() {
  // Return empty array to prevent Next.js from hammering the backend with concurrent
  // requests during build time. All pages will be generated on-demand (ISR)
  // when first requested (dynamicParams = true).
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (slug === 'admit-card-released-today') {
    return {
      title: "Admit Cards Released Today | Exam Suchana",
      description: "Check the latest government exam admit cards officially released today. Download your hall tickets directly.",
      alternates: { canonical: `${SITE_URL}/${slug}` }
    };
  }

  if (slug === 'upcoming-gov-exam-this-week') {
    return {
      title: "Upcoming Government Exams This Week | Exam Suchana",
      description: "Browse the hottest upcoming government exam notifications and application deadlines this week.",
      alternates: { canonical: `${SITE_URL}/${slug}` }
    };
  }

  if (slug.startsWith('latest-exams-')) {
    const rawDate = slug.replace('latest-exams-', '');
    const formattedDate = rawDate.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return {
      title: `Latest Exams ${formattedDate} | Exam Suchana`,
      description: `View a total aggregated list of the latest government exams for ${formattedDate}.`,
      alternates: { canonical: `${SITE_URL}/${slug}` }
    };
  }

  const page = await fetchSeoPageBySlug(slug);

  if (page && 'error' in page) {
    return {
      title: "Loading Article... | Exam Suchana",
      description: "Fetching the latest content. Please wait.",
    };
  }

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
        ...(page.ogImage ? { images: [{ url: page.ogImage }] } : {}),
        type: 'article',
        publishedTime: page.createdAt,
        modifiedTime: page.updatedAt,
      },
      twitter: {
        card: 'summary_large_image',
        title: page.metaTitle || page.title,
        description,
        ...(page.ogImage ? { images: [page.ogImage] } : {}),
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

function buildFaqJsonLd(page: SeoPage) {
  if (!page.faqs || page.faqs.length === 0) return null;

  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/${page.slug}#faq`,
    "mainEntity": page.faqs.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  };
}

export default async function DynamicSlugPage({ params }: Props) {
  const { slug } = await params;

  // 1. Intercept Special Temporal Exam Listings
  if (slug === 'admit-card-released-today') {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return (
      <div style={{ paddingTop: 'clamp(60px, 8vh, 80px)' }}>
        <ExamListingClient title="Admit Cards Released Today" status="ADMIT_CARD_OUT" startDate={startOfToday.toISOString()} />
      </div>
    );
  }

  if (slug === 'upcoming-gov-exam-this-week') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return (
      <div style={{ paddingTop: 'clamp(60px, 8vh, 80px)' }}>
        <ExamListingClient title="Upcoming Gov Exams This Week" status="NOTIFICATION,REGISTRATION_OPEN" startDate={weekAgo.toISOString()} />
      </div>
    );
  }

  if (slug.startsWith('latest-exams-')) {
    const rawDate = slug.replace('latest-exams-', '');
    const formattedDate = rawDate.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

    try {
      const targetMonthDate = new Date(`1 ${formattedDate}`);
      if (!isNaN(targetMonthDate.getTime())) {
        const startDate = targetMonthDate.toISOString();
        targetMonthDate.setMonth(targetMonthDate.getMonth() + 1);
        const endDate = targetMonthDate.toISOString();

        return (
          <div style={{ paddingTop: 'clamp(60px, 8vh, 80px)' }}>
            <ExamListingClient title={`Latest Exams ${formattedDate}`} startDate={startDate} endDate={endDate} />
          </div>
        );
      }
    } catch (e) { }

    return (
      <div style={{ paddingTop: 'clamp(60px, 8vh, 80px)' }}>
        <ExamListingClient title={`Latest Exams ${formattedDate}`} />
      </div>
    );
  }

  const page = await fetchSeoPageBySlug(slug);

  if (page && 'error' in page) {
    throw new Error("Failed to fetch article data from API");
  }

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
        buildFaqJsonLd(page),
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

