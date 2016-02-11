import { createAction } from 'redux-actions';
import { routeActions } from 'react-router-redux';

import { get, post } from "../fetch";

const editStatus = createAction("profile/edit/STATUS");

function parseError(error) {
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

function edit({ email, password }) {
  return (dispatch, getState) => {
    dispatch(signinStatus({ status: 1 }));

    return post("/api/profile", { identifier: email, password })
    .then(data => {
      dispatch(signinStatus({ status: 2, data }));

      return data;
    })
    .catch(error => {
      error = Object.assign({
        _error: "Edit failed!"
      }, parseError(error));

      dispatch(signinStatus({ status: 3, error }));

      throw error;
    });
  }
}

export default {
  edit
};
