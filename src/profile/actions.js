import _ from "lodash";

import { api } from "../api";

function edit(data) {
  return api("saveProfile", _.pick(data, "id"), _.omit(data, "id"));
}

export default {
  edit
};
