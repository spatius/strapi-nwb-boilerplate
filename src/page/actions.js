import { api, graphql } from "../api";

function fetchPages() {
  return graphql("{ pages { id, title, route } }"); // api("pages", {}, {});
}

function fetchPage(id) {
  return graphql("query($id: String!) { page(id: $id) { title, content } }", { id }); // api("page", { id }, {});
}

export default {
  fetchPages,
  fetchPage
};
