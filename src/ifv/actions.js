import { createAction } from 'redux-actions';
import { routeActions } from 'react-router-redux';
import _ from "lodash";

import { get, post, put } from "../fetch";

const saveSectionStatus = createAction("ifv/save/STATUS");
const fetchSectionsStatus = createAction("ifv/fetch/STATUS");

function parseError(error) {
  console.log("parseError", error);

  const { invalidAttributes } = error;

  var result = {};

  // Parse server side validation
  if(invalidAttributes) {
    for(let key of Object.keys(invalidAttributes)) {
      result[key] = invalidAttributes[key].map(error => {
        switch(error.rule) {
          case "required": return "required";
          case "minLength": return "too short";
          case "maxLength": return "too long";
          case "unique": return "already taken";
          default: return error.rule;
        }
      });
    }
  } else
    result._error = error.message || error;

  return result;
}

function saveSection(key, data) {
  return (dispatch, getState) => {
    dispatch(saveSectionStatus({ status: 1 }));

    return (
      !data.id
        ? post("/api/section", { key, data: JSON.stringify(data) })
        : put("/api/section/" + data.id, { key, data: JSON.stringify(_.omit(data, "id")) })
    ).then(data => {
      dispatch(saveSectionStatus({ status: 2, data }));

      return data;
    })
    .catch(error => {
      error = Object.assign({
        _error: "Save Section failed!"
      }, parseError(error));

      dispatch(saveSectionStatus({ status: 3, error }));

      throw error;
    });
  }
}

function fetchSections() {
  return (dispatch, getState) => {
    dispatch(fetchSectionsStatus({ status: 1 }));

    return get("/api/section")
    .then(data => {
      dispatch(fetchSectionsStatus({ status: 2, data }));

      return data;
    })
    .catch(error => {
      error = Object.assign({
        _error: "Fetch sections failed!"
      }, parseError(error));

      dispatch(fetchSectionsStatus({ status: 3, error }));

      throw error;
    });
  }
}

export default {
  saveSection,
  fetchSections
};
