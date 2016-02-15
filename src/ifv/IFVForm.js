import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { propTypes } from 'react-props-decorators';
import RadioGroup from 'react-radio';
import DatePicker from 'react-date-picker';
import moment from "moment";
import css from 'react-css-modules';
import { waitFor } from "../decorators";
import actions from "./actions";
import {section1} from "./IFVFormModel";
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';


const validate = (values, {fields}) => {
  const errors = {};
  console.log("VVVVVVV", fields)
  fields.forEach(key => {
    console.log("VALIDATE", key, section1);
    if(!values[key] && section1[key].required)
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

function renderElement(element, field){
  // return <input type="text" {...field}/>;
  if(element.question.type == "range"){
    return <Slider defaultValue={element.question.defaultValue} min={element.question.from} max={element.question.to} step="100" />
  }
  else if(element.question.type == "list"){

  }
  else{
    return <input type="text" {...field}/>
  }
}

@waitFor(({ profile }) => [ profile.data ])
@reduxForm({
  form: "ifv",
  fields: ["salaryMonthly", "clubContractYearly", "monthlySpendingHabit"],
  validate
}, ({ profile: { data } = {} }) => ({ initialValues: data }))
@connect(state => state, actions)
@propTypes({
  handleSubmit: PropTypes.func,
  resetForm: PropTypes.func.isRequired,
  submitting: PropTypes.bool
})
@css(require("./IFVForm.less"), { allowMultiple: true })
export default class IFVForm extends Component {

  render() {
    const { handleSubmit, resetForm, submit, submitting, error, router: { location: { query } } } = this.props;
    const fields = this.props.fields;
    return (
      <row className="centered">
        <column cols="10">
          <form styleName="root" className="forms" onSubmit={handleSubmit(submit)}>
            {error && <div className="alert alert-error">{error}</div>}
            {Object.keys(fields).map(key => {
              let element = section1[key];
              return(

                <section>
                  <label>{element.label} {fields[key].error && <span className="error">{showErrors(fields[key].error)}</span>}</label>
                  {renderElement(element, fields[key])}
                </section>
            )})}


            <p>
              <button styleName="reset" disabled={submitting} onClick={resetForm}>
                {submitting ? <i/> : <i/>} Reset
              </button>

              <button type="primary" styleName="submit" disabled={submitting}>
                {submitting ? <i/> : <i/>} Save
              </button>
            </p>
          </form>
        </column>
      </row>
    );
  }
}
