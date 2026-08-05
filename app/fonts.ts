import localFont from "next/font/local";

// Self-hosted so there's no build-time network call and no CDN dependency.
// Licenses and provenance in ./fonts/LICENSE.txt.

// The two real brand fonts, taken from the QR sticker artwork. Both are
// SUBSETS that only carry the characters the sticker used — RegularBrush has
// "ACELNOS" (enough for COALESCENCE) and fourHand has " !BIJMNORS" (enough for
// "BRB!" and "JOIN SMS"). Any other character falls through to the fonts
// below, so custom copy renders in Yellowtail/Permanent Marker instead.
export const regularBrush = localFont({
  src: "./fonts/RegularBrush.woff2",
  variable: "--font-regular-brush",
  display: "swap",
});

export const fourHand = localFont({
  src: "./fonts/fourHand.woff2",
  variable: "--font-four-hand",
  display: "swap",
});

// Full-alphabet stand-ins, used wherever the subsets above have no glyph.
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
