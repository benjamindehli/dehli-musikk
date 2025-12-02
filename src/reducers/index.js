// Dependencies
import {combineReducers} from 'redux';
import {connectRouter} from 'connected-react-router'

// Reducers
import AvailableLanguagesReducer from '../reducers/AvailableLanguagesReducer';
import MultilingualRoutesReducer from '../reducers/MultilingualRoutesReducer';
import SelectedLanguageKeyReducer from '../reducers/SelectedLanguageKeyReducer';
import HasAcceptedPolicyReducer from '../reducers/HasAcceptedPolicyReducer';
import SearchResultsReducer from '../reducers/SearchResultsReducer';
import SearchResultsCountReducer from '../reducers/SearchResultsCountReducer';

const state = history => combineReducers({
  router: connectRouter(history),
  availableLanguages: AvailableLanguagesReducer,
  multilingualRoutes: MultilingualRoutesReducer,
  selectedLanguageKey: SelectedLanguageKeyReducer,
  hasAcceptedPolicy: HasAcceptedPolicyReducer,
  searchResults: SearchResultsReducer,
  searchResultsCount: SearchResultsCountReducer
});

export default state;
