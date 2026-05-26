import { createSupabaseServerClient } from "@/lib/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

type PlayerRow = {
  id: number;
  mlbam_id: number;
  name_ja: string;
  type: "hitter" | "pitcher";
};

type MlbStatSplit = {
  stat?: Record<string, string | number | undefined>;
};

type MlbStatsResponse = {
  stats?: {
    splits?: MlbStatSplit[];
  }[];
};

type PlayerUpdateResult = {
  playerId: number;
  mlbamId: number;
  name: string;
  type: PlayerRow["type"];
  status: "updated" | "skipped" | "failed";
  message?: string;
};

type HitterSeasonStatsUpsert = {
  player_id: number;
  season: number;
  avg: string;
  home_runs: number;
  rbi: number;
  stolen_bases: number;
  ops: string;
  games: number;
  plate_appearances: number;
  at_bats: number;
  hits: number;
  walks: number;
  hit_by_pitch: number;
  updated_at: string;
};

type PitcherSeasonStatsUpsert = {
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

const MLB_STATS_API_BASE_URL = "https://statsapi.mlb.com/api/v1";

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-cron-secret");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;

  return bearerToken === cronSecret || headerSecret === cronSecret;
}

function currentSeason() {
  return new Date().getFullYear();
}

function getStringStat(
  stat: Record<string, string | number | undefined>,
  key: string,
  fallback = ".000"
) {
  const value = stat[key];

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
}

function getNumberStat(
  stat: Record<string, string | number | undefined>,
  key: string
) {
  const value = stat[key];

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

async function fetchMlbSeasonStat(
  mlbamId: number,
  group: "hitting" | "pitching",
  season: number
) {
  const params = new URLSearchParams({
    stats: "season",
    group,
    season: String(season),
  });
  const response = await fetch(
    `${MLB_STATS_API_BASE_URL}/people/${mlbamId}/stats?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    throw new Error(`MLB Stats API returned ${response.status}`);
  }

  const data = (await response.json()) as MlbStatsResponse;
  return data.stats?.[0]?.splits?.[0]?.stat;
}

function toHitterUpsert(
  playerId: number,
  season: number,
  stat: Record<string, string | number | undefined>
): HitterSeasonStatsUpsert {
  return {
    player_id: playerId,
    season,
    avg: getStringStat(stat, "avg"),
    home_runs: getNumberStat(stat, "homeRuns"),
    rbi: getNumberStat(stat, "rbi"),
    stolen_bases: getNumberStat(stat, "stolenBases"),
    ops: getStringStat(stat, "ops"),
    games: getNumberStat(stat, "gamesPlayed"),
    plate_appearances: getNumberStat(stat, "plateAppearances"),
    at_bats: getNumberStat(stat, "atBats"),
    hits: getNumberStat(stat, "hits"),
    walks: getNumberStat(stat, "baseOnBalls"),
    hit_by_pitch: getNumberStat(stat, "hitByPitch"),
    updated_at: new Date().toISOString(),
  };
}

function toPitcherUpsert(
  playerId: number,
  season: number,
  stat: Record<string, string | number | undefined>
): PitcherSeasonStatsUpsert {
  return {
    player_id: playerId,
    season,
    era: getStringStat(stat, "era", "0.00"),
    wins: getNumberStat(stat, "wins"),
    losses: getNumberStat(stat, "losses"),
    saves: getNumberStat(stat, "saves"),
    strikeouts: getNumberStat(stat, "strikeOuts"),
    whip: getStringStat(stat, "whip", "0.00"),
    updated_at: new Date().toISOString(),
  };
}

async function updatePlayerStats(
  supabase: SupabaseClient,
  player: PlayerRow,
  season: number
): Promise<PlayerUpdateResult> {
  try {
    const group = player.type === "hitter" ? "hitting" : "pitching";
    const stat = await fetchMlbSeasonStat(player.mlbam_id, group, season);

    if (!stat) {
      return {
        playerId: player.id,
        mlbamId: player.mlbam_id,
        name: player.name_ja,
        type: player.type,
        status: "skipped",
        message: "今季成績が見つかりませんでした。",
      };
    }

    if (player.type === "hitter") {
      const { error } = await supabase
        .from("hitter_season_stats")
        .upsert(toHitterUpsert(player.id, season, stat), {
          onConflict: "player_id,season",
        });

      if (error) {
        throw error;
      }
    } else {
      const { error } = await supabase
        .from("pitcher_season_stats")
        .upsert(toPitcherUpsert(player.id, season, stat), {
          onConflict: "player_id,season",
        });

      if (error) {
        throw error;
      }
    }

    return {
      playerId: player.id,
      mlbamId: player.mlbam_id,
      name: player.name_ja,
      type: player.type,
      status: "updated",
    };
  } catch (error) {
    return {
      playerId: player.id,
      mlbamId: player.mlbam_id,
      name: player.name_ja,
      type: player.type,
      status: "failed",
      message: error instanceof Error ? error.message : "更新に失敗しました。",
    };
  }
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createSupabaseServerClient();

  if (!supabase.ok) {
    return Response.json({ error: supabase.message }, { status: 500 });
  }

  const season = currentSeason();
  const { data: players, error } = await supabase.client
    .from("players")
    .select("id, mlbam_id, name_ja, type")
    .eq("is_active", true)
    .in("type", ["hitter", "pitcher"]);

  if (error) {
    return Response.json(
      { error: "選手データの取得に失敗しました。" },
      { status: 500 }
    );
  }

  const results: PlayerUpdateResult[] = [];

  for (const player of (players ?? []) as PlayerRow[]) {
    results.push(await updatePlayerStats(supabase.client, player, season));
  }

  const summary = results.reduce(
    (counts, result) => {
      counts[result.status] += 1;
      return counts;
    },
    { updated: 0, skipped: 0, failed: 0 }
  );

  return Response.json({
    season,
    totalPlayers: results.length,
    summary,
    results,
  });
}
