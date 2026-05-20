"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

export default function LeaderboardAd() {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const pushAd = () => {
      try {
        if (adRef.current && !adRef.current.hasAttribute("data-ad-status")) {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (e) {
        console.error("AdSense error:", e);
      }
    };

    timeoutId = setTimeout(pushAd, 200);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="wrap-home" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="ad-leader" style={{ margin: "16px 0 0", overflow: "hidden", display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Script
          id="adsbygoogle-init-leaderboard"
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6631120605146752"
          crossOrigin="anonymous"
        />
        <div className="ad-label" style={{ fontSize: "10px", color: "var(--text3)", marginBottom: "4px", width: "100%", textAlign: "left" }}>
          Advertisement
        </div>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "inline-block", width: "728px", maxWidth: "100%", height: "90px", background: "rgba(0,0,0,0.02)", borderRadius: "8px" }}
          data-ad-client="ca-pub-6631120605146752"
          data-ad-slot="3262405422"
          data-ad-format="horizontal"
          data-full-width-responsive="false"
        />
      </div>
    </div>
  );
}
