// Dependencies
import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import * as serviceWorker from 'serviceWorker';

// Components
import App from 'App';

// Stylesheets
import 'style/styles.scss';

const container = document.getElementById('root');

if (container.hasChildNodes()) {
  hydrateRoot(container, <App tab="home" />);
} else {
  const root = createRoot(container);
  root.render(<App />);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
