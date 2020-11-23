// Dependencies
import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router'

// Reducers
import PostsReducer from 'reducers/PostsReducer';
import ReleasesReducer from 'reducers/ReleasesReducer';
import VideosReducer from 'reducers/VideosReducer';

const state = history => combineReducers({
  router: connectRouter(history),
  posts: PostsReducer,
  releases: ReleasesReducer,
  videos: VideosReducer
});

export default state;
