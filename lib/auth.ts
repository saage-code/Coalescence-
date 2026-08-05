import crypto from "crypto";
import { cookies } from "next/headers";

// Single-admin cookie auth. The session token is an HMAC over an expiry
// timestamp, keyed off the admin password — no session storage needed, and
// changing ADMIN_PASSWORD invalidates every existing session.

export const SESSION_COOKIE = "brand_admin";
const SESSION_DAYS = 7;

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "admin";
}

export function isDefaultPassword(): boolean {
  return !process.env.ADMIN_PASSWORD;
}

function secret(): Buffer {
  return crypto.createHash("sha256").update(`brand-admin:${adminPassword()}`).digest();
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createSessionToken(): { token: string; maxAge: number } {
  const exp = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
  return { token: `${exp}.${sign(String(exp))}`, maxAge: SESSION_DAYS * 24 * 60 * 60 };
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [exp, mac] = token.split(".");
  if (!exp || !mac) return false;
  if (Number(exp) < Date.now()) return false;
  const expected = sign(exp);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function checkPassword(password: string): boolean {
  const a = Buffer.from(password);
  const b = Buffer.from(adminPassword());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(SESSION_COOKIE)?.value);
}
