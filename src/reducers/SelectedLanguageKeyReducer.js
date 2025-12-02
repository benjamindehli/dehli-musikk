import {UPDATE_SELECTED_LANGUAGE_KEY} from '../constants/types';

const initialState = 'no';

const reducer = (state = initialState, action) => {
  if (action.type === UPDATE_SELECTED_LANGUAGE_KEY) {
    return action.payload;
  } else {
    return state;
  }
};

export default reducer;
