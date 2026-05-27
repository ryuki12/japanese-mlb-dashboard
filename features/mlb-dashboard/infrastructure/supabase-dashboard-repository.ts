import { createSupabaseClient } from "@/lib/supabase";
import type {
  DashboardData,
  HitterStats,
  PitcherStats,
} from "../domain/stats";

const CURRENT_SEASON = new Date().getFullYear();

type PlayerRow = {
  id: number;
  mlbam_id: number | null;
  name_ja: string;
  name_en: string;
  team_abbr: string;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type HitterSeasonStatsRow = {
  id: number;
  player_id: number;
  season: number;
  avg: string;
  home_runs: number;
  rbi: number;
  stolen_bases: number;
  ops: string;
  updated_at: string;
  games: number;
  plate_appearances: number;
  at_bats: number;
  hits: number;
  walks: number;
  hit_by_pitch: number;
};

type PitcherSeasonStatsRow = {
  id: number;
  player_id: number;
  season: number;
  era: string;
  wins: number;
  losses: number;
  saves: number;
  strikeouts: number;
  whip: string;
  updated_at: string;
};

function formatUpdatedAt(value: string) {
  if (value.length === 0) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createPlayerMap(players: PlayerRow[]) {
  return new Map(players.map((player) => [player.id, player]));
}

function toHitterStats(
  stats: HitterSeasonStatsRow,
  player: PlayerRow | undefined
): HitterStats {
  return {
    id: stats.id,
    player: player?.name_ja ?? "-",
    team: player?.team_abbr ?? "-",
    games: stats.games,
    plateAppearances: stats.plate_appearances,
    average: stats.avg,
    homeRuns: stats.home_runs,
    rbi: stats.rbi,
    stolenBases: stats.stolen_bases,
    walksAndHitByPitch: stats.walks + stats.hit_by_pitch,
    ops: stats.ops,
    updatedAt: formatUpdatedAt(stats.updated_at),
  };
}

function toPitcherStats(
  stats: PitcherSeasonStatsRow,
  player: PlayerRow | undefined
): PitcherStats {
  return {
    id: stats.id,
    player: player?.name_ja ?? "-",
    team: player?.team_abbr ?? "-",
    era: stats.era,
    wins: stats.wins,
    losses: stats.losses,
    saves: stats.saves,
    strikeouts: stats.strikeouts,
    whip: stats.whip,
    updatedAt: formatUpdatedAt(stats.updated_at),
  };
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const supabase = createSupabaseClient();

  if (!supabase.ok) {
    return {
      hitters: [],
      pitchers: [],
      errorMessage: supabase.message,
    };
  }

  const [playersResult, hittersResult, pitchersResult] = await Promise.all([
    supabase.client
      .from("players")
      .select(
        "id, mlbam_id, name_ja, name_en, team_abbr, type, is_active, created_at, updated_at"
      )
      .eq("is_active", true),
    supabase.client
      .from("hitter_season_stats")
      .select(
        "id, player_id, season, avg, home_runs, rbi, stolen_bases, ops, updated_at, games, plate_appearances, at_bats, hits, walks, hit_by_pitch"
      )
      .eq("season", CURRENT_SEASON),
    supabase.client
      .from("pitcher_season_stats")
      .select(
        "id, player_id, season, era, wins, losses, saves, strikeouts, whip, updated_at"
      )
      .eq("season", CURRENT_SEASON),
  ]);

  const errors = [
    playersResult.error,
    hittersResult.error,
    pitchersResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    console.error("Supabase query errors:", errors);
    return {
      hitters: [],
      pitchers: [],
      errorMessage: "データの取得に失敗しました。",
    };
  }

  const players = (playersResult.data ?? []) as PlayerRow[];
  const playerMap = createPlayerMap(players);
  const hitters = ((hittersResult.data ?? []) as HitterSeasonStatsRow[]).map(
    (stats) => toHitterStats(stats, playerMap.get(stats.player_id))
  );
  const pitchers = (
    (pitchersResult.data ?? []) as PitcherSeasonStatsRow[]
  ).map((stats) => toPitcherStats(stats, playerMap.get(stats.player_id)));

  return { hitters, pitchers };
}
