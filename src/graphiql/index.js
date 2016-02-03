import "./index.css";

import React from 'react';
import { Route, Link } from 'react-router';
import GraphiQL from 'graphiql';
import Helmet from "react-helmet";

import { HeaderLink } from "../elements";
import { get } from "../fetch";

function graphQLFetcher(graphQLParams) {
  console.log(graphQLParams);

  return get('graphql', graphQLParams);
}

function GraphiqlView(props) {
  return (
    <div className="graphiql">
      <Helmet title="Graphiql" titleTemplate="Blog - %s"/>

      <GraphiQL fetcher={graphQLFetcher} />
    </div>
  );
}

export const headerLink = (
  <HeaderLink name="Graphiql" path="/graphiql"/>
);

export const route = (
  <Route path="/graphiql" component={GraphiqlView} />
);
