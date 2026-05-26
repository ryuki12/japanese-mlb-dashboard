import { connection } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";

type Hitter = {
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

type DbRow = Record<string, unknown>;

type DashboardData = {
  hitters: Hitter[];
  pitchers: Pitcher[];
  errorMessage?: string;
};

function getValue(row: DbRow | undefined, keys: string[]) {
  if (!row) {
    return undefined;
  }

  return keys.map((key) => row[key]).find((value) => value != null);
}

function getString(row: DbRow | undefined, keys: string[], fallback = "") {
  const value = getValue(row, keys);

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return fallback;
}

function getNumber(row: DbRow | undefined, keys: string[], fallback = 0) {
  const value = getValue(row, keys);

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function formatRate(value: unknown, digits: number) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value !== "number") {
    return "-";
  }

  const formatted = value.toFixed(digits);
  return value > 0 && value < 1 ? formatted.replace(/^0/, "") : formatted;
}

function formatUpdatedAt(value: unknown) {
  if (typeof value !== "string" || value.length === 0) {
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

function getPlayerId(row: DbRow) {
  return getString(row, ["id", "player_id"]);
}

function createPlayerMap(players: DbRow[]) {
  return new Map(players.map((player) => [getPlayerId(player), player]));
}

function getPlayerName(player: DbRow | undefined, stats: DbRow) {
  return getString(
    player,
    ["name", "name_ja", "player_name", "full_name"],
    getString(stats, ["player_name", "name"], "-")
  );
}

function getTeamName(player: DbRow | undefined, stats: DbRow) {
  return getString(
    stats,
    ["team", "team_name"],
    getString(player, ["team", "team_name"], "-")
  );
}

function toHitter(stats: DbRow, player: DbRow | undefined): Hitter {
  const walksAndHitByPitch =
    getNumber(stats, ["walks_and_hit_by_pitch", "bb_hbp"], Number.NaN) ||
    getNumber(stats, ["walks", "base_on_balls", "bb"]) +
      getNumber(stats, ["hit_by_pitch", "hit_by_pitches", "hbp"]);

  return {
    player: getPlayerName(player, stats),
    team: getTeamName(player, stats),
    games: getNumber(stats, ["games", "games_played", "g"]),
    plateAppearances: getNumber(stats, ["plate_appearances", "pa"]),
    average: formatRate(
      getValue(stats, ["batting_average", "average", "avg"]),
      3
    ),
    homeRuns: getNumber(stats, ["home_runs", "hr"]),
    rbi: getNumber(stats, ["rbi", "runs_batted_in"]),
    stolenBases: getNumber(stats, ["stolen_bases", "sb"]),
    walksAndHitByPitch,
    ops: formatRate(getValue(stats, ["ops"]), 3),
    updatedAt: formatUpdatedAt(
      getValue(stats, ["updated_at", "last_updated_at"])
    ),
  };
}

function toPitcher(stats: DbRow, player: DbRow | undefined): Pitcher {
  return {
    player: getPlayerName(player, stats),
    team: getTeamName(player, stats),
    era: formatRate(getValue(stats, ["era", "earned_run_average"]), 2),
    wins: getNumber(stats, ["wins", "w"]),
    losses: getNumber(stats, ["losses", "l"]),
    saves: getNumber(stats, ["saves", "sv"]),
    strikeouts: getNumber(stats, ["strikeouts", "so", "k"]),
    whip: formatRate(getValue(stats, ["whip"]), 2),
    updatedAt: formatUpdatedAt(
      getValue(stats, ["updated_at", "last_updated_at"])
    ),
  };
}

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
    supabase.client.from("players").select("*"),
    supabase.client.from("hitter_season_stats").select("*"),
    supabase.client.from("pitcher_season_stats").select("*"),
  ]);

  const error =
    playersResult.error ?? hittersResult.error ?? pitchersResult.error;

  if (error) {
    return {
      hitters: [],
      pitchers: [],
      errorMessage: "データの取得に失敗しました。",
    };
  }

  const players = (playersResult.data ?? []) as DbRow[];
  const playerMap = createPlayerMap(players);
  const hitters = ((hittersResult.data ?? []) as DbRow[]).map((stats) =>
    toHitter(stats, playerMap.get(getString(stats, ["player_id"])))
  );
  const pitchers = ((pitchersResult.data ?? []) as DbRow[]).map((stats) =>
    toPitcher(stats, playerMap.get(getString(stats, ["player_id"])))
  );

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
                <tr key={String(row.player)} className="hover:bg-zinc-50">
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
              key={String(row.player)}
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
