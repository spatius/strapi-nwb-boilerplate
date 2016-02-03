import "./index.css";

import React, { Component, PropTypes } from 'react';
import { Route, Link } from 'react-router';
import { connect } from 'react-redux';
import classnames from "classnames";
import { propTypes, contextTypes } from 'react-props-decorators';

import AuthLink from "../../auth/headerLink";

const links = [
  require("../../home").headerLink,
  require("../../posts").headerLink,
  require("../../graphiql").headerLink,
  // require("../../auth/headerLink").default
];

@connect(
  state => state
)
@propTypes({
  auth: PropTypes.object.isRequired
})
@contextTypes({
  router: PropTypes.object.isRequired
})
export default class Header extends Component {
  render() {
    const { auth: { loggedIn, user }, children } = this.props;
    const { router } = this.context;

    var classes = {
      "home-menu": true,
      "pure-menu": true,
      "pure-menu-horizontal": true
    };

    const hello = "Hello " + (loggedIn && user ? user.username : "Guest");

    return (
      <div className={classnames(classes)}>
        <Link className="pure-menu-heading" to="/">Blog</Link>

        <ul className="pure-menu-list">
          <li className="pure-menu-item">{hello}</li>
          {links}
          <AuthLink/>
        </ul>
      </div>
    );
  }
}
