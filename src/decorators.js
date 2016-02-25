import 'react-dots-loader/index.css';

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { propTypes } from 'react-props-decorators';
import { routeActions } from 'react-router-redux';
import { createAction, handleActions } from 'redux-actions';
import Preloader from 'react-dots-loader';

function canShow(yes, { api: { user: { status, loggedIn } } }) {
  return status == 1 || yes == !!loggedIn;
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
        // console.log(fields);
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

const titleChanged = createAction("titleChanged");

export const reducer = handleActions({
  titleChanged: (state, { payload: { key, title } }) => ({ ...state, [key]: title })
}, {});

export function title(key, select) {
  return function(Component) {
    return @connect(state => state)
    class Title extends React.Component {
      componentDidMount() {
        const { dispatch, titles } = this.props;

        const title = null;

        if(title != titles[key])
          dispatch(titleChanged({ key, title }));
      }

      componentWillReceiveProps(props) {
        const { dispatch, titles } = props;

        const title = select(props);

        if(title != titles[key])
          dispatch(titleChanged({ key, title }));
      }

      render() {
        return (
          <Component {...this.props}/>
        );
      }
    }
  }
}
