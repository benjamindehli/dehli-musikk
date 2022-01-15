import { createBrowserHistory } from 'history';

import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import createRootReducer from '../reducers';


export const history = createBrowserHistory()

export default function configureStore(preloadedState) {
	const store = createStore(
		createRootReducer(history),
		preloadedState,
		composeWithDevTools(
			applyMiddleware()
		)
	);

	return store;
}


