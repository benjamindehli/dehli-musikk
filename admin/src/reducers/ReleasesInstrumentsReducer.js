import {CREATE_RELEASE_INSTRUMENT, UPDATE_RELEASE_INSTRUMENT} from 'constants/types';
import releasesInstruments from 'data/releasesInstruments';

const initialState = releasesInstruments;

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_RELEASE_INSTRUMENT:
      return action.payload;
    case UPDATE_RELEASE_INSTRUMENT:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
