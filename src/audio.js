import { TONICS, SCALES, createScale } from "./music";
import {
  EVENT_PLAY,
  EVENT_PAUSE,
  EVENT_RESET,
  EVENT_PLAYBACK,
  EVENT_AUDIO_UP,
  EVENT_AUDIO_DOWN,
  EVENT_AUDIO_LOADING,
  EVENT_AUDIO_LOADED,
  EVENT_DATA_LOADED,
  EVENT_TONIC_CHANGE,
  EVENT_SCALE_CHANGE,
  EVENT_SPEED_CHANGE,
} from "./events";

const DEFAULT_NOTE_DURATION = 2;

const AUDIO_OUT = {
  waveform: undefined,
};

const importTone = () => import(/* webpackChunkName: "tone" */ "tone");

const createSynth = ({ PolySynth, Synth }, noteDuration) =>
  new PolySynth(64, Synth, {
    oscillator: {
      type: "triangle",
    },
    envelope: {
      attack: noteDuration * 0.75,
      decay: noteDuration * 1.5,
      sustain: 0.05,
      release: noteDuration,
    },
  });

const createReverb = ({ Freeverb }) => new Freeverb(0.95, 6000);

const createVolume = ({ Volume }) => new Volume(-10);

const createLimiter = ({ Compressor }) => new Compressor(-5, 16);

const createCompressor = ({ Compressor }) => new Compressor(-15, 8);

const createChannel = ({ Channel }) => new Channel(-20);

const initEngine = (Tone) => {
  const { Waveform, Master } = Tone;
  let tonicName = localStorage.getItem("tonic") || TONICS[0];
  let scaleName = localStorage.getItem("scale") || SCALES[0];
  let dataPoints = [];
  let playbackIndex = 0;
  let playbackTimeout = undefined;
  let noteDuration =
    DEFAULT_NOTE_DURATION / (localStorage.getItem("speed") || 1);

  const waveform = new Waveform(16 * 256);
  const reverb = createReverb(Tone);
  const volume = createVolume(Tone);
  const limiter = createLimiter(Tone);
  const compressor = createCompressor(Tone);
  const channel = createChannel(Tone).chain(
    compressor,
    limiter,
    reverb,
    waveform,
    volume,
    Master
  );
  let synth = createSynth(Tone, noteDuration).connect(channel);

  const play = () => {
    clearTimeout(playbackTimeout);
    if (dataPoints.length === 0) {
      playbackTimeout = setTimeout(play, noteDuration);
      return;
    }

    const minValue = dataPoints.reduce(
      (acc, p) => Math.min(acc, p.value),
      Infinity
    );
    const maxValue = dataPoints.reduce(
      (acc, p) => Math.max(acc, p.value),
      -Infinity
    );
    const point = dataPoints[playbackIndex];
    const value = point.value;
    const scale = createScale(scaleName, tonicName);
    const pitch =
      scale[
        Math.round(
          ((value - minValue) * (scale.length - 1)) / (maxValue - minValue)
        )
      ];

    const minTimestamp = dataPoints.reduce(
      (acc, p) => Math.min(acc, p.start),
      Infinity
    );
    const maxTimestamp = dataPoints.reduce(
      (acc, p) => Math.max(acc, p.end),
      -Infinity
    );
    const scoreDuration = (noteDuration * dataPoints.length) / 4;
    const tick = scoreDuration / (maxTimestamp - minTimestamp);

    const duration = (point.end - point.start) * tick;
    synth.triggerAttackRelease(
      pitch,
      Math.max(Math.min(duration, noteDuration), noteDuration * 2)
    );
    document.dispatchEvent(
      new CustomEvent(EVENT_PLAYBACK, {
        detail: { title: point.title, pitch, playbackIndex },
      })
    );

    playbackIndex = (playbackIndex + 1) % dataPoints.length;
    const nextPoint = dataPoints[playbackIndex];
    playbackTimeout = setTimeout(
      play,
      (nextPoint.start - point.start >= 0
        ? nextPoint.start - point.start
        : point.end - point.start) *
        (tick * 1000)
    );
  };

  const onTonicChange = (name) => {
    tonicName = name;
  };
  const onScaleChange = (name) => {
    scaleName = name;
  };
  const onPlay = () => {
    play();
  };
  const onPause = () => {
    synth.releaseAll();
    clearTimeout(playbackTimeout);
  };
  const onLoadData = (data = []) => {
    dataPoints = [...data].sort((a, b) => a.start - b.start);
    onReset();
  };
  const onReset = () => {
    playbackIndex = 0;
  };
  const onSpeedChange = (speed) => {
    const currentSynth = synth;
    currentSynth.releaseAll();
    setTimeout(() => currentSynth.dispose(), noteDuration * 2000);
    noteDuration = DEFAULT_NOTE_DURATION / speed;
    synth = createSynth(Tone, noteDuration).connect(channel);
  };

  return Promise.resolve({
    waveform,
    onPlay,
    onPause,
    onReset,
    onLoadData,
    onTonicChange,
    onScaleChange,
    onSpeedChange,
  });
};

const initAudio = () => {
  document.dispatchEvent(new Event(EVENT_AUDIO_LOADING));
  return importTone()
    .then(initEngine)
    .then(({ waveform, ...events }) => {
      const {
        onPlay,
        onPause,
        onReset,
        onLoadData,
        onTonicChange,
        onScaleChange,
        onSpeedChange,
      } = events;
      document.addEventListener(EVENT_PLAY, onPlay);
      document.addEventListener(EVENT_PAUSE, onPause);
      document.addEventListener(EVENT_RESET, onReset);
      document.addEventListener(EVENT_DATA_LOADED, ({ detail }) =>
        onLoadData(detail)
      );
      document.addEventListener(EVENT_TONIC_CHANGE, ({ detail }) =>
        onTonicChange(detail)
      );
      document.addEventListener(EVENT_SCALE_CHANGE, ({ detail }) =>
        onScaleChange(detail)
      );
      document.addEventListener(EVENT_SPEED_CHANGE, ({ detail }) =>
        onSpeedChange(detail)
      );

      AUDIO_OUT.waveform = waveform;

      document.dispatchEvent(new Event(EVENT_AUDIO_LOADED));
      document.dispatchEvent(new Event(EVENT_AUDIO_UP));
    })
    .catch((err) => {
      document.dispatchEvent(new Event(EVENT_AUDIO_DOWN));
      document.dispatchEvent(new Event(EVENT_AUDIO_LOADED));
      throw err;
    });
};

export { initAudio, SCALES, TONICS, AUDIO_OUT };
