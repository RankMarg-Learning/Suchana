import { Metadata } from 'next';
import { fetchSeoPages, SITE_URL } from '@/app/lib/api';
import SyllabusClient from './SyllabusClient';

export const metadata: Metadata = {
  title: 'Latest Syllabus & Exam Patterns 2026 | Exam Suchana',
  description: 'Download the latest syllabus and exam patterns for government exams including SSC, UPSC, Banking, Defence, and Railways. Free PDF downloads and topic-wise breakdown.',
  alternates: {
    canonical: `${SITE_URL}/syllabus`,
  },
};

export default async function SyllabusPage() {
  const { pages, total } = await fetchSeoPages(1, 10, 'SYLLABUS');

  return <SyllabusClient initialPages={pages} initialTotal={total} />;
}
