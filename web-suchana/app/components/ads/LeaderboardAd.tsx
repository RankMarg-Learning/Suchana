"use client";

import { LeaderboardAd as AdUnitsLeaderboardAd } from "../AdUnits";

interface LeaderboardAdProps {
  slotId?: string;
}

export default function LeaderboardAd({ slotId = "top-leaderboard-ad" }: LeaderboardAdProps) {
  return <AdUnitsLeaderboardAd id={slotId} />;
}
