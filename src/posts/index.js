import "./index.css";

import React from 'react';
import { Route } from 'react-router';
import Helmet from "react-helmet";

import { Heading, HeaderLink } from "../elements";

function PostsView(props) {
  return (
    <div className="posts">
      <Helmet title="Posts" titleTemplate="Blog - %s"/>

      <Heading title="Posts"/>
    </div>
  );
}

export const headerLink = (
  <HeaderLink name="Posts" path="/posts"/>
);

export const route = (
  <Route path="/posts" component={PostsView} />
);
