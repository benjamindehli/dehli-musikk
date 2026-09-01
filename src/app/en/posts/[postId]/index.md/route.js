// Helpers
import { markdownResponse, getPostMarkdown, getPostIds } from "helpers/markdownHelpers";

export const dynamic = "force-static";

export function generateStaticParams() {
    return getPostIds("en").map((postId) => ({ postId }));
}

export async function GET(request, { params }) {
    const { postId } = await params;
    return markdownResponse(getPostMarkdown("en", postId));
}
