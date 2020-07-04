import { SCALES, TONICS } from "./music";
import { AUDIO_OUT } from "./audio";
import {
  EVENT_PLAY,
  EVENT_PAUSE,
  EVENT_RESET,
  EVENT_PLAYBACK,
  EVENT_AUDIO_UP,
  EVENT_AUDIO_DOWN,
  EVENT_AUDIO_LOADING,
  EVENT_AUDIO_LOADED,
  EVENT_DATA_LOADING,
  EVENT_DATA_LOADED,
  EVENT_MESSAGE,
  EVENT_TONIC_CHANGE,
  EVENT_SCALE_CHANGE,
} from "./events";

const MAX_PLAYLIST_COUNT = 10;
const FILL_COLOUR = "#00dddd";

const createTonicSelector = () => {
  const tonicSelector = document.createElement("select");
  tonicSelector.classList.add("selector");
  tonicSelector.classList.add("tonic-selector");
  TONICS.forEach((tonic) => {
    const option = document.createElement("option");
    option.value = tonic;
    option.textContent = tonic;
    if (localStorage.getItem("tonic") === tonic) {
      option.selected = true;
    }
    tonicSelector.appendChild(option);
  });
  tonicSelector.addEventListener("change", (event) => {
    document.dispatchEvent(
      new CustomEvent(EVENT_TONIC_CHANGE, { detail: event.target.value })
    );
    localStorage.setItem("tonic", event.target.value);
  });
  return Promise.resolve(tonicSelector);
};

const createScaleSelector = () => {
  const scaleSelector = document.createElement("select");
  scaleSelector.classList.add("selector");
  scaleSelector.classList.add("scale-selector");
  SCALES.forEach((scale) => {
    const option = document.createElement("option");
    option.value = scale;
    option.textContent = scale;
    if (localStorage.getItem("scale") === scale) {
      option.selected = true;
    }
    scaleSelector.appendChild(option);
  });
  scaleSelector.addEventListener("change", (event) => {
    document.dispatchEvent(
      new CustomEvent(EVENT_SCALE_CHANGE, { detail: event.target.value })
    );
    localStorage.setItem("scale", event.target.value);
  });
  return Promise.resolve(scaleSelector);
};

const createPlayButton = () => {
  const playButton = document.createElement("button");
  playButton.textContent = "Play";
  playButton.classList.add("btn-audio");
  playButton.classList.add("paused");
  playButton.disabled = true;
  playButton.addEventListener("click", () =>
    document.dispatchEvent(
      new Event(
        playButton.classList.contains("paused") ? EVENT_PLAY : EVENT_PAUSE
      )
    )
  );
  document.addEventListener(EVENT_PLAY, () => {
    playButton.classList.remove("paused");
    playButton.textContent = "Pause";
  });
  document.addEventListener(EVENT_PAUSE, () => {
    playButton.classList.add("paused");
    playButton.textContent = "Play";
  });
  document.addEventListener(EVENT_AUDIO_UP, () => {
    playButton.disabled = false;
  });
  document.addEventListener(EVENT_AUDIO_DOWN, () => {
    playButton.disabled = true;
  });
  return Promise.resolve(playButton);
};

const createResetButton = () => {
  const resetButton = document.createElement("button");
  resetButton.textContent = "Reset";
  resetButton.classList.add("btn-reset");
  resetButton.disabled = true;
  resetButton.addEventListener("click", () => {
    resetButton.disabled = true;
    document.dispatchEvent(new Event(EVENT_RESET));
  });
  document.addEventListener(EVENT_PLAYBACK, ({ detail: { playbackIndex } }) => {
    resetButton.disabled = playbackIndex === 0;
  });
  return Promise.resolve(resetButton);
};

const createLoader = () => {
  const loader = document.createElement("div");
  loader.textContent = "Loading...";
  loader.classList.add("loader");
  const setTextContent = () => {
    const classes = Array.from(loader.classList)
      .filter((c) => c.startsWith("loading-"))
      .map((c) => c.replace("loading-", ""));
    loader.textContent = `Loading ${classes.join(", ")}...`;
  };
  document.addEventListener(EVENT_AUDIO_LOADING, () => {
    loader.classList.add("loading-audio");
    setTextContent();
  });
  document.addEventListener(EVENT_AUDIO_LOADED, () => {
    loader.classList.remove("loading-audio");
    setTextContent();
  });
  document.addEventListener(EVENT_DATA_LOADING, () => {
    loader.classList.add("loading-data");
    setTextContent();
  });
  document.addEventListener(EVENT_DATA_LOADED, () => {
    loader.classList.remove("loading-data");
    setTextContent();
  });
  return Promise.resolve(loader);
};

const createMessage = () => {
  const message = document.createElement("div");
  message.classList.add("message");
  document.addEventListener(EVENT_MESSAGE, ({ detail }) => {
    message.classList.add("visible");
    message.textContent = detail;
  });
  return Promise.resolve(message);
};

const createPlaylist = () => {
  const playlist = document.createElement("div");
  playlist.classList.add("playlist");
  document.addEventListener(EVENT_PLAYBACK, ({ detail: { title } }) => {
    const item = document.createElement("div");
    item.classList.add("playlist-item");
    item.textContent = title;
    playlist.prepend(item);
    while (playlist.childElementCount > MAX_PLAYLIST_COUNT) {
      playlist.removeChild(playlist.lastChild);
    }
  });
  return Promise.resolve(playlist);
};

const createVisualizer = () => {
  const canvas = document.createElement("canvas");
  canvas.classList.add("visualizer");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  const visualize = () => {
    const samples = AUDIO_OUT.waveform && AUDIO_OUT.waveform.getValue();
    if (!samples) {
      return requestAnimationFrame(visualize);
    }

    const context = canvas.getContext("2d");
    const { width, height } = canvas;

    context.clearRect(0, 0, width, height);
    context.fillStyle = FILL_COLOUR;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(0, height);
    for (let i = 0; i < samples.length; i++) {
      const x = (i * width) / samples.length;
      const y = (samples[i] + 1) * (height / 2);
      context.lineTo(x, y);
    }
    context.lineTo(width, height);
    context.lineTo(0, height);
    context.fill();

    requestAnimationFrame(visualize);
  };

  visualize();

  return Promise.resolve(canvas);
};

const createElements = () =>
  Promise.all([
    createVisualizer(),
    createTonicSelector(),
    createScaleSelector(),
    createPlayButton(),
    createResetButton(),
    createLoader(),
    createMessage(),
    createPlaylist(),
  ]);

const mountElements = (elements) => {
  Object.values(elements).forEach((element) =>
    document.body.appendChild(element)
  );
  return Promise.resolve(true);
};

export { createElements, mountElements };
