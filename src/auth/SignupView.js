import "./SignupView.css";

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { propTypes } from 'react-props-decorators';

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
        <SignupForm submit={signup} submitting={false}/>
      </div>
    );
  }
}
