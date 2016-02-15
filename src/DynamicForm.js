import 'rc-slider/assets/index.css';

import React, { Component, PropTypes, createElement } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { propTypes } from 'react-props-decorators';
import css from 'react-css-modules';
import RadioGroup from 'react-radio';
import DatePicker from 'react-date-picker';
import moment from "moment";
import Slider from 'rc-slider';

const validate = (values, {model, fields}) => {
  const errors = {};
  fields.filter(key => !!model[key]).forEach(key => {
    if((typeof values[key] == "undefined" || values[key] == "") && model[key].required)
      errors[key] = ["required"];
  });

  return errors;

};

function showErrors(array) {
  if(!array)
    return "";

  if(array instanceof Array)
    return "is " + array.join(" and ");

  return "is " + array;
}

function renderElement({ type, props }, field) {
  if(type == "range")
    return createElement(Slider, {
      step: 100,
      ...props,
      value: field.value,
      onChange: field.onChange
    });

  if(type == "radio-list")
    return createElement(RadioGroup, {
      name: field.name,
      ...props,
      ...field
    });

  return createElement("input", {
    type: type || "text",
    ...props,
    ...field
  });
}

@reduxForm({
  validate
}, (state, { data, model }) => ({ initialValues: data || _.mapValues(model, "value") }))
@propTypes({
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func,
  resetForm: PropTypes.func.isRequired,
  submitting: PropTypes.bool
})
@css(require("./DynamicForm.less"), { allowMultiple: true })
export default class DynamicForm extends Component {
  render() {
    const { title, model, fields, handleSubmit, resetForm, submit, submitting, error } = this.props;

    return (
      <form className="forms" onSubmit={handleSubmit(submit)}>
        {error && <div className="alert alert-error">{error}</div>}

        <fieldset>
          {title && <legend>{title}</legend>}

          {Object.keys(fields).filter(key => !!model[key]).map(key => {
            let element = model[key];
            let field = fields[key];

            return (
              <section key={key}>
                <label>{element.label} {field.error && <span className="error">{showErrors(field.error)}</span>}</label>
                {renderElement(element, field)}
              </section>
            );
          })}

          <p>
            <button styleName="reset" disabled={submitting} onClick={resetForm}>
              {submitting ? <i/> : <i/>} Reset
            </button>

            <button type="primary" styleName="submit" disabled={submitting}>
              {submitting ? <i/> : <i/>} Save
            </button>
          </p>
        </fieldset>
      </form>
    );
  }
}
