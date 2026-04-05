import { ImageResponse } from 'next/og';
import { fetchSeoPageBySlug } from '@/app/lib/api';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'Exam Suchana - Intelligence Hub';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const { slug } = await params;
  
  if (slug === 'admit-card-released-today' || slug === 'upcoming-gov-exam-this-week') {
      const title = slug.replace(/-/g, ' ').toUpperCase();
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
                backgroundColor: '#7c3aed',
                padding: '80px',
              }}
            >
               <div style={{ color: 'white', fontSize: 100, fontWeight: 900, textAlign: 'center', letterSpacing: '-0.05em' }}>
                  {title}
               </div>
               <div style={{ marginTop: 40, border: '2px solid rgba(255,255,255,0.3)', padding: '10px 40px', borderRadius: 100, color: 'white', fontSize: 24, fontWeight: 600 }}>
                  EXAM SUCHANA LIVE UPDATE
               </div>
            </div>
          ),
          { ...size }
      );
  }

  const page = await fetchSeoPageBySlug(slug);

  if (!page) {
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
             }}
           >
              <div style={{ fontSize: 32, fontWeight: 'bold' }}>Exam Suchana</div>
           </div>
         ),
         { ...size }
     );
  }

  const mainTitle = page.title;
  const isExamPage = !!page.exam;

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
          backgroundImage: 'radial-gradient(circle at 2px 2px, #f1f5f9 1px, transparent 0)',
          backgroundSize: '24px 24px',
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 60, opacity: 0.8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#7c3aed', marginRight: 10 }} />
            <div style={{ fontSize: 24, fontWeight: 600, color: '#4b5563', letterSpacing: '0.05em' }}>INTELLIGENCE HUB</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 80, fontWeight: 800, color: '#0f172a', lineHeight: 1, marginBottom: 20, maxWidth: '900px' }}>
              {mainTitle}
            </div>
            {isExamPage && (
              <div style={{ fontSize: 32, color: '#6366f1', fontWeight: 600 }}>
                {page.exam?.conductingBody}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', borderTop: '2px solid #f1f5f9', paddingTop: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, backgroundColor: '#7c3aed', borderRadius: 6, marginRight: 12 }} />
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#111827' }}>Exam Suchana</div>
          </div>
          <div style={{ fontSize: 24, color: '#64748b' }}>examsuchana.in</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
