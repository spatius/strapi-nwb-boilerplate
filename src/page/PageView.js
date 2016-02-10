import "./PageView.less";

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { propTypes } from 'react-props-decorators';

import actions from "./actions";

@connect(
  state => state,
  actions
)
@propTypes({
  // fetchPage: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  pages: PropTypes.array.isRequired
})
export default class PageView extends Component {
  render() {
    const { params: { id }, pages } = this.props;

    const content = id && pages[id - 1] ? pages[id - 1].content : "Loading";

    return (
      <div className="page">
        <div dangerouslySetInnerHTML={{__html: content}}/>
      </div>
    );
  }
}
