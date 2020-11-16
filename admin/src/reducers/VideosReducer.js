import {UPDATE_VIDEOS} from 'constants/types';
import videos from 'data/videos';

const initialState = videos;

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case UPDATE_VIDEOS:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
