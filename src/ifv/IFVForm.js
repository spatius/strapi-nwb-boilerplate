import React, { Component, PropTypes, createElement } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { reduxForm } from 'redux-form';
import { propTypes } from 'react-props-decorators';
import css from 'react-css-modules';
import _ from "lodash";

import { waitFor } from "../decorators";
import DynamicForm from "../DynamicForm";

import actions from "./actions";
import { section1, section2 } from "./IFVFormModel";

@waitFor(({ api: { sections } }) => [ sections.data ])
@connect(state => state, actions)
@css(require("./IFVForm.less"), { allowMultiple: true })
export default class IFVForm extends Component {
  render() {
    const { api: { sections }, submit } = this.props;
    const formData = this.props.form;

    function handleSubmit(key) {
      return (data) => submit(key, data);
    }

    const forms = [
      {
        key: "section1",
        title: "Section 1",
        model: section1,
        data: sections.data.section1,
        fields: ["id", "salaryMonthly", "clubContractYearly", "monthlySpendingHabit", "abc"],
        amount: function({ salaryMonthly, clubContractYearly, monthlySpendingHabit }) {
          return (salaryMonthly + clubContractYearly) * (monthlySpendingHabit == "DA" ? 50 : 1);
        }
      },
      {
        key: "section2",
        title: "Section 2",
        model: section2,
        data: sections.data.section2,
        fields: ["id", "salaryMonthly", "clubContractYearly", "monthlySpendingHabit"],
        amount: function({ salaryMonthly, clubContractYearly, monthlySpendingHabit }) {
          return (salaryMonthly + clubContractYearly) * (monthlySpendingHabit == "DA" ? 50 : 1);
        }
      }
    ];

    return (
      <div styleName="root">
        <row className="centered">
          <column cols="7">
            {forms.map(props => (
              <DynamicForm
                form={props.key}
                submit={handleSubmit(props.key)}
                {...props}/>
            ))}
          </column>

          <column cols="5">
            <fieldset>
              <legend>Izračun</legend>

              <table className="table-bordered">
                <thead>
                  <tr>
                    <th>Section</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {forms.map(({ key, title, fields, amount }) => (
                    <tr>
                      <td>{title}</td>
                      <td>{amount(_.mapValues(_.pick(formData[key], fields), "value"))}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="1">Total</td>
                    <td>{forms.reduce((memo, { key, fields, amount }) => {
                      return memo + amount(_.mapValues(_.pick(formData[key], fields), "value"));
                    }, 0)}</td>
                  </tr>
                </tfoot>
              </table>
            </fieldset>
          </column>
        </row>
      </div>
    );
  }
}
