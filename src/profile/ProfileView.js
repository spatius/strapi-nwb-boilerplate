import "./ProfileView.css";

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { propTypes } from 'react-props-decorators';

import { authenticated } from "../decorators";

import actions from "./actions";
import ProfileForm from "./ProfileForm";

@authenticated()
@connect(state => state, actions)
@propTypes({
  edit: PropTypes.func.isRequired
})
export default class ProfileView extends Component {
  render() {
    const { edit } = this.props;

    return (
      <div className="profile">
        <ProfileForm submit={edit} submitting={false}/>
      </div>
    );
  }
}
