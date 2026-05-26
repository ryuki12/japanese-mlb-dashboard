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

const hitters: Hitter[] = [
  {
    player: "大谷 翔平",
    team: "ドジャース",
    games: 52,
    plateAppearances: 236,
    average: ".312",
    homeRuns: 21,
    rbi: 54,
    stolenBases: 12,
    walksAndHitByPitch: 38,
    ops: "1.021",
    updatedAt: "2026/05/26 22:30",
  },
  {
    player: "鈴木 誠也",
    team: "カブス",
    games: 48,
    plateAppearances: 204,
    average: ".286",
    homeRuns: 13,
    rbi: 42,
    stolenBases: 3,
    walksAndHitByPitch: 23,
    ops: ".874",
    updatedAt: "2026/05/26 22:30",
  },
  {
    player: "吉田 正尚",
    team: "レッドソックス",
    games: 39,
    plateAppearances: 151,
    average: ".274",
    homeRuns: 5,
    rbi: 24,
    stolenBases: 1,
    walksAndHitByPitch: 16,
    ops: ".742",
    updatedAt: "2026/05/26 22:30",
  },
];

const pitchers: Pitcher[] = [
  {
    player: "山本 由伸",
    team: "ドジャース",
    era: "2.71",
    wins: 6,
    losses: 2,
    saves: 0,
    strikeouts: 68,
    whip: "1.03",
    updatedAt: "2026/05/26 22:30",
  },
  {
    player: "今永 昇太",
    team: "カブス",
    era: "3.08",
    wins: 5,
    losses: 3,
    saves: 0,
    strikeouts: 61,
    whip: "1.10",
    updatedAt: "2026/05/26 22:30",
  },
  {
    player: "ダルビッシュ 有",
    team: "パドレス",
    era: "3.42",
    wins: 4,
    losses: 3,
    saves: 0,
    strikeouts: 57,
    whip: "1.18",
    updatedAt: "2026/05/26 22:30",
  },
];

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
                <div key={String(column.key)} className="rounded-md bg-zinc-50 p-3">
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
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-8 text-zinc-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="space-y-3">
          <p className="text-sm font-medium text-emerald-700">Phase 1 Mock</p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
            日本人メジャーリーガー最新情報
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-zinc-600 sm:text-base">
            日本人MLB選手の主要成績を一覧できるダッシュボードです。現在はPhase
            1としてモックデータを表示しています。
          </p>
        </header>

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
