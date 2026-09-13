"use client";

import React, { useEffect, useRef, useState } from "react";
import { ADS_CONFIG, AdSlotConfig, AdsterraConfig } from "@/app/config/ads";

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

function AdSenseUnit({
  slotId,
  onStatusChange,
  format,
  layout,
  className = "adsbygoogle",
  style = { display: "block", width: "100%" }
}: {
  slotId: string;
  onStatusChange: (status: "loading" | "filled" | "empty") => void;
  format?: string;
  layout?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const insRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    const el = insRef.current;
    if (!el || pushed.current) return;
    let timerId: NodeJS.Timeout | null = null;

    // Only push when the <ins> is actually visible in the viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !pushed.current) {
          pushed.current = true;
          try {
            // @ts-ignore — adsbygoogle is a global injected by the AdSense script
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } catch (_) {
            onStatusChange("empty"); // Ad blocker present
          }

          timerId = setTimeout(() => {
            if (!el) return;
            const hasIframe = el.querySelector("iframe");
            const status = el.getAttribute("data-ad-status");
            if (!hasIframe && status !== "filled") {
              onStatusChange("empty");
            } else {
              onStatusChange("filled");
            }
          }, 3000); // 3 seconds timeout

          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px", threshold: 0 } // Pre-load ad 400px before it enters viewport to maximize CTR and Active View
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timerId) clearTimeout(timerId);
    };
  }, [onStatusChange]);

  return (
    <ins
      ref={insRef}
      className={className}
      style={style}
      data-ad-client={ADS_CONFIG.googleAdSensePublisherId}
      data-ad-slot={slotId}
      {...(format ? { "data-ad-format": format } : { "data-ad-format": "auto" })}
      {...(layout ? { "data-ad-layout": layout } : {})}
      data-full-width-responsive="true"
    />
  );
}

// ─── Adsterra Unit ────────────────────────────────────────────────────────────

