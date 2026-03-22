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
  };
  slots: Record<string, AdSlotConfig>;
  inFeedAds: SponsorBanner[];
  inFeedAdFrequency: number;
} = {
  // Global Ad Settings
  enableAds: false, // Master switch for all ads anywhere
  googleAdSensePublisherId: "ca-pub-XXXXXXXXXXXXXXXX", // Your Master AdSense Publisher ID

  // Placement Feature Flags (Enable/Disable individual zones entirely)
  placements: {
    sidebarLeft: false,
    sidebarRight: false,
    feedTopLeaderboard: false,
    feedMidLeaderboard: false,
    inFeedNativeAds: false, // Sponsored items inside the exams list feed
  },

  // Hybrid Ad Slots: Choose either "sponsor" (Custom Image) OR "adsense" (Google Ads) per slot!
  slots: {
    // Feed Home Page IDs
    "top-leaderboard-ad": {
      type: "sponsor",
      adsenseSlotId: "1111111111",
      sponsor: { imageUrl: "https://placehold.co/728x90/3b0764/fff?text=Sponsor+Leaderboard", link: "#", alt: "Sponsor Ad" }
    },
    "feed-mid-leaderboard": {
      type: "adsense",
      adsenseSlotId: "2222222222",
    },
    "bottom-leaderboard-ad": {
      type: "sponsor",
      sponsor: { imageUrl: "https://placehold.co/728x90/3b0764/fff?text=Bottom+Leaderboard", link: "#", alt: "Sponsor Ad" }
    },

    // Sidebar IDs
    "sidebar-ad-left-1": {
      type: "adsense",
      adsenseSlotId: "3333333333",
    },
    "sidebar-ad-left-2": {
      type: "sponsor",
      sponsor: { imageUrl: "https://placehold.co/300x600/1e1e24/fff?text=Sponsor+Left+Tall", link: "#", alt: "Sponsor Ad" }
    },
    "sidebar-ad-right-1": {
      type: "adsense",
      adsenseSlotId: "4444444444",
    },
    "sidebar-ad-right-2": {
      type: "sponsor",
      sponsor: { imageUrl: "https://placehold.co/300x250/1e1e24/fff?text=Sponsor+Right+2", link: "#", alt: "Sponsor Ad" }
    },
    "sidebar-ad-right-3": {
      type: "adsense",
      adsenseSlotId: "5555555555",
    },

    // Detail Page IDs
    "exam-top-leaderboard": { type: "adsense", adsenseSlotId: "6666666666" },
    "detail-left-ad-1": { type: "sponsor", sponsor: { imageUrl: "https://placehold.co/300x250/3b0764/fff?text=Detail+Left", link: "#", alt: "Ad" } },
    "detail-left-ad-2": { type: "adsense", adsenseSlotId: "7777777777" },
    "detail-right-ad-1": { type: "adsense", adsenseSlotId: "8888888888" },
    "detail-right-ad-2": { type: "sponsor", sponsor: { imageUrl: "https://placehold.co/300x250/1e1e24/fff?text=Detail+Right", link: "#", alt: "Ad" } },
    "detail-right-ad-3": { type: "adsense", adsenseSlotId: "9999999999" },
    "exam-bottom-leaderboard": { type: "adsense", adsenseSlotId: "0000000000" },
  },

  // In-Feed Native Sponsored Content
  // These are inherently "sponsor" type since they blend into the feed. 
  // You can still leave this array empty to disable them.
  inFeedAds: [
    {
      imageUrl: "https://placehold.co/600x120/7c3aed/fff?text=UPSC+Masterclass",
      link: "https://example.com/upsc",
      alt: "Master UPSC in 6 Months",
    },
    {
      imageUrl: "https://placehold.co/600x120/3b82f6/fff?text=RRB+Mock+Tests",
      link: "https://example.com/rrb",
      alt: "RRB Mock Tests 2025",
    },
    {
      imageUrl: "https://placehold.co/600x120/10b981/fff?text=Banking+Exam+App",
      link: "https://example.com/banking",
      alt: "Banking Exam Prep App",
    },
  ],

  // In-feed appearance frequency
  inFeedAdFrequency: 4, // Show an in-feed ad every 4 items
};
