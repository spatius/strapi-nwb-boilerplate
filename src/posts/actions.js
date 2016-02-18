import { api, graphql } from "../api";

function fetchPosts(skip, limit) {
  return graphql("query($skip: Int!, $limit: Int!) { countPosts posts(skip: $skip, limit: $limit, sort: \"id ASC\") { id, title } }", { skip, limit }); // api("posts", {}, {});
}

function fetchPost(id) {
  return graphql("query($id: String!) { post(id: $id) { title, content, createdBy { username } } }", { id }); // api("post", { id }, {});
}

export default {
  fetchPosts,
  fetchPost
};
