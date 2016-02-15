import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { propTypes } from 'react-props-decorators';
import RadioGroup from 'react-radio';
import DatePicker from 'react-date-picker';
import moment from "moment";
import Dropzone from "react-dropzone";

import css from 'react-css-modules';

import { waitFor } from "../decorators";

import actions from "./actions";

import { upload } from "../fetch";

const validate = values => {
  const errors = {};

  ["firstName", "lastName", 'address1', 'city', /*"region",*/ "phone", "sex", "birthday"].forEach(key => {
    if(!values[key])
      errors[key] = ["required"];
  });

  return errors;

  // const errors = {};
  // if (!values.username) {
  //   errors.username = ['required'];
  // } else if (values.username.length > 15) {
  //   errors.username = ['too long'];
  // }
  // if (!values.email) {
  //   errors.email = ['required'];
  // } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
  //   errors.email = ['invalid'];
  // }
  // if (!values.password) {
  //   errors.password = ['required'];
  // } else if (values.password.length < 5) {
  //   errors.password = ['too short'];
  // }
  // if (!values.password2) {
  //   errors.password2 = ['required'];
  // } else if (values.password2.length < 5) {
  //   errors.password2 = ['too short'];
  // }
  // if(!errors.password && !errors.password2 && values.password != values.password2)
  //   errors.password = errors.password2 = ["different"];
  // return errors;
};

function showErrors(array) {
  if(!array)
    return "";

  if(array instanceof Array)
    return "is " + array.join(" and ");

  return "is " + array;
}

// @waitFor(({ profile }) => [ profile.data ])
@reduxForm({
  form: "profile",
  fields: ["id", "firstName", "midName", "lastName", 'address1', 'address2', 'city', /*"region",*/ "phone", "bio", "picture", "sex", "birthday"],
  validate
}, ({ profile: { data } = {} }) => ({ initialValues: data }))
@connect(state => state, actions)
@propTypes({
  handleSubmit: PropTypes.func,
  resetForm: PropTypes.func.isRequired,
  submitting: PropTypes.bool
})
@css(require("./ProfileForm.less"), { allowMultiple: true })
export default class ProfileForm extends Component {
  constructor() {
    super();

    this.state = {
      files: []
    };
  }

  onDrop(files) {
    const { fields: { firstName, midName, lastName, address1, address2, city, /*region,*/ phone, bio, picture, sex, birthday }, handleSubmit, resetForm, submit, submitting, error, router: { location: { query } } } = this.props;

    var data = new FormData;
    files.forEach(file => data.append("file", file));
    upload(data).then(r => {
console.log(r[0][0].filename);
      picture.onChange(r[0][0].filename);
    }).catch(e => console.log("error", e));

    this.setState({
      files: files
    });
  }

  render() {
    const { fields: { firstName, midName, lastName, address1, address2, city, /*region,*/ phone, bio, picture, sex, birthday }, handleSubmit, resetForm, submit, submitting, error, router: { location: { query } } } = this.props;

    return (
      <row className="centered">
        <column cols="10">
          <form styleName="root" className="forms" onSubmit={handleSubmit(submit)}>
            {error && <div className="alert alert-error">{error}</div>}

            <fieldset>
              <legend>Name <span className="req">*</span></legend>

              <row>
                <column cols="4">
                  <label>First {firstName.error && <span className="error">{showErrors(firstName.error)}</span>}</label>
                  <input type="text" {...firstName}/>
                </column>

                <column cols="4">
                  <label>Middle {midName.error && <span className="error">{showErrors(midName.error)}</span>}</label>
                  <input type="text" {...midName}/>
                </column>

                <column cols="4">
                  <label>Last {lastName.error && <span className="error">{showErrors(lastName.error)}</span>}</label>
                  <input type="text" {...lastName}/>
                </column>
              </row>
            </fieldset>

            <fieldset>
              <legend>Address <span className="req">*</span></legend>

              <section>
                <label>Address 1 {address1.error && <span className="error">{showErrors(address1.error)}</span>}</label>
                <input type="text" {...address1}/>
              </section>

              <section>
                <label>Address 2 {address2.error && <span className="error">{showErrors(address2.error)}</span>}</label>
                <input type="text" {...address2}/>
              </section>

              <section>
                <label>City {city.error && <span className="error">{showErrors(city.error)}</span>}</label>
                <input type="text" {...city}/>
              </section>

              {/*<row>
                <column cols="6">
                  <label>City {city.error && <span className="error">{showErrors(city.error)}</span>}</label>
                  <input type="text" {...city}/>
                </column>

                <column cols="6">
                  <label>State / Province / Region {region.error && <span className="error">{showErrors(region.error)}</span>}</label>
                  <input type="text" {...region}/>
                </column>
              </row>

              <row>
                <column cols="6">
                  <label>Postal / Zip Code {zipCode.error && <span className="error">{showErrors(zipCode.error)}</span>}</label>
                  <input type="text" {...zipCode}/>
                </column>

                <column cols="6">
                  <label>Country {country.error && <span className="error">{showErrors(country.error)}</span>}</label>
                  <input type="text" {...country}/>
                </column>
              </row>*/}
            </fieldset>

            <section>
              <label>Phone {phone.error && <span className="error">{showErrors(phone.error)}</span>}</label>
              <input type="text" {...phone}/>
            </section>

            <section>
              <label>Biography {bio.error && <span className="error">{showErrors(bio.error)}</span>}</label>
              <textarea rows="6" {...bio}/>
            </section>

            <section>
              <label>Picture {picture.error && <span className="error">{showErrors(picture.error)}</span>}</label>
              <Dropzone multiple={false} accept="image/*" className="dropzone-input" activeClassName="dropzone-input-active" rejectClassName="dropzone-input-reject" ref={c => this._dropzone = c} onDrop={this.onDrop.bind(this)}>
                <div className="big">Try dropping some files here, or click to select files to upload.</div>
              </Dropzone>
              {this.state.files.length > 0 ? <div>
                <h2>Uploading {this.state.files.length} files...</h2>
                <div>{this.state.files.map((file) => <img src={file.preview} /> )}</div>
                </div> : null}
            </section>

            <section className="checkbox-list">
              <label>Gender {sex.error && <span className="error">{showErrors(sex.error)}</span>}</label>
              <RadioGroup name="gender" items={[{ label: "Male", value: "MALE" }, { label: "Female", value: "FEMALE" }, { label: "Other", value: "OTHER" }]} {...sex}/>
            </section>

            <section>
              <label>Birthday {birthday.error && <span className="error">{showErrors(birthday.error)}</span>}</label>
              {/*}<input type="date" {...birthday}/>*/}
              <DatePicker
                defaultView="decade"
                minDate='1900-01-01'
                maxDate={moment()}
                defaultViewDate={moment().subtract(25, "years")}
                date={birthday.value}
                {...birthday}/>
            </section>

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
