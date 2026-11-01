import fs from "node:fs/promises";
import path from "node:path";
import { REPO_ROOT } from "@admin/lib/dataFiles";

/*
 * Serves the site's own images to the admin, so an editor can show the
 * thumbnails it is about to replace. Read only, and confined to public/data:
 * the resolved path must stay inside it and be an image the site serves.
 */
const ROOT = path.join(REPO_ROOT, "public", "data");
const TYPES: Record<string, string> = { ".jpg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif" };

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
    const { path: segments } = await params;
    const target = path.resolve(ROOT, ...segments);
    const type = TYPES[path.extname(target)];
    if (!target.startsWith(ROOT + path.sep) || !type) return new Response("Not found", { status: 404 });
    try {
        return new Response(new Uint8Array(await fs.readFile(target)), { headers: { "Content-Type": type, "Cache-Control": "no-store" } });
    } catch {
        return new Response("Not found", { status: 404 });
    }
}
