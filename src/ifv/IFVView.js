import "./IFVView.css";

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { propTypes } from 'react-props-decorators';

import { authenticated } from "../decorators";

import actions from "./actions";
import IFVForm from "./IFVForm";

@authenticated()
@connect(state => state, actions)
@propTypes({
  edit: PropTypes.func.isRequired
})
export default class IFVView extends Component {
  render() {
    const { edit } = this.props;

    return (
      <div className="ifv">
        <IFVForm submit={edit} />
      </div>
    );
  }
}
