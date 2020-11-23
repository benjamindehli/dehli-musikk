import {CREATE_VIDEO, UPDATE_VIDEOS} from 'constants/types';

export const createVideo = (videos = []) => dispatch => {
  videos.unshift({
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
    duration: '',
    thumbnailDescription: '',
    thumbnailFilename: '',
    youTubeId: '',
    youTubeUser: '',
    youTubeChannelId: ''
  });
  dispatch({ type: CREATE_VIDEO, payload: videos });
}

export const updateVideos = videos => dispatch => {
  dispatch({type: UPDATE_VIDEOS, payload: videos});
}
