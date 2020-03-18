// Dependencies
import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {Route, Switch} from 'react-router';
import {ConnectedRouter} from 'connected-react-router';
import loadable from "@loadable/component";
import { PrerenderedComponent } from "react-prerendered-component";
import {Helmet} from 'react-helmet';
import WebFont from 'webfontloader';

import {library} from '@fortawesome/fontawesome-svg-core'
import {
  faFacebookF,
  faInstagram,
  faTumblr,
  faTwitter,
  faVimeoV,
  faYoutube
} from '@fortawesome/free-brands-svg-icons'
import {faGripHorizontal, faListUl, faLanguage, faChevronDown, faPhotoVideo, faMusic, faSearch} from '@fortawesome/free-solid-svg-icons'

// Utils
import configureStore, {history} from 'utils/configureStore';

// Components
import NavigationBar from 'components/partials/NavigationBar';
import Footer from 'components/partials/Footer';

// Assets
import openGraphImage from 'assets/images/DehliMusikk-OpenGraph.jpg';

// Stylesheets
import style from 'App.module.scss';


const prerenderedLoadable = dynamicImport => {
  const LoadableComponent = loadable(dynamicImport);
  return React.memo(props => (
    <PrerenderedComponent live={LoadableComponent.load()}>
      <LoadableComponent {...props} />
    </PrerenderedComponent>
  ));
};


const Home = prerenderedLoadable(() => import("./components/routes/Home"));
const Portfolio = prerenderedLoadable(() => import("./components/routes/Portfolio"));
const Posts = prerenderedLoadable(() => import("./components/routes/Posts"));
const Equipment = prerenderedLoadable(() => import("./components/routes/Equipment"));
const NotFound = prerenderedLoadable(() => import("./components/routes/NotFound"));

WebFont.load({
  google: {
    families: ['Roboto:400,700&display=swap']
  }
});

library.add(faFacebookF, faInstagram, faTumblr, faTwitter, faVimeoV, faYoutube, faGripHorizontal, faListUl, faLanguage, faChevronDown, faSearch, faMusic, faPhotoVideo)

const initialState = {};

// Grab the state from a global variable injected into the server-generated HTML
const preloadedState = window.__PRELOADED_STATE__;

// Allow the passed state to be garbage-collected
delete window.__PRELOADED_STATE__;

const store = configureStore(preloadedState || initialState);

window.snapSaveState = () => ({
  __PRELOADED_STATE__: store.getState()
});

class App extends Component {
  render() {
    return (<Provider store={store}>
      <ConnectedRouter history={history}>
        <Helmet>
          <meta property="og:type" content="website" />
          <meta property="og:image" content={`https://www.dehlimusikk.no${openGraphImage}`} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:site_name" content="Dehli Musikk" />
          <meta property="fb:app_id" content="525744544728800" />
          <meta name="twitter:card" content="summary"></meta>
          <meta name="twitter:site" content="@BenjaminDehli" />
          <meta name="twitter:creator" content="@BenjaminDehli" />
          <meta name="twitter:image" content={`https://www.dehlimusikk.no${openGraphImage}`} />
        </Helmet>
        <NavigationBar/>
        <div className={style.container}>
          <Switch>

            <Route exact={true} strict={true} path="/portfolio/:releaseId/" render={(props) => (<Portfolio {...props}/>)}/>
            <Route exact={true} strict={true} path="/portfolio/" render={() => (<Portfolio/>)}/>
            <Route exact={true} strict={true} path="/:selectedLanguage/portfolio/:releaseId/" render={(props) => (<Portfolio {...props}/>)}/>
            <Route exact={true} strict={true} path="/:selectedLanguage/portfolio/" render={(props) => (<Portfolio {...props}/>)}/>

            <Route exact={true} strict={true} path="/posts/:postId/" render={(props) => (<Posts {...props}/>)}/>
            <Route exact={true} strict={true} path="/posts/" render={() => (<Posts/>)}/>
            <Route exact={true} strict={true} path="/:selectedLanguage/posts/:postId/" render={(props) => (<Posts {...props}/>)}/>
            <Route exact={true} strict={true} path="/:selectedLanguage/posts/" render={(props) => (<Posts {...props}/>)}/>

            <Route exact={true} strict={true} path="/equipment/:equipmentId/" render={(props) => (<Equipment {...props}/>)}/>
            <Route exact={true} strict={true} path="/equipment/" render={() => (<Equipment/>)}/>
            <Route exact={true} strict={true} path="/:selectedLanguage/equipment/:equipmentId/" render={(props) => (<Equipment {...props}/>)}/>
            <Route exact={true} strict={true} path="/:selectedLanguage/equipment/" render={(props) => (<Equipment {...props}/>)}/>




            <Route exact={true} strict={true} path="/:selectedLanguage/" render={(props) => (<Home {...props}/>)}/>


            <Route exact={true} path="/" render={() => (<Home/>)}/>
            <Route key={"/shell.html"} path="/shell.html" component={() => null} />
            <Route key={"/404.html"} component={NotFound} />
            <Route render={() => (<NotFound />)}/>

          </Switch>
          <Footer/>
        </div>
      </ConnectedRouter>
    </Provider>);
  }
}

export default App;
