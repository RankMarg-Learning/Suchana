import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { category: string } }) {
  const { category: categorySlug } = await params;
  const label = categorySlug.replace(/-/g, ' ').toUpperCase();

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff',
          padding: '80px', position: 'relative', overflow: 'hidden',
          backgroundImage: 'linear-gradient(to bottom, #f8fafc, #ffffff)',
          borderBottom: '24px solid #7c3aed'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ padding: '12px 32px', backgroundColor: '#f5f3ff', color: '#7c3aed', borderRadius: 100, fontSize: 24, fontWeight: 700, marginBottom: 40, border: '2px solid #ddd6fe' }}>
            BY CATEGORY
          </div>
          
          <div style={{ fontSize: 110, fontWeight: 900, color: '#0f172a', lineHeight: 0.9, letterSpacing: '-0.06em' }}>
            {label}
          </div>
          <div style={{ fontSize: 60, fontWeight: 800, color: '#64748b', lineHeight: 1.2, marginTop: 20 }}>
            Notifications & Updates
          </div>
        </div>

        <div style={{ marginTop: 60, display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, backgroundColor: '#7c3aed', borderRadius: 8, marginRight: 16 }} />
          <div style={{ fontSize: 32, fontWeight: 'bold', color: '#1e293b' }}>Exam Suchana</div>
        </div>

        <div style={{ position: 'absolute', bottom: 60, right: 80, fontSize: 24, color: '#94a3b8', fontWeight: 600 }}>
          examsuchana.in
        </div>
      </div>
    ),
    { ...size }
  );
}
