import {UPDATE_SEARCH_RESULTS_COUNT} from 'constants/types';

const initialState = {};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_SEARCH_RESULTS_COUNT:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
