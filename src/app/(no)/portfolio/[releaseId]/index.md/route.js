// Helpers
import { markdownResponse, getReleaseMarkdown, getReleaseIds } from "helpers/markdownHelpers";

export const dynamic = "force-static";

export function generateStaticParams() {
    return getReleaseIds().map((releaseId) => ({ releaseId }));
}

export async function GET(request, { params }) {
    const { releaseId } = await params;
    return markdownResponse(getReleaseMarkdown("no", releaseId));
}
