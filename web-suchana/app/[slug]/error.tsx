"use client"; 

import { useEffect } from 'react';
import RetryErrorState from '@/app/components/RetryErrorState';

export default function SeoPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App Router] Dynamic Slug caught API error:', error);
  }, [error]);

  return (
    <RetryErrorState 
      title="Article Loading..."
      message="Setting up the article content... Retrying latest updates automatically."
    />
  );
}
