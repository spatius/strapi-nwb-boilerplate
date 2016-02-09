import "./index.css";

import React, { Component, PropTypes } from 'react';
import { Route } from 'react-router';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { propTypes, contextTypes } from 'react-props-decorators';

import { Heading } from "../elements";
import actions from "../auth/actions";

import Header from "./header";

@connect(
  state => state,
  actions
)
@propTypes({
  auth: PropTypes.object.isRequired,
  routes: PropTypes.array.isRequired,
  fetchUser: PropTypes.func.isRequired
})
@contextTypes({
  router: PropTypes.object.isRequired
})
export default class Layout extends Component {
  render() {
    const { auth: { loggedIn, user }, fetchUser, routes: [ head, ...tail ], children } = this.props;
    const { router } = this.context;
    const name = tail.length ? tail[tail.length - 1].name : "???";
    const title = tail.map(({ name }) => name).join(" / ");

    if(loggedIn && !user)
      fetchUser();

    return (
      <div className="layout">
        <Header routes={tail} children={children}/>
        <Header routes={tail} children={children} classes={{fixed: true}}/>

        <Helmet title={title} titleTemplate="Blog - %s"/>

        <Heading title={name}/>

        {children}
      </div>
    );
  }
}
