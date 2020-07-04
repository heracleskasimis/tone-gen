import "./index.css";
import * as events from "./events";
import { createElements, mountElements } from "./elements";
import { initAudio } from "./audio";
import { initData } from "./data";

if (window.DEBUG) {
  Object.values(events).forEach((event) =>
    document.addEventListener(event, (e) =>
      console.info(event, ...(e.detail ? [e.detail] : []))
    )
  );
}

createElements()
  .then((elements) => mountElements(elements))
  .then(() => initAudio())
  .then(() => initData())
  .catch((err) => {
    console.error(err);
    document.dispatchEvent(
      new CustomEvent(events.EVENT_MESSAGE, { detail: err.message })
    );
  });
