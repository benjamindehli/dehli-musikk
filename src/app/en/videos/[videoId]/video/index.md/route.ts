// Helpers
import { markdownResponse, getVideoIds, getVideoMarkdown } from "helpers/markdownHelpers";

export const dynamic = "force-static";

export function generateStaticParams() {
    return getVideoIds("en").map((videoId) => ({ videoId }));
}

export async function GET(request: Request, { params }: { params: Promise<{ videoId: string }> }) {
    const { videoId } = await params;
    return markdownResponse(getVideoMarkdown("en", videoId, { theater: true }) as string);
}
