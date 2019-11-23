// Dependencies
import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {Route, Switch} from 'react-router';
import {ConnectedRouter} from 'connected-react-router';
import {Helmet} from 'react-helmet';

// Utils
import configureStore, {history} from './utils/configureStore';

// Components
import NotFound from './components/routes/NotFound';
import Home from './components/routes/Home';
import Portfolio from './components/routes/Portfolio';

// Stylesheets
import style from './App.module.scss';

const initialState = {};
const store = configureStore(initialState);

class App extends Component {
  render() {
    return (<Provider store={store}>
      <ConnectedRouter history={history}>
        <Helmet>
        <script type="application/ld+json">{`
          {
            "@context": "http://schema.org",
            "@type": "WebSite",
            "name": "Dehli Musikk"
          }
        `}</script>
        </Helmet>
        <div className={style.container}>
          <Switch>
            <Route exact={true} path="/" render={() => (<Home/>)}/>
            <Route exact={true} path="/portfolio" render={() => (<Portfolio/>)}/>
            <Route render={() => (<NotFound/>)}/>
          </Switch>
        </div>
      </ConnectedRouter>
    </Provider>);
  }
}

export default App;
