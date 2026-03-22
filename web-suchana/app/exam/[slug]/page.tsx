import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchExamBySlug, SITE_URL, fetchAllExamSlugs } from "@/app/lib/api";
import {
  STATUS_LABELS,
  STAGE_LABELS,
  cleanLabel,
  formatDate,
  getTotalVacancies,
  getStageState,
  countdownStr,
} from "@/app/lib/types";
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

  const title = exam.shortTitle ?? exam.title;
  const statusLabel = STATUS_LABELS[exam.status] ?? cleanLabel(exam.status);
  const vacancies = getTotalVacancies(exam.totalVacancies);
  const regEvent = exam.lifecycleEvents?.find((e) => e.stage === "REGISTRATION");
  const deadline = regEvent?.endsAt ? `Registration closes ${formatDate(regEvent.endsAt)}.` : "";

  const description =
    exam.description
      ? `${exam.description.slice(0, 140)} Status: ${statusLabel}. Vacancies: ${vacancies}. ${deadline} Track full timeline on Exam Suchana.`
      : `${title} by ${exam.conductingBody}. Status: ${statusLabel}. ${vacancies !== "TBA" ? `${vacancies} vacancies.` : ""} ${deadline} Get registration dates, admit card & result notifications.`;

  const canonicalUrl = `${SITE_URL}/exam/${slug}`;

  return {
    title: `${title} — ${statusLabel} | Dates, Vacancies & Timeline`,
    description,
    keywords: [
      title,
      exam.conductingBody,
      `${title} registration`,
      `${title} admit card`,
      `${title} result`,
      `${title} exam date`,
      `${title} notification`,
      cleanLabel(exam.category),
      cleanLabel(exam.examLevel),
      exam.state ?? "",
      "government exam 2025",
      "sarkari naukri",
      "exam timeline",
    ].filter(Boolean),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: `${title} — Registration, Dates & Result | Exam Suchana`,
      description,
      locale: "en_IN",
      siteName: "Exam Suchana",
      publishedTime: new Date().toISOString(),
      modifiedTime: new Date().toISOString(),
      section: cleanLabel(exam.category),
      tags: [title, exam.conductingBody, cleanLabel(exam.category)],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — ${statusLabel}`,
      description: `${vacancies} vacancies. ${deadline} Full timeline on Exam Suchana.`,
    },
  };
}

// ─── JSON-LD Builder ──────────────────────────────────────────────────────────

function buildJobPostingJsonLd(exam: NonNullable<Awaited<ReturnType<typeof fetchExamBySlug>>>) {
  const regEvent = exam.lifecycleEvents?.find((e) => e.stage === "REGISTRATION");
  const examEvent = exam.lifecycleEvents?.find(
    (e) => e.stage === "EXAM_DATE" || e.stage === "EXAM"
  );

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: exam.title,
    description: exam.description ?? `${exam.title} — Government recruitment by ${exam.conductingBody}.`,
    hiringOrganization: {
      "@type": "Organization",
      name: exam.conductingBody,
      url: exam.officialWebsite,
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
    url: `${SITE_URL}/exam/${exam.slug}`,
    ...(exam.totalVacancies
      ? { totalJobOpenings: parseInt(exam.totalVacancies) || undefined }
      : {}),
    ...(exam.applicationFee
      ? {
        applicationContact: {
          "@type": "ContactPoint",
          url: exam.notificationUrl ?? exam.officialWebsite,
          name: "Application Details",
          description: exam.applicationFee
        },
      }
      : {}),
  };
}

function buildEventJsonLd(exam: NonNullable<Awaited<ReturnType<typeof fetchExamBySlug>>>) {
  const examEvent = exam.lifecycleEvents?.find((e) => e.stage === "EXAM_DATE" || e.stage === "EXAM");
  if (!examEvent?.startsAt) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: exam.shortTitle ?? exam.title,
    description: exam.description ?? `${exam.title} examination.`,
    startDate: examEvent.startsAt,
    endDate: examEvent.endsAt ?? examEvent.startsAt,
    organizer: {
      "@type": "Organization",
      name: exam.conductingBody,
      url: exam.officialWebsite,
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
    url: `${SITE_URL}/exam/${exam.slug}`,
  };
}

function buildBreadcrumbJsonLd(exam: NonNullable<Awaited<ReturnType<typeof fetchExamBySlug>>>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: cleanLabel(exam.category), item: `${SITE_URL}/?category=${exam.category}` },
      { "@type": "ListItem", position: 3, name: exam.shortTitle ?? exam.title, item: `${SITE_URL}/exam/${exam.slug}` },
    ],
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ExamDetailPage({ params }: Props) {
  const { slug } = await params;
  const exam = await fetchExamBySlug(slug);

  if (!exam) notFound();

  const jobPostingJsonLd = buildJobPostingJsonLd(exam);
  const eventJsonLd = buildEventJsonLd(exam);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(exam);

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
      />
      {eventJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Client Component handles interactive UI */}
      <ExamDetailClient exam={exam} />
    </>
  );
}
