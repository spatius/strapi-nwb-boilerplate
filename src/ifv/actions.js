import _ from "lodash";

import { api } from "../api";

function saveSection(key, data) {
  return api("saveSection", _.pick(data, "id"), { key, data: JSON.stringify(_.omit(data, "id")) });
}

function fetchSections() {
  return api("sections", {}, {});
}

export default {
  saveSection,
  fetchSections
};
