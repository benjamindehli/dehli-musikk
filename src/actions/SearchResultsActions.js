import { UPDATE_SEARCH_RESULTS, UPDATE_SEARCH_RESULTS_COUNT } from "constants/types";

export const updateSearchResults = (searchResults) => ({
    type: UPDATE_SEARCH_RESULTS,
    payload: searchResults || []
});

export const updateSearchResultsCount = (searchResults) => {
    let searchResultsCount = {
        all: searchResults?.length || 0
    };
    if (searchResults) {
        for (const searchResult of searchResults) {
            searchResultsCount[searchResult.type] = searchResultsCount[searchResult.type]
                ? searchResultsCount[searchResult.type] + 1
                : 1;
        }
    }
    return { type: UPDATE_SEARCH_RESULTS_COUNT, payload: searchResultsCount };
};
