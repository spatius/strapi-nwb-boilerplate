import React from 'react';
import { Route, Link } from 'react-router';
import GraphiQL from 'graphiql';
import fetch from 'isomorphic-fetch';
import URI from "urijs";

// import withStyles from "../decorators/withStyles";
import s from "./index.css";

// import "graphiql/graphiql.css";

function graphQLFetcher (graphQLParams) {
  console.log(graphQLParams);

  return fetch(URI(window.location.origin + '/graphql').query(graphQLParams), {
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
    // body: JSON.stringify(graphQLParams)
  }).then(response => response.json());
}

// @withStyles(s)
function GraphiqlView(props) {
  return (
    <article className={s.root}>
      <GraphiQL fetcher={graphQLFetcher} />
      <Link to="/" className="btn">Home</Link>
    </article>
  );
}

export const route = (
  <Route path="graphiql" component={GraphiqlView} />
);
