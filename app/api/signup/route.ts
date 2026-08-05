import { NextResponse } from "next/server";
import { addSignup } from "@/lib/db";

// Public endpoint: collects email and/or phone (SMS) signups.
export async function POST(req: Request) {
  let body: { email?: string; phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email || "").trim();
  const phone = (body.phone || "").trim();

  if (!email && !phone) {
    return NextResponse.json(
      { error: "Enter an email or a phone number." },
      { status: 400 }
    );
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "That email doesn't look right." }, { status: 400 });
  }
  if (phone && !/^\+?[\d\s().-]{7,20}$/.test(phone)) {
    return NextResponse.json({ error: "That phone number doesn't look right." }, { status: 400 });
  }

  addSignup(email, phone);
  // Duplicates are treated as success so the form never leaks who's already on the list.
  return NextResponse.json({ ok: true });
}
