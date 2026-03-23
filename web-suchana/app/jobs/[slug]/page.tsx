import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchExamBySlug, SITE_URL, fetchAllExamSlugs, fetchExamsFromAPI } from "@/app/lib/api";
import { generateSeoTitle, generateSeoDescription } from "@/app/lib/seo";
import ExamDetailClient from "../../exam/[slug]/ExamDetailClient";

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
    return { title: "Job Not Found" };
  }

  const seoTitle = generateSeoTitle(exam, "JOB");
  const description = generateSeoDescription(exam, "JOB");
  const canonicalUrl = `${SITE_URL}/jobs/${slug}`;

  return {
    title: seoTitle,
    description,
    keywords: [
      exam.shortTitle || exam.title,
      `${exam.shortTitle || exam.title} recruitment 2026`,
      `${exam.shortTitle || exam.title} vacancy`,
      "government jobs",
      "sarkari naukri",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title: seoTitle,
      description,
      siteName: "Exam Suchana",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description,
    },
  };
}


export default async function JobPage({ params }: Props) {
  const { slug } = await params;
  const exam = await fetchExamBySlug(slug);

  if (!exam) notFound();

  const { exams: relatedExams } = await fetchExamsFromAPI(1, 5, exam.category).catch(() => ({ exams: [] }));
  const filteredRelated = (relatedExams || []).filter(e => e.id !== exam.id).slice(0, 4);

  return <ExamDetailClient exam={exam} relatedExams={filteredRelated} />;
}
