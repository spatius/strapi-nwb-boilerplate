import "./index.css";

import React, { Component, PropTypes } from 'react';
import { Route } from 'react-router';
import { formatPattern } from 'react-router/lib/PatternUtils';
// import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { propTypes, contextTypes } from 'react-props-decorators';

import { Heading } from "../elements";

import Header from "./header";

function buildBreadcrumbs([ root, current ], params, titles) {
  var list = [ { name: root.indexRoute.name, path: root.path } ];

  if(root.indexRoute === current)
    return list;

  return [
    ...list,
    { name: current.name || titles[current.nameKey] || "...", path: formatPattern(current.path, params) }
  ];
}

@connect(
  state => state,
  Object.assign({}, require("../auth/actions"), require("../page/actions"), require("../ifv/actions"))
)
@propTypes({
  api: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired,
  fetchUser: PropTypes.func.isRequired,
  fetchPages: PropTypes.func.isRequired,
  fetchSections: PropTypes.func.isRequired,
})
@contextTypes({
  router: PropTypes.object.isRequired
})
export default class Layout extends Component {
  // TODO: Move me out!
  componentDidMount() {
    const { api: { user, pages: { status } }, fetchUser, fetchPages, fetchSections } = this.props;

    const jwt = localStorage.getItem("jwt");

    if(!!jwt && !user.data)
      fetchUser();

    if(status == 0)
      fetchPages();

    fetchSections();
  }

  render() {
    const { routes, params, titles, children } = this.props;
    const { router } = this.context;

    const breadcrumbs = buildBreadcrumbs(routes, params, titles);

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
