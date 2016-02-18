function processResponse(state, { status, data, jwt, error }) {
  if(status == 2) {
    localStorage.setItem("jwt", jwt);
    localStorage.setItem("uid", data.id);
  }

  return {
    status,
    data,
    jwt,
    loggedIn: !!jwt,
    error
  };
}

export default ["user", {
  "signin": processResponse,
  "signup": processResponse,
  "signout": (state, { status, error }) => {
    if(status == 2) {
      localStorage.removeItem("jwt");
      localStorage.removeItem("uid");
    }

    return {
      status,
      data: null,
      jwt: null,
      loggedIn: false,
      error
    };
  },
  "forgotPassword": processResponse,
  "changePassword": processResponse,
  "user": processResponse,

  "saveProfile": (state, { status, data, error }) => {
    if(status != 2)
      return state;

    return {
      ...state,
      data: {
        ...state.data,
        profile: data
      }
    };
  }
}, () => {
  const jwt = localStorage.getItem("jwt");

  return {
    jwt,
    loggedIn: !!jwt
  };
}];
