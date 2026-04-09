import { Metadata } from 'next';
import { Suspense } from 'react';
import CurrentAffairsClient from './CurrentAffairsClient';

export const metadata: Metadata = {
  title: 'Current Affairs - Exam Suchana',
  description: 'Stay updated with the latest current affairs for your government exams preparation.',
  keywords: ['government exams', 'current affairs', 'daily news', 'preparation'],
  openGraph: {
    title: 'Current Affairs - Exam Suchana',
    description: 'Find detailed current affairs and news for your dream career.',
    type: 'website',
  },
};

export default function CurrentAffairsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen">
        <div className="app-shell" style={{ opacity: 0.1 }}>
          <aside className="sidebar-left"><div className="sidebar-widget"><div className="skeleton" style={{ height: '300px', borderRadius: '16px' }} /></div></aside>
          <section className="feed-main">
            <div className="feed-header"><div className="skeleton" style={{ height: '120px', borderRadius: '16px' }} /></div>
            <div className="article-skeleton-list" style={{ marginTop: '32px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="article-skeleton-item">
                  <div className="skeleton" style={{ height: '24px', width: '60%', borderRadius: '4px', marginBottom: '12px' }} />
                  <div className="skeleton" style={{ height: '14px', width: '40%', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          </section>
          <aside className="sidebar-right"><div className="sidebar-widget"><div className="skeleton" style={{ height: '400px', borderRadius: '16px' }} /></div></aside>
        </div>
      </main>
    }>
      <CurrentAffairsClient />
    </Suspense>
  );
}
