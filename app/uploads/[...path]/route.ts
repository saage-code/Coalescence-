import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { uploadsDir } from "@/lib/db";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
};

// Serves admin-uploaded images from the gitignored data/uploads directory.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: segments } = await params;
  const name = path.basename(segments.join("/")); // strip any traversal
  const contentType = CONTENT_TYPES[path.extname(name).toLowerCase()];
  const file = path.join(uploadsDir(), name);

  if (!contentType || !fs.existsSync(file)) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(fs.readFileSync(file)), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
