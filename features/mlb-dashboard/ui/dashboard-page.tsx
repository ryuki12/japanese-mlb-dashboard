import type {
  DashboardData,
  HitterStats,
  PitcherStats,
} from "../domain/stats";
import { StatsSection } from "./stats-section";

const hitterColumns = [
  { label: "選手", key: "player", preferredDirection: "asc" },
  { label: "チーム", key: "team", preferredDirection: "asc" },
  { label: "試合数", key: "games" },
  { label: "打席数", key: "plateAppearances" },
  { label: "打率", key: "average" },
  { label: "本塁打", key: "homeRuns" },
  { label: "打点", key: "rbi" },
  { label: "盗塁", key: "stolenBases" },
  { label: "四死球", key: "walksAndHitByPitch" },
  { label: "OPS", key: "ops" },
  { label: "更新時刻", key: "updatedAt" },
] satisfies {
  label: string;
  key: keyof HitterStats;
  preferredDirection?: "asc" | "desc";
}[];

const pitcherColumns = [
  { label: "選手", key: "player", preferredDirection: "asc" },
  { label: "チーム", key: "team", preferredDirection: "asc" },
  { label: "防御率", key: "era", preferredDirection: "asc" },
  { label: "勝", key: "wins" },
  { label: "敗", key: "losses", preferredDirection: "asc" },
  { label: "セーブ", key: "saves" },
  { label: "奪三振", key: "strikeouts" },
  { label: "WHIP", key: "whip", preferredDirection: "asc" },
  { label: "更新時刻", key: "updatedAt" },
] satisfies {
  label: string;
  key: keyof PitcherStats;
  preferredDirection?: "asc" | "desc";
}[];

export function DashboardPage({
  hitters,
  pitchers,
  errorMessage,
}: DashboardData) {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            日本人メジャーリーガー最新情報
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-600 sm:text-base">
            日本人MLB選手の主要成績をMLB Stats APIから取得して表示しています。
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
