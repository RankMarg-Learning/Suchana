import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
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
          padding: '100px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: '#7c3aed', opacity: 0.05 }} />
        
        {/* Glow effect */}
        <div style={{ position: 'absolute', width: 600, height: 600, backgroundColor: '#7c3aed', opacity: 0.1, filter: 'blur(150px)', borderRadius: '50%' }} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          <div style={{ padding: '12px 32px', backgroundColor: '#7c3aed', color: 'white', borderRadius: 100, fontSize: 24, fontWeight: 700, marginBottom: 48, boxShadow: '0 20px 40px -10px rgba(124, 58, 237, 0.5)' }}>
            LATEST NOTIFICATIONS
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: 100, fontWeight: 900, color: '#0f172a', lineHeight: 0.95, letterSpacing: '-0.06em' }}>
              EXAM SUCHANA
            </div>
            <div style={{ fontSize: 56, fontWeight: 600, color: '#6366f1', lineHeight: 1.2, marginTop: 12 }}>
              Government Exam Lifecycle Tracker
            </div>
          </div>

          <div style={{ marginTop: 60, display: 'flex', gap: 32, alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>1000+</div>
                <div style={{ fontSize: 16, color: '#64748b', fontWeight: 600 }}>Active Exams</div>
            </div>
            <div style={{ width: 1, height: 40, backgroundColor: '#e2e8f0' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#0f172a' }}>Real-time</div>
                <div style={{ fontSize: 16, color: '#64748b', fontWeight: 600 }}>Status Track</div>
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 80, display: 'flex', alignItems: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>examsuchana.in</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
