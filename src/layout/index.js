import React from 'react';
import { Route } from 'react-router';
import { connect } from 'react-redux';

import s from "./index.css";

function Layout({ children }) {
  return (
    <div className={s.root}>
      {children}
    </div>
  );
}

// REDUX: Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state
  };
}

export default connect(select)(Layout);
