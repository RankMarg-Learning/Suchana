import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchExamBySlug, SITE_URL, fetchAllExamSlugs, fetchExamsFromAPI } from "@/app/lib/api";
import {
  STATUS_LABELS,
  STAGE_LABELS,
  cleanLabel,
  formatDate,
  getTotalVacancies,
  getStageState,
  countdownStr,
  stripHtml,
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

  const year = new Date().getFullYear();
  const title = exam.shortTitle ?? exam.title;
  const statusLabel = STATUS_LABELS[exam.status] ?? cleanLabel(exam.status);
  const vacancies = getTotalVacancies(exam.totalVacancies);
  const regEvent = exam.lifecycleEvents?.find((e) => e.stage === "REGISTRATION");
  const deadline = regEvent?.endsAt ? `Registration deadline ${formatDate(regEvent.endsAt)}.` : "";

  const seoTitle = `${title} Recruitment ${year}: Apply Online, Full Schedule, Vacancies & Eligibility`;
  const description =
    exam.description
      ? `${exam.description.slice(0, 140)}... Status: ${statusLabel}. Vacancies: ${vacancies}. ${deadline} Get real-time updates on Exam Suchana.`
      : `${title} official notification by ${exam.conductingBody}. Status: ${statusLabel}. ${vacancies !== "TBA" ? `${vacancies} vacancies.` : ""} ${deadline} Check syllabus, result & admit card.`;

  const canonicalUrl = `${SITE_URL}/exam/${slug}`;

  return {
    title: seoTitle,
    description,
    keywords: [
      title,
      exam.conductingBody,
      `${title} ${year}`,
      `${title} apply online`,
      `${title} admit card download`,
      `${title} result date`,
      `${title} syllabus pdf`,
      "government jobs",
      "sarkari results",
    ].filter(Boolean),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: `${title} Recruitment ${year} — Check Full Timeline & Details`,
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
      title: `${title} — ${statusLabel} Updates`,
      description: `${vacancies} vacancies. ${deadline} Full timeline on Exam Suchana.`,
    },
  };
}


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
      name: exam.conductingBody || "Government Agency",
      url: exam.officialWebsite || SITE_URL,
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
          description: stripHtml(exam.applicationFee)
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
    description: stripHtml(exam.description) || `${exam.title} examination.`,
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

function buildFaqJsonLd(exam: NonNullable<Awaited<ReturnType<typeof fetchExamBySlug>>>) {
  const faqs = [];

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
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs,
  };
}



export default async function ExamDetailPage({ params }: Props) {
  const { slug } = await params;
  const exam = await fetchExamBySlug(slug);

  if (!exam) notFound();

  const { exams: relatedExams } = await fetchExamsFromAPI(1, 5, exam.category).catch(() => ({ exams: [] }));
  const filteredRelated = (relatedExams || []).filter(e => e.id !== exam.id).slice(0, 4);

  const jobPostingJsonLd = buildJobPostingJsonLd(exam);
  const eventJsonLd = buildEventJsonLd(exam);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(exam);
  const faqJsonLd = buildFaqJsonLd(exam);

  return (
    <>
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
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      <ExamDetailClient exam={exam} relatedExams={filteredRelated} />
    </>
  );
}
