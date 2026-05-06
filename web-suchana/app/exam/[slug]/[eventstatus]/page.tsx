import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { fetchExamBySlug, SITE_URL, fetchExamsFromAPI } from "@/app/lib/api";
import { cleanLabel, stripHtml } from "@/app/lib/types";
import EventDetailClient from "./EventDetailClient";


interface Props {
  params: Promise<{ slug: string, eventstatus: string }>;
}

export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  const { exams } = await fetchExamsFromAPI(1, 100);
  const params: { slug: string; eventstatus: string }[] = [];

  exams.forEach((exam) => {
    exam.lifecycleEvents?.forEach((event) => {
      params.push({
        slug: exam.slug,
        eventstatus: event.stage.toLowerCase().replace(/_/g, '-'),
      });
    });
  });

  return params.slice(0, 50);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, eventstatus } = await params;
  const exam = await fetchExamBySlug(slug);

  if (!exam) {
    return { title: "Exam Not Found" };
  }

  if ('error' in exam) {
    return { title: "Updates Loading... | Exam Suchana" };
  }

  const requestedStage = eventstatus.toUpperCase().replace(/-/g, '_');
  const event = exam.lifecycleEvents?.find(e => e.stage === requestedStage);

  if (!event) {
    return { title: `${exam.shortTitle || exam.title} Updates | Exam Suchana` };
  }

  const title = event.title || event.actionLabel || cleanLabel(event.stage);
  const seoTitle = `${exam.shortTitle || exam.title} ${title} Released - Check Now`;
  const descRaw = event.description ? stripHtml(event.description).slice(0, 150) : "";
  const description = descRaw || `Check the latest ${title} updates for ${exam.title} by ${exam.conductingBody}.`;

  return {
    title: seoTitle,
    description,
    alternates: {
      canonical: `${SITE_URL}/exam/${slug}/${eventstatus.toLowerCase()}`,
    },
    openGraph: {
      title: seoTitle,
      description,
      type: "article",
    }
  };
}

export default async function ExamEventPage({ params }: Props) {
  const { slug, eventstatus } = await params;
  const exam = await fetchExamBySlug(slug);

  if (exam && 'error' in exam) {
    throw new Error("Failed to fetch event data from API");
  }

  if (!exam) {
    notFound();
  }

  const requestedStage = eventstatus.toUpperCase().replace(/-/g, '_');
  const event = exam.lifecycleEvents?.find(e => e.stage === requestedStage);

  if (!event) {
    redirect(`/exam/${slug}`);
  }

  const title = event.title || event.actionLabel || cleanLabel(event.stage);
  const seoTitle = `${exam.shortTitle || exam.title} ${title} Released - Check Now`;
  const descRaw = event.description ? stripHtml(event.description).slice(0, 150) : "";
  const description = descRaw || `Check the latest ${title} updates for ${exam.title} by ${exam.conductingBody}.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": seoTitle,
    "description": description,
    "url": `${SITE_URL}/exam/${slug}/${eventstatus.toLowerCase()}`,
    "publisher": {
      "@type": "Organization",
      "name": "Exam Suchana",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.png`
      }
    },
    "datePublished": exam.createdAt || new Date().toISOString(),
    "dateModified": exam.updatedAt || new Date().toISOString(),
    "author": exam.author ? {
      "@type": "Person",
      "name": exam.author.name,
      "url": `${SITE_URL}/author/${exam.author.slug}`
    } : {
      "@type": "Organization",
      "name": "Exam Suchana Editorial Team"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${SITE_URL}/exam/${slug}/${eventstatus.toLowerCase()}`
    }
  };

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <EventDetailClient exam={exam} event={event} />
    </div>
  );
}
