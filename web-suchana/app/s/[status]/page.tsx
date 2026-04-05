import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ExamListingClient from '@/app/components/ExamListingClient';
import { STATUS_LABELS, slugToEnum, enumToSlug } from '@/app/lib/types';
import { EXAM_STATUSES } from '@/app/lib/enums';

interface Props {
  params: Promise<{ status: string }>;
}

export async function generateStaticParams() {
  return EXAM_STATUSES.map((status) => ({
    status: enumToSlug(status),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { status: statusSlug } = await params;
  const statusEnum = slugToEnum(statusSlug);
  const label = STATUS_LABELS[statusEnum];

  if (!label) return { title: 'Exams' };

  return {
    title: `${label} Exams 2025: Latest Government Job Updates & Notifications`,
    description: `Explore all government recruitment notifications currently in ${label} stage. Get complete timelines, eligibility, and direct links for application.`,
  };
}

export default async function StatusListingPage({ params }: Props) {
  const { status: statusSlug } = await params;
  const statusEnum = slugToEnum(statusSlug);
  const label = STATUS_LABELS[statusEnum];

  if (!label) notFound();

  return (
    <ExamListingClient 
      title={`${label} Exams`} 
      status={statusEnum} 
    />
  );
}
