import React from 'react';
import { Route } from 'react-router';

import SigninView from "./SigninView";
import SignupView from "./SignupView";

export default [
  <Route name="Sign in" path="/signin" component={SigninView} />,
  <Route name="Sign up" path="/signup" component={SignupView} />
];
