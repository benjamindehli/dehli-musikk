import {CREATE_EFFECT, UPDATE_EFFECTS} from 'constants/types';
import {effects} from 'data/equipment';

const initialState = effects;

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_EFFECT:
      return action.payload;
    case UPDATE_EFFECTS:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
