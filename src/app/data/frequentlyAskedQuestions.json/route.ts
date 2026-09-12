// Helpers
import { getSearchableFrequentlyAskedQuestions, searchDataResponse } from "helpers/searchDataHelpers";

// Data
import frequentlyAskedQuestions from "data/frequentlyAskedQuestions";

export const dynamic = "force-static";

export async function GET() {
    return searchDataResponse(getSearchableFrequentlyAskedQuestions(frequentlyAskedQuestions));
}
