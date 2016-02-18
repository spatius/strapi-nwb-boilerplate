export default {
  pages: {
    graphql: (state, { status, data, error }) => {
      if(!data || !data.data.pages)
        return state;

      return {
        status,
        data: [...(state.data || []), ...data.data.pages],
        error
      };
    }
  },
  page: {
    graphql: (state, { status, data, error }) => {
      // if(!data || !data.data.page)
      //   return state;

      return {
        status,
        data: data && data.data.page,
        error
      };
    }
  }
};
