import {CREATE_POST, UPDATE_POSTS} from 'constants/types';
import posts from 'data/posts';

const initialState = posts;

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case CREATE_POST:
      return action.payload;
    case UPDATE_POSTS:
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
