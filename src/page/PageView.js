import "./PageView.css";

import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { propTypes } from 'react-props-decorators';

import actions from "./actions";

@connect(
  state => state,
  actions
)
@propTypes({
  fetchPage: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  page: PropTypes.object
})
export default class PageView extends Component {
  render() {
    const { fetchPage, params: { id }, page } = this.props;

    var content = "";

    if(!page.page)
      fetchPage(id);
    else
      content = page.page.content;

    console.log("page", this.props);

    return (
      <div className="page">
        <div dangerouslySetInnerHTML={{__html: content}}/>
      </div>
    );
  }
}
