import React, { Component } from 'react';
import { Route, Link } from 'react-router';
import { connect } from 'react-redux';
import t from 'tcomb-form';

import s from "./index.css";

const Form = t.form.Form;

const loginModel = t.struct({
  username: t.String,
  password: t.String
}, "login");

const loginOptions = {
  fields: {
    password: {  type: "password" }
  }
};

class LoginView extends Component {
  constructor() {
    super();

    this.login = (e) => {
      e.preventDefault();

      const value = this.refs.form.getValue();

      console.log(this, arguments, value);
    }
  }

  render() {
    return (
      <article className={s.root}>
        <h1>Login</h1>

        <form onSubmit={this.login}>
          <Form ref="form" type={loginModel} options={loginOptions} />

          <button type="submit">Log In</button>
        </form>
      </article>
    );
  }
}

// REDUX: Which props do we want to inject, given the global state?
function select(state) {
  return {
    data: state
  };
}

export const route = (
  <Route path="/login" component={connect(select)(LoginView)} />
);
