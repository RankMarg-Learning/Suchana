import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ExamListingClient from '@/app/components/ExamListingClient';
import { STATUS_LABELS, slugToEnum, enumToSlug } from '@/app/lib/types';
import { EXAM_STATUSES } from '@/app/lib/enums';

import getQueryClient from '@/app/lib/getQueryClient';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { fetchExamsFromAPI } from '@/app/lib/api';

interface Props {
  params: Promise<{ status: string }>;
}

export const revalidate = 3600; // Revalidate every hour
export const dynamicParams = false; // Instantly 404 for any unregistered slug

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
    title: `${label} Exams 2026: Latest Government Job Updates & Notifications`,
    description: `Explore all government recruitment notifications currently in ${label} stage. Get complete timelines, eligibility, and direct links for application.`,
  };
}

export default async function StatusListingPage({ params }: Props) {
  const { status: statusSlug } = await params;
  const statusEnum = slugToEnum(statusSlug);
  const label = STATUS_LABELS[statusEnum];

  if (!label) notFound();

  const queryClient = getQueryClient();

  // Prefetch the first page of exams for this status on the server
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['exams', { category: undefined, status: statusEnum, conductingBody: undefined, state: undefined, startDate: undefined, endDate: undefined, search: '' }],
    queryFn: () => fetchExamsFromAPI(1, 10, undefined, statusEnum),
    initialPageParam: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ExamListingClient
        title={`${label} Exams`}
        status={statusEnum}
      />
    </HydrationBoundary>
  );
}
