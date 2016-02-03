import "./index.css";

import React, { Component, PropTypes } from 'react';
import { Route } from 'react-router';
import { connect } from 'react-redux';
import { propTypes, contextTypes } from 'react-props-decorators';

import actions from "../auth/actions";

import Header from "./header";

@connect(
  state => state,
  actions
)
@propTypes({
  auth: PropTypes.object.isRequired,
  fetchUser: PropTypes.func.isRequired
})
@contextTypes({
  router: PropTypes.object.isRequired
})
export default class Layout extends Component {
  render() {
    const { auth: { loggedIn, user }, fetchUser, children } = this.props;
    const { router } = this.context;

    if(loggedIn && !user)
      fetchUser();

    return (
      <div className="layout">
        <div className="layout-header">
          {/* Pass children to refresh the header when route changes */}
          <Header children={children}/>
        </div>

        <div className="layout-content">
          {children}
        </div>
      </div>
    );
  }
}
