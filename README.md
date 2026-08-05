# Clothing Brand Site

A small, self-contained storefront with a built-in admin panel. Standalone
project — push it to its own repository and deploy it on its own.

## What it does

- **Lock screen** (`/` while locked) — the finished, branded page: vertical
  teal gradient, brush-script wordmark, "BRB!", and an outlined JOIN SMS button
  that opens the email/SMS capture form.
- **Storefront** (`/` while open) — still deliberately plain black-and-white
  (basic font, no colors) so the shop's real look can be layered on later:
  announcement bar, big hero, product grid, about section, and an email/SMS
  signup in the footer.
- **Admin panel** (`/admin`) — password-protected. From there the owner can:
  - **Lock / unlock the store.** When locked, customers see *only* the branded
    lock screen (teal gradient, brush-script logo, "BRB!", and a JOIN SMS button
    that opens the email/SMS form) — no products, no prices, nothing else. The
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
- `components/LockScreen.tsx` — the locked-store page (gradient, logo, button).
- `app/fonts.ts` + `app/fonts/` — the two bundled brand fonts (Yellowtail for
  the brush logo, Permanent Marker for the subtitle/button). Both are Apache
  2.0 from Google Fonts and are self-hosted, so there's no CDN call at runtime
  or build time. Swap the `.woff2` files and the `.font-brush` / `.font-marker`
  rules in `globals.css` to change them.
- Real checkout, per-product pages, size selection, and SMS sending
  (Twilio/Klaviyo) are the natural next steps; signups are already being
  collected so nothing is lost in the meantime.
