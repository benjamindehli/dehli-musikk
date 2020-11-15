// Dependencies
import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router'

// Reducers
import PostsReducer from 'reducers/PostsReducer';

const state = history => combineReducers({
  router: connectRouter(history),
  posts: PostsReducer
});

export default state;
