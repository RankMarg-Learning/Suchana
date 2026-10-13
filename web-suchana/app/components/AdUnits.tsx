"use client";

import React, { useEffect, useRef, useState } from "react";
import { ADS_CONFIG, AdSlotConfig, getAdSlotConfig } from "@/app/config/ads";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSlot(id: string): AdSlotConfig | undefined {
  return getAdSlotConfig(id);
}

// ─── AdSense Unit ─────────────────────────────────────────────────────────────
//
// Policy & High-RPM Optimization:
// 1. Only calls .push({}) once per mounted instance (useRef + data-attribute guard).
// 2. Uses IntersectionObserver with 350px rootMargin — pre-loads ads right before
//    they enter the viewport. This maximizes Google Active View (>70%), boosting domain-wide eCPM.
// 3. Uses MutationObserver on data-ad-status ("filled" | "unfilled") rather than arbitrary timeouts,
//    ensuring ads are never prematurely destroyed during latency spikes or slow 3G/4G connections.
// 4. CSS :has(ins[data-ad-status="unfilled"]) cleanly collapses unfilled slots with zero CLS.

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
    if (!el) return;

    // MutationObserver to watch Google AdSense updating data-ad-status
    const mutationObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === "attributes" && m.attributeName === "data-ad-status") {
          const status = el.getAttribute("data-ad-status");
          if (status === "filled") {
            onStatusChange("filled");
          } else if (status === "unfilled") {
            onStatusChange("empty");
          }
        }
      }
    });

    mutationObserver.observe(el, { attributes: true, attributeFilter: ["data-ad-status"] });

    // Initial check in case attribute was already set
    const currentStatus = el.getAttribute("data-ad-status");
    if (currentStatus === "filled") {
      onStatusChange("filled");
    } else if (currentStatus === "unfilled") {
      onStatusChange("empty");
    }

    // Pre-load ad 350px before entering viewport to maximize Active View Viewability (>70%)
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !pushed.current) {
          if (!el.getAttribute("data-adsbygoogle-status")) {
            pushed.current = true;
            try {
              // @ts-ignore — adsbygoogle is a global injected by the AdSense script
              (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (_) {
              onStatusChange("empty"); // Ad blocker present or script failed
            }
          }
          observer.disconnect();
        }
      },
      { rootMargin: "350px 0px", threshold: 0 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, [onStatusChange, slotId]);

  return (
    <ins
      ref={insRef}
      className={className}
      style={style}
      data-ad-client={ADS_CONFIG.googleAdSensePublisherId}
      data-ad-slot={slotId}
      {...(format && format !== "fixed" ? { "data-ad-format": format } : {})}
      {...(!format ? { "data-ad-format": "auto" } : {})}
      {...(layout ? { "data-ad-layout": layout } : {})}
      {...(format !== "fixed" ? { "data-full-width-responsive": "true" } : {})}
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
    return (
      <AdSenseUnit
        slotId={config.adsenseSlotId}
        onStatusChange={onStatusChange}
        format={format}
        layout={layout}
        className={className}
        style={style}
      />
    );
  }
  if (config.type === "sponsor" && config.sponsor) {
    return <SponsorBannerWrapper sponsor={config.sponsor} onStatusChange={onStatusChange} />;
  }

  return null;
}

// ─── Shared wrapper styles ────────────────────────────────────────────────────

const adLabel = (
  <p
    aria-hidden="true"
    style={{
      fontSize: 9,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "#94a3b8",
      textAlign: "center",
      margin: "0 0 4px",
      userSelect: "none",
      pointerEvents: "none",
      lineHeight: 1,
      fontFamily: "system-ui, sans-serif",
      fontWeight: 500,
    }}
  >
    Advertisement
  </p>
);

// ─── Public Components ────────────────────────────────────────────────────────

/**
 * LeaderboardAd — full-width responsive banner (728×90 desktop, 320x50/320x100 mobile).
 * Slot: top-leaderboard-ad → 3262405422
 */
