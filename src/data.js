import { EVENT_DATA_LOADING, EVENT_DATA_LOADED } from "./events";

import endpoints from "./endpoints";

const fetchEndpointData = (endpoint) =>
  endpoint
    .fetchData()
    .then((detail) =>
      document.dispatchEvent(new CustomEvent(EVENT_DATA_LOADED, { detail }))
    )
    .then(
      () =>
        endpoint.fetchInterval &&
        setTimeout(() => fetchEndpointData(endpoint), endpoint.fetchInterval)
    )
    .catch((err) => {
      document.dispatchEvent(new Event(EVENT_DATA_LOADED));
      throw err;
    });

const initData = (endpointName) => {
  const endpoint = endpoints[endpointName] || Object.values(endpoints).pop();
  document.dispatchEvent(new Event(EVENT_DATA_LOADING));
  return fetchEndpointData(endpoint);
};

export { initData };
