import {UPDATE_SEARCH_RESULTS, UPDATE_SEARCH_RESULTS_COUNT} from 'constants/types';

export const updateSearchResults = searchResults => dispatch => {
  dispatch({type: UPDATE_SEARCH_RESULTS, payload: searchResults});
}

export const updateSearchResultsCount = searchResults => dispatch => {
  let searchResultsCount = {
    all: searchResults.length
  };
  searchResults.forEach(searchResult => {
    searchResultsCount[searchResult.type] = searchResultsCount[searchResult.type] ? searchResultsCount[searchResult.type]+1 : 1;
  })
  dispatch({type: UPDATE_SEARCH_RESULTS_COUNT, payload: searchResultsCount});
}