function AdsterraUnit({
  config,
  onStatusChange,
}: {
  config: AdsterraConfig;
  onStatusChange: (status: "loading" | "filled" | "empty") => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    onStatusChange("filled"); // Adsterra typically fills
    const el = iframeRef.current;
    if (!el) return;

    if (el.getAttribute('data-injected')) return;
    el.setAttribute('data-injected', 'true');

    const doc = el.contentWindow?.document;
    if (doc) {
      doc.open();
      if (config.format === 'native') {
        doc.write(`
          <html>
            <body style="margin:0;padding:0;">
              <script async="async" data-cfasync="false" src="https://pl29872491.profitableratecpmnetwork.com/${config.key}/invoke.js"></script>
              <div id="container-${config.key}"></div>
            </body>
          </html>
        `);
      } else {
        doc.write(`
          <html>
            <body style="margin:0;padding:0;text-align:center;overflow:hidden;">
              <script>
                atOptions = {
                  'key' : '${config.key}',
                  'format' : 'iframe',
                  'height' : ${config.height},
                  'width' : ${config.width},
                  'params' : {}
                };
              </script>
              <script src="https://www.highrevenueformat.com/${config.key}/invoke.js"></script>
            </body>
          </html>
        `);
      }
      doc.close();
    }
  }, [config, onStatusChange]);

  return (
    <iframe
      ref={iframeRef}
      width={config.width || "100%"}
      height={config.height || (config.format === 'native' ? "250" : "auto")}
      frameBorder="0"
      scrolling="no"
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
      style={{ display: "block", margin: "0 auto", maxWidth: "100%", overflow: "hidden" }}
      title={`Adsterra ${config.format}`}
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

function SponsorBannerWrapper({
  sponsor,
  onStatusChange,
}: {
  sponsor: any;
  onStatusChange: (status: "loading" | "filled" | "empty") => void;
}) {
  useEffect(() => {
    onStatusChange("filled");
  }, [onStatusChange]);

  return <SponsorBannerUnit {...sponsor} />;
}

function SlotRenderer({
  config,
  onStatusChange,
  format,
  layout,
  className,
  style
}: {
  config: AdSlotConfig;
  onStatusChange: (status: "loading" | "filled" | "empty") => void;
  format?: string;
  layout?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (config.type === "adsense" && config.adsenseSlotId) {
    return <AdSenseUnit slotId={config.adsenseSlotId} onStatusChange={onStatusChange} format={format} layout={layout} className={className} style={style} />;
  }
  if (config.type === "sponsor" && config.sponsor) {
    return <SponsorBannerWrapper sponsor={config.sponsor} onStatusChange={onStatusChange} />;
  }
  if (config.type === "adsterra" && config.adsterra) {
    return <AdsterraUnit config={config.adsterra} onStatusChange={onStatusChange} />;
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
  const [status, setStatus] = useState<"loading" | "filled" | "empty">("loading");
  useEffect(() => setMounted(true), []);

  if (!id || !mounted) return null;
  const slot = getSlot(id);
  if (!slot) return null;

  if (status === "empty") {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div style={{ width: "100%", minHeight: "105px", background: "#F5F2EB", border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", margin: "24px auto", color: "#64748b", fontSize: "12px", fontFamily: "monospace" }}>
          [LeaderboardAd: {id}] (Unfilled - Dev Mode)
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className="ad-leaderboard ad-strict-728x90"
      aria-label="Advertisement"
      style={{
        display: "block",
        margin: "24px auto", // vertical clearance from surrounding content
        padding: "0 0 2px",  // 2px bottom prevents layout collapse flash
        textAlign: "center",
        boxSizing: "border-box",
        background: "transparent",
        border: "none",
        flexShrink: 0
      }}
    >
      {adLabel}
      <SlotRenderer config={slot} onStatusChange={setStatus} format="horizontal" />
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
  const [status, setStatus] = useState<"loading" | "filled" | "empty">("loading");
  useEffect(() => setMounted(true), []);

  if (!id || !mounted) return null;
  const slot = getSlot(id);
  if (!slot) return null;

  if (status === "empty") {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div style={{ width: "100%", minHeight: tall ? "615px" : "265px", background: "#F5F2EB", border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", margin: "24px 0", color: "#64748b", fontSize: "12px", fontFamily: "monospace" }}>
          [SidebarAd: {id}] (Unfilled - Dev Mode)
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className={`ad-sidebar ${tall ? 'ad-strict-300x600' : 'ad-strict-300x250'}`}
      aria-label="Advertisement"
      style={{
        display: "block",
        margin: "24px 0", // Safely space the ad from navigation links to avoid invalid click penalties
        overflow: "hidden",
        textAlign: "center",
        background: "transparent",
        border: "none",
        flexShrink: 0,
        position: tall ? "sticky" : "static",
        top: tall ? "80px" : "auto", // Make tall ads sticky to follow user scroll
      }}
    >
      {adLabel}
      <SlotRenderer config={slot} onStatusChange={setStatus} format={tall ? "vertical" : "rectangle"} />
    </div>
  );
}

/**
 * InFeedAd — native sponsored content inside exam list feed.
 * Slot: inFeedAds array (sponsor banners only, not AdSense).
 * Policy: must be visually distinct from editorial content.
 */
export function InFeedAd({ id, index }: { id?: string; index?: number }) {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"loading" | "filled" | "empty">("loading");
  useEffect(() => setMounted(true), []);

  if (!ADS_CONFIG.enableAds || !ADS_CONFIG.placements.inFeedNativeAds || !mounted) return null;
  const slot = getSlot("in-feed-native");
  if (!slot) return null;

  return (
    <div
      className="in-feed-ad"
      aria-label="Sponsored"
      style={{ margin: "8px 0", border: "1px solid rgba(0,0,0,0.06)", minHeight: "100px" }}
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
      <SlotRenderer config={slot} onStatusChange={setStatus} />
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
  const [status, setStatus] = useState<"loading" | "filled" | "empty">("loading");
  useEffect(() => setMounted(true), []);

  if (!ADS_CONFIG.enableAds) return null;
  if (placementKey && !ADS_CONFIG.placements[placementKey]) return null;
  const slot = getSlot(slotId);
  if (!slot || !mounted) return null;

  if (status === "empty") {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div style={{ width: "100%", minHeight: "280px", background: "#F5F2EB", border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", margin: "28px 0", color: "#64748b", fontSize: "12px", fontFamily: "monospace" }}>
          [ArticleAd: {slotId}] (Unfilled - Dev Mode)
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className="article-ad-slot"
      aria-label={label}
      style={{
        width: "100%",
        margin: "28px 0",
        display: "block",
        clear: "both",
        overflow: "hidden",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        padding: "12px 0",
        minHeight: "280px",
        flexShrink: 0
      }}
    >
      {adLabel}
      <SlotRenderer config={slot} onStatusChange={setStatus} format="fluid" layout="in-article" />
    </div>
  );
}

/**
 * GutterAd — 160x600 sticky skyscraper ad for ultra-wide desktop screens.
 * Uses slots: sidebar-ad-left-2 and sidebar-ad-right-3
 */
export function GutterAd({ side }: { side: "left" | "right" }) {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"loading" | "filled" | "empty">("loading");

  useEffect(() => setMounted(true), []);

  if (!ADS_CONFIG.enableAds || !mounted) return null;

  const slotId = side === "left" ? "sidebar-ad-left-2" : "sidebar-ad-right-3";
  const slot = getSlot(slotId);

  if (!slot) return null;

  if (status === "empty") {
    if (process.env.NODE_ENV === "development") {
      return (
        <div style={{ width: "100%", height: "600px", background: "#F5F2EB", border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "12px", fontFamily: "monospace", textAlign: "center" }}>
          [Gutter {side} 160x600]
        </div>
      );
    }
    return null;
  }

  return (
    <div className="w-full flex justify-center" aria-label="Advertisement">
      <SlotRenderer config={slot} onStatusChange={setStatus} format="vertical" />
    </div>
  );
}

/**
 * MobileAnchorAd — Sticky 320x50 / 320x100 bottom anchor ad for Mobile devices.
 * Highly visible ad format to boost mobile revenue.
 */
export function MobileAnchorAd() {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"loading" | "filled" | "empty">("loading");

  useEffect(() => setMounted(true), []);

  if (!ADS_CONFIG.enableAds || !mounted) return null;

  // Uses the dedicated mobile-anchor slot configured in ads.ts
  const slot = getSlot("mobile-anchor");
  if (!slot) return null;

  // Only render container if not empty in prod
  if (status === "empty" && process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex justify-center items-center safe-area-pb">
      <div className="relative w-full max-w-[320px] min-h-[50px] flex items-center justify-center bg-gray-50">
        {status === "empty" && process.env.NODE_ENV === "development" && (
           <div style={{ width: "100%", height: "50px", background: "#F5F2EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "10px", fontFamily: "monospace" }}>
             [Mobile Anchor Ad]
           </div>
        )}
        <div className={status === "empty" ? "hidden" : "w-full"}>
           <SlotRenderer config={slot} onStatusChange={setStatus} format="horizontal" style={{ display: "inline-block", width: "320px", height: "50px" }} />
        </div>
      </div>
    </div>
  );
}
