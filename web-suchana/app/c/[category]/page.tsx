import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ExamListingClient from '@/app/components/ExamListingClient';
import { CATEGORIES, slugToEnum, enumToSlug, cleanLabel } from '@/app/lib/types';
import { EXAM_CATEGORIES } from '@/app/lib/enums';

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return EXAM_CATEGORIES.map((cat) => ({
    category: enumToSlug(cat),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category: catSlug } = await params;
  const catEnum = slugToEnum(catSlug);
  const cat = CATEGORIES.find(c => c.value === catEnum);
  const label = cat?.label || cleanLabel(catEnum);

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

  return (
    <ExamListingClient 
      title={`${label} Exams`} 
      category={catEnum} 
    />
  );
}
