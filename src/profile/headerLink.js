import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { propTypes } from 'react-props-decorators';

@connect(state => state)
@propTypes({
  api: PropTypes.object.isRequired
})
export default class ProfileLink extends Component {
  render() {
    const { api: { user: { status, loggedIn, data } } } = this.props;

    if(status == 2 && loggedIn)
      return <Link to="/profile">{data.profile && data.profile.picture ? <img style={{ height: "32px", verticalAlign: "middle" }} src={"/upload/" + data.profile.picture}/> : ""}{data.username}</Link>;

    return <Link to="/profile">Guest</Link>;
  }
}
