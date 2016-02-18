import { api } from "../api";

function fetchPosts() {
  return api("posts", {}, {});
}
function fetchPost(id) {
  return api("page", { id }, {});
}

export default {
  fetchPosts,
  fetchPost
};
