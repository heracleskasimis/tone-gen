import Scale from "music-scale";

const TONICS = ["C", "D", "E", "F", "G", "A", "B"];
const ROOT_OCTAVE = 3;
const OCTAVE_RANGE = 4;
const SCALES = Scale.names();

const createScale = (name, note) => {
  const scale = new Scale(name, note);
  return Array.from(Array(OCTAVE_RANGE).keys()).flatMap((o) =>
    scale.map((tone) => `${tone}${ROOT_OCTAVE + o}`)
  );
};

export { TONICS, SCALES, ROOT_OCTAVE, createScale };
