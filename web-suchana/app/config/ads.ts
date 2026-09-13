export type AdType = "sponsor" | "adsense" | "adsterra";

export type SponsorBanner = {
  imageUrl: string;
  link: string;
  alt: string;
};

export type AdsterraConfig = {
  key: string;
  format: "banner" | "native";
  width?: number;
  height?: number;
};

export type AdSlotConfig = {
  type: AdType;
  adsenseSlotId?: string;
  sponsor?: SponsorBanner;
  adsterra?: AdsterraConfig;
};

export const ADS_CONFIG: {
  enableAds: boolean;
  googleAdSensePublisherId: string;
  placements: {
    sidebarLeft: boolean;
    sidebarRight: boolean;
    feedTopLeaderboard: boolean;
    feedMidLeaderboard: boolean;
    inFeedNativeAds: boolean;
    // Article page placements
    articleTop: boolean;
    articleMid: boolean;
    articleBottom: boolean;
  };
  slots: Record<string, AdSlotConfig>;
  inFeedAds: SponsorBanner[];
  inFeedAdFrequency: number;
  inArticleAdFrequency: number;
} = {
  // Global Ad Settings
  enableAds: true, // Master switch for all ads anywhere
  googleAdSensePublisherId: "ca-pub-6631120605146752",

  // Placement Feature Flags (Enable/Disable individual zones entirely)
  placements: {
    sidebarLeft: true,
    sidebarRight: true,
    feedTopLeaderboard: true,
    feedMidLeaderboard: true,
    inFeedNativeAds: true, // Enabled for Adsterra Native
    // Article page placements
    articleTop: true,    // Banner just below the hero image
    articleMid: true,    // Auto-injected mid-content ads
    articleBottom: true, // Banner after article body, before FAQs
  },

  slots: {
    // Top Leaderboard: AdSense
    "top-leaderboard-ad": {
      type: "adsense",
      adsenseSlotId: "3262405422",
    },
    // Mid Leaderboard: Adsterra 468x60
    "feed-mid-leaderboard": {
      type: "adsterra",
      adsterra: { key: "7fd519d964a6db689dacc428394b9b02", format: "banner", width: 468, height: 60 }
    },
    // Bottom Leaderboard: Adsterra 728x90
    "bottom-leaderboard-ad": {
      type: "adsterra",
      adsterra: { key: "cd02348c4c2fe249a78719eb7148f51c", format: "banner", width: 728, height: 90 }
    },
    // Mobile Anchor: Adsterra 320x50
    "mobile-anchor": {
      type: "adsterra",
      adsterra: { key: "281934343ae0be5a3ded4f6a2d0d16be", format: "banner", width: 320, height: 50 }
    },

    // Sidebar Rectangle Ads
    "sidebar-ad-left-1": { type: "adsense", adsenseSlotId: "5246027788" },
    "sidebar-ad-right-1": { 
      type: "adsterra", 
      adsterra: { key: "884dc6d693d98eb7af5778e41efd4258", format: "banner", width: 300, height: 250 } 
    },
    "sidebar-ad-right-2": { 
      type: "adsterra", 
      adsterra: { key: "c13cbe25abaca837d7f8cd69a4753719", format: "banner", width: 160, height: 300 } 
    },

    // Sidebar Gutter Ads
    "sidebar-ad-left-2": { type: "adsense", adsenseSlotId: "5881607554" },
    "sidebar-ad-right-3": { 
      type: "adsterra", 
      adsterra: { key: "ac1599dec5b9c617f957f01982cc3b89", format: "banner", width: 160, height: 600 } 
    },

    // General sidebar slots
    "home-sidebar-ad": { type: "adsense", adsenseSlotId: "5881607554" },
    "exam-sidebar-ad": { type: "adsense", adsenseSlotId: "5246027788" },

    // Detail Page Sidebar
    "exam-top-leaderboard": { type: "adsense", adsenseSlotId: "5246027788" },
    "detail-left-ad-1": { type: "adsense", adsenseSlotId: "5246027788" },
    "detail-left-ad-2": { type: "adsense", adsenseSlotId: "5246027788" },
    "detail-right-ad-1": { 
      type: "adsterra", 
      adsterra: { key: "884dc6d693d98eb7af5778e41efd4258", format: "banner", width: 300, height: 250 } 
    },
    "detail-right-ad-2": { type: "adsense", adsenseSlotId: "5246027788" },
    "detail-right-ad-3": { type: "adsense", adsenseSlotId: "5246027788" },
    "exam-bottom-leaderboard": { type: "adsense", adsenseSlotId: "3262405422" },

    // In-Article Slots
    "article-top": { type: "adsense", adsenseSlotId: "3921303403" },
    "article-mid-1": { type: "adsense", adsenseSlotId: "3921303403" },
    "article-mid-2": { type: "adsense", adsenseSlotId: "3921303403" },
    "article-bottom": { type: "adsense", adsenseSlotId: "3921303403" },
    
    // In-Feed Native Ad
    "in-feed-native": {
      type: "adsterra",
      adsterra: { key: "b26b06afa7d490c25edb32a002a750d5", format: "native" }
    }
  },

  inFeedAds: [],
  inFeedAdFrequency: 4,
  inArticleAdFrequency: 0,
};
