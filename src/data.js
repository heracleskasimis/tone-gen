import {
  EVENT_MESSAGE,
  EVENT_DATA_LOADING,
  EVENT_DATA_LOADED,
  EVENT_ENDPOINT_CHANGE,
} from "./events";

import endpoints from "./endpoints";

const initData = () => {
  let fetchTimeout = undefined;

  const fetchEndpointData = (endpoint) => {
    clearTimeout(fetchTimeout);
    return endpoint
      .fetchData()
      .then((detail) =>
        document.dispatchEvent(new CustomEvent(EVENT_DATA_LOADED, { detail }))
      )
      .then(() => {
        if (endpoint.fetchInterval) {
          fetchTimeout = setTimeout(
            () => fetchEndpointData(endpoint),
            endpoint.fetchInterval
          );
        }
      })
      .catch((err) => {
        document.dispatchEvent(new Event(EVENT_DATA_LOADED));
        throw err;
      });
  };

  document.addEventListener(
    EVENT_ENDPOINT_CHANGE,
    ({ detail: endpointName }) => {
      const endpoint = endpoints[endpointName];
      document.dispatchEvent(new Event(EVENT_DATA_LOADING));
      fetchEndpointData(endpoint).catch((err) =>
        document.dispatchEvent(
          new CustomEvent(EVENT_MESSAGE, { detail: err.message })
        )
      );
    }
  );

  const endpointName =
    localStorage.getItem("endpoint") || Object.keys(endpoints).shift();
  const endpoint = endpoints[endpointName];
  document.dispatchEvent(new Event(EVENT_DATA_LOADING));
  return fetchEndpointData(endpoint);
};

export { initData };
