// Dependencies
import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {Route, Switch} from 'react-router';
import {ConnectedRouter} from 'connected-react-router';

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
