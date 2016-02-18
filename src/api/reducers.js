import { handleActions } from 'redux-actions';
import _ from "lodash";

const reducers = [
  require("../auth/reducers"),
  require("../ifv/reducers"),
  require("../page/reducers"),
  require("../posts/reducers"),
  require("../profile/reducers")
];

export default handleActions({
  "api/STATUS": (state, { payload }) => {
    const action = _.omit(payload, "key");

    return reducers.reduce((memo, object) => {
      Object.keys(object).forEach(key => {
        const reducer = object[key];

        const r = reducer[payload.key];

        if(!r)
          return;

        memo = {
          ...memo,
          [key]: r(memo[key] || {}, action)
        };
      });

      return memo;
    }, state);
  }
}, _.reduce(reducers, (memo, object) => {
  Object.keys(object).forEach(key => {
    if(!memo[key])
      memo[key] = { status: 0 };
  });

  // if(defaultValue)
  //   memo[key] = {
  //     ...memo[key],
  //     ...defaultValue()
  //   };

  return memo;
}, {}));