export function LeaderboardAd({ id = "top-leaderboard-ad" }: { id?: string }) {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"loading" | "filled" | "empty">("loading");
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  const slot = getSlot(id);
  if (!slot) return null;

  return (
    <div
      className="ad-leaderboard ad-strict-728x90"
      aria-label="Advertisement"
      style={{
        display: "block",
        margin: "16px auto",
        padding: "0 0 2px",
        textAlign: "center",
        boxSizing: "border-box",
        background: "transparent",
        border: "none",
        width: "100%",
        maxWidth: "970px",
        flexShrink: 0
      }}
    >
      {adLabel}
      {status === "empty" && process.env.NODE_ENV === "development" ? (
        <div style={{ width: "100%", minHeight: "90px", background: "#F5F2EB", border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", margin: "8px auto", color: "#64748b", fontSize: "12px", fontFamily: "monospace" }}>
          [LeaderboardAd: {id}] (Unfilled - Dev Mode)
        </div>
      ) : (
        <SlotRenderer config={slot} onStatusChange={setStatus} format="auto" />
      )}
    </div>
  );
}

/**
 * SidebarAd — rectangle (300×250) or vertical (160×600 / 300x600).
 * Slots: sidebar-ad-* → 5246027788 / 5881607554
 */
export function SidebarAd({ id = "sidebar-ad-right-1", tall }: { id?: string; tall?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"loading" | "filled" | "empty">("loading");
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;
  const slot = getSlot(id);
  if (!slot) return null;

  return (
    <div
      className={`ad-sidebar ${tall ? 'ad-strict-300x600' : 'ad-strict-300x250'}`}
      aria-label="Advertisement"
      style={{
        display: "block",
        margin: "16px auto",
        overflow: "hidden",
        textAlign: "center",
        background: "transparent",
        border: "none",
        flexShrink: 0,
        width: "100%",
        maxWidth: tall ? "300px" : "336px",
        position: tall ? "sticky" : "static",
        top: tall ? "84px" : "auto",
        zIndex: 10,
      }}
    >
      {adLabel}
      {status === "empty" && process.env.NODE_ENV === "development" ? (
        <div style={{ width: "100%", minHeight: tall ? "600px" : "250px", background: "#F5F2EB", border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", margin: "8px 0", color: "#64748b", fontSize: "12px", fontFamily: "monospace" }}>
          [SidebarAd: {id}] (Unfilled - Dev Mode)
        </div>
      ) : (
        <SlotRenderer config={slot} onStatusChange={setStatus} format={tall ? "vertical" : "rectangle"} />
      )}
    </div>
  );
}

/**
 * InFeedAd — native sponsored content card inside exam list feed.
 */
export function InFeedAd({ id = "in-feed-native", index }: { id?: string; index?: number }) {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"loading" | "filled" | "empty">("loading");
  useEffect(() => setMounted(true), []);

  if (!ADS_CONFIG.enableAds || !ADS_CONFIG.placements.inFeedNativeAds || !mounted) return null;
  const slot = getSlot(id);
  if (!slot) return null;

  return (
    <div
      className="in-feed-ad"
      aria-label="Sponsored"
      style={{
        margin: "12px 0",
        padding: "10px 14px",
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: "8px",
        position: "relative",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "6px",
        }}
      >
        <span
          style={{
            fontSize: "9px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#94a3b8",
            fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Sponsored / Advertisement
        </span>
      </div>
      {status === "empty" && process.env.NODE_ENV === "development" ? (
        <div style={{ width: "100%", minHeight: "80px", background: "#F5F2EB", border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "11px", fontFamily: "monospace" }}>
          [InFeedAd: {id}] (Unfilled - Dev Mode)
        </div>
      ) : (
        <SlotRenderer config={slot} onStatusChange={setStatus} format="fluid" layout="in-article" />
      )}
    </div>
  );
}

/**
 * ArticleAd — Google AdSense In-Article ad.
 *
 * Usage:
 *   <ArticleAd slotId="article-top" placementKey="articleTop" />
 *   <ArticleAd slotId="article-bottom" placementKey="articleBottom" />
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

  return (
    <div
      className="article-ad-slot"
      aria-label={label}
      style={{
        width: "100%",
        margin: "24px 0",
        display: "block",
        clear: "both",
        overflow: "hidden",
        borderTop: "1px solid rgba(0,0,0,0.06)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        padding: "10px 0",
        textAlign: "center",
        flexShrink: 0
      }}
    >
      {adLabel}
      {status === "empty" && process.env.NODE_ENV === "development" ? (
        <div style={{ width: "100%", minHeight: "250px", background: "#F5F2EB", border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", margin: "12px 0", color: "#64748b", fontSize: "12px", fontFamily: "monospace" }}>
          [ArticleAd: {slotId}] (Unfilled - Dev Mode)
        </div>
      ) : (
        <SlotRenderer config={slot} onStatusChange={setStatus} format="fluid" layout="in-article" />
      )}
    </div>
  );
}

/**
 * GutterAd — 160x600 sticky skyscraper ad for ultra-wide desktop screens.
 */
export function GutterAd({ side }: { side: "left" | "right" }) {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"loading" | "filled" | "empty">("loading");

  useEffect(() => setMounted(true), []);

  if (!ADS_CONFIG.enableAds || !mounted) return null;

  const slotId = side === "left" ? "sidebar-ad-left-2" : "sidebar-ad-right-3";
  const slot = getSlot(slotId);

  if (!slot) return null;

  return (
    <div className="gutter-ad w-full flex flex-col items-center justify-center overflow-hidden" aria-label="Advertisement">
      {adLabel}
      {status === "empty" && process.env.NODE_ENV === "development" ? (
        <div style={{ width: "100%", maxWidth: "160px", height: "600px", background: "#F5F2EB", border: "1px dashed #cbd5e1", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "12px", fontFamily: "monospace", textAlign: "center" }}>
          [Gutter {side} Skyscraper]
        </div>
      ) : (
        <SlotRenderer
          config={slot}
          onStatusChange={setStatus}
          format="vertical"
          style={{ display: "block", width: "100%", maxWidth: "300px", minHeight: "600px" }}
        />
      )}
    </div>
  );
}

/**
 * MobileAnchorAd — Sticky 320x50 / 320x100 bottom anchor ad for Mobile devices.
 * High-viewability mobile unit with user-dismiss toggle to ensure policy compliance and UX.
 */
export function MobileAnchorAd() {
  const [mounted, setMounted] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [status, setStatus] = useState<"loading" | "filled" | "empty">("loading");

  useEffect(() => setMounted(true), []);

  if (!ADS_CONFIG.enableAds || !mounted || isDismissed) return null;

  const slot = getSlot("mobile-anchor");
  if (!slot) return null;

  return (
    <aside
      className="mobile-anchor-ad md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.12)] flex flex-col items-center justify-center pb-[env(safe-area-inset-bottom,0px)] transition-transform duration-300"
      aria-label="Advertisement"
    >
      <div className="relative w-full max-w-[360px] flex flex-col items-center justify-center py-1">
        {/* Dismiss Button */}
        <button
          onClick={() => setIsDismissed(true)}
          aria-label="Close advertisement"
          className="absolute -top-3 right-2 bg-gray-800 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-md hover:bg-gray-900 transition-colors z-10"
        >
          ✕
        </button>

        <p
          aria-hidden="true"
          style={{
            fontSize: 8,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#94a3b8",
            textAlign: "center",
            margin: "0 0 2px",
            userSelect: "none",
            pointerEvents: "none",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          Advertisement
        </p>

        {status === "empty" && process.env.NODE_ENV === "development" ? (
          <div style={{ width: "320px", height: "50px", background: "#F5F2EB", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "10px", fontFamily: "monospace" }}>
            [Mobile Anchor Ad - Dev Mode]
          </div>
        ) : (
          <div className="w-full flex justify-center items-center overflow-hidden min-h-[50px] max-h-[100px]">
            <SlotRenderer
              config={slot}
              onStatusChange={setStatus}
              format="horizontal"
              style={{ display: "inline-block", width: "100%", maxWidth: "320px", minHeight: "50px" }}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
