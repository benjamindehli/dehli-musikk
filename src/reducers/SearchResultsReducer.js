import {UPDATE_SEARCH_RESULTS} from '../constants/types';

const initialState = [];

const reducer = (state = initialState, action) => {
  if (action.type === UPDATE_SEARCH_RESULTS) {
    return action.payload;
  } else {
    return state;
  }
};

export default reducer;
