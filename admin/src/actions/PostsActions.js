import { CREATE_POST, UPDATE_POSTS } from 'constants/types';

export const createPost = (posts = []) => {
  let newPosts = posts.slice()
  newPosts.splice(0, 0, {
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
  return { type: CREATE_POST, payload: newPosts };
}

export const updatePosts = posts => {
  return { type: UPDATE_POSTS, payload: posts };
}
