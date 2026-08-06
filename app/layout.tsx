import type { Metadata } from "next";
import { getSettings } from "@/lib/db";
import { brush, fourHand, marker, regularBrush } from "./fonts";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSettings();
  return {
    title: settings.brandName,
    description: settings.tagline,
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = getSettings();
  return (
    <html
      lang="en"
      className={`${regularBrush.variable} ${fourHand.variable} ${brush.variable} ${marker.variable}`}
    >
      <body
        className="min-h-screen"
        style={
          {
            "--accent": settings.accentColor,
            // The lock screen's two gradient stops, exposed site-wide so the
            // storefront and product pages stay in step with it when the admin
            // changes them.
            "--brand-top": settings.lockGradientTop,
            "--brand-bottom": settings.lockGradientBottom,
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
