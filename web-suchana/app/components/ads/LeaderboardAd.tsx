"use client";

import { LeaderboardAd as AdUnitsLeaderboardAd } from "../AdUnits";

interface LeaderboardAdProps {
  slotId?: string;
  id?: string;
}

export default function LeaderboardAd({ slotId, id }: LeaderboardAdProps) {
  const targetId = id || slotId || "top-leaderboard-ad";
  return <AdUnitsLeaderboardAd id={targetId} />;
}
