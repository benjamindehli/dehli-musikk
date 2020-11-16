import {UPDATE_VIDEOS} from 'constants/types';

export const updateVideos = videos => dispatch => {
  dispatch({type: UPDATE_VIDEOS, payload: videos});
}
