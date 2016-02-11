import "./index.css";

import React, { Component } from 'react';
import { Route } from 'react-router';

import { HeaderLink } from "../elements";
import { authenticated } from "../decorators";

@authenticated()
class PostsView extends Component {
  render() {
    return (
      <div className="posts">
      </div>
    );
  }
}

export const headerLink = (
  <HeaderLink name="Posts (protected)" path="/posts"/>
);

export const route = (
  <Route name="Posts" path="/posts" component={PostsView} />
);
