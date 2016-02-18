import React from 'react';
import { Route } from 'react-router';

import PageView from "./PageView";

export default [
  <Route nameKey="page" path="/:route" component={PageView}/>
];
