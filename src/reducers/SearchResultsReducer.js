import {UPDATE_SEARCH_RESULTS} from 'constants/types';

const initialState = [];

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_SEARCH_RESULTS:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
