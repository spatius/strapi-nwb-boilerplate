import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { propTypes } from 'react-props-decorators';

@connect(state => state)
@propTypes({
  auth: PropTypes.object.isRequired
})
export default class ProfileLink extends Component {
  render() {
    const { auth: { status, loggedIn, user } } = this.props;

    return <Link to="/profile">{status == 2 && loggedIn ? user.username : "Guest"}</Link>;
  }
}
