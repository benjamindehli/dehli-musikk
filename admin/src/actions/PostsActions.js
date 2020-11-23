import {CREATE_POST, UPDATE_POSTS} from 'constants/types';

export const createPost = (posts = []) => dispatch => {
  posts.unshift({
    id: '',
    orderNumber: 0,
    copyright: false,
    timestamp: 0,
    title: {
      no: '',
      en: ''
    },
    content: {
      no: '',
      en: ''
    },
    thumbnailDescription: '',
    thumbnailFilename: ''
  });
  dispatch({ type: CREATE_POST, payload: posts });
}

export const updatePosts = posts => dispatch => {
  dispatch({type: UPDATE_POSTS, payload: posts});
}
