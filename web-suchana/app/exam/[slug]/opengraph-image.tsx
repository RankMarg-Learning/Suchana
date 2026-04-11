/** @format */

import { ImageResponse } from 'next/og';
import { fetchExamBySlug } from '@/app/lib/api';
import { STATUS_LABELS } from '@/app/lib/types';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// REDESIGNED STATUS THEMES
const THEMES: Record<string, { main: string; bg: string; accent: string }> = {
  NOTIFICATION: { main: '#6366f1', bg: '#0f172a', accent: '#4338ca' },
  REGISTRATION_OPEN: { main: '#10b981', bg: '#064e3b', accent: '#059669' },
  ADMIT_CARD_OUT: { main: '#0ea5e9', bg: '#0c4a6e', accent: '#0284c7' },
  RESULT_DECLARED: { main: '#f59e0b', bg: '#451a03', accent: '#d97706' },
  EXAM_DATE_ANNOUNCED: { main: '#f43f5e', bg: '#4c0519', accent: '#e11d48' },
  ANSWER_KEY_OUT: { main: '#8b5cf6', bg: '#2e1065', accent: '#7c3aed' },
};

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const exam = await fetchExamBySlug(slug).catch(() => null);

  const title = (exam?.shortTitle || exam?.title || slug.replace(/-/g, ' ')).toUpperCase();
  const status = exam?.status || 'NOTIFICATION';
  const theme = THEMES[status] || THEMES.NOTIFICATION;
  const statusLabel = STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;

  return new ImageResponse(
    (
      <div style={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: theme.bg, position: 'relative', overflow: 'hidden' }}>

        {/* DESIGN ACCENTS */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: 200, background: `radial-gradient(circle, ${theme.main}44 0%, transparent 70%)` }} />
        <div style={{ position: 'absolute', bottom: -150, left: -150, width: 500, height: 500, borderRadius: 250, background: `radial-gradient(circle, ${theme.main}33 0%, transparent 70%)` }} />

        {/* STATUS TOP BAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: theme.main, padding: '16px 0', width: '100%', borderBottom: '4px solid rgba(255,255,255,0.2)' }}>
          <span style={{ color: 'white', fontSize: 26, fontWeight: 900, letterSpacing: '0.2em' }}>
            {statusLabel.toUpperCase()}
          </span>
        </div>

        {/* MAIN INFO SECTION */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '60px 80px', flex: 1, justifyContent: 'center' }}>

          <div style={{ color: theme.main, fontSize: 28, fontWeight: 800, marginBottom: 12, display: 'flex' }}>
            {exam?.conductingBody?.toUpperCase() || 'OFFICIAL EXAM ALERT'}
          </div>

          <div style={{ fontSize: 94, fontWeight: 900, color: 'white', lineHeight: 0.9, letterSpacing: '-0.06em', marginBottom: 40, display: 'flex' }}>
            {title}
          </div>


        </div>

        {/* BRAND FOOTER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 80px 40px', zIndex: 10 }}>

          <span style={{ color: '#94a3b8', fontSize: 24, fontWeight: 600 }}>www.examsuchana.in</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
