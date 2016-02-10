import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { reduxForm } from 'redux-form';
import { propTypes } from 'react-props-decorators';

import css from 'react-css-modules';

const validate = values => {
  const errors = {};
  if (!values.email) {
    errors.email = ['required'];
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = ['invalid'];
  }

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
  form: "forgot-password",
  fields: ['email'],
  validate
})
@propTypes({
  handleSubmit: PropTypes.func,
  submitting: PropTypes.bool
})
@css(require("./ForgotPasswordForm.css"), { allowMultiple: true })
export default class ForgotPasswordForm extends Component {
  render() {
    const { fields: { email }, handleSubmit, submit, submitting, error } = this.props;

    return (
      <form styleName="root" className="forms" onSubmit={handleSubmit(submit)}>
        {error && <div className="alert alert-error">{error}</div>}

        <section>
          <label>Email {email.error && <span className="error">{showErrors(email.error)}</span>}</label>
          <input type="text" {...email}/>
        </section>

        <p>
          <button type="primary" className="width-12" disabled={submitting}>
            {submitting ? <i/> : <i/>} Reset
          </button>
        </p>

        <p><Link to="/signin" className="small color-black">Have account?</Link></p>
        <p><Link to="/signup" className="small color-black">Don't have account?</Link></p>
      </form>
    );
  }
}
