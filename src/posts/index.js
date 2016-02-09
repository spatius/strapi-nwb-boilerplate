import "./index.css";

import React from 'react';
import { Route } from 'react-router';

import { HeaderLink } from "../elements";

function PostsView(props) {
  return (
    <div className="posts">
    </div>
  );
}

export const headerLink = (
  <HeaderLink name="Posts" path="/posts"/>
);

export const route = (
  <Route name="Posts" path="/posts" component={PostsView} />
);
