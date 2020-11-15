import {UPDATE_POSTS} from 'constants/types';

export const updatePosts = posts => dispatch => {
  dispatch({type: UPDATE_POSTS, payload: posts});
}
