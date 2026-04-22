/** @format */

import { ImageResponse } from 'next/og';
import { fetchSeoPageBySlug } from '@/app/lib/api';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let page = null;
  try {
    const res = await fetchSeoPageBySlug(slug);
    if (res && !('error' in res)) {
      page = res;
    }
  } catch (e) {
    console.error("OG Image Fetch Error:", e);
  }

  const rawTitle = page?.title || slug.replace(/-/g, ' ').toUpperCase() || 'EXAM UPDATE';
  const category = (page?.category || 'RESOURCES').replace(/_/g, ' ').toUpperCase();
  const titleDisplay = rawTitle.toUpperCase();

  // Font scaling for readability
  const fontSize = titleDisplay.length > 60 ? 60 : titleDisplay.length > 35 ? 78 : 105;

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
          backgroundColor: '#0f172a', // Deep Professional Blue
          backgroundImage: 'radial-gradient(circle at 0% 0%, #1e293b 0%, transparent 50%), radial-gradient(circle at 100% 100%, #1e293b 0%, transparent 50%)',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* Subtle Decorative Stripes (Canvas feel) */}
        <div style={{ position: 'absolute', top: 0, right: '10%', width: 200, height: '100%', background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.03), transparent)', transform: 'skewX(-20deg)', display: 'flex' }} />

        {/* Framing Border */}
        <div style={{ position: 'absolute', top: 30, left: 30, right: 30, bottom: 30, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, display: 'flex' }} />



        {/* Content Box */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '80px 60px',
            borderRadius: 24,
            zIndex: 20,
          }}
        >
          {/* Category Tag */}
          <div style={{
            color: '#38bdf8',
            fontSize: 28,
            fontWeight: 800,
            marginBottom: 20,
            letterSpacing: '0.1em',
            display: 'flex'
          }}>
            {category}
          </div>

          {/* Main Title (The Update Headline) */}
          <div
            style={{
              display: 'flex',
              fontSize: fontSize,
              fontWeight: 900,
              color: 'white',
              lineHeight: 1,
              letterSpacing: '-0.04em',
              textShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            {titleDisplay}
          </div>
        </div>

        {/* Footer info: EXAM SUCHANA branding */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 70,
            right: 70,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 30
          }}
        >

          <div style={{ color: '#64748b', fontSize: 26, fontWeight: 600, display: 'flex' }}>
            www.examsuchana.in
          </div>
        </div>

        {/* Decorative corner accent */}
        <div style={{ position: 'absolute', top: 30, right: 30, padding: 10, display: 'flex' }}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect x="0" y="0" width="10" height="10" fill="rgba(255,255,255,0.1)" />
            <rect x="15" y="0" width="10" height="10" fill="rgba(255,255,255,0.1)" />
            <rect x="0" y="15" width="10" height="10" fill="rgba(255,255,255,0.1)" />
          </svg>
        </div>
      </div>
    ),
    { ...size }
  );
}
