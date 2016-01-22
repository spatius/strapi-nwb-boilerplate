import React from 'react';
import { Route, Link } from 'react-router';

import s from "./index.css";

function PostsView(props) {
  return (
    <article className={s.root}>
      <h1>Posts</h1>
      <Link to="/" className="btn">Home</Link>
    </article>
  );
}

export const route = (
  <Route path="posts" component={PostsView} />
);
