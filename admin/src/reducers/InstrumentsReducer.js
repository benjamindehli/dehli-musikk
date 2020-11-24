import {CREATE_INSTRUMENT, UPDATE_INSTRUMENTS} from 'constants/types';
import {instruments} from 'data/equipment';

const initialState = instruments;

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_INSTRUMENT:
      return action.payload;
    case UPDATE_INSTRUMENTS:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
