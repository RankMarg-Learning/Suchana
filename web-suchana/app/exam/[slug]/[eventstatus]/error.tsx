"use client"; 

import { useEffect } from 'react';
import RetryErrorState from '@/app/components/RetryErrorState';

export default function EventDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Router] Event Detail caught API error:', error);
  }, [error]);

  return (
    <RetryErrorState 
      title="Event Timeline Loading..."
      message="We're having trouble catching the latest timeline event updates. Retrying..."
    />
  );
}
