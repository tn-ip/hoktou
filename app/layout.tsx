import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import "./globals.css";

const sans = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-sans",
  preload: false,
});

const serif = Noto_Serif_TC({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-serif",
  preload: false,
});

export const metadata: Metadata = {
  title: "學途 Hoktou",
  description:
    "香港中學生活模擬遊戲。由中一走到選科、公開試季節與虛構升學結果。分數與取錄都是遊戲，不是輔導建議。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f6e6a",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="zh-Hant-HK" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
