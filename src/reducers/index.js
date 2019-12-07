// Dependencies
import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router'

// Reducers
import AvailableLanguagesReducer from "./AvailableLanguagesReducer";
import MultilingualRoutesReducer from "./MultilingualRoutesReducer";

export default (history) => combineReducers({
  router: connectRouter(history),
  availableLanguages: AvailableLanguagesReducer,
  multilingualRoutes: MultilingualRoutesReducer
});
