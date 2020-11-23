import {CREATE_VIDEO, UPDATE_VIDEOS} from 'constants/types';
import videos from 'data/videos';

const initialState = videos;

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_VIDEO:
      return action.payload;
    case UPDATE_VIDEOS:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
