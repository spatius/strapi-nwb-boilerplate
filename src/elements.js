import React, { Component, PropTypes } from 'react';
import { Link, isActive } from 'react-router';
import classnames from "classnames";
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

    var classes = {
      "pure-menu-item": true,
      "pure-menu-selected": !!path && router.isActive(path)
    };

    return (
      <li className={classnames(classes)}><Link to={path || "/"} onClick={onClick} className="pure-menu-link">{name}</Link></li>
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
      <div className="splash-container">
        <div className="splash">
          <h1 className="splash-head">{title}</h1>
          {/*<p className="splash-subhead">
              Lorem ipsum dolor sit amet, consectetur adipisicing elit.
          </p>
          <p>
              <a href="http://purecss.io" className="pure-button pure-button-primary">Get Started</a>
          </p>*/}
        </div>
      </div>
    );
  }
}
