import { ImageResponse } from 'next/og';
import { fetchExamBySlug } from '@/app/lib/api';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Exam Suchana - Government Exam Tracker';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  const exam = await fetchExamBySlug(slug);

  if (!exam) {
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            backgroundImage: 'radial-gradient(circle at 25px 25px, #f1f5f9 2%, transparent 0%), radial-gradient(circle at 75px 75px, #f1f5f9 2%, transparent 0%)',
            backgroundSize: '100px 100px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
             <div style={{ padding: '8px 16px', backgroundColor: '#7c3aed', color: 'white', borderRadius: 8, fontSize: 32, fontWeight: 'bold' }}>
                Suchana
             </div>
          </div>
          <div style={{ fontSize: 48, fontWeight: 'bold', color: '#0f172a' }}>Exam Not Found</div>
        </div>
      ),
      { ...size }
    );
  }

  const statusLabel = exam.status.replace(/_/g, ' ');
  const subtitle = exam.conductingBody || 'Government Recruitment';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #f1f5f9 2%, transparent 0%), radial-gradient(circle at 75px 75px, #f1f5f9 2%, transparent 0%)',
          backgroundSize: '100px 100px',
          padding: '80px',
          border: '1px solid #7c3aed',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          {/* Header Branding */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, backgroundColor: '#7c3aed', borderRadius: 8, marginRight: 12 }} />
              <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1e293b', letterSpacing: '-0.02em' }}>Exam Suchana</div>
            </div>
            <div style={{ padding: '8px 20px', backgroundColor: '#f5f3ff', color: '#7c3aed', borderRadius: 100, fontSize: 20, fontWeight: 600, border: '1px solid #ddd6fe' }}>
              RECRUITMENT HUB
            </div>
          </div>

          {/* Main Title Area */}
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 20 }}>
            <div style={{ fontSize: 24, fontWeight: 500, color: '#64748b', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {subtitle}
            </div>
            <div style={{ fontSize: 72, fontWeight: 800, color: '#0f172a', lineHeight: 1.1, marginBottom: 20, maxWidth: '900px' }}>
              {exam.shortTitle || exam.title}
            </div>
          </div>
        </div>

        {/* Footer Area with Badges */}
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ padding: '16px 32px', backgroundColor: '#0f172a', color: 'white', borderRadius: 12, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontSize: 14, color: '#94a3b8', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>CURRENT STATUS</div>
              <div style={{ fontSize: 28, fontWeight: 'bold' }}>{statusLabel}</div>
            </div>
            {exam.totalVacancies && (
               <div style={{ padding: '16px 32px', backgroundColor: '#ffffff', color: '#0f172a', borderRadius: 12, display: 'flex', flexDirection: 'column', border: '1px solid #e2e8f0' }}>
               <div style={{ fontSize: 14, color: '#64748b', textTransform: 'uppercase', marginBottom: 4, fontWeight: 600 }}>VACANCIES</div>
               <div style={{ fontSize: 28, fontWeight: 'bold' }}>{exam.totalVacancies.replace(/[^\d+]/g, '') || 'Details Inside'}</div>
             </div>
            )}
          </div>
          
          <div style={{ fontSize: 20, color: '#64748b', fontWeight: 500 }}>
            examsuchana.in
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
