import {CREATE_AMPLIFIER, UPDATE_AMPLIFIERS} from 'constants/types';
import {amplifiers} from 'data/equipment';

const initialState = amplifiers;

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_AMPLIFIER:
      return action.payload;
    case UPDATE_AMPLIFIERS:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
