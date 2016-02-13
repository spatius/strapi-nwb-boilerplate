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

    if(status == 2 && loggedIn)
      return <Link to="/profile">{user.profile && user.profile.picture ? <img style={{ height: "32px", verticalAlign: "middle" }} src={"/upload/" + user.profile.picture}/> : ""}{user.username}</Link>;

    return <Link to="/profile">Guest</Link>;
  }
}
