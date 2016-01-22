/**
 *
 * app.js
 *
 * This is the entry file for the application, mostly just setup and boilerplate
 * code. Routes are configured at the end of this file!
 *
 */

// Import all the third party stuff
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Router, Route, browserHistory } from 'react-router';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import FontFaceObserver from 'fontfaceobserver';

// Observer loading of Open Sans (to remove open sans, remove the <link> tag in the index.html file and this observer)
const openSansObserver = new FontFaceObserver('Open Sans', {});

// When Open Sans is loaded, add the js-open-sans-loaded class to the body
openSansObserver.check().then(() => {
  document.body.classList.add('js-open-sans-loaded');
}, () => {
  document.body.classList.remove('js-open-sans-loaded');
});

// Import the CSS file, which HtmlWebpackPlugin transfers to the build folder
// import '../css/main.css';

// Create the store with the redux-thunk middleware, which allows us
// to do asynchronous things in the actions
import rootReducer from './reducers';
const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);
const store = createStoreWithMiddleware(rootReducer);

// Make reducers hot reloadable, see http://stackoverflow.com/questions/34243684/make-redux-reducers-and-other-non-components-hot-loadable
// if (module.hot) {
//   module.hot.accept('../js/reducers/rootReducer', () => {
//     const nextRootReducer = require('../js/reducers/rootReducer').default;
//     store.replaceReducer(nextRootReducer);
//   });
// }

// Views
import Layout from "./layout";

// Routes
import {route as home} from "./home";
import {route as posts} from "./posts";
import {route as graphiql} from "./graphiql";
import {route as login} from "./login";
import {route as notFound} from "./notFound";

ReactDOM.render(
  <Provider store={store}>
    <Router history={browserHistory}>
      <Route component={Layout}>
        {home}
        {posts}
        {graphiql}
        {login}
        {notFound}
      </Route>
    </Router>
  </Provider>,
  document.getElementById('app')
);

// <Route path="*" component={NotFoundPage} />
