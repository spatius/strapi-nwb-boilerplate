import "./index.css";

import React, { Component } from 'react';
import { IndexRoute } from 'react-router';
import { connect } from 'react-redux';

@connect(state => state)
class HomeView extends Component {
  render() {
    return (
      <div className="home">
      </div>
    );
  }
}

export const route = (
  <IndexRoute name="Blog" component={HomeView} />
);
