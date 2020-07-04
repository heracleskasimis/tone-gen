import { EVENT_DATA_LOADING, EVENT_DATA_LOADED } from "./events";

import endpoints from "./endpoints";

const initData = (endpointName) => {
  const endpoint = endpoints[endpointName] || Object.values(endpoints).pop();
  document.dispatchEvent(new Event(EVENT_DATA_LOADING));
  return endpoint
    .fetchData()
    .then((detail) =>
      document.dispatchEvent(new CustomEvent(EVENT_DATA_LOADED, { detail }))
    )
    .catch((err) => {
      document.dispatchEvent(new Event(EVENT_DATA_LOADED));
      throw err;
    });
};

export { initData };
