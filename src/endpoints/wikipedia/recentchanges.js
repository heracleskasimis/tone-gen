const QUERY =
  "https://en.wikipedia.org/w/api.php?action=query&list=recentchanges&rcprop=title|sizes|flags|timestamp&rctype=edit&rclimit=500&origin=*&format=json";

const fetchData = () =>
  fetch(QUERY)
    .then((response) => response.json())
    .then((response) =>
      response.query.recentchanges
        .map((change) => ({
          title: `${change.title} (${new Date(
            change.timestamp
          ).toLocaleDateString()}) ~ ${Math.abs(
            change.oldlen - change.newlen
          )}`,
          value: Math.log(Math.abs(change.oldlen - change.newlen)),
          start: new Date(change.timestamp).getTime() / 1000,
          end: new Date(change.timestamp).getTime() / 1000,
        }))
        .filter((change) => change.value > 0)
    );

export { fetchData };
