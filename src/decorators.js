import 'react-dots-loader/index.css';

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { propTypes } from 'react-props-decorators';
import { routeActions } from 'react-router-redux';
import Preloader from 'react-dots-loader';

function canShow(yes, { auth: { status, loggedIn } }) {
  return status == 1 || yes == loggedIn;
}

function redirect(yes, path, props) {
  if(canShow(yes, props))
    return;

  const { dispatch, router: { location: { pathname, query: { next } } } } = props;

  if(yes)
    dispatch(routeActions.replace((path || "/signin") + `?next=${pathname}`));
  else if(pathname)
    dispatch(routeActions.replace(next || path || "/"));
}

export function authenticated(yes = true, path = null) {
  return function(Component) {
    return @connect(state => state)
    class AuthenticatedComponent extends React.Component {
      componentWillMount() {
        redirect(yes, path, this.props);
      }

      componentWillReceiveProps(nextProps) {
        redirect(yes, path, nextProps);
      }

      render() {
        return (
          <div>
            {canShow(yes, this.props)
              ? <Component {...this.props}/>
              : null
            }
          </div>
        );
      }
    }
  }
}

export function waitFor(select) {
  return function(Component) {
    return @connect(state => state)
    class Wait extends React.Component {
      render() {
        const fields = select(this.props);
        console.log(fields);
        if(fields.filter(item => !item).length)
        return (
          <Preloader size={10}/>
        );

        return (
          <Component {...this.props}/>
        );
      }
    }
  }
}
