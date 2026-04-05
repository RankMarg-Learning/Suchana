import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { fetchExamBySlug, SITE_URL } from "@/app/lib/api";
import { cleanLabel, stripHtml } from "@/app/lib/types";
import EventDetailClient from "./EventDetailClient";


interface Props {
  params: Promise<{ slug: string, eventstatus: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, eventstatus } = await params;
  const exam = await fetchExamBySlug(slug);

  if (!exam) {
    return { title: "Exam Not Found" };
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

  if (!exam) {
    notFound();
  }

  const requestedStage = eventstatus.toUpperCase().replace(/-/g, '_');
  const event = exam.lifecycleEvents?.find(e => e.stage === requestedStage);

  if (!event) {
    redirect(`/exam/${slug}`);
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      <EventDetailClient exam={exam} event={event} />
    </div>
  );
}
