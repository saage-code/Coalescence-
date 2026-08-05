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
};

export type Product = {
  id: string;
  name: string;
  price: string;
  image: string;
  tag: string;
  buyUrl: string;
  soldOut: boolean;
};

export type Signup = {
  id: string;
  email: string;
  phone: string;
  createdAt: string;
};

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
  // The sticker prints this as "BRB!"; the exclamation was dropped by choice.
  lockHeadline: "BRB",
  // Empty by default so the lock screen stays clean: logo, subtitle, button.
  lockMessage: "",
  // The brand wordmark from the sticker artwork, as outlined vector so it
  // renders exactly at any size. Admin uploads replace it; clearing it falls
  // back to brandName set in the brush font.
  lockLogo: "/brand/wordmark.svg",
  lockButtonLabel: "JOIN SMS",
  // Sampled from the sticker's background, which is a pure vertical ramp.
  lockGradientTop: "#4BD8B2",
  lockGradientBottom: "#216A9F",
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
  return { ...DEFAULT_SETTINGS, ...readJson<Partial<SiteSettings>>("site.json", {}) };
}

export function saveSettings(patch: Partial<SiteSettings>): SiteSettings {
  const next = { ...getSettings(), ...patch };
  writeJson("site.json", next);
  return next;
}

export function getProducts(): Product[] {
  return readJson<Product[]>("products.json", []);
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
