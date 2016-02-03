import "./SignupView.css";

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from "react-helmet";
import { propTypes } from 'react-props-decorators';

import { Heading } from "../elements";

import actions from "./actions";
import SignupForm from "./SignupForm";

@connect(
  state => state,
  actions
)
@propTypes({
  signup: PropTypes.func.isRequired
})
export default class SignupView extends Component {
  render() {
    const { signup } = this.props;

    return (
      <div className="signup">
        <Helmet title="Sign up" titleTemplate="Blog - %s"/>

        <Heading title="Sign up"/>

        <div className="content" style={{width: "80%", margin: "auto"}}>
          <h2 className="content-head is-center">Dolore magna aliqua. Uis aute irure.</h2>

          <div className="pure-g">
              <div className="pure-u-1 pure-u-md-1-5">
                <SignupForm submit={signup} submitting={false}/>
              </div>

              <div className="l-box-lrg pure-u-1 pure-u-md-3-5">
                  <h4>Contact Us</h4>
                  <p>
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                      tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
                      quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                      consequat.
                  </p>

                  <h4>More Information</h4>
                  <p>
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                      tempor incididunt ut labore et dolore magna aliqua.
                  </p>
              </div>
          </div>
        </div>
      </div>
    );
  }
}
