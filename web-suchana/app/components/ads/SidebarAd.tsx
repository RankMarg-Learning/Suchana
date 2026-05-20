"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface SidebarAdProps {
  className?: string;
}

export default function SidebarAd({ className = "ad-sidebar ad-s-250" }: SidebarAdProps) {
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
    <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: "hidden", margin: "16px 0" }}>
      <Script
        id="adsbygoogle-init-sidebar"
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
        style={{ display: "inline-block", width: "300px", height: "250px", background: "rgba(0,0,0,0.02)", borderRadius: "8px" }}
        data-ad-client="ca-pub-6631120605146752"
        data-ad-slot="5246027788"
      />
    </div>
  );
}
