import { Metadata } from 'next';
import ExamListingClient from '@/app/components/ExamListingClient';
import { unslugify } from '@/app/lib/types';

interface Props {
  params: Promise<{ state: string }>;
}

export const revalidate = 1800; // 30 minutes

export async function generateStaticParams() {
  const states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
    "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal", "Chandigarh",
    "Puducherry", "Ladakh"
  ];

  return states.map((state) => ({
    state: state.toLowerCase().replace(/ /g, "-"),
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const label = unslugify(stateSlug);

  return {
    title: `Government Exams in ${label} 2025: Latest State Job Notifications`,
    description: `Real-time updates on all government recruitment exams in ${label}. Track State PSC, local board, and national level exams held within ${label} on Exam Suchana India.`,
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
