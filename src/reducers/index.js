// Dependencies
import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router'

// Reducers
import AvailableLanguagesReducer from "./AvailableLanguagesReducer";

export default (history) => combineReducers({
  router: connectRouter(history),
  availableLanguages: AvailableLanguagesReducer
});
