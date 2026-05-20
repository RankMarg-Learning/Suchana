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
          const width = adRef.current.clientWidth || adRef.current.parentElement?.clientWidth || 0;
          if (width > 0) {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
          } else {
            timeoutId = setTimeout(pushAd, 200);
          }
        }
      } catch (e) {
        console.error("AdSense error:", e);
      }
    };

    timeoutId = setTimeout(pushAd, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className="wrap-home">
      <div className="ad-leader" style={{ margin: "16px 0 0", textAlign: "center", overflow: "hidden", minHeight: "90px" }}>
        <Script
          id="adsbygoogle-init"
          strategy="afterInteractive"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6631120605146752"
          crossOrigin="anonymous"
        />
        <div className="ad-label" style={{ fontSize: "10px", color: "var(--text3)", marginBottom: "4px", textAlign: "left" }}>
          Advertisement
        </div>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%", minWidth: "250px" }}
          data-ad-client="ca-pub-6631120605146752"
          data-ad-slot="3262405422"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
