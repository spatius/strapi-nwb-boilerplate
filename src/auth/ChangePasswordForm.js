import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { reduxForm } from 'redux-form';
import { propTypes } from 'react-props-decorators';

import css from 'react-css-modules';

const validate = values => {
  const errors = {};
  if (!values.password) {
    errors.password = ['required'];
  } else if (values.password.length < 5) {
    errors.password = ['too short'];
  }
  if (!values.password2) {
    errors.password2 = ['required'];
  } else if (values.password2.length < 5) {
    errors.password2 = ['too short'];
  }
  if(!errors.password && !errors.password2 && values.password != values.password2)
    errors.password = errors.password2 = ["different"];
  return errors;
};

function showErrors(array) {
  if(!array)
    return "";

  if(array instanceof Array)
    return "is " + array.join(" and ");

  return "is " + array;
}

@reduxForm({
  form: "change-password",
  fields: ["token", 'password', 'password2'],
  validate
}, (state, { token }) => ({ initialValues: { token } }))
@propTypes({
  token: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func,
  submitting: PropTypes.bool
})
@css(require("./ChangePasswordForm.css"), { allowMultiple: true })
export default class ChangePasswordForm extends Component {
  render() {
    const { fields: { token, password, password2 }, handleSubmit, submit, submitting, error } = this.props;

    return (
      <form styleName="root" className="forms" onSubmit={handleSubmit(submit)}>
        {error && <div className="alert alert-error">{error}</div>}

        <section>
          <label>Password {password.error && <span className="error">{showErrors(password.error)}</span>}</label>
          <input type="password" {...password}/>
        </section>

        <section>
          <label>Confirm Password {password2.error && <span className="error">{showErrors(password2.error)}</span>}</label>
          <input type="password" {...password2}/>
        </section>

        <p>
          <button type="primary" className="width-12" disabled={submitting}>
            {submitting ? <i/> : <i/>} Change
          </button>
        </p>

        <p><Link to="/signin" className="small color-black">Have account?</Link></p>
        <p><Link to="/signup" className="small color-black">Don't have account?</Link></p>
      </form>
    );
  }
}
