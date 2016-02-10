import "./index.css";

import React, { Component, PropTypes } from 'react';
import { Route } from 'react-router';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { propTypes, contextTypes } from 'react-props-decorators';

import { Heading } from "../elements";

import Header from "./header";

@connect(
  state => state,
  Object.assign({}, require("../auth/actions"), require("../page/actions"))
)
@propTypes({
  auth: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  pages: PropTypes.array.isRequired,
  routes: PropTypes.array.isRequired,
  fetchUser: PropTypes.func.isRequired,
  fetchPages: PropTypes.func.isRequired
})
@contextTypes({
  router: PropTypes.object.isRequired
})
export default class Layout extends Component {
  render() {
    const { auth: { loggedIn, user }, params: { id }, pages, fetchUser, fetchPages, routes: [ head, ...tail ], children } = this.props;
    const { router } = this.context;
    const name = (tail.length ? tail[tail.length - 1].name : null) || (id && pages[id - 1] ? pages[id - 1].title : null) || "???";
    const title = tail.map(({ name }) => name).join(" / "); // TODO: fix dynamic breadcrumbs

    document.title = "Blog - " + title;

    if(loggedIn && !user)
      fetchUser();

    if(!pages.length)
      fetchPages();

    return (
      <div className="layout">
        <Header routes={tail} children={children}/>
        <Header routes={tail} children={children} classes={{fixed: true}}/>

        {/*<Helmet title={title} titleTemplate="Blog - %s"/>*/}

        <Heading title={name}/>

        {children}
      </div>
    );
  }
}
