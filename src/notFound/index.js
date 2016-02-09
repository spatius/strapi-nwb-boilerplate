import "./index.css";

import React from 'react';
import { Route } from 'react-router';

function NotFoundView(props) {
  return (
    <div className="notFound">
    </div>
  );
}

export const route = (
  <Route name="Page not found" path="*" component={NotFoundView} />
);
