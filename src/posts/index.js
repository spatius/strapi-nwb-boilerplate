import "./index.less";

import React, { Component } from 'react';
import { Route, Link } from 'react-router';
import { connect } from 'react-redux';

import { HeaderLink } from "../elements";
import { waitFor } from "../decorators";

import actions from "./actions";
import PostView from './PostView';

const step = 5;

@connect(state => state, actions)
class PostsView extends Component {
  componentWillMount() {
    const { api: { posts: { status, skip, limit } }, fetchPosts } = this.props;

    if(status == 0)
      fetchPosts(skip || 0, limit || step);
  }

  render() {
    const { api: { posts: { skip, limit, count } }, fetchPosts } = this.props;

    return (
      <div className="posts">
        <div>
          <PostsList/>

          {skip + step < count && <button onClick={() => fetchPosts(skip + step, step)}>Show more</button>}
        </div>
      </div>
    );
  }
}

@waitFor(({ api: { posts } }) => [ posts.data ])
@connect(state => state, actions)
class PostsList extends Component {
  render() {
    const { api: { posts: { data } } } = this.props;

    return (
      <blocks cols="4">
        {data.map(item => <div><Link to={'posts/' + item.id}><img src=""/><h3>{item.title}</h3></Link></div>)}
      </blocks>
    );

    return (
      <ul>{data.map(item => <li><Link to={'posts/' + item.id}>{item.title}</Link></li>)}</ul>
    );
  }
}

export const headerLink = (
  <HeaderLink name="Posts" path="/posts"/>
);

export const route = [
  <Route name="Posts" path="/posts" component={PostsView} />,
  <Route nameKey="post" path="/posts/:id" component={PostView} />
];
