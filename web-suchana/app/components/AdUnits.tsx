"use client";

import React, { useEffect, useRef, useState } from "react";
import { ADS_CONFIG, AdSlotConfig } from "@/app/config/ads";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSlot(id: string): AdSlotConfig | undefined {
  if (!ADS_CONFIG.enableAds) return undefined;
  return ADS_CONFIG.slots[id];
}

// ─── AdSense Unit ─────────────────────────────────────────────────────────────
//
// Policy compliance:
// 1. Only calls .push({}) once per mounted instance (useRef guard).
// 2. Uses IntersectionObserver — push only fires when the <ins> enters the
//    viewport (prevents "ad stuffing" / loading hidden ads).
// 3. No fixed min-height on the container — Google flags reserved blank space.
// 4. Wrapped in a unique key at call-site to ensure fresh mount per slot.

function AdSenseUnit({ slotId }: { slotId: string }) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    const el = insRef.current;
    if (!el || pushed.current) return;

    // Only push when the <ins> is actually visible in the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !pushed.current) {
          pushed.current = true;
          try {
            // @ts-ignore — adsbygoogle is a global injected by the AdSense script
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch (_) {
            // Silently fail — ad blocker present or script not yet loaded
          }
          observer.disconnect();
        }
      },
      { threshold: 0.1 } // fire when at least 10% of the unit is visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <ins
      ref={insRef}
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client={ADS_CONFIG.googleAdSensePublisherId}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}

// ─── Sponsor Banner ───────────────────────────────────────────────────────────

function SponsorBannerUnit({
  imageUrl,
  link,
  alt,
}: {
  imageUrl: string;
  link: string;
  alt: string;
}) {
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={alt}
      style={{ display: "block", lineHeight: 0 }}
    >
      <img
        src={imageUrl}
        alt={alt}
        style={{ width: "100%", height: "auto", display: "block" }}
        loading="lazy"
      />
    </a>
  );
}

// ─── Generic Slot Renderer ────────────────────────────────────────────────────

function SlotRenderer({ config }: { config: AdSlotConfig }) {
  if (config.type === "adsense" && config.adsenseSlotId) {
    return <AdSenseUnit slotId={config.adsenseSlotId} />;
  }
  if (config.type === "sponsor" && config.sponsor) {
    return <SponsorBannerUnit {...config.sponsor} />;
  }
  return null;
}

// ─── Shared wrapper styles ────────────────────────────────────────────────────
//
// Policy notes:
// • NO min-height — reserving blank space for ads violates "ad placement" policy.
// • "Advertisement" label is required when ads might be confused with content.
// • pointer-events: none on the label — prevents any accidental label-click from
//   registering as an ad click.
// • Clear padding from surrounding content — accidental clicks near nav/buttons.

const adLabel = (
  <p
    aria-hidden="true"
    style={{
      fontSize: 9,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "#b0b0b0",
      textAlign: "center",
      margin: "0 0 4px",
      userSelect: "none",
      pointerEvents: "none",
      lineHeight: 1,
      fontFamily: "system-ui, sans-serif",
      fontWeight: 400,
    }}
  >
    Advertisement
  </p>
);

// ─── Public Components ────────────────────────────────────────────────────────

/**
 * LeaderboardAd — full-width banner (728×90 / responsive).
 * Slot: top-leaderboard-ad → 3262405422
 * Policy: min 150px from navigation. Enforce via margin in CSS.
 */
export function LeaderboardAd({ id }: { id?: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!id || !mounted) return null;
  const slot = getSlot(id);
  if (!slot) return null;

  return (
    <div
      className="ad-leaderboard"
      aria-label="Advertisement"
      style={{
        width: "100%",
        // No max-width forced — let AdSense handle responsive sizing
        margin: "24px auto", // vertical clearance from surrounding content
        padding: "0 0 2px",  // 2px bottom prevents layout collapse flash
        textAlign: "center",
        // Clearance from any clickable elements above/below (policy: no ads
        // within 150px of interactive elements that could cause accidental clicks)
        boxSizing: "border-box",
      }}
    >
      {adLabel}
      <SlotRenderer config={slot} />
    </div>
  );
}

