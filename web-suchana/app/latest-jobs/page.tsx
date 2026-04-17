import { Metadata } from 'next';
import ExamListingClient from '@/app/components/ExamListingClient';
import { ExamStatus } from '@/app/lib/enums';

export const metadata: Metadata = {
  title: 'Latest Government Jobs 2026: All New Recruitment Notifications',
  description: 'Stay updated with the latest government job notifications and active registration links. Find UPSC, SSC, Banking, and State Jobs in one place.',
};

export default function LatestJobsPage() {
  const statuses = `${ExamStatus.NOTIFICATION},${ExamStatus.REGISTRATION_OPEN}`;

  return (
    <ExamListingClient
      title="Latest Jobs & Notifications"
      status={statuses}
    />
  );
}
