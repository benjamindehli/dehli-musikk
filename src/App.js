// Dependencies
import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {Route, Switch} from 'react-router';
import {ConnectedRouter} from 'connected-react-router';
import {Helmet, HelmetProvider} from 'react-helmet-async';

import {library} from '@fortawesome/fontawesome-svg-core'
import {
  faFacebookF,
  faInstagram,
  faTumblr,
  faTwitter,
  faVimeoV,
  faYoutube
} from '@fortawesome/free-brands-svg-icons'
import {faGripHorizontal, faListUl, faLanguage, faChevronDown} from '@fortawesome/free-solid-svg-icons'

// Utils
import configureStore, {history} from './utils/configureStore';

// Components
import NavigationBar from './components/partials/NavigationBar';
import Footer from './components/partials/Footer';
import NotFound from './components/routes/NotFound';
import Home from './components/routes/Home';
import Portfolio from './components/routes/Portfolio';

// Stylesheets
import style from './App.module.scss';

library.add(faFacebookF, faInstagram, faTumblr, faTwitter, faVimeoV, faYoutube, faGripHorizontal, faListUl, faLanguage, faChevronDown)

const initialState = {};
const store = configureStore(initialState);

class App extends Component {
  render() {
    return (<Provider store={store}>
      <ConnectedRouter history={history}>
      <HelmetProvider>
        <Helmet>
        <script type="application/ld+json">{`
          {
            "@context": "http://schema.org",
            "@type": "WebSite",
            "name": "Dehli Musikk"
          }
        `}</script>
        </Helmet>
        <NavigationBar/>
        <div className={style.container}>
          <Switch>
            <Route exact={true} path="/portfolio" render={() => (<Portfolio/>)}/>
            <Route exact={true} path="/:selectedLanguage/portfolio" render={(props) => (<Portfolio {...props}/>)}/>
            <Route exact={true} path="/:selectedLanguage" render={(props) => (<Home {...props}/>)}/>
            <Route exact={true} path="/" render={() => (<Home/>)}/>
            <Route render={() => (<NotFound/>)}/>
          </Switch>
          <Footer/>
        </div>
        </HelmetProvider>
      </ConnectedRouter>
    </Provider>);
  }
}

export default App;
