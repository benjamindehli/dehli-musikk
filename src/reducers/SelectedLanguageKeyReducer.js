import {UPDATE_SELECTED_LANGUAGE_KEY} from 'constants/types';

const initialState = 'no';

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_SELECTED_LANGUAGE_KEY:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
