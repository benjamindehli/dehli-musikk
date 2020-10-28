import {UPDATE_HAS_ACCEPTED_POLICY} from 'constants/types';

const initialState = false;

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_HAS_ACCEPTED_POLICY:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
