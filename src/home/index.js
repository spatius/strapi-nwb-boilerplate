import React from 'react';
import { Route, Link } from 'react-router';
import { connect } from 'react-redux';

// import { asyncChangeProjectName, asyncChangeOwnerName } from '../../js/actions/AppActions';

import s from "./index.css";

function HomeView({ dispatch, data }) {
  const { projectName, ownerName } = data;

  return (
    <article className={s.root}>
      <h1>Hello World!</h1>
      <h2>This is the demo for the <span className="home__text--red">{ projectName }</span> by <a href={'https://twitter.com/' + ownerName} >@{ ownerName }</a></h2>
      <label className="home__label">Change to your project name:
        {/*<input className="home__input" type="text" onChange={(evt) => { dispatch(asyncChangeProjectName(evt.target.value)); }} defaultValue="React.js Boilerplate" value={projectName} />*/}
      </label>
      <label className="home__label">Change to your name:
        {/*<input className="home__input" type="text" onChange={(evt) => { dispatch(asyncChangeOwnerName(evt.target.value)); }} defaultValue="mxstbr" value={ownerName} />*/}
      </label>
      <Link className="btn" to="/posts">Posts</Link>
      <Link className="btn" to="/graphiql">Graphiql</Link>
    </article>
  );
}

// REDUX: Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state
  };
}

export const route = (
  <Route path="/" component={connect(select)(HomeView)} />
);