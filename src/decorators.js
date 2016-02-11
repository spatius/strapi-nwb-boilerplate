import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { propTypes } from 'react-props-decorators';
import { routeActions } from 'react-router-redux';

export function authenticated(yes = true, path = null) {
  return function(Component) {
    return @connect(state => state)
    class AuthenticatedComponent extends React.Component {
      componentWillMount() {
        this.shouldRedirect(this.canShow(this.props), this.props);
      }

      componentWillReceiveProps(nextProps) {
        this.shouldRedirect(this.canShow(nextProps), nextProps);
      }

      canShow({ auth: { status, loggedIn } }) {
        if(!yes)
          return !loggedIn;

        return status == 2 && loggedIn;
      }

      shouldRedirect(no, { dispatch, router: { location: { pathname } } }) {
        if(no)
          return;

        if(yes)
          dispatch(routeActions.replace((path || "/signin") + `?next=${pathname}`));
        else
          dispatch(routeActions.replace(path || "/"));
      }

      render() {
        return (
          <div>
            {this.canShow(this.props)
              ? <Component {...this.props}/>
              : null
            }
          </div>
        );
      }
    }
  }
}
