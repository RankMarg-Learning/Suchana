import { Metadata } from 'next';
import ExamListingClient from '@/app/components/ExamListingClient';
import { cleanLabel } from '@/app/lib/types';

interface Props {
  params: Promise<{ body: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { body: bodySlug } = await params;
  const label = bodySlug.toUpperCase().replace(/-/g, " ");

  return {
    title: `${label} Exam Notifications 2025: All Recruitment Schedules & Updates`,
    description: `Full list of all current and upcoming government recruitment notifications from ${label}. Track application deadlines, admit card releases, and results on Exam Suchana.`,
  };
}

export default async function ConductingBodyListingPage({ params }: Props) {
  const { body: bodySlug } = await params;
  // Use a more relaxed normalization for search on the backend
  const label = bodySlug.toUpperCase().replace(/-/g, " ");

  return (
    <ExamListingClient 
      title={`${label} Exams`} 
      conductingBody={label} 
    />
  );
}
