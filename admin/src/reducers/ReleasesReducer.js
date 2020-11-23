import {CREATE_RELEASE, UPDATE_RELEASES} from 'constants/types';
import releases from 'data/portfolio';

const initialState = releases;

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_RELEASE:
      return action.payload;
    case UPDATE_RELEASES:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
