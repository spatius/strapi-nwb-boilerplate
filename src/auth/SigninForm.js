import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { propTypes } from 'react-props-decorators';

import css from 'react-css-modules';

const validate = values => {
  const errors = {};
  if (!values.email) {
    errors.email = ['Required'];
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = ['Invalid email address'];
  }
  if (!values.password) {
    errors.password = ['Required'];
  } else if (values.password.length < 5) {
    errors.password = ['Must be 5 characters or more'];
  }
  return errors;
};

@reduxForm({
  form: "signin",
  fields: ['email', 'password'],
  validate
})
@propTypes({
  handleSubmit: PropTypes.func,
  submitting: PropTypes.bool
})
@css(require("./SigninForm.css"), { allowMultiple: true })
export default class SigninForm extends Component {
  render() {
    const {fields: {email, password}, handleSubmit, submit, submitting} = this.props;

    return (
      <form className="pure-form" onSubmit={handleSubmit(submit)}>
        <fieldset>
          <div styleName="padding" className="pure-g">
            <label styleName="label padding valign" className="pure-u-1-5">Email</label>
            <input styleName="padding" className="pure-u-3-5" type="text" placeholder="Email" {...email}/>
            {email.error && <span styleName="padding valign" className="pure-u-1-5">{email.error}</span>}
          </div>
          <div styleName="padding" className="pure-g">
            <label styleName="label padding valign" className="pure-u-1-5">Password</label>
            <input styleName="padding" className="pure-u-3-5" type="password" placeholder="Password" {...password}/>
            {password.error && <span styleName="padding valign" className="pure-u-1-5">{password.error}</span>}
          </div>

          <div styleName="padding" className="pure-g">
            <div styleName="padding" className="pure-u-1-5"></div>
            <div styleName="padding" className="pure-u-4-5">
              <button type="submit" className="pure-button" disabled={submitting}>
                {submitting ? <i/> : <i/>} Submit
              </button>
            </div>
          </div>
        </fieldset>
      </form>
    );
  }
}
