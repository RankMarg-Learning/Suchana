import { ImageResponse } from 'next/og';
import { STATUS_LABELS, slugToEnum } from '@/app/lib/types';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { status: string } }) {
  const { status: statusSlug } = await params;
  const statusEnum = slugToEnum(statusSlug);
  const label = STATUS_LABELS[statusEnum] || 'Government';
  
  const colors: Record<string, string> = {
      'REGISTRATION_OPEN': '#10b981',
      'ADMIT_CARD_OUT': '#7c3aed',
      'RESULT_DECLARED': '#f59e0b',
      'NOTIFICATION': '#3b82f6',
  };
  
  const mainColor = colors[statusEnum] || '#7c3aed';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%', width: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a',
          padding: '80px', position: 'relative', overflow: 'hidden',
        }}
      >
          {/* Decorative background elements */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: 400, height: 400, borderRadius: '50%', backgroundColor: mainColor, opacity: 0.2, filter: 'blur(100px)' }} />
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: 400, height: 400, borderRadius: '50%', backgroundColor: '#6366f1', opacity: 0.1, filter: 'blur(100px)' }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          <div style={{ border: `2px solid ${mainColor}`, padding: '8px 24px', borderRadius: 100, color: mainColor, fontSize: 24, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 32 }}>
            REAL-TIME INTELLIGENCE
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div style={{ fontSize: 100, fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-0.04em' }}>
              {label}
            </div>
            <div style={{ fontSize: 100, fontWeight: 900, color: mainColor, lineHeight: 1, letterSpacing: '-0.04em' }}>
              EXAMS
            </div>
          </div>

          <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: '16px 40px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: mainColor, marginRight: 16, border: '2px solid white' }} />
            <div style={{ color: '#94a3b8', fontSize: 28, fontWeight: 500 }}>Lifecycle Tracker | Exam Suchana</div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', fontSize: 24, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
          examsuchana.in
        </div>
      </div>
    ),
    { ...size }
  );
}
