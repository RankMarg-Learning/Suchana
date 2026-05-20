"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface SidebarAdProps {
  className?: string;
}

export default function SidebarAd({ className = "ad-sidebar ad-s-250" }: SidebarAdProps) {
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    try {
      if (adRef.current && !adRef.current.hasAttribute("data-ad-status")) {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, []);

  return (
    <div className={className}>
      <Script
        id="adsbygoogle-init-sidebar"
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
        style={{ display: "block" }}
        data-ad-client="ca-pub-6631120605146752"
        data-ad-slot="5246027788"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
