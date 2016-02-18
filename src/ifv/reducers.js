export default ["sections", {
  "saveSection": (state, { status, data, error }) => {
    return {
      status,
      data: data ? {
        [data.key]: {
          id: data.id,
          ...data.data
        }
      } : null,
      error
    };
  },

  "sections": (state, { status, data, error }) => {
    return {
      status,
      data: data ? data.reduce((memo, value) => {
        memo[value.key] = {
          id: value.id,
          ...value.data
        };

        return memo;
      }, {}) : null,
      error
    };
  }
}];
