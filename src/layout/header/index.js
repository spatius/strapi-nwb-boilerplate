import "./index.less";

import React, { Component, PropTypes } from 'react';
import { Route, Link } from 'react-router';
import { connect } from 'react-redux';
import classnames from "classnames";
import { propTypes, contextTypes } from 'react-props-decorators';

import { HeaderLink } from "../../elements";
import AuthLink from "../../auth/headerLink";

const links = [
  require("../../posts").headerLink,
  // require("../../auth/headerLink").default
];

@connect(state => state)
@propTypes({
  auth: PropTypes.object.isRequired,
  pages: PropTypes.object.isRequired,
  breadcrumbs: PropTypes.array.isRequired,
  classes: PropTypes.object
})
@contextTypes({
  router: PropTypes.object.isRequired
})
export default class Header extends Component {
  render() {
    var { auth: { loggedIn, user }, pages: { status, data, error }, breadcrumbs: [ brand, ...routes ], classes, children } = this.props;
    const { router } = this.context;
    const breadcrumbs = [
      <HeaderLink className="brand" index {...brand}/>,
      ...routes.map(route => <HeaderLink {...route}/>)
    ];

    classes = Object.assign(classes || {}, {
      header: true
    });

    const hello = "Hello " + (loggedIn && user ? user.username : "Guest");

    return (
      <div className={classnames(classes)}>
        <ul className="breadcrumb breadcrumb-path">
          {breadcrumbs}
        </ul>

        <ul className="right">
          <li>{hello}</li>
          {status == 2 && data.map(({ title, route }) => <HeaderLink name={title} path={route}/>)}
          {links}
          <AuthLink/>
        </ul>
      </div>
    );
  }
}