/**
 * SidebarAd — rectangle (300×250) or vertical (160×600+).
 * Slots: sidebar-ad-* → 5246027788 / 5881607554
 * Policy: no min-height reserved, no placement next to download buttons.
 */
export function SidebarAd({ id, tall }: { id?: string; tall?: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!id || !mounted) return null;
  const slot = getSlot(id);
  if (!slot) return null;

  return (
    <div
      className="ad-sidebar"
      aria-label="Advertisement"
      style={{
        width: "100%",
        margin: tall ? "16px 0" : "12px 0",
        // No min-height: reserved blank space is a policy violation.
        // AdSense collapses the unit naturally if no ad fills.
        overflow: "hidden",
      }}
    >
      {adLabel}
      <SlotRenderer config={slot} />
    </div>
  );
}

/**
 * InFeedAd — native sponsored content inside exam list feed.
 * Slot: inFeedAds array (sponsor banners only, not AdSense).
 * Policy: must be visually distinct from editorial content.
 */
export function InFeedAd({ id, index }: { id?: string; index?: number }) {
  if (!ADS_CONFIG.enableAds || !ADS_CONFIG.placements.inFeedNativeAds) return null;
  const ads = ADS_CONFIG.inFeedAds;
  if (!ads || ads.length === 0) return null;
  const ad = ads[(index ?? 0) % ads.length];
  return (
    <div
      className="in-feed-ad"
      aria-label="Sponsored"
      style={{ margin: "8px 0", border: "1px solid rgba(0,0,0,0.06)" }}
    >
      {/* "Sponsored" label required for native ads to differentiate from content */}
      <p
        aria-hidden="true"
        style={{
          fontSize: 9,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "#b0b0b0",
          margin: "4px 0 4px 6px",
          userSelect: "none",
          pointerEvents: "none",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        Sponsored
      </p>
      <SponsorBannerUnit {...ad} />
    </div>
  );
}

/**
 * ArticleAd — Google AdSense In-Article ad.
 *
 * Policy compliance:
 * • Only renders client-side after hydration (no SSR mismatch).
 * • IntersectionObserver in AdSenseUnit ensures push() only fires when visible.
 * • "Advertisement" label always shown above unit.
 * • 28px vertical margin creates clear separation from article paragraphs/tables.
 * • No reserved min-height — collapses gracefully if no fill.
 * • Never placed inside a table cell, floated element, or hidden container.
 *
 * Usage — layout level (ArticleDetailClient.tsx):
 *   <ArticleAd slotId="article-top"    placementKey="articleTop" />
 *   <ArticleAd slotId="article-bottom" placementKey="articleBottom" />
 *
 * Usage — Markdown shortcode (between paragraphs, headings, tables):
 *   [AD: article-mid-1]
 *   [AD: article-mid-2]
 */
export function ArticleAd({
  slotId,
  placementKey,
  label = "Advertisement",
}: {
  slotId: string;
  placementKey?: keyof typeof ADS_CONFIG.placements;
  label?: string;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!ADS_CONFIG.enableAds) return null;
  if (placementKey && !ADS_CONFIG.placements[placementKey]) return null;
  const slot = getSlot(slotId);
  if (!slot || !mounted) return null;

  return (
    <div
      className="article-ad-slot"
      aria-label={label}
      style={{
        width: "100%",
        // 28px vertical clearance — separates from paragraphs and table borders.
        // This prevents accidental clicks when user scrolls through content.
        margin: "28px 0",
        display: "block",
        clear: "both",      // never overlap floated images
        overflow: "hidden",
        // borderTop/Bottom give a visual break so ad is never confused with content
        borderTop: "1px solid rgba(0,0,0,0.06)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        padding: "12px 0",
      }}
    >
      {adLabel}
      <SlotRenderer config={slot} />
    </div>
  );
}
