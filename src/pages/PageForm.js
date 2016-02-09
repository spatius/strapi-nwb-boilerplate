import React, { Component, PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import { propTypes } from 'react-props-decorators';

import css from 'react-css-modules';

const validate = values => {
  return {};

  const errors = {};
  if (!values.username) {
    errors.username = ['Required'];
  } else if (values.username.length > 15) {
    errors.username = ['Must be 15 characters or less'];
  }
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
  if (!values.password2) {
    errors.password2 = ['Required'];
  } else if (values.password2.length < 5) {
    errors.password2 = ['Must be 5 characters or more'];
  }
  if(!errors.password && !errors.password2 && values.password != values.password2)
    errors.password = errors.password2 = ["Passwords don't match"];
  return errors;
};

@reduxForm({
  form: "signup",
  fields: ['title', 'content', 'metaDescription', "published"],
  validate
})
@propTypes({
  handleSubmit: PropTypes.func,
  submitting: PropTypes.bool
})
@css(require("../auth/SignupForm.css"), { allowMultiple: true })
export default class PageForm extends Component {
  render() {
    const {fields: {title, content, metaDescription, published}, handleSubmit, submit, submitting} = this.props;

    return (
      <form className="pure-form" onSubmit={handleSubmit(submit)}>
        <fieldset>
          <div styleName="padding" className="pure-g">
            <label styleName="label padding valign" className="pure-u-1-5">Title</label>
            <input styleName="padding" className="pure-u-3-5" type="text" placeholder="Page Title" {...title}/>
            {title.error && <span styleName="padding valign" className="pure-u-1-5">{title.error.join(", ")}</span>}
          </div>
          <div styleName="padding" className="pure-g">
            <label styleName="label padding valign" className="pure-u-1-5">Content</label>
            <input styleName="padding" className="pure-u-3-5" type="text" placeholder="Content" {...content}/>
            {content.error && <span styleName="padding valign" className="pure-u-1-5">{content.error.join(", ")}</span>}
          </div>
          <div styleName="padding" className="pure-g">
            <label styleName="label padding valign" className="pure-u-1-5">Meta Description</label>
            <input styleName="padding" className="pure-u-3-5" type="text" placeholder="Meta, Description" {...metaDescription}/>
            {metaDescription.error && <span styleName="padding valign" className="pure-u-1-5">{metaDescription.error.join(", ")}</span>}
          </div>
          <div styleName="padding" className="pure-g">
            <label styleName="label padding valign" className="pure-u-1-5">Published</label>
            <input styleName="padding" className="pure-u-3-5" type="checkbox" {...published}/>
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
