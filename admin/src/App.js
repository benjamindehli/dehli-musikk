// Dependencies
import React from 'react';
import { Provider } from 'react-redux';
import { Route, Routes } from 'react-router';
import { HistoryRouter as Router } from "redux-first-history/rr6";
import { registerLocale } from "react-datepicker";
import nb from 'date-fns/locale/nb';

import { library } from '@fortawesome/fontawesome-svg-core';
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
  faRss,
  faSearch,
  faShoppingCart,
  faSlidersH,
  faTrash,
  faUnlink
} from '@fortawesome/free-solid-svg-icons';

// Utils
import configureStore, { history } from 'utils/configureStore';

// Components
import NavigationBar from 'components/partials/NavigationBar';

// Routes
import Dashboard from 'components/routes/Dashboard';
import Posts from 'components/routes/Posts';
import Portfolio from 'components/routes/Portfolio';
import Videos from 'components/routes/Videos';
import Statistics from 'components/routes/Statistics';
import NotFound from 'components/routes/NotFound';

// Stylesheets
import style from 'App.module.scss';
import "react-datepicker/dist/react-datepicker.css";


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
  faRss,
  faSearch,
  faShoppingCart,
  faSlidersH,
  faTrash,
  faUnlink
);

registerLocale('nb', nb)

const initialState = {};
const store = configureStore(initialState);


const App = () => {
  return (<Provider store={store}>
    <Router history={history}>
      <NavigationBar />
      <div className={style.container}>
        <Routes>
          <Route exact={true} path="/" element={<Dashboard />} />
          <Route exact={true} path="/posts/" element={<Posts />} />
          <Route exact={true} path="/portfolio/" element={<Portfolio />} />
          <Route exact={true} path="/videos/" element={<Videos />} />
          <Route exact={true} path="/statistics/" element={<Statistics />} />
          <Route element={() => (<NotFound />)} />
        </Routes>
      </div>
    </Router>
  </Provider>);
}

export default App;
