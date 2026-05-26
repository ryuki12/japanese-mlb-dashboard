This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 日本人メジャーリーガー最新情報

Phase 1では、トップページに日本人MLB選手のモック成績を表示します。

### 実装済み

- トップページタイトル「日本人メジャーリーガー最新情報」
- 野手テーブル: 選手、チーム、打率、本塁打、打点、盗塁、OPS、更新時刻
- 投手テーブル: 選手、チーム、防御率、勝、敗、セーブ、奪三振、WHIP、更新時刻
- スマホではカード形式、タブレット以上ではテーブル形式で表示

### これから実装する内容

- 実データ取得方法の検討
- 更新頻度と取得元に合わせたキャッシュ設計
- 選手追加・絞り込み・並び替え

### 残タスク

- MLB公式または信頼できるデータソースとの連携
- データ取得失敗時の表示
- 自動更新時刻の管理

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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
