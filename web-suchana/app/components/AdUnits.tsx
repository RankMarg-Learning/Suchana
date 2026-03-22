"use client";

import React, { useEffect } from "react";
import { ADS_CONFIG } from "../config/ads";

// ─── Google AdSense Helper ───
// Ensures the ad script push is executed safely on client-side
function GoogleAdSenseUnit({ slotId, width, height }: { slotId: string, width: string, height: string }) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error("AdSense Error:", err);
    }
  }, []);

  return (
    <div style={{ width, height, background: "var(--bg-card)", display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
      {/* Actual AdSense Code */}
      <ins 
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "100%" }}
        data-ad-client={ADS_CONFIG.googleAdSensePublisherId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}

// ─── Component Renderers ───

export function LeaderboardAd({ id }: { id: string }) {
  if (!ADS_CONFIG.enableAds) return null;
  const config = ADS_CONFIG.slots[id];
  if (!config) return null; // Failsafe

  return (
    <div className="ad-leaderboard" id={id} aria-label="Advertisement">
      <div className="ad-label">{config.type === "adsense" ? "AdSense" : "Sponsored"}</div>
      
      {config.type === "sponsor" && config.sponsor ? (
        <a href={config.sponsor.link} target="_blank" rel="noopener noreferrer" style={{ display: "block", width: "100%", height: "100%" }}>
          <img 
            src={config.sponsor.imageUrl} 
            alt={config.sponsor.alt} 
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} 
          />
        </a>
      ) : config.type === "adsense" && config.adsenseSlotId ? (
        <GoogleAdSenseUnit slotId={config.adsenseSlotId} width="100%" height="100%" />
      ) : null}
    </div>
  );
}

export function SidebarAd({ id, tall }: { id: string; tall?: boolean }) {
  if (!ADS_CONFIG.enableAds) return null;
  const config = ADS_CONFIG.slots[id];
  if (!config) return null;

  return (
    <div className={`ad-sidebar-unit ${tall ? "ad-sidebar-tall" : ""}`} id={id} aria-label="Advertisement">
      <div className="ad-label">{config.type === "adsense" ? "AdSense" : "Sponsored"}</div>
      
      {config.type === "sponsor" && config.sponsor ? (
        <a href={config.sponsor.link} target="_blank" rel="noopener noreferrer" style={{ display: "block", width: "100%", height: "100%" }}>
          <img 
            src={config.sponsor.imageUrl} 
            alt={config.sponsor.alt} 
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "10px" }} 
          />
        </a>
      ) : config.type === "adsense" && config.adsenseSlotId ? (
        <GoogleAdSenseUnit slotId={config.adsenseSlotId} width="100%" height="100%" />
      ) : null}
    </div>
  );
}

export function InFeedAd({ id, index }: { id: string; index: number }) {
  if (!ADS_CONFIG.enableAds || !ADS_CONFIG.placements.inFeedNativeAds) return null;

  const ads = ADS_CONFIG.inFeedAds;
  if (!ads || ads.length === 0) return null;
  
  const ad = ads[index % ads.length];
  
  return (
    <div className="ad-infeed" id={id} aria-label="Sponsored" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", border: "1px solid var(--border)", borderRadius: "var(--radius-md)" }}>
      <div className="ad-label ad-label-sponsored" style={{ position: "absolute", top: 10, left: 10, zIndex: 5, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>Sponsored</div>
      <a href={ad.link} target="_blank" rel="noopener noreferrer" style={{ display: "block", width: "100%", height: "120px" }}>
        <img 
          src={ad.imageUrl} 
          alt={ad.alt} 
          style={{ width: "100%", height: "100%", objectFit: "cover" }} 
        />
      </a>
    </div>
  );
}
