import { connection } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

type Hitter = {
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

type Pitcher = {
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

const hitterColumns = [
  { label: "選手", key: "player" },
  { label: "チーム", key: "team" },
  { label: "試合数", key: "games" },
  { label: "打席数", key: "plateAppearances" },
  { label: "打率", key: "average" },
  { label: "本塁打", key: "homeRuns" },
  { label: "打点", key: "rbi" },
  { label: "盗塁", key: "stolenBases" },
  { label: "四死球", key: "walksAndHitByPitch" },
  { label: "OPS", key: "ops" },
  { label: "更新時刻", key: "updatedAt" },
] satisfies { label: string; key: keyof Hitter }[];

const pitcherColumns = [
  { label: "選手", key: "player" },
  { label: "チーム", key: "team" },
  { label: "防御率", key: "era" },
  { label: "勝", key: "wins" },
  { label: "敗", key: "losses" },
  { label: "セーブ", key: "saves" },
  { label: "奪三振", key: "strikeouts" },
  { label: "WHIP", key: "whip" },
  { label: "更新時刻", key: "updatedAt" },
] satisfies { label: string; key: keyof Pitcher }[];

type DashboardData = {
  hitters: Hitter[];
  pitchers: Pitcher[];
  errorMessage?: string;
};

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

function toHitter(
  stats: HitterSeasonStatsRow,
  player: PlayerRow | undefined
): Hitter {
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

function toPitcher(
  stats: PitcherSeasonStatsRow,
  player: PlayerRow | undefined
): Pitcher {
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

const CURRENT_SEASON = new Date().getFullYear();

async function getDashboardData(): Promise<DashboardData> {
  await connection();

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
    (stats) => toHitter(stats, playerMap.get(stats.player_id))
  );
  const pitchers = (
    (pitchersResult.data ?? []) as PitcherSeasonStatsRow[]
  ).map((stats) => toPitcher(stats, playerMap.get(stats.player_id)));

  return { hitters, pitchers };
}

function StatsSection<T extends Record<string, string | number>>({
  title,
  description,
  columns,
  rows,
}: {
  title: string;
  description: string;
  columns: { label: string; key: keyof T }[];
  rows: T[];
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-zinc-950">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-zinc-600">{description}</p>
      </div>

      {rows.length > 0 ? (
        <div className="hidden overflow-x-auto rounded-lg border border-zinc-200 bg-white shadow-sm md:block">
          <table className="w-full min-w-max border-collapse text-left text-sm">
            <thead className="bg-zinc-100 text-xs font-semibold uppercase tracking-wide text-zinc-600">
              <tr>
                {columns.map((column) => (
                  <th key={String(column.key)} className="px-4 py-3">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.map((row) => (
                <tr key={String(row.id)} className="hover:bg-zinc-50">
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-4 py-4 text-zinc-800 first:font-medium first:text-zinc-950"
                    >
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-600">
          データがありません
        </div>
      ) : (
        <div className="grid gap-3 md:hidden">
          {rows.map((row) => (
            <article
              key={String(row.id)}
              className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3 border-b border-zinc-100 pb-3">
                <div>
                  <h3 className="font-semibold text-zinc-950">{row.player}</h3>
                  <p className="mt-1 text-sm text-zinc-600">{row.team}</p>
                </div>
                <p className="text-right text-xs leading-5 text-zinc-500">
                  {row.updatedAt}
                </p>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                {columns.slice(2, -1).map((column) => (
                  <div
                    key={String(column.key)}
                    className="rounded-md bg-zinc-50 p-3"
                  >
                    <dt className="text-xs text-zinc-500">{column.label}</dt>
                    <dd className="mt-1 font-semibold text-zinc-950">
                      {row[column.key]}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default async function Home() {
  const { hitters, pitchers, errorMessage } = await getDashboardData();

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-medium text-emerald-700">Supabase Data</p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            日本人メジャーリーガー最新情報
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-600 sm:text-base">
            日本人MLB選手の主要成績をSupabaseから取得して表示しています。
          </p>
        </header>

        {errorMessage ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <StatsSection
          title="野手成績"
          description="打撃成績と走塁指標を確認できます。"
          columns={hitterColumns}
          rows={hitters}
        />

        <StatsSection
          title="投手成績"
          description="先発・救援投手の主要な投球成績を確認できます。"
          columns={pitcherColumns}
          rows={pitchers}
        />
      </div>
    </main>
  );
}
