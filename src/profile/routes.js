import React from 'react';
import { Route } from 'react-router';

import ProfileView from "./ProfileView";

export default [
  <Route name="Profile" path="/profile" component={ProfileView} />
];
