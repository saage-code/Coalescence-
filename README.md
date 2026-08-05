# Clothing Brand Site

A small, self-contained storefront with a built-in admin panel. Standalone
project — push it to its own repository and deploy it on its own.

## What it does

- **Lock screen** (`/` while locked) — the finished, branded page, rebuilt to
  match the QR sticker artwork: vertical teal gradient, brush wordmark, "BRB",
  and an outlined JOIN SMS button that opens a single SMS bar — one phone field
  plus JOIN, in the same footprint the button occupied. See
  [Lock screen fidelity](#lock-screen-fidelity) for how it was derived.
- **Storefront** (`/` while open) — still deliberately plain black-and-white
  (basic font, no colors) so the shop's real look can be layered on later:
  announcement bar, big hero, product grid, about section, and an email/SMS
  signup in the footer.
- **Admin panel** (`/admin`) — password-protected. From there the owner can:
  - **Lock / unlock the store.** When locked, customers see *only* the branded
    lock screen (teal gradient, brush-script logo, "BRB", and a JOIN SMS button
    that opens the SMS bar) — no products, no prices, nothing else. The
    admin still sees the full site (with a banner) so they can keep working on it.
  - **Design the lock screen** — upload a logo image (or fall back to the brand
    name in the brush font), change the subtitle, the button label, the small
    line under the button, and both gradient colors, with a live preview in the
    admin panel.
  - **Add pieces** — name, price, photo upload, badge ("New", "1 of 50"…),
    sold-out flag, optional buy link (Stripe payment link, PayPal, DM link — no
    checkout is built in yet, on purpose).
  - **Hook up photos** — upload a hero background photo and product photos
    straight from the browser.
  - **Tune the touches** — brand name, tagline, announcement ticker, hero
    headline, about text, accent color (color picker), socials, and the lock
    screen's headline/message.
  - **See signups** — table of every email/phone captured, with one-click CSV
    export.

## Run it

```bash
npm install
cp .env.example .env.local   # then change ADMIN_PASSWORD
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin — password is whatever `ADMIN_PASSWORD` is
  set to (falls back to `admin` for local preview; the admin panel shows a
  warning until you change it).

## Lock screen fidelity

The lock screen is a reproduction of the supplied QR sticker PDF, measured
rather than eyeballed. Rendered at the artwork's own 612x792, every element
matches the print to the pixel — wordmark 522x62, headline 40 tall, button
368x90, with 38px and 55px gaps between the rows. (The headline now
measures 88 wide against the print's 100 purely because the copy dropped the
exclamation mark; the geometry is untouched.)

Where each piece came from:

- **Background** — the artwork's background is a pure vertical ramp, so it
  needs no image: sampling it gives `#4BD8B2` to `#216A9F`, which is what
  `DEFAULT_SETTINGS` now uses. The midpoint of a CSS `linear-gradient` between
  those two matches the sampled midpoint exactly.
- **Wordmark** — `public/brand/wordmark.svg`, the COALESCENCE glyphs converted
  to outlined vector straight from the PDF. Being outlines rather than text, it
  is crisp at any size and depends on no font file. It ships as the default
  `lockLogo`; uploading a logo in the admin panel replaces it, and clearing it
  falls back to the brand name set in the brush font.
- **Proportions** — `components/LockLockup.tsx` is a container-query context and
  every size in it is `cqw`, so the wordmark / "BRB!" / button keep the
  artwork's relationship at any viewport instead of each scaling on its own
  curve. `.btn-lock` in `globals.css` does the same for the button: its border
  and padding are in `em`, derived from the artwork's 6pt rule and 368x90 box.
  Its vertical padding is deliberately uneven (`0.518em` top, `0.282em`
  bottom) — `fourHand` reserves descender space below a label that has none, so
  even padding left the label sitting at 15.6% from the box top where the print
  has it at 21.8%. The bias lands it on the printed position without changing
  the box height. The admin preview renders through the same component so it
  can't drift.

### The SMS bar

The lock screen collects SMS only: `SignupForm`'s `smsOnly` prop drops the email
field and lays the rest out as one bar, sized by `.sms-bar-form` to land in the
JOIN button's own footprint so the lockup doesn't reflow when it opens. The
consent line and the empty-submit message both switch to SMS-only wording to
match. The storefront footer still takes email **or** phone, and the API is
unchanged — a phone on its own has always been a valid signup.

Its two sizes deliberately stop shrinking, unlike the display type above: an
input has a legibility floor, so the text never drops below 1rem (under 16px
mobile Safari zooms the page on focus) and the bar goes full-width, stacking
JOIN underneath, once the button footprint would squeeze it. Measured: 30.5px
inline at 1440, 22.3px inline at 768, 16px stacked at 390 and 320.

To go back to collecting email as well, drop the `smsOnly` prop in
`components/LockScreen.tsx`; everything else is driven off it.

Deliberate departures from the artwork:

- The printed headline and button sit ~7px left of the page centre while the
  wordmark is centred — an inconsistency in the artwork. All three are properly
  centred here.
- The fonts are handled as described below rather than being baked in, so the
  copy stays editable.
- The copy differs: the print reads "BRB!", the site "BRB". The headline is the
  admin-editable `lockHeadline`, so this is a default, not a layout constant.

### Brand fonts, and one thing to check

The artwork embedded the two real brand faces, and both are now self-hosted:
`RegularBrush` (wordmark) and `fourHand` ("BRB!", button). **They are subsets** —
the PDF only carried the characters it used, so `RegularBrush` has `ACELNOS`
and `fourHand` has `BIJMNORS!` plus space. That covers the default copy
exactly. Other characters fall through to the bundled Yellowtail / Permanent
Marker, per the stacks in `globals.css`, so custom copy still renders but can
look inconsistent; the admin panel says so next to those fields.

That fall-through only works because both brand faces are declared with
`adjustFontFallback: false`. By default `next/font` injects a metric-adjusted
*system* face (`"fourHand Fallback"`) immediately after each font, which
intercepts every missing character before it can reach the marker/script faces —
so uncovered copy rendered in Arial instead. **Don't remove that flag**, or the
lock screen's non-sticker text quietly turns into Arial.

The lock-screen form fields use the brush stack, so the phone placeholder and
the number the customer types read like the wordmark above them. `RegularBrush`
is uppercase-only and has no digits, so that text is painted by the Yellowtail
script behind it — confirmed with Chrome's `CSS.getPlatformFontsForNode`, which
reports both "Phone number" and a typed "+1 555 0177" as entirely Yellowtail.

**Keep the placeholder lowercase.** A capital N is the one letter in "Phone
Number" that `RegularBrush` covers, so title-casing it renders that single
glyph in the rough brush face and the other eleven in Yellowtail — two
mismatched letterforms inside one word. Same trap in the other direction for
the marker stack, where `PHONE NUMBER` would split `O N M B R` from `P H E U`.

**Their licensing is unverified.** Font EULAs often allow PDF embedding while
charging separately for webfont use, so confirm the terms for `RegularBrush`
and `fourHand` before this goes public. If webfont use isn't licensed, delete
the two `.woff2` files and drop them from `app/fonts.ts` — the fallback chain
keeps the page working and the wordmark SVG is unaffected, since outlines
aren't a font. Details in `app/fonts/LICENSE.txt`.

## How it stores things

Everything the admin edits — settings, products, signups, uploaded images —
lives as JSON/files in `data/` (gitignored, seeded with defaults
on first run). Zero external services, which keeps it easy to run and hand over.

**Deployment note:** because storage is on-disk, host it somewhere with a
persistent filesystem (Railway, Render, Fly.io, a VPS, etc.). Serverless hosts
like Vercel wipe local files between requests — if you want Vercel later, swap
`lib/db.ts` for Supabase/Postgres and uploads for Supabase Storage or Vercel
Blob; that file is the only storage layer, everything else stays the same.

## Where to add his touches later

- `lib/db.ts` → `DEFAULT_SETTINGS` — the defaults for every branding knob.
- `app/globals.css` — fonts and colors (the `.font-display` class and the
  CSS variables at the top are the intended swap points).
- `app/page.tsx` — storefront layout/sections.
- `components/LockScreen.tsx` — the locked-store page (gradient + signup form).
- `components/LockLockup.tsx` — the sticker lockup and its proportions, shared
  by the lock screen and the admin preview.
- `public/brand/wordmark.svg` — the outlined COALESCENCE wordmark.
- `app/fonts.ts` + `app/fonts/` — four self-hosted faces, so there's no CDN call
  at runtime or build time: the two brand fonts from the artwork
  (`RegularBrush`, `fourHand`) and the two Apache-2.0 Google fonts behind them
  (Yellowtail, Permanent Marker). Swap the `.woff2` files and the
  `.font-brush` / `.font-marker` rules in `globals.css` to change them, and see
  the fidelity notes above for the subset and licensing caveats.
- Real checkout, per-product pages, size selection, and SMS sending
  (Twilio/Klaviyo) are the natural next steps; signups are already being
  collected so nothing is lost in the meantime.
