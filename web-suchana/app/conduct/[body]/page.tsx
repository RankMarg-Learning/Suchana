import { Metadata } from 'next';
import ExamListingClient from '@/app/components/ExamListingClient';
import { cleanLabel } from '@/app/lib/types';

import getQueryClient from '@/app/lib/getQueryClient';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { fetchExamsFromAPI, fetchAllConductingBodies } from '@/app/lib/api';

interface Props {
  params: Promise<{ body: string }>;
}

export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  const bodies = await fetchAllConductingBodies();
  return bodies.map((body) => ({
    body: body.toLowerCase().replace(/ /g, "-"),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { body: bodySlug } = await params;
  const label = bodySlug.toUpperCase().replace(/-/g, " ");

  return {
    title: `${label} Exam Notifications 2026: All Recruitment Schedules & Updates`,
    description: `Full list of all current and upcoming government recruitment notifications from ${label}. Track application deadlines, admit card releases, and results on Exam Suchana.`,
  };
}

export default async function ConductingBodyListingPage({ params }: Props) {
  const { body: bodySlug } = await params;
  // Use a more relaxed normalization for search on the backend
  const label = bodySlug.toUpperCase().replace(/-/g, " ");

  const queryClient = getQueryClient();

  // Prefetch the first page of exams for this conducting body on the server
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['exams', { category: undefined, status: undefined, conductingBody: label, state: undefined, startDate: undefined, endDate: undefined, search: '' }],
    queryFn: () => fetchExamsFromAPI(1, 10, undefined, undefined, undefined, label),
    initialPageParam: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ExamListingClient
        title={`${label} Exams`}
        conductingBody={label}
      />
    </HydrationBoundary>
  );
}
