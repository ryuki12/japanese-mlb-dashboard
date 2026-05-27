export type HitterStats = {
  id: number;
  player: string;
  team: string;
  games: number;
  plateAppearances: number;
  average: string;
  homeRuns: number;
  rbi: number;
  stolenBases: number;
  walksAndHitByPitch: number;
  ops: string;
  updatedAt: string;
};

export type PitcherStats = {
  id: number;
  player: string;
  team: string;
  era: string;
  wins: number;
  losses: number;
  saves: number;
  strikeouts: number;
  whip: string;
  updatedAt: string;
};

export type DashboardData = {
  hitters: HitterStats[];
  pitchers: PitcherStats[];
  errorMessage?: string;
};
