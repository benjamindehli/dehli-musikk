// Helpers
import { markdownResponse, getFaqMarkdown } from "helpers/markdownHelpers";

export const dynamic = "force-static";

export async function GET() {
    return markdownResponse(getFaqMarkdown("en"));
}
