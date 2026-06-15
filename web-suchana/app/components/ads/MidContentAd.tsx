"use client";

import { ArticleAd } from "../AdUnits";

interface MidContentAdProps {
  slotId?: string;
}

export default function MidContentAd({ slotId = "article-mid-1" }: MidContentAdProps) {
  return <ArticleAd slotId={slotId} placementKey="articleMid" />;
}
