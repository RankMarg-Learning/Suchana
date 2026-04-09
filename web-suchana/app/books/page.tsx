import { Metadata } from 'next';
import { Suspense } from 'react';
import BooksClient from './BooksClient';

export const metadata: Metadata = {
  title: 'Books & Study Material - Exam Suchana',
  description: 'Find detailed books, study material, and resources for your government exams.',
  keywords: ['government exams', 'books', 'study material', 'resources'],
  openGraph: {
    title: 'Books & Study Material - Exam Suchana',
    description: 'Find detailed books and study material for your dream career.',
    type: 'website',
  },
};

export default function BooksPage() {
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
      <BooksClient />
    </Suspense>
  );
}
