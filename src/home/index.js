import "./index.css";

import React from 'react';
import { Route, Link } from 'react-router';
import { connect } from 'react-redux';

import { HeaderLink } from "../elements";

function HomeView({ dispatch, data }) {
  const { projectName, ownerName } = data;

  return (
    <div className="home">
    </div>
  );
}

// REDUX: Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state
  };
}

export const headerLink = (
  <HeaderLink name="Home" path="/"/>
);

export const route = (
  <Route name="Home" path="/" component={connect(select)(HomeView)} />
);
