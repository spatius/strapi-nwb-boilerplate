import "./index.css";

import React from 'react';
import { Route } from 'react-router';
import Helmet from "react-helmet";

import { Heading } from "../elements";

function NotFoundView(props) {
  return (
    <div className="notFound">
      <Helmet title="Page not found" titleTemplate="Blog - %s"/>

      <Heading title="Page not found"/>
    </div>
  );
}

export const route = (
  <Route path="*" component={NotFoundView} />
);
