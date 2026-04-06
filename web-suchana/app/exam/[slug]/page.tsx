import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { fetchExamBySlug, SITE_URL, fetchAllExamSlugs, fetchExamsFromAPI } from "@/app/lib/api";
import {
  STATUS_LABELS,
  cleanLabel,
  formatDate,
  getTotalVacancies,
  stripHtml,
} from "@/app/lib/types";
import { generateSeoTitle, generateSeoDescription } from "@/app/lib/seo";
import ExamDetailClient from "./ExamDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}


export async function generateStaticParams() {
  const slugs = await fetchAllExamSlugs();
  return slugs.map((slug) => ({ slug }));
}


export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const exam = await fetchExamBySlug(slug);

  if (!exam) {
    return {
      title: "Exam Not Found",
      description: "The requested exam could not be found on Exam Suchana.",
    };
  }

  const year = new Date().getFullYear();
  const title = exam.title;
  const seoTitle = generateSeoTitle(exam, exam.status);
  const seoDescription = generateSeoDescription(exam, exam.status);

  const canonicalUrl = `${SITE_URL}/exam/${slug}`;

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: [
      title,
      exam.shortTitle,
      exam.conductingBody,
      `${title} ${year}`,
      `${title} recruitment`,
      `${title} notification pdf`,
      `${title} apply online`,
      `${title} admit card download`,
      `${title} result link`,
      `${title} syllabus pdf`,
      "government jobs",
      "sarkari naukri",
      "sarkari results",
    ].filter((k): k is string => !!k),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: seoTitle,
      images: [
        {
          url: `${SITE_URL}/exam-banner.png`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      description: seoDescription,
      locale: "en_IN",
      siteName: "Exam Suchana",
      publishedTime: exam.createdAt || new Date().toISOString(),
      modifiedTime: exam.updatedAt || new Date().toISOString(),
      section: cleanLabel(exam.category),
      tags: [title, exam.conductingBody, cleanLabel(exam.category)].filter(Boolean),
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: [`${SITE_URL}/exam-banner.png`],
    },
  };
}


function buildJobPostingJsonLd(exam: NonNullable<Awaited<ReturnType<typeof fetchExamBySlug>>>) {
  const regEvent = exam.lifecycleEvents?.find((e) => e.stage === "REGISTRATION");
  const canonicalUrl = `${SITE_URL}/exam/${exam.slug}`;

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
      logo: `${SITE_URL}/examsuchana-logoT.png`,
    },
    identifier: {
      "@type": "PropertyValue",
      name: exam.conductingBody,
      value: exam.slug,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressCountry: "IN",
        addressRegion: exam.state ?? "India",
      },
    },
    employmentType: "FULL_TIME",
    validThrough: regEvent?.endsAt ?? undefined,
    datePosted: regEvent?.startsAt ?? new Date().toISOString(),
    url: canonicalUrl,
    ...(exam.applicationFee
      ? {
        applicationContact: {
          "@type": "ContactPoint",
          url: exam.notificationUrl ?? exam.officialWebsite,
          name: "Application Details",
          description: stripHtml(exam.applicationFee)
        },
      }
      : {}),
  };
}

function buildEventJsonLd(exam: NonNullable<Awaited<ReturnType<typeof fetchExamBySlug>>>) {
  const examEvent = exam.lifecycleEvents?.find((e) => e.stage === "EXAM_DATE" || e.stage === "EXAM");
  if (!examEvent?.startsAt) return null;

  const canonicalUrl = `${SITE_URL}/exam/${exam.slug}`;

  return {
    "@type": "Event",
    "@id": `${canonicalUrl}#event`,
    name: exam.shortTitle ?? exam.title,
    description: stripHtml(exam.description) || `${exam.title} examination.`,
    startDate: examEvent.startsAt,
    endDate: examEvent.endsAt ?? examEvent.startsAt,
    organizer: {
      "@type": "Organization",
      "@id": `${SITE_URL}#organization`,
      name: exam.conductingBody,
      url: exam.officialWebsite,
      logo: `${SITE_URL}/examsuchana-logoT.png`,
    },
    location: {
      "@type": "Place",
      name: exam.state ?? "India",
      address: {
        "@type": "PostalAddress",
        addressCountry: "IN",
      },
    },
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: canonicalUrl,
  };
}

function buildBreadcrumbJsonLd(exam: NonNullable<Awaited<ReturnType<typeof fetchExamBySlug>>>) {
  const canonicalUrl = `${SITE_URL}/exam/${exam.slug}`;
  return {
    "@type": "BreadcrumbList",
    "@id": `${canonicalUrl}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: cleanLabel(exam.category), item: `${SITE_URL}/?category=${exam.category}` },
      { "@type": "ListItem", position: 3, name: exam.shortTitle ?? exam.title, item: canonicalUrl },
    ],
  };
}

function buildFaqJsonLd(exam: NonNullable<Awaited<ReturnType<typeof fetchExamBySlug>>>) {
  const faqs = [];
  const canonicalUrl = `${SITE_URL}/exam/${exam.slug}`;

  if (exam.qualificationCriteria) {
    const text = stripHtml(exam.qualificationCriteria);
    if (text.length > 5) {
      faqs.push({
        "@type": "Question",
        name: `What is the qualification for ${exam.shortTitle || exam.title}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: text,
        },
      });
    }
  }

  if (exam.age) {
    const text = stripHtml(exam.age);
    if (text.length > 3) {
      faqs.push({
        "@type": "Question",
        name: `What is the age limit for ${exam.shortTitle || exam.title}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: text,
        },
      });
    }
  }

  if (exam.salary) {
    const text = stripHtml(exam.salary);
    if (text.length > 3) {
      faqs.push({
        "@type": "Question",
        name: `What is the salary for ${exam.shortTitle || exam.title}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The salary details for ${exam.title} are: ${text}`,
        },
      });
    }
  }

  if (exam.totalVacancies) {
    const text = stripHtml(exam.totalVacancies);
    if (text.length > 0 && text !== "TBA") {
      faqs.push({
        "@type": "Question",
        name: `How many vacancies are there in ${exam.shortTitle || exam.title}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `There are a total of ${text} vacancies announced for this recruitment.`,
        },
      });
    }
  }

  if (faqs.length === 0) return null;

  return {
    "@type": "FAQPage",
    "@id": `${canonicalUrl}#faq`,
    mainEntity: faqs,
  };
}



export default async function ExamDetailPage({ params }: Props) {
  const { slug } = await params;
  const exam = await fetchExamBySlug(slug);
  if (!exam) {
    notFound();
  }

  const { fetchExamsFromAPI } = await import('@/app/lib/api');
  const { exams: relatedExams } = await fetchExamsFromAPI(1, 5, exam.category).catch(() => ({ exams: [] }));
  const filteredRelated = (relatedExams || []).filter(e => e.id !== exam.id).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      buildJobPostingJsonLd(exam),
      buildEventJsonLd(exam),
      buildBreadcrumbJsonLd(exam),
      buildFaqJsonLd(exam),
    ].filter(Boolean)
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ExamDetailClient exam={exam} relatedExams={filteredRelated} />
    </div>
  );
}

