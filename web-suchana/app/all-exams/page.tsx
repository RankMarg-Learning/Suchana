import { Metadata } from 'next';
import ExamListingClient from '@/app/components/ExamListingClient';

export const metadata: Metadata = {
  title: 'All Government Exams 2026: Complete List of Recruitment Notifications',
  description: 'Browse the complete list of government exams in India. Filter by category, conducting body, and registration status for UPSC, SSC, Banking, Railways and more.',
};

export default function AllExamsPage() {
  return (
    <ExamListingClient
      title="All Government Exams"
      category="ALL"
      status="ALL"
    />
  );
}
