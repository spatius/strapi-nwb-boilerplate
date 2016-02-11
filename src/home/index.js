import "./index.css";

import React from 'react';
import { IndexRoute } from 'react-router';
import { connect } from 'react-redux';

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

export const route = (
  <IndexRoute name="Blog" component={connect(select)(HomeView)} />
);
