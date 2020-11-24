// Dependencies
import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router'

// Reducers
import AmplifiersReducer from 'reducers/AmplifiersReducer';
import EffectsReducer from 'reducers/EffectsReducer';
import InstrumentsReducer from 'reducers/InstrumentsReducer';
import PostsReducer from 'reducers/PostsReducer';
import ReleasesInstrumentsReducer from 'reducers/ReleasesInstrumentsReducer';
import ReleasesReducer from 'reducers/ReleasesReducer';
import VideosReducer from 'reducers/VideosReducer';

const state = history => combineReducers({
  router: connectRouter(history),
  amplifiers: AmplifiersReducer,
  effects: EffectsReducer,
  instruments: InstrumentsReducer,
  posts: PostsReducer,
  releasesInstruments: ReleasesInstrumentsReducer,
  releases: ReleasesReducer,
  videos: VideosReducer
});

export default state;
