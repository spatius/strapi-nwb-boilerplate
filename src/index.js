import "purecss/build/pure.css";
// import "bootstrap-css-only/css/bootstrap.css";
import "graphiql/graphiql.css";
import "./index.css";

// Import all the third party stuff
// import "babel-polyfill";
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { syncHistory, routeReducer } from 'react-router-redux';
import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import {reducer as formReducer} from 'redux-form';
import FontFaceObserver from 'fontfaceobserver';

// Observer loading of Open Sans (to remove open sans, remove the <link> tag in the index.html file and this observer)
const openSansObserver = new FontFaceObserver('Open Sans', {});

// When Open Sans is loaded, add the js-open-sans-loaded class to the body
openSansObserver.check().then(() => {
  document.body.classList.add('js-open-sans-loaded');
}, () => {
  document.body.classList.remove('js-open-sans-loaded');
});

const rootReducer = combineReducers({
  router: routeReducer,
  form: formReducer,
  auth: require("./auth/reducers")
});

export default function configureStore ({ initialState = {}, history }) {
  // Sync with router via history instance (main.js)
  const routerMiddleware = syncHistory(history)

  // Compose final middleware and use devtools in debug environment
  let middleware = applyMiddleware(thunk, routerMiddleware)

  const devTools = window.devToolsExtension ? window.devToolsExtension() : f => f
  middleware = compose(middleware, devTools)

  // Create final store and subscribe router in debug env ie. for devtools
  const store = middleware(createStore)(rootReducer, initialState)
  routerMiddleware.listenForReplays(store, ({ router }) => router.location)

  // if (module.hot) {
  //   module.hot.accept('./rootReducer', () => {
  //     const nextRootReducer = require('./rootReducer').default
  //
  //     store.replaceReducer(nextRootReducer)
  //   })
  // }
  return store
}

const store = configureStore({history: browserHistory});

import Layout from "./layout";

const routes = [
  require("./home").route,
  require("./posts").route,
  require("./graphiql").route,
  ...require("./auth/routes"),
  require("./notFound").route
];

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route component={Layout}>
        {routes}
      </Route>
    </Router>
  </Provider>,
  document.getElementById('app')
);
