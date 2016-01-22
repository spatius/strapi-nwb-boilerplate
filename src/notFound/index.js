import React from 'react';
import { Route, Link } from 'react-router';

import s from "./index.css";

function NotFoundView(props) {
  return (
    <article className={s.root}>
      <h1>Page not found.</h1>
      <Link to="/" className="btn">Home</Link>
    </article>
  );
}

export const route = (
  <Route path="*" component={NotFoundView} />
);
