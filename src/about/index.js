import "./index.css";

import React from 'react';
import { Route, Link } from 'react-router';
import { connect } from 'react-redux';
import Helmet from "react-helmet";
import Quill from "react-quill";

import { Heading, HeaderLink } from "../elements";

import PageForm from "../page/PageForm";

// import { asyncChangeProjectName, asyncChangeOwnerName } from '../../js/actions/AppActions';

function AboutView({ dispatch, data }) {
  const { projectName, ownerName } = data;

  return (
    <div className="about">
      <Helmet title="About" titleTemplate="Blog - %s"/>

      <Heading title="About"/>

      <PageForm submit={() => console.log("submit", arguments)}/>

      <Quill value="test" onChange={() => console.log(this, arguments)}/>
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
  <HeaderLink name="About" path="/about"/>
);

export const route = (
  <Route path="/about" component={connect(select)(AboutView)} />
);
