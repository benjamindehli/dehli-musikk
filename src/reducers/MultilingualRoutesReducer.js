import {UPDATE_MULTILINGUAL_ROUTES} from 'constants/types';

const initialState = {};

const reducer = (state = initialState, action) => {
  if (action.type === UPDATE_MULTILINGUAL_ROUTES) {
    return action.payload;
  } else {
    return state;
  }
};

export default reducer;
