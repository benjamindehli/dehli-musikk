import {UPDATE_SEARCH_RESULTS} from 'constants/types';

export const updateSearchResults = searchResults => dispatch => {
  dispatch({type: UPDATE_SEARCH_RESULTS, payload: searchResults});
}
