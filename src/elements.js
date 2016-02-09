import "./elements.less";

import React, { Component, PropTypes } from 'react';
import { Link, isActive } from 'react-router';
import { propTypes, contextTypes } from 'react-props-decorators';

@propTypes({
  name: PropTypes.string.isRequired,
  // path: PropTypes.string.isRequired
})
@contextTypes({
  router: PropTypes.object.isRequired
})
export class HeaderLink extends Component {
  render() {
    const { name, path, onClick } = this.props;
    const { router } = this.context;

    var element = !!path && router.isActive(path)
      ? name
      : <Link to={path || "/"} onClick={onClick}>{name}</Link>;

    return (
      <li>{element}</li>
    );
  }
};

@propTypes({
  title: PropTypes.string.isRequired
})
export class Heading extends Component {
  render() {
    const {title} = this.props;

    return (
      <div className="heading">
        <h1>{title}</h1>
      </div>
    );
  }
}
