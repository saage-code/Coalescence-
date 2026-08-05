import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getSignups } from "@/lib/db";

function csvField(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = [
    "email,phone,signed_up_at",
    ...getSignups().map((s) =>
      [csvField(s.email), csvField(s.phone), csvField(s.createdAt)].join(",")
    ),
  ];

  return new NextResponse(rows.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="signups.csv"',
    },
  });
}
