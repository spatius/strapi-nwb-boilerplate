import "./index.css";

import React, { Component } from 'react';
import { Route, Link } from 'react-router';

import { HeaderLink } from "../elements";
import { authenticated } from "../decorators";
import { get, post } from "../fetch";
import actions from "./actions";
import { connect } from 'react-redux';
import PostView from './PostView';

// @authenticated()
@connect(state => state, actions)
class PostsView extends Component {
  componentWillMount() {
    const { fetchPosts } = this.props;
    fetchPosts();
  }

  render() {
    const {posts:{status, posts}} = this.props;

    return (
      <div className="posts">

        <ul>{status == 2 ? posts.map(item => <li><Link to={'posts/' + item.id}>{item.title}</Link></li>)  : "Loading.." }</ul>

      </div>
    );
  }
}



export const headerLink = (
  <HeaderLink name="Posts (protected)" path="/posts"/>
);

export const route = [
  <Route name="Posts" path="/posts" component={PostsView} />,
  <Route name="Post" path="/posts/:id" component={PostView} />
];
