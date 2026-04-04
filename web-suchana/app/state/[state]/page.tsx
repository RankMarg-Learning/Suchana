import { Metadata } from 'next';
import ExamListingClient from '@/app/components/ExamListingClient';
import { unslugify } from '@/app/lib/types';

interface Props {
  params: Promise<{ state: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const label = unslugify(stateSlug);

  return {
    title: `Government Exams in ${label} 2025: Latest State Job Notifications`,
    description: `Real-time updates on all government recruitment exams in ${label}. Track State PSC, local board, and national level exams held within ${label} on Exam Suchana.`,
  };
}

export default async function StateListingPage({ params }: Props) {
  const { state: stateSlug } = await params;
  const label = unslugify(stateSlug);

  return (
    <ExamListingClient 
      title={`Exams in ${label}`} 
      state={label} 
    />
  );
}
