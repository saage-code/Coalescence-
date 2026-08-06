import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { DEFAULT_SETTINGS, getSettings, saveSettings, type SiteSettings } from "@/lib/db";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(getSettings());
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Only accept known settings keys, coerced to the right type.
  const patch: Partial<SiteSettings> = {};
  for (const key of Object.keys(DEFAULT_SETTINGS) as (keyof SiteSettings)[]) {
    if (!(key in body)) continue;
    if (key === "locked") {
      patch.locked = Boolean(body.locked);
    } else if (key === "productTheme") {
      // Union, not free text — anything else is ignored rather than stored.
      if (body.productTheme === "light" || body.productTheme === "dark") {
        patch.productTheme = body.productTheme;
      }
    } else if (typeof body[key] === "string") {
      (patch as Record<string, string>)[key] = (body[key] as string).slice(0, 2000);
    }
  }

  return NextResponse.json(saveSettings(patch));
}
