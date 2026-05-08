import { readFile } from "node:fs/promises";
import path from "node:path";

export async function GET() {
  const imagePath = path.join(process.cwd(), "..", "assets", "images", "deco.jpg");
  const bytes = await readFile(imagePath);
  return new Response(bytes, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
