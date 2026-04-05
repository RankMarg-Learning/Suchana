import { Metadata } from 'next';
import { Suspense } from 'react';
import ArticlesClient from './ArticlesClient';
import { RefreshCw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Guides & Intelligence - Exam Suchana',
  description: 'Find detailed exam analysis, syllabus, preparation strategies, salary details and all guidance for government exams.',
  keywords: ['government exams', 'syllabus', 'salary', 'intelligence', 'preparation', 'guides'],
  openGraph: {
    title: 'Guides & Intelligence - Exam Suchana',
    description: 'Find detailed exam analysis, syllabus, and guidance for your dream career.',
    type: 'website',
  },
};

export default function ArticlesPage() {
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
      <ArticlesClient />
    </Suspense>
  );
}
