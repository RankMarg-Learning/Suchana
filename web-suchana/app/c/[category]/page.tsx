import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ExamListingClient from '@/app/components/ExamListingClient';
import { CATEGORIES, slugToEnum, enumToSlug, cleanLabel, getCategoryInfo } from '@/app/lib/types';
import { EXAM_CATEGORIES } from '@/app/lib/enums';

import getQueryClient from '@/app/lib/getQueryClient';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { fetchExamsFromAPI } from '@/app/lib/api';

interface Props {
  params: Promise<{ category: string }>;
}

export const revalidate = 3600; // Revalidate every hour

export async function generateStaticParams() {
  return EXAM_CATEGORIES.map((cat) => ({
    category: enumToSlug(cat),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: catSlug } = await params;
  const catEnum = slugToEnum(catSlug);
  const { label } = getCategoryInfo(catEnum);

  if (!catEnum) return { title: 'Exams' };

  return {
    title: `${label} Exams 2025: All Recruitment Notifications & Exam Schedules`,
    description: `Browse all government exams and jobs under the ${label} category. Get latest updates on recruitment dates, timelines, and application links on Exam Suchana.`,
  };
}

export default async function CategoryListingPage({ params }: Props) {
  const { category: catSlug } = await params;
  const catEnum = slugToEnum(catSlug);
  const cat = CATEGORIES.find(c => c.value === catEnum);
  const label = cat?.label || cleanLabel(catEnum);

  const queryClient = getQueryClient();

  // Prefetch the first page of exams for this category on the server
  await queryClient.prefetchInfiniteQuery({
    queryKey: ['exams', { category: catEnum, status: undefined, conductingBody: undefined, state: undefined, startDate: undefined, endDate: undefined, search: '' }],
    queryFn: () => fetchExamsFromAPI(1, 10, catEnum),
    initialPageParam: 1,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ExamListingClient 
        title={`${label} Exams`} 
        category={catEnum} 
      />
    </HydrationBoundary>
  );
}
