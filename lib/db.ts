import fs from "fs";
import path from "path";
import crypto from "crypto";

// Simple JSON-on-disk storage so the site runs with zero external services.
// Everything lives in /data (gitignored). To move to a hosted DB later,
// swap the implementations in this file only.

const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(DATA_DIR, "uploads");

export type SiteSettings = {
  brandName: string;
  tagline: string;
  announcement: string;
  accentColor: string;
  heroHeadline: string;
  heroImage: string;
  about: string;
  instagram: string;
  tiktok: string;
  contactEmail: string;
  locked: boolean;
  lockHeadline: string;
  lockMessage: string;
  lockLogo: string;
  lockButtonLabel: string;
  lockGradientTop: string;
  lockGradientBottom: string;
  /** Surface the product page renders on. */
  productTheme: "light" | "dark";
};

export type Product = {
  id: string;
  name: string;
  price: string;
  /** Was-price, shown struck through next to price when set. */
  compareAtPrice: string;
  image: string;
  /** Extra photos for the product page gallery; `image` stays the lead shot. */
  gallery: string[];
  tag: string;
  /** Long copy for the product page. Blank lines separate paragraphs. */
  description: string;
  /** Comma-separated, e.g. "S, M, L, XL". Empty means one-size / no picker. */
  sizes: string;
  buyUrl: string;
  soldOut: boolean;
};

export type Signup = {
  id: string;
  email: string;
  phone: string;
  createdAt: string;
};

/** The wordmark shipped as the default lockLogo, and its light counterpart.
    Declared above DEFAULT_SETTINGS because that object references it. */
export const DEFAULT_LOCK_LOGO = "/brand/wordmark.svg";
const DEFAULT_LOCK_LOGO_LIGHT = "/brand/wordmark-light.svg";

export const DEFAULT_SETTINGS: SiteSettings = {
  brandName: "COALESCENCE",
  tagline: "Limited drops. No restocks.",
  announcement: "DROP 001 — COMING SOON",
  accentColor: "#000000",
  heroHeadline: "Wear it once,\nremember it forever.",
  heroImage: "",
  about:
    "Independent clothing label. Every piece is cut, printed and numbered in small runs — when a drop sells out, it's gone.",
  instagram: "",
  tiktok: "",
  contactEmail: "",
  locked: false,
  // As printed on the sticker.
  lockHeadline: "BRB!",
  // Empty by default so the lock screen stays clean: logo, subtitle, button.
  lockMessage: "",
  // The brand wordmark from the sticker artwork, as outlined vector so it
  // renders exactly at any size. Admin uploads replace it; clearing it falls
  // back to brandName set in the brush font.
  lockLogo: DEFAULT_LOCK_LOGO,
  lockButtonLabel: "JOIN SMS",
  // Sampled from the sticker's background, which is a pure vertical ramp.
  lockGradientTop: "#4BD8B2",
  lockGradientBottom: "#216A9F",
  productTheme: "light",
};

function ensureDirs() {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function readJson<T>(file: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(file: string, value: unknown) {
  ensureDirs();
  const target = path.join(DATA_DIR, file);
  const tmp = `${target}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2));
  fs.renameSync(tmp, target);
}

export function newId(): string {
  return crypto.randomBytes(8).toString("hex");
}

export function getSettings(): SiteSettings {
  const merged = { ...DEFAULT_SETTINGS, ...readJson<Partial<SiteSettings>>("site.json", {}) };
  // Guard the union so a hand-edited site.json can't put an arbitrary string
  // into a field the CSS switches on.
  if (merged.productTheme !== "light" && merged.productTheme !== "dark") {
    merged.productTheme = DEFAULT_SETTINGS.productTheme;
  }
  return merged;
}

export function saveSettings(patch: Partial<SiteSettings>): SiteSettings {
  const next = { ...getSettings(), ...patch };
  writeJson("site.json", next);
  return next;
}

// Products saved before the product-page fields existed are missing them, so
// every read is normalised rather than trusted. Keeps older data/products.json
// files working instead of rendering `undefined`.
function normalizeProduct(raw: Partial<Product>): Product {
  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : newId(),
    name: raw.name ?? "",
    price: raw.price ?? "",
    compareAtPrice: raw.compareAtPrice ?? "",
    image: raw.image ?? "",
    gallery: Array.isArray(raw.gallery) ? raw.gallery.filter((s) => typeof s === "string") : [],
    tag: raw.tag ?? "",
    description: raw.description ?? "",
    sizes: raw.sizes ?? "",
    buyUrl: raw.buyUrl ?? "",
    soldOut: Boolean(raw.soldOut),
  };
}

export function getProducts(): Product[] {
  return readJson<Partial<Product>[]>("products.json", []).map(normalizeProduct);
}

export function getProduct(id: string): Product | undefined {
  return getProducts().find((p) => p.id === id);
}

/** "S, M , L" -> ["S","M","L"]. Empty string means the product has no sizes. */
export function parseSizes(sizes: string): string[] {
  return sizes
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * The bundled wordmark is an `<img>`, so it can't inherit currentColor — its
 * fill is baked in, and the black one disappears on a dark surface. Swap in the
 * white copy there. An admin-uploaded logo is left alone, since its colours are
 * unknown; a dark custom logo needs a light version of its own.
 */
export function logoFor(settings: SiteSettings, surface: "light" | "dark"): string {
  if (surface === "dark" && settings.lockLogo === DEFAULT_LOCK_LOGO) {
    return DEFAULT_LOCK_LOGO_LIGHT;
  }
  return settings.lockLogo;
}

/** Lead image plus gallery, de-duplicated, for the product page thumbnails. */
export function productImages(product: Product): string[] {
  return [product.image, ...product.gallery].filter((src, i, all) => src && all.indexOf(src) === i);
}

export function saveProducts(products: Product[]) {
  writeJson("products.json", products);
}

export function getSignups(): Signup[] {
  return readJson<Signup[]>("signups.json", []);
}

export function addSignup(email: string, phone: string): { added: boolean } {
  const signups = getSignups();
  const emailNorm = email.trim().toLowerCase();
  const phoneNorm = phone.replace(/[^\d+]/g, "");
  const duplicate = signups.some(
    (s) =>
      (emailNorm && s.email.toLowerCase() === emailNorm) ||
      (phoneNorm && s.phone === phoneNorm)
  );
  if (duplicate) return { added: false };
  signups.push({
    id: newId(),
    email: emailNorm,
    phone: phoneNorm,
    createdAt: new Date().toISOString(),
  });
  writeJson("signups.json", signups);
  return { added: true };
}

export function uploadsDir(): string {
  ensureDirs();
  return UPLOADS_DIR;
}
