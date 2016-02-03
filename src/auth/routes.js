import React from 'react';
import { Route } from 'react-router';

import SigninView from "./SigninView";
import SignupView from "./SignupView";

export default [
  <Route path="/signin" component={SigninView} />,
  <Route path="/signup" component={SignupView} />
];
