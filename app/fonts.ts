import localFont from "next/font/local";

// Self-hosted so there's no build-time network call and no CDN dependency.
// Licenses in ./fonts/LICENSE.txt.

export const brush = localFont({
  src: "./fonts/Yellowtail.woff2",
  variable: "--font-brush",
  display: "swap",
});

export const marker = localFont({
  src: "./fonts/PermanentMarker.woff2",
  variable: "--font-marker",
  display: "swap",
});
