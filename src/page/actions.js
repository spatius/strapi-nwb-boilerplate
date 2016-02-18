import { api } from "../api";

function fetchPages() {
  return api("pages", {}, {});
}

export default {
  fetchPages
};
