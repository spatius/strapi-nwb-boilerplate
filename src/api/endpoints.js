import { routeActions } from 'react-router-redux';

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

export default {
  graphql: {
    method: "get",
    path: "/api/graphql"
  },

  user: {
    method: "get",
    path: "/api/user/:id",
    action: (action) => {
      const jwt = localStorage.getItem("jwt");

      return {
        ...action,
        jwt,
        loggedIn: !!jwt
      };
    }
  },
  saveProfile: {
    method: "save",
    path: "/api/profile(/:id)",
    action: (action, dispatch, getState) => {
      if(action.status == 3) {
        action.error = Object.assign({
          _error: "Edit failed!"
        }, parseError(action.error));
      }

      return action;
    }
  },
  signin: {
    method: "post",
    path: "/api/auth/local",
    action: (action, dispatch, getState) => {
      if(action.status == 2) {
        const { router: { location: { query: { next } } } } = getState();

        if(next)
          dispatch(routeActions.replace(next));
        else
          dispatch(routeActions.replace("/"));

        action = {
          ..._.omit(action, "data"),
          jwt: action.data.jwt,
          data: action.data.user
        };
      }

      if(action.status == 3) {
        action.error = Object.assign({
          _error: "Login failed!"
        }, parseError(action.error));
      }

      return action;
    }
  },
  signup: {
    method: "post",
    path: "/api/auth/local/register",
    action: (action, dispatch) => {
      if(action.status == 2) {
        dispatch(routeActions.replace("/"));

        action = {
          ..._.omit(action, "data"),
          jwt: action.data.jwt,
          data: action.data.user
        };
      }

      if(action.status == 3) {
        action.error = Object.assign({
          _error: "Registration failed!"
        }, parseError(action.error));
      }

      return action;
    }
  },
  signout: {
    method: "post",
    path: "/api/auth/logout",
    action: (action, dispatch) => {
      if(action.status == 3) {
        action.error = Object.assign({
          _error: "Logout failed!"
        }, parseError(action.error));
      }

      return action;
    }
  },
  forgotPassword: {
    method: "post",
    path: "/api/auth/forgot-password",
    action: (action, dispatch) => {
      if(action.status == 2)
        dispatch(routeActions.replace("/"));

      if(action.status == 3) {
        action.error = Object.assign({
          _error: "Password reset failed!"
        }, parseError(action.error));
      }

      return action;
    }
  },
  changePassword: {
    method: "post",
    path: "/api/auth/change-password",
    action: (action, dispatch) => {
      if(action.status == 2)
        dispatch(routeActions.replace("/"));

      if(action.status == 3) {
        action.error = Object.assign({
          _error: "Password reset failed!"
        }, parseError(action.error));
      }

      return action;
    }
  },

  sections: {
    method: "get",
    path: "/api/section",
    action: (action, dispatch) => {
      if(action.status == 3) {
        action.error = Object.assign({
          _error: "Fetch sections failed!"
        }, parseError(action.error));
      }

      return action;
    }
  },
  saveSection: {
    method: "save",
    path: "/api/section(/:id)",
    action: (action, dispatch) => {
      if(action.status == 3) {
        action.error = Object.assign({
          _error: "Save Section failed!"
        }, parseError(action.error));
      }

      return action;
    }
  },

  pages: {
    method: "get",
    path: "/api/page"
  },

  posts: {
    method: "get",
    path: "/api/post"
  },
  post: {
    method: "get",
    path: "/api/post/:id"
  }
};
