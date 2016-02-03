import "./SigninView.css";

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Helmet from "react-helmet";
import { propTypes } from 'react-props-decorators';

import { Heading } from "../elements";

import actions from "./actions";
import SigninForm from "./SigninForm";

@connect(
  state => state,
  actions
)
@propTypes({
  signin: PropTypes.func.isRequired
})
export default class SigninView extends Component {
  render() {
    const { signin } = this.props;

    return (
      <div className="signin">
        <Helmet title="Sign in" titleTemplate="Blog - %s"/>

        <Heading title="Sign in"/>

        <div className="content" style={{width: "80%", margin: "auto"}}>
          <h2 className="content-head is-center">Dolore magna aliqua. Uis aute irure.</h2>

          <div className="pure-g">
              <div className="pure-u-1 pure-u-md-2-5">
                <SigninForm submit={signin} submitting={false}/>
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
