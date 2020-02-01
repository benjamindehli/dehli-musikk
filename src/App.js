// Dependencies
import React, {Component} from 'react';
import {Provider} from 'react-redux';
import {Route, Switch} from 'react-router';
import {ConnectedRouter} from 'connected-react-router';
import loadable from "@loadable/component";
import { PrerenderedComponent } from "react-prerendered-component";

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
import configureStore, {history} from 'utils/configureStore';

// Components
import NavigationBar from 'components/partials/NavigationBar';
import Footer from 'components/partials/Footer';
import NotFound from 'components/routes/NotFound';


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

library.add(faFacebookF, faInstagram, faTumblr, faTwitter, faVimeoV, faYoutube, faGripHorizontal, faListUl, faLanguage, faChevronDown)

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
        <NavigationBar/>
        <div className={style.container}>
          <Switch>
            <Route exact={true} path="/portfolio/" render={() => (<Portfolio/>)}/>
            <Route exact={true} path="/:selectedLanguage/portfolio/" render={(props) => (<Portfolio {...props}/>)}/>
            <Route exact={true} path="/posts/:postId/" render={(props) => (<Posts {...props}/>)}/>
            <Route exact={true} path="/posts/" render={() => (<Posts/>)}/>
            <Route exact={true} path="/:selectedLanguage/posts/:postId/" render={(props) => (<Posts {...props}/>)}/>
            <Route exact={true} path="/:selectedLanguage/posts/" render={(props) => (<Posts {...props}/>)}/>
            <Route exact={true} path="/:selectedLanguage" render={(props) => (<Home {...props}/>)}/>
            <Route exact={true} path="/:selectedLanguage/" render={(props) => (<Home {...props}/>)}/>
            <Route exact={true} path="/" render={() => (<Home/>)}/>
            <Route
           key={"/shell.html"}
           path="/shell.html"
           component={() => null}
         />
          <Route key={"/404.html"} component={NotFound} />
            <Route render={() => (<NotFound/>)}/>
          </Switch>
          <Footer/>
        </div>
      </ConnectedRouter>
    </Provider>);
  }
}

export default App;
