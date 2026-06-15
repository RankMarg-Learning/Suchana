"use client";

/**
 * Legacy stub re-export — used by HomeSidebar & SeoExamPageLayout.
 * Delegates to the real AdUnits.SidebarAd so all ad config stays in ads.ts.
 *
 * className values used by callers:
 *   "ad-sidebar ad-s-250"  →  rectangle slot  (home-sidebar-ad)
 *   "ad-sidebar ad-s-120"  →  tall/vertical slot (home-sidebar-ad)
 */
import { SidebarAd as AdUnitsSidebarAd } from "../AdUnits";

interface SidebarAdProps {
  className?: string;
  slotId?: string;
}

export default function SidebarAd({
  className = "ad-sidebar ad-s-250",
  slotId,
}: SidebarAdProps) {
  // Infer slot from className if not explicitly provided
  const resolvedSlotId =
    slotId ??
    (className.includes("ad-s-120") ? "home-sidebar-ad" : "exam-sidebar-ad");

  const isTall = className.includes("ad-s-120");

  return <AdUnitsSidebarAd id={resolvedSlotId} tall={isTall} />;
}
