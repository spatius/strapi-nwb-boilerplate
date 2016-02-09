import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { propTypes, contextTypes } from 'react-props-decorators';

import { HeaderLink } from "../elements";

import actions from "./actions";

@connect(
  state => state,
  actions
)
@propTypes({
  auth: PropTypes.object.isRequired,
  signout: PropTypes.func.isRequired
})
@contextTypes({
  router: PropTypes.object.isRequired
})
export default class AuthLink extends Component {
  render() {
    const { auth: { loggedIn }, signout } = this.props;
    const { router } = this.context;

    if(loggedIn)
      return <HeaderLink name="Sign out" onClick={signout}/>;

    if(router.isActive("/signup"))
      return <HeaderLink name="Sign in" path="/signin"/>;

    return <HeaderLink name="Manage pages" path="/signup"/>
  }
}
