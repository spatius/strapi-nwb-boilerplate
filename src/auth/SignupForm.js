import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { propTypes } from 'react-props-decorators';

import css from 'react-css-modules';

const validate = values => {
  const errors = {};
  if (!values.username) {
    errors.username = ['required'];
  } else if (values.username.length > 15) {
    errors.username = ['too long'];
  }
  if (!values.email) {
    errors.email = ['required'];
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = ['invalid'];
  }
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
  form: "signup",
  fields: ['username', 'email', 'password', "password2"],
  validate
})
@connect(state => state)
@propTypes({
  handleSubmit: PropTypes.func,
  submitting: PropTypes.bool
})
@css(require("./SignupForm.css"), { allowMultiple: true })
export default class SignupForm extends Component {
  render() {
    const { fields: { username, email, password, password2 }, handleSubmit, submit, submitting, error, router: { location: { query } } } = this.props;

    return (
      <form styleName="root" className="forms" onSubmit={handleSubmit(submit)}>
        {error && <div className="alert alert-error">{error}</div>}

        <section>
          <label>Username {username.error && <span className="error">{showErrors(username.error)}</span>}</label>
          <input type="text" {...username}/>
        </section>

        <section>
          <label>Email {email.error && <span className="error">{showErrors(email.error)}</span>}</label>
          <input type="text" {...email}/>
        </section>

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
            {submitting ? <i/> : <i/>} Register
          </button>
        </p>

        <p><Link to={{ pathname: "/signin", query }} className="small color-black">Have account?</Link></p>
      </form>
    );
  }
}
