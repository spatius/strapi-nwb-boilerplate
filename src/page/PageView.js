import "./PageView.less";

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { propTypes } from 'react-props-decorators';
import { routeActions } from 'react-router-redux';

@connect(state => state)
@propTypes({
  api: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired
})
export default class PageView extends Component {
  componentWillMount() {
    this.shouldRedirect(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.shouldRedirect(nextProps);
  }

  shouldRedirect({ dispatch, params: { route }, api: { pages: { status, data, error } } }) {
    const page = status == 2 ? data.find(item => item.route.indexOf(route) > -1) : null;
    const content = page ? page.content : null;

    if(status == 2 && !content)
      dispatch(routeActions.replace("/404"));
  }

  render() {
    const { params: { route }, api: { pages: { status, data, error } } } = this.props;

    const page = status == 2 ? data.find(item => item.route.indexOf(route) > -1) : null;
    const content = page ? page.content : null;

    return (
      <div className="page">
        {status == 1
          ? "Loading"
          : status == 3
            ? error
            : content
              ? <div dangerouslySetInnerHTML={{ __html: content }}/>
              : "Page does not exist"}
      </div>
    );
  }
}
