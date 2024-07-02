// Dependencies
import React from 'react';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router';
import { HistoryRouter as Router } from "redux-first-history/rr6";
import loadable from "@loadable/component";
import { PrerenderedComponent } from "react-prerendered-component";
import { Helmet, HelmetProvider } from 'react-helmet-async';

import { library } from '@fortawesome/fontawesome-svg-core';
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
  faRss,
  faSearch,
  faShoppingCart,
  faSlidersH
} from '@fortawesome/free-solid-svg-icons';

// Utils
import configureStore, { history } from 'utils/configureStore';

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
const Search = prerenderedLoadable(() => import("./components/routes/Search"));
const Portfolio = prerenderedLoadable(() => import("./components/routes/Portfolio"));
const Posts = prerenderedLoadable(() => import("./components/routes/Posts"));
const Videos = prerenderedLoadable(() => import("./components/routes/Videos"));
const Products = prerenderedLoadable(() => import("./components/routes/Products"));
const Equipment = prerenderedLoadable(() => import("./components/routes/Equipment"));
const NotFound = prerenderedLoadable(() => import("./components/routes/NotFound"));

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
  faRss,
  faSearch,
  faShoppingCart,
  faSlidersH,
  faTumblr,
  faTwitter,
  faVimeoV,
  faYoutube
);

const initialState = {};

// Grab the state from a global variable injected into the server-generated HTML
const preloadedState = window.__PRELOADED_STATE__;

// Allow the passed state to be garbage-collected
delete window.__PRELOADED_STATE__;

const store = configureStore(preloadedState || initialState);

window.snapSaveState = () => ({
  __PRELOADED_STATE__: store.getState()
});

const App = () => {
  const selectedLanguageKey = window?.location?.pathname?.startsWith('/en/') ? 'en' : 'no';
  return (<Provider store={store}>
    <HelmetProvider>
      <Router history={history}>
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
          <link rel="alternate" type="application/rss-xml" title={selectedLanguageKey === 'en' ? 'Subscribe to Dehli Musikk news' : 'Abonner på Dehli Musikk nyheter'} href={`https://www.dehlimusikk.no/feed-${selectedLanguageKey}.rss`} />
        </Helmet>
        <NavigationBar />
        <div className={style.container}>
          <main>
            <Routes>
              <Route path="*" key={"/404.html"} element={<NotFound />} />
              <Route path="/404" key={"/404.html"} element={<NotFound />} />
              <Route path="/" element={<Home />} />
              <Route key={"/feed-no.rss"} path="/feed-no.rss" element={() => null} />
              <Route key={"/feed-en.rss"} path="/feed-en.rss" element={() => null} />
              <Route key={"/shell.html"} path="/shell.html" element={() => null} />
              <Route strict={true} path="/:selectedLanguage/" element={<Home />} />


              <Route strict={true} path="/search/" element={<Search />} />
              <Route strict={true} path="/:selectedLanguage/search/" element={<Search />} />
              <Route strict={true} path="/portfolio/:releaseId/" element={<Portfolio />} />
              <Route strict={true} path="/portfolio/" element={<Portfolio />} />
              <Route strict={true} path="/:selectedLanguage/portfolio/:releaseId/" element={<Portfolio />} />
              <Route strict={true} path="/:selectedLanguage/portfolio/" element={<Portfolio />} />

              <Route strict={true} path="/posts/:postId/" element={<Posts />} />
              <Route strict={true} path="/posts/" element={<Posts />} />
              <Route strict={true} path="/:selectedLanguage/posts/:postId/" element={<Posts />} />
              <Route strict={true} path="/:selectedLanguage/posts/" element={<Posts />} />

              <Route strict={true} path="/videos/:videoId/video/" element={<Videos />} />
              <Route strict={true} path="/videos/:videoId/" element={<Videos />} />
              <Route strict={true} path="/videos/" element={<Videos />} />
              <Route strict={true} path="/:selectedLanguage/videos/:videoId/video/" element={<Videos />} />
              <Route strict={true} path="/:selectedLanguage/videos/:videoId/" element={<Videos />} />
              <Route strict={true} path="/:selectedLanguage/videos/" element={<Videos />} />

              <Route strict={true} path="/products/:productId/" element={<Products />} />
              <Route strict={true} path="/products/" element={<Products />} />
              <Route strict={true} path="/:selectedLanguage/products/:productId/" element={<Products />} />
              <Route strict={true} path="/:selectedLanguage/products/" element={<Products />} />

              <Route strict={true} path="/equipment/:equipmentType/:equipmentId/" element={<Equipment />} />
              <Route strict={true} path="/equipment/:equipmentType/" element={<Equipment />} />
              <Route strict={true} path="/equipment/" element={<Equipment />} />
              <Route strict={true} path="/:selectedLanguage/equipment/:equipmentType/:equipmentId/" element={<Equipment />} />
              <Route strict={true} path="/:selectedLanguage/equipment/:equipmentType/" element={<Equipment />} />
              <Route strict={true} path="/:selectedLanguage/equipment/" element={<Equipment />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </HelmetProvider>
  </Provider>);
}


export default App;
