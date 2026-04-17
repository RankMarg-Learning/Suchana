import { Metadata } from 'next';
import ExamListingClient from '@/app/components/ExamListingClient';
import { unslugify } from '@/app/lib/types';

import getQueryClient from '@/app/lib/getQueryClient';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { fetchExamsFromAPI } from '@/app/lib/api';

interface Props {
  params: Promise<{ state: string }>;
}

export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
    "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Chandigarh",
    "Puducherry", "Ladakh"
  ];

  return STATES.map(state => ({
    state: state.toLowerCase().replace(/ /g, "-")
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const label = unslugify(stateSlug);

  return {
    title: `Government Exams in ${label} 2026: Latest State Job Notifications`,
    description: `Real-time updates on all government recruitment exams in ${label}. Track State PSC, local board, and national level exams held within ${label} on Exam Suchana India.`,
  };
}

export default async function StateListingPage({ params }: Props) {
  const { state: stateSlug } = await params;
  const label = unslugify(stateSlug);

  const queryClient = getQueryClient();

  // Prefetch the first page of exams for this state on the server using infinite query pattern
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['exams', { category: undefined, status: undefined, conductingBody: undefined, state: label, startDate: undefined, endDate: undefined, search: '' }],
    queryFn: () => fetchExamsFromAPI(1, 10, undefined, undefined, undefined, undefined, label),
    initialPageParam: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ExamListingClient
        title={`Exams in ${label}`}
        state={label}
      />
    </HydrationBoundary>
  );
}

