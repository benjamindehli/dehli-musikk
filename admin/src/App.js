// Dependencies
import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {Route, Switch} from 'react-router';
import {ConnectedRouter} from 'connected-react-router';
import WebFont from 'webfontloader';

import {library} from '@fortawesome/fontawesome-svg-core';
import {
  faBullhorn,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faDownload,
  faFilm,
  faFilter,
  faGripHorizontal,
  faGuitar,
  faLanguage,
  faLink,
  faListUl,
  faMusic,
  faPhotoVideo,
  faPlus,
  faSearch,
  faShoppingCart,
  faSlidersH,
  faTrash,
  faUnlink
} from '@fortawesome/free-solid-svg-icons';

// Utils
import configureStore, {history} from 'utils/configureStore';

// Components
import NavigationBar from 'components/partials/NavigationBar';

// Routes
import Dashboard from 'components/routes/Dashboard';
import Posts from 'components/routes/Posts';
import Portfolio from 'components/routes/Portfolio';
import Videos from 'components/routes/Videos';
import NotFound from 'components/routes/NotFound';

// Stylesheets
import style from 'App.module.scss';

WebFont.load({
  google: {
    families: ['Roboto:400,700&display=swap']
  }
});

library.add(
  faBullhorn,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faDownload,
  faFilm,
  faFilter,
  faGripHorizontal,
  faGuitar,
  faLanguage,
  faLink,
  faListUl,
  faMusic,
  faPhotoVideo,
  faPlus,
  faSearch,
  faShoppingCart,
  faSlidersH,
  faTrash,
  faUnlink
);

const initialState = {};
const store = configureStore(initialState);


class App extends Component {
  render() {
    return (<Provider store={store}>
      <ConnectedRouter history={history}>
        <NavigationBar/>
        <div className={style.container}>
          <Switch>
            <Route exact={true} path="/" render={() => (<Dashboard/>)}/>
            <Route exact={true} path="/posts/" render={() => (<Posts/>)}/>
            <Route exact={true} path="/portfolio/" render={() => (<Portfolio/>)}/>
            <Route exact={true} path="/videos/" render={() => (<Videos/>)}/>
            <Route render={() => (<NotFound />)}/>
          </Switch>
        </div>
      </ConnectedRouter>
    </Provider>);
  }
}

export default App;
