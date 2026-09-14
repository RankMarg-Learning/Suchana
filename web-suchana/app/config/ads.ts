export type AdType = "sponsor" | "adsense";

export type SponsorBanner = {
  imageUrl: string;
  link: string;
  alt: string;
};

export type AdSlotConfig = {
  type: AdType;
  adsenseSlotId?: string;
  sponsor?: SponsorBanner;
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
    inFeedNativeAds: true, // Enabled for AdSense Native/In-Feed
    // Article page placements
    articleTop: true,    // Banner just below the hero image
    articleMid: true,    // Auto-injected mid-content ads
    articleBottom: true, // Banner after article body, before FAQs
  },

  slots: {
    // Leaderboards
    "top-leaderboard-ad": { type: "adsense", adsenseSlotId: "3262405422" },
    "feed-mid-leaderboard": { type: "adsense", adsenseSlotId: "3262405422" },
    "bottom-leaderboard-ad": { type: "adsense", adsenseSlotId: "3262405422" },
    
    // Mobile Anchor
    "mobile-anchor": { type: "adsense", adsenseSlotId: "5758558240" },

    // Sidebar Rectangle Ads
    "sidebar-ad-left-1": { type: "adsense", adsenseSlotId: "5246027788" },
    "sidebar-ad-right-1": { type: "adsense", adsenseSlotId: "5246027788" },
    "sidebar-ad-right-2": { type: "adsense", adsenseSlotId: "5246027788" },

    // Sidebar Gutter Ads
    "sidebar-ad-left-2": { type: "adsense", adsenseSlotId: "5881607554" },
    "sidebar-ad-right-3": { type: "adsense", adsenseSlotId: "5881607554" },

    // General sidebar slots
    "home-sidebar-ad": { type: "adsense", adsenseSlotId: "5881607554" },
    "exam-sidebar-ad": { type: "adsense", adsenseSlotId: "5246027788" },

    // Detail Page Sidebar
    "exam-top-leaderboard": { type: "adsense", adsenseSlotId: "5246027788" },
    "detail-left-ad-1": { type: "adsense", adsenseSlotId: "5246027788" },
    "detail-left-ad-2": { type: "adsense", adsenseSlotId: "5246027788" },
    "detail-right-ad-1": { type: "adsense", adsenseSlotId: "5246027788" },
    "detail-right-ad-2": { type: "adsense", adsenseSlotId: "5246027788" },
    "detail-right-ad-3": { type: "adsense", adsenseSlotId: "5246027788" },
    "exam-bottom-leaderboard": { type: "adsense", adsenseSlotId: "3262405422" },

    // In-Article Slots
    "article-top": { type: "adsense", adsenseSlotId: "3921303403" },
    "article-mid-1": { type: "adsense", adsenseSlotId: "3921303403" },
    "article-mid-2": { type: "adsense", adsenseSlotId: "3921303403" },
    "article-bottom": { type: "adsense", adsenseSlotId: "3921303403" },
    
    // In-Feed Native Ad
    "in-feed-native": { type: "adsense", adsenseSlotId: "3921303403" } // Reusing in-article for native feed natively
  },

  inFeedAds: [],
  inFeedAdFrequency: 4,
  inArticleAdFrequency: 0,
};
