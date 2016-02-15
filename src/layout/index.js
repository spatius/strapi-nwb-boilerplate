import "./index.css";

import React, { Component, PropTypes } from 'react';
import { Route } from 'react-router';
// import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { propTypes, contextTypes } from 'react-props-decorators';

import { Heading } from "../elements";

import Header from "./header";

function buildBreadcrumbs([ root, current ], page) {
  var list = [ { name: root.indexRoute.name, path: root.path } ];

  if(root.indexRoute === current)
    return list;

  return [
    ...list,
    !current.name
      ? { name: page.title, path: page.route }
      : { name: current.name, path: current.path }
  ];
}

@connect(
  state => state,
  Object.assign({}, require("../auth/actions"), require("../page/actions"), require("../ifv/actions"))
)
@propTypes({
  auth: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  pages: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired,
  fetchUser: PropTypes.func.isRequired,
  fetchPages: PropTypes.func.isRequired,
  fetchSections: PropTypes.func.isRequired
})
@contextTypes({
  router: PropTypes.object.isRequired
})
export default class Layout extends Component {
  componentDidMount() {
    const { auth: { loggedIn, user }, pages: { status }, fetchUser, fetchPages, fetchSections } = this.props;

    if(loggedIn && !user)
      fetchUser();

    if(status == 0)
      fetchPages();

    fetchSections();
  }

  render() {
    const { auth: { loggedIn, user }, params: { route }, pages: { status, data }, routes, children } = this.props;
    const { router } = this.context;

    // TODO: Find out a better way
    const breadcrumbs = buildBreadcrumbs(routes, status == 2 && route && data.find(item => item.route.indexOf(route) > -1));

    document.title = breadcrumbs.map(item => item.name).join(" / ");

    return (
      <div className="layout">
        <Header breadcrumbs={breadcrumbs} children={children}/>
        <Header breadcrumbs={breadcrumbs} children={children} classes={{fixed: true}}/>

        {/*<Helmet title={title} titleTemplate="Blog - %s"/>*/}

        <Heading title={breadcrumbs[breadcrumbs.length - 1].name}/>

        {children}
      </div>
    );
  }
}
