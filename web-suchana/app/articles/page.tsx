import { Metadata } from 'next';
import { Suspense } from 'react';
import ArticlesClient from './ArticlesClient';

export const metadata: Metadata = {
  title: 'Latest Articles - Exam Suchana',
  description: 'Find detailed exam analysis, syllabus, preparation strategies, salary details and all guidance for government exams.',
  keywords: ['government exams', 'syllabus', 'salary', 'intelligence', 'preparation', 'guides'],
  openGraph: {
    title: 'Latest Articles - Exam Suchana',
    description: 'Find detailed exam analysis, syllabus, and guidance for your dream career.',
    type: 'website',
  },
};

export default function ArticlesPage() {
  return (
    <Suspense fallback={
      <div className="wrap-home" style={{ marginTop: '24px', marginBottom: '60px', opacity: 0.2 }}>
        <div className="page-grid">
          <div className="content-col">
            <div className="skeleton" style={{ height: '40px', width: '250px', marginBottom: '24px' }} />
            <div className="skeleton" style={{ height: '46px', width: '100%', marginBottom: '24px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: '120px', width: '100%', borderRadius: '4px' }} />
              ))}
            </div>
          </div>
          <div className="sidebar-col">
            <div className="skeleton" style={{ height: '300px', width: '100%', borderRadius: '4px' }} />
          </div>
        </div>
      </div>
    }>
      <ArticlesClient />
    </Suspense>
  );
}
