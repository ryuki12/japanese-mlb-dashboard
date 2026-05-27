This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 日本人メジャーリーガー最新情報

Phase 1では、トップページに日本人MLB選手の成績を表示します。

### 実装済み

- トップページタイトル「日本人メジャーリーガー最新情報」
- Supabaseの `players`, `hitter_season_stats`, `pitcher_season_stats` から表示用データを取得
- 実DBカラムに合わせて `name_ja`, `team_abbr`, `walks + hit_by_pitch` などを表示用に変換
- 野手テーブル: 選手、チーム、試合数、打席数、打率、本塁打、打点、盗塁、四死球、OPS、更新時刻
- 投手テーブル: 選手、チーム、防御率、勝、敗、セーブ、奪三振、WHIP、更新時刻
- スマホではカード形式、タブレット以上ではテーブル形式で表示
- データがない場合は「データがありません」を表示
- 取得エラー時は画面に簡潔なエラーメッセージを表示
- 開発時のNext.js dev indicatorを非表示
- `GET /api/cron/update-mlb-stats` でMLB Stats APIから今季累計成績を取得してSupabaseへ保存
- cron APIは `CRON_SECRET` による簡易認証に対応
- Vercel Cronで毎日13:00（JST）に成績更新APIを実行

### これから実装する内容

- 更新頻度と取得元に合わせたキャッシュ設計
- 選手追加・絞り込み・並び替え
- 管理画面の設計

### 残タスク

- 本番環境への `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `CRON_SECRET` の設定
- 実データ投入フローの整備
- 自動更新時刻の管理
- `hitter_season_stats` と `pitcher_season_stats` に `player_id, season` のunique制約を設定

## Vercel Cron

`vercel.json` で `/api/cron/update-mlb-stats` を毎日13:00（JST）に実行するよう設定しています。Vercel CronのscheduleはUTC基準のため、設定値は `0 4 * * *` です。

Vercel本番環境には次の環境変数を設定してください。

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
CRON_SECRET=...
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses Tailwind CSS for styling.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
