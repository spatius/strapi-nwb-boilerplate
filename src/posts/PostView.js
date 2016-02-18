import "./index.css";

import React, { Component } from 'react';
import { Route, Link } from 'react-router';
import { connect } from 'react-redux';

import { HeaderLink } from "../elements";
import { authenticated } from "../decorators";

import actions from "./actions";

@connect(state => state, actions)
export default class PostView extends Component {
  componentWillMount() {
    const { fetchPost, params:{id} } = this.props;
    fetchPost(id);
  }
  render() {
    const {posts:{status, data}} = this.props;
    const post = data;
    if(status != 2){
      return(
          <div className="post">
            Loading...
          </div>
      )
    }
    return (
      <div className="post">
        <h1>{post.title}</h1>
        <p>By: {post.createdBy.username}</p>
        <div dangerouslySetInnerHTML={{ __html: post.content }}/>
      </div>
    );
  }
}
