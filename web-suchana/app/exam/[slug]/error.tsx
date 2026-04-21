"use client"; // Error components must be Client Components

import { useEffect } from 'react';
import RetryErrorState from '@/app/components/RetryErrorState';

export default function ExamDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('[App Router] Exam Detail caught API error:', error);
  }, [error]);

  return (
    <RetryErrorState 
      title="Exam Updates Loading..."
      message="We're having trouble connecting to our servers. Retrying latest updates automatically..." 
    />
  );
}
