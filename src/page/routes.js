import React from 'react';
import { Route } from 'react-router';

import PageView from "./PageView";

export default [
  <Route name="Page x" path="/page/:id" component={PageView} />,
];
