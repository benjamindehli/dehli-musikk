// Dependencies
import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {Route, Switch} from 'react-router';
import {ConnectedRouter} from 'connected-react-router';
import WebFont from 'webfontloader';

import {library} from '@fortawesome/fontawesome-svg-core';
import {
  faFacebookF,
  faInstagram,
  faTumblr,
  faTwitter,
  faVimeoV,
  faYoutube
} from '@fortawesome/free-brands-svg-icons';
import {
  faBullhorn,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faFilm,
  faFilter,
  faGripHorizontal,
  faGuitar,
  faListUl,
  faLanguage,
  faMusic,
  faPhotoVideo,
  faSearch,
  faShoppingCart,
  faSlidersH
} from '@fortawesome/free-solid-svg-icons';

// Utils
import configureStore, {history} from 'utils/configureStore';

// Components
import NavigationBar from 'components/partials/NavigationBar';

// Routes
import Dashboard from 'components/routes/Dashboard';
import Posts from 'components/routes/Posts';
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
  faFacebookF,
  faFilm,
  faFilter,
  faGripHorizontal,
  faGuitar,
  faInstagram,
  faLanguage,
  faListUl,
  faMusic,
  faPhotoVideo,
  faSearch,
  faShoppingCart,
  faSlidersH,
  faTumblr,
  faTwitter,
  faVimeoV,
  faYoutube
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
            <Route render={() => (<NotFound />)}/>
          </Switch>
        </div>
      </ConnectedRouter>
    </Provider>);
  }
}

export default App;
