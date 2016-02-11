import React from 'react';
import { Route } from 'react-router';

import PageView from "./PageView";

function onEnter({ params: { route } }, replace) {
  console.log(route);

  replace("/404");
}

export default [
  <Route path="/:route" component={PageView}/> //  onEnter={onEnter} />,
];
