const QUERY_STORIES = "https://hacker-news.firebaseio.com/v0/topstories.json";
const QUERY_STORY = "https://hacker-news.firebaseio.com/v0/item/{0}.json";

const fetchInterval = 30 * 60 * 1000;

const fetchData = () =>
  fetch(QUERY_STORIES)
    .then((response) => response.json())
    .then((stories) =>
      Promise.all(
        stories.map((story) =>
          fetch(QUERY_STORY.replace("{0}", story)).then((res) => res.json())
        )
      )
    )
    .then((response) =>
      response
        .filter((story) => story && story.score)
        .map((story) => ({
          title: `${story.title} (${new Date(
            story.time * 1000
          ).toLocaleDateString()}) ~ ${story.score}`,
          value: Math.log(story.score),
          start: story.time,
          end: story.time,
        }))
    );

export { fetchData, fetchInterval };
