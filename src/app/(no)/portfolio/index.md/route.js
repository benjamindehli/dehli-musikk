// Helpers
import { markdownResponse, getPortfolioMarkdown } from "helpers/markdownHelpers";

export const dynamic = "force-static";

export async function GET() {
    return markdownResponse(getPortfolioMarkdown("no"));
}
