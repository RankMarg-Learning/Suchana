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
  /**
   * Auto-inject an ad every N paragraphs/headings inside article body.
   * Set to 0 to disable auto-injection (manual [AD: slotId] only).
   */
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
    inFeedNativeAds: false, // Sponsored items inside the exams list feed
    // Article page placements
    articleTop: true,    // Banner just below the hero image
    articleMid: true,    // Auto-injected mid-content ads
    articleBottom: true, // Banner after article body, before FAQs
  },

  // Hybrid Ad Slots: Choose either "sponsor" (Custom Image) OR "adsense" (Google Ads) per slot!
  slots: {
    // Feed Home Page IDs — Leaderboard
    // Slot ID: 3262405422  |  Publisher: ca-pub-6631120605146752
    "top-leaderboard-ad": {
      type: "adsense",
      adsenseSlotId: "3262405422",
    },
    "feed-mid-leaderboard": {
      type: "adsense",
      adsenseSlotId: "3262405422",
    },
    "bottom-leaderboard-ad": {
      type: "adsense",
      adsenseSlotId: "3262405422",
    },

    // Sidebar IDs — Rectangle Ads  (300×250)
    // Slot ID: 5246027788  |  Publisher: ca-pub-6631120605146752
    "sidebar-ad-left-1": { type: "adsense", adsenseSlotId: "5246027788" },
    "sidebar-ad-right-1": { type: "adsense", adsenseSlotId: "5246027788" },
    "sidebar-ad-right-2": { type: "adsense", adsenseSlotId: "5246027788" },

    // Sidebar IDs — Left & Right Vertical Ads  (tall, 160×600 / auto)
    // Slot ID: 5881607554  |  Publisher: ca-pub-6631120605146752
    "sidebar-ad-left-2": { type: "adsense", adsenseSlotId: "5881607554" },
    "sidebar-ad-right-3": { type: "adsense", adsenseSlotId: "5881607554" },

    // General sidebar slot used by HomeSidebar & SeoExamPageLayout
    "home-sidebar-ad": { type: "adsense", adsenseSlotId: "5881607554" },
    "exam-sidebar-ad": { type: "adsense", adsenseSlotId: "5246027788" },

    // Detail Page Sidebar IDs — Rectangle Ads (same slot)
    "exam-top-leaderboard": { type: "adsense", adsenseSlotId: "5246027788" },
    "detail-left-ad-1": { type: "adsense", adsenseSlotId: "5246027788" },
    "detail-left-ad-2": { type: "adsense", adsenseSlotId: "5246027788" },
    "detail-right-ad-1": { type: "adsense", adsenseSlotId: "5246027788" },
    "detail-right-ad-2": { type: "adsense", adsenseSlotId: "5246027788" },
    "detail-right-ad-3": { type: "adsense", adsenseSlotId: "5246027788" },
    "exam-bottom-leaderboard": { type: "adsense", adsenseSlotId: "3262405422" },

    // ── In-Article Slots ───────────────────────────────────────────────────────
    // All use the same In-Article ad slot from Google AdSense.
    // Slot ID: 3921303403  |  Publisher: ca-pub-6631120605146752
    // Place [AD: article-mid-1] or [AD: article-mid-2] anywhere in Markdown.
    "article-top": {
      type: "adsense",
      adsenseSlotId: "3921303403",
    },
    "article-mid-1": {
      type: "adsense",
      adsenseSlotId: "3921303403",
    },
    "article-mid-2": {
      type: "adsense",
      adsenseSlotId: "3921303403",
    },
    "article-bottom": {
      type: "adsense",
      adsenseSlotId: "3921303403",
    },
  },

  // In-Feed Native Sponsored Content
  // These are inherently "sponsor" type since they blend into the feed. 
  // You can still leave this array empty to disable them.
  inFeedAds: [

  ],

  // In-feed appearance frequency
  inFeedAdFrequency: 4, // Show an in-feed ad every 4 items

  // In-article auto-injection frequency (0 = manual [AD:] shortcodes only)
  inArticleAdFrequency: 0,
};
