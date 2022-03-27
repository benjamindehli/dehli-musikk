import { CREATE_VIDEO, UPDATE_VIDEOS } from 'constants/types';

export const createVideo = (videos = []) => {
  let newVideos = videos.slice()
  newVideos.splice(0, 0, {
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
  return { type: CREATE_VIDEO, payload: videos };
}

export const updateVideos = videos => {
  return { type: UPDATE_VIDEOS, payload: videos };
}
