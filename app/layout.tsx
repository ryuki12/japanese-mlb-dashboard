import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "日本人メジャーリーガー最新情報",
  description: "日本人MLB選手の最新成績を確認できるダッシュボードです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
