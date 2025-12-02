import React from 'react';
//import * as serviceWorker from 'serviceWorker';
import { hydrate, render } from "react-dom";

import App from './App.jsx';

import './style/styles.scss';


const rootElement = document.getElementById("root");
if (rootElement.hasChildNodes()) {
  hydrate(<App />, rootElement);
} else {
  render(<React.StrictMode><App /></React.StrictMode>, rootElement);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.register();

/*
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'style/styles.scss';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)*/
