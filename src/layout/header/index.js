import "./index.less";

import React, { Component, PropTypes } from 'react';
import { Route, Link } from 'react-router';
import { connect } from 'react-redux';
import classnames from "classnames";
import { propTypes, contextTypes } from 'react-props-decorators';

import { HeaderLink } from "../../elements";
import AuthLink from "../../auth/headerLink";

const pages = [ { name: "About", path: "/page/1" }, { name: "About 2", path: "/page/2" }, { name: "About 3", path: "/page/3" } ];

const links = [
  require("../../home").headerLink,
  ...pages.map(({ name, path }) => <HeaderLink name={name} path={path}/>),
  require("../../posts").headerLink,
  // require("../../auth/headerLink").default
];

@connect(
  state => state
)
@propTypes({
  auth: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired,
  classes: PropTypes.object
})
@contextTypes({
  router: PropTypes.object.isRequired
})
export default class Header extends Component {
  render() {
    var { auth: { loggedIn, user }, routes, classes, children } = this.props;
    const { router } = this.context;

    classes = Object.assign(classes || {}, {
      header: true
    });

    const hello = "Hello " + (loggedIn && user ? user.username : "Guest");

    return (
      <div className={classnames(classes)}>
        <ul className="breadcrumb breadcrumb-path">
          <li><Link className="brand" to="/">Blog</Link></li>
          {routes.map(({ name, path }) => <HeaderLink name={name} path={path}/>)}
        </ul>

        <ul className="right">
          <li>{hello}</li>
          {links}
          <AuthLink/>
        </ul>
      </div>
    );
  }
}
