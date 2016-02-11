import "./PasswordResetView.css";

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { propTypes } from 'react-props-decorators';

import actions from "./actions";
import ForgotPasswordForm from "./ForgotPasswordForm";
import ChangePasswordForm from "./ChangePasswordForm";

@connect(state => state, actions)
@propTypes({
  router: PropTypes.object.isRequired,
  forgotPassword: PropTypes.func.isRequired,
  changePassword: PropTypes.func.isRequired
})
export default class PasswordResetView extends Component {
  render() {
    const { router: { location: { query: { token } } }, forgotPassword, changePassword } = this.props;

    return (
      <div className="password-reset">
        {token
          ? <ChangePasswordForm submit={changePassword} submitting={false} token={token}/>
          : <ForgotPasswordForm submit={forgotPassword} submitting={false}/>}
      </div>
    );
  }
}
