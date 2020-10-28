import {UPDATE_MULTILINGUAL_ROUTES} from 'constants/types';

const initialState = {};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_MULTILINGUAL_ROUTES:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
