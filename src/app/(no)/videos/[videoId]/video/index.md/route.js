// Helpers
import { markdownResponse, getVideoIds, getVideoMarkdown } from "helpers/markdownHelpers";

export const dynamic = "force-static";

export function generateStaticParams() {
    return getVideoIds("no").map((videoId) => ({ videoId }));
}

export async function GET(request, { params }) {
    const { videoId } = await params;
    return markdownResponse(getVideoMarkdown("no", videoId, { theater: true }));
}
