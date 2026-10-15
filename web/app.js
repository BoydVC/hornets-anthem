/* Hornets Anthem Release — "Buzz Like Thunder"
   Original lyrics + WebAudio-synthesized track + canvas cover / lyric video.
   Everything is generated in this file: no audio files, no network. */
(() => {
"use strict";

// ---------------------------------------------------------------- song data
const BPM = 128, BEAT = 60 / BPM, BAR = BEAT * 4, SR = 44100;
const CHORDS = {
  G:  { root: 43, pad: [55, 59, 62], mel: [62, 67, 71, 74, 79] },
  D:  { root: 38, pad: [54, 57, 62], mel: [62, 66, 69, 74, 78] },
  Em: { root: 40, pad: [55, 59, 64], mel: [64, 67, 71, 76, 79] },
  C:  { root: 36, pad: [55, 60, 64], mel: [64, 67, 72, 76, 79] },
};
// Original lyrics, written for the Green Hornets 12U.
const SECTIONS = [
  { id: "intro", kind: "intro", name: "Intro", bars: 4, chords: ["G", "D", "Em", "C"],
    lines: [{ bar: 2, bars: 2, text: "Green and gold — here we go!" }] },
  { id: "v1", kind: "verse", name: "Verse 1", bars: 8, chords: ["Em", "C", "G", "D", "Em", "C", "G", "D"],
    lines: [
      { bar: 0, bars: 2, text: "Cleats laced tight when the whistle blows," },
      { bar: 2, bars: 2, text: "Green and gold from our heads to toes," },
      { bar: 4, bars: 2, text: "Pass it wide and we run as one," },
      { bar: 6, bars: 2, text: "We don't stop till the game is done!" },
    ] },
  { id: "c1", kind: "chorus", name: "Chorus", bars: 8, chords: ["G", "D", "Em", "C", "G", "D", "C", "D"],
    lines: [
      { bar: 0, bars: 2, text: "Buzz, buzz! Green Hornets rise," },
      { bar: 2, bars: 2, text: "Gold on the jersey, fire in our eyes," },
      { bar: 4, bars: 2, text: "Every pass, every run, every goal we score —" },
      { bar: 6, bars: 2, text: "We're the Hornets, hear the swarm ROAR!" },
    ] },
  { id: "v2", kind: "verse", name: "Verse 2", bars: 8, chords: ["Em", "C", "G", "D", "Em", "C", "G", "D"],
    lines: [
      { bar: 0, bars: 2, text: "Rain or shine, we will hold the line," },
      { bar: 2, bars: 2, text: "Keeper's wall and the backs align," },
      { bar: 4, bars: 2, text: "Midfield magic and a strike so true —" },
      { bar: 6, bars: 2, text: "Twelve-U Hornets coming through!" },
    ] },
  { id: "c2", kind: "chorus", name: "Chorus", bars: 8, chords: ["G", "D", "Em", "C", "G", "D", "C", "D"],
    lines: [
      { bar: 0, bars: 2, text: "Buzz, buzz! Green Hornets rise," },
      { bar: 2, bars: 2, text: "Gold on the jersey, fire in our eyes," },
      { bar: 4, bars: 2, text: "Every pass, every run, every goal we score —" },
      { bar: 6, bars: 2, text: "We're the Hornets, hear the swarm ROAR!" },
    ] },
  { id: "outro", kind: "outro", name: "Outro Chant", bars: 4, chords: ["G", "C", "D", "G"],
    lines: [
      { bar: 0, bars: 2, text: "Hornets on three — one, two, three…" },
      { bar: 2, bars: 1, text: "HORNETS! Buzz like thunder!" },
    ] },
];
const CONTOURS = {
  intro: [[2, 2, 3, 3, 4, 4]],
  verse: [[1, 1, 2, 2, 3, 2, 1, 2, 2, 1], [1, 2, 3, 3, 2, 2, 1, 1, 0, 0],
          [1, 1, 2, 2, 3, 3, 2, 2, 1], [2, 2, 3, 2, 1, 1, 2, 1, 0, 0]],
  chorus: [[3, 3, 4, 3, 2], [2, 3, 4, 4, 3, 2, 3, 2, 1], [2, 2, 3, 3, 4, 4, 3, 3, 4], [4, 4, 3, 2, 3, 4, 4, 4]],
  outro: [[2, 2, 3, 2, 3, 4], [4, 3, 3, 4]],
};
const STEMS = [
  { id: "drums", name: "Drums", sub: "kick · snare · claps · hats", vol: 0.9 },
  { id: "bass", name: "Bass", sub: "saw + sub", vol: 0.8 },
  { id: "chords", name: "Chords", sub: "pads · plucks", vol: 0.7 },
  { id: "lead", name: "Lead", sub: "guide melody", vol: 0.85 },
  { id: "fx", name: "Buzz FX", sub: "hornet · risers · HEY!", vol: 0.7 },
];
const PRESETS = {
  anthem: { title: "Buzz Like Thunder (Anthem Mix)", vols: { drums: 0.9, bass: 0.8, chords: 0.7, lead: 0.85, fx: 0.7 } },
  instrumental: { title: "Buzz Like Thunder (Instrumental)", vols: { drums: 0.9, bass: 0.8, chords: 0.8, lead: 0, fx: 0.6 } },
  chant: { title: "Buzz Like Thunder (Sideline Chant Mix)", vols: { drums: 1, bass: 0.5, chords: 0, lead: 0, fx: 0.9 } },
};
const SEC_COLORS = { intro: "#7fd3a0", verse: "#1f9d4c", chorus: "#f5c518", outro: "#e0a500" };

// ----------------------------------------------------- timeline / lyrics
let TOTAL_BARS = 0;
const LINES = [];
SECTIONS.forEach((s) => {
  s.startBar = TOTAL_BARS; s.t0 = TOTAL_BARS * BAR; s.t1 = (TOTAL_BARS + s.bars) * BAR;
  s.lines.forEach((ln, li) => {
    const raw = ln.text.split(/\s+/);
    const words = [];
    raw.forEach((w) => {
      if (!/[A-Za-z0-9]/.test(w) && words.length) words[words.length - 1] += " " + w;
      else words.push(w);
    });
    const n = words.length, usable = ln.bars * 8 - 2;
    const lineBeat = (s.startBar + ln.bar) * 4;
    const slots = words.map((_, i) => (n * 2 <= usable ? i * 2 : Math.round((i * (usable - 2)) / Math.max(1, n - 1))));
    const contour = CONTOURS[s.kind][li % CONTOURS[s.kind].length];
    const endBeat = lineBeat + ln.bars * 4;
    const wobjs = words.map((w, i) => {
      const beat = lineBeat + slots[i] / 2;
      const nextBeat = i < n - 1 ? lineBeat + slots[i + 1] / 2 : Math.min(beat + 2, endBeat - 0.25);
      const chord = CHORDS[s.chords[Math.floor(beat / 4) - s.startBar]];
      const idx = Math.max(0, Math.min(4, contour[i % contour.length]));
      return { w, beat, t0: beat * BEAT, t1: nextBeat * BEAT, midi: chord.mel[idx] };
    });
    LINES.push({ text: ln.text, sec: s, secLine: li, words: wobjs, t0: lineBeat * BEAT, t1: endBeat * BEAT,
                 chords: s.chords.slice(ln.bar, ln.bar + ln.bars) });
  });
  TOTAL_BARS += s.bars;
});
const DUR = TOTAL_BARS * BAR;
LINES.forEach((l, i) => (l.index = i));

function sectionAt(t) { return SECTIONS.find((s) => t >= s.t0 && t < s.t1) || SECTIONS[SECTIONS.length - 1]; }
function lineAt(t) {
  let cur = null;
  for (const l of LINES) if (t >= l.t0 && t < l.t1) cur = l;
  if (!cur) return { line: null, wordIdx: -1, next: LINES.find((l) => l.t0 > t) || null };
  let wi = -1;
  cur.words.forEach((w, i) => { if (t >= w.t0) wi = i; });
  return { line: cur, wordIdx: wi, next: LINES[cur.index + 1] || null, prev: LINES[cur.index - 1] || null };
}

// ------------------------------------------------------------ event list
function generateEvents() {
  const ev = [];
  const add = (stem, type, beat, o = {}) => ev.push({ stem, type, beat, t: beat * BEAT, vel: 1, ...o });
  SECTIONS.forEach((s, si) => {
    const next = SECTIONS[si + 1];
    for (let b = 0; b < s.bars; b++) {
      const B = (s.startBar + b) * 4, ch = CHORDS[s.chords[b]], last = b === s.bars - 1;
      if (s.kind === "intro") {
        if (b === 0) add("fx", "buzz", B, { dur: BAR * 2 });
        add("chords", "pad", B, { notes: ch.pad, dur: BAR, vel: 0.35 + b * 0.1 });
        if (b === 0) add("drums", "kick", B, { vel: 0.8 });
        if (b === 1) { add("drums", "kick", B, { vel: 0.8 }); add("drums", "kick", B + 2, { vel: 0.8 }); }
        if (b >= 2) {
          for (let q = 0; q < 4; q++) add("drums", "kick", B + q, { vel: 0.9 });
          add("drums", "clap", B + 1); if (b === 2) add("drums", "clap", B + 3);
          for (let e = 0; e < 8; e++) add("drums", "hat", B + e / 2, { vel: e % 2 ? 0.7 : 0.4 });
          for (let e = 0; e < 8; e++) add("bass", "bass", B + e / 2, { midi: ch.root + (e % 2 ? 12 : 0), dur: BEAT * 0.45, vel: 0.8 });
        }
        if (b === 3) {
          for (let k = 0; k < 8; k++) add("drums", "snare", B + 2 + k / 4, { vel: 0.35 + k * 0.08 });
          add("fx", "riser", B, { dur: BAR });
        }
      } else if (s.kind === "verse") {
        if (b === 0) add("drums", "crash", B);
        [0, 1.5, 2].forEach((k) => add("drums", "kick", B + k));
        if (b % 2) add("drums", "kick", B + 3.5, { vel: 0.7 });
        add("drums", "snare", B + 1);
        if (!last) add("drums", "snare", B + 3);
        else for (let k = 0; k < 4; k++) add("drums", "snare", B + 3 + k / 4, { vel: 0.55 + k * 0.12 });
        for (let e = 0; e < 8; e++) add("drums", "hat", B + e / 2, { vel: e % 2 ? 0.35 : 0.6 });
        const bl = [0, 0, 12, 0, 0, 7, 12, 0];
        for (let e = 0; e < 8; e++) add("bass", "bass", B + e / 2, { midi: ch.root + bl[e], dur: BEAT * 0.42, vel: 0.85 });
        add("chords", "pad", B, { notes: ch.pad, dur: BAR, vel: 0.45 });
        if (last && next && next.kind === "chorus") add("fx", "riser", B, { dur: BAR });
      } else if (s.kind === "chorus") {
        if (b === 0 || b === 4) add("drums", "crash", B);
        for (let q = 0; q < 4; q++) add("drums", "kick", B + q);
        add("drums", "snare", B + 1); add("drums", "clap", B + 1);
        if (!last) { add("drums", "snare", B + 3); add("drums", "clap", B + 3); }
        else for (let k = 0; k < 4; k++) add("drums", "snare", B + 3 + k / 4, { vel: 0.6 + k * 0.12 });
        for (let e = 0; e < 16; e++) add("drums", e % 4 === 2 ? "ohat" : "hat", B + e / 4, { vel: e % 2 ? 0.3 : 0.5 });
        for (let e = 0; e < 8; e++) add("bass", "bass", B + e / 2, { midi: ch.root + (e % 2 ? 12 : 0), dur: BEAT * 0.42, vel: 0.95 });
        add("chords", "pad", B, { notes: ch.pad, dur: BAR, vel: 0.55 });
        const arp = [0, 1, 2, 1];
        for (let e = 0; e < 16; e++) add("chords", "pluck", B + e / 4, { midi: ch.pad[arp[e % 4]] + 12, vel: e % 4 === 0 ? 0.9 : 0.6 });
        if (b % 2 === 1) add("fx", "hey", B + 3);
      } else if (s.kind === "outro") {
        if (b === 0) add("drums", "crash", B);
        if (b < 3) {
          add("drums", "kick", B); add("drums", "kick", B + 2);
          for (let q = 0; q < 4; q++) add("drums", "clap", B + q, { vel: q % 2 ? 1 : 0.75 });
          for (let e = 0; e < 8; e++) add("drums", "hat", B + e / 2, { vel: e % 2 ? 0.35 : 0.55 });
          for (let q = 0; q < 4; q++) add("bass", "bass", B + q, { midi: ch.root, dur: BEAT * 0.8, vel: 0.9 });
          add("chords", "pad", B, { notes: ch.pad, dur: BAR, vel: 0.5 });
          if (b === 2) for (let k = 0; k < 8; k++) add("drums", "snare", B + 2 + k / 4, { vel: 0.4 + k * 0.08 });
        } else {
          add("drums", "crash", B); add("drums", "kick", B, { vel: 1 });
          add("bass", "bass", B, { midi: ch.root, dur: BAR * 0.9, vel: 1 });
          add("chords", "pad", B, { notes: ch.pad.concat([ch.pad[0] + 12]), dur: BAR * 0.95, vel: 0.65 });
          add("fx", "hey", B, { vel: 1.2 });
          add("fx", "buzz", B + 1, { dur: BAR * 0.7, vel: 0.8 });
        }
      }
    }
  });
  LINES.forEach((l) => l.words.forEach((w) => {
    add("lead", "lead", w.beat, { midi: w.midi, dur: Math.max(0.12, (w.t1 - w.t0) * 0.88), vel: 0.9 });
  }));
  ev.sort((a, b) => a.t - b.t);
  return ev;
}
const EVENTS = generateEvents();

// --------------------------------------------------------------- synthesis
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
function makeNoise(ac) {
  const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
  const d = buf.getChannelData(0);
  let s = 1337;
  for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; }
  return buf;
}
function envGain(ac, out, t, peak, attack, decayTo, decayTime, end) {
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, decayTo), t + attack + decayTime);
  if (end) { g.gain.setValueAtTime(Math.max(0.0001, decayTo), end); g.gain.exponentialRampToValueAtTime(0.0001, end + 0.06); }
  g.connect(out);
  return g;
}
function noiseSrc(ac, noise, t, dur, seed) {
  const n = ac.createBufferSource(); n.buffer = noise;
  n.start(t, (seed * 0.137) % 1.5, dur + 0.05);
  return n;
}
function synth(ac, out, e, noise, k) {
  const t = e.t + 0.005, v = e.vel;
  switch (e.type) {
    case "kick": {
      const o = ac.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(165, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.11);
      const g = envGain(ac, out, t, 0.95 * v, 0.003, 0.001, 0.36);
      o.connect(g); o.start(t); o.stop(t + 0.42);
      const c = noiseSrc(ac, noise, t, 0.02, k); const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2500;
      const cg = envGain(ac, out, t, 0.15 * v, 0.001, 0.001, 0.012); c.connect(hp); hp.connect(cg);
      break;
    }
    case "snare": {
      const n = noiseSrc(ac, noise, t, 0.2, k); const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 1100;
      const g = envGain(ac, out, t, 0.42 * v, 0.002, 0.001, 0.17); n.connect(hp); hp.connect(g);
      const o = ac.createOscillator(); o.type = "triangle"; o.frequency.setValueAtTime(195, t); o.frequency.exponentialRampToValueAtTime(150, t + 0.08);
      const og = envGain(ac, out, t, 0.3 * v, 0.002, 0.001, 0.1); o.connect(og); o.start(t); o.stop(t + 0.15);
      break;
    }
    case "clap": {
      const n = noiseSrc(ac, noise, t, 0.2, k + 7); const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 1450; bp.Q.value = 0.9;
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t);
      [0, 0.011, 0.022].forEach((d) => { g.gain.setValueAtTime(0.55 * v, t + d); g.gain.exponentialRampToValueAtTime(0.05, t + d + 0.009); });
      g.gain.setValueAtTime(0.5 * v, t + 0.031); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
      n.connect(bp); bp.connect(g); g.connect(out);
      break;
    }
    case "hat": case "ohat": {
      const open = e.type === "ohat";
      const n = noiseSrc(ac, noise, t, open ? 0.25 : 0.06, k + 3); const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 7600;
      const g = envGain(ac, out, t, (open ? 0.13 : 0.16) * v, 0.001, 0.0005, open ? 0.22 : 0.045); n.connect(hp); hp.connect(g);
      break;
    }
    case "crash": {
      const n = noiseSrc(ac, noise, t, 1.6, k + 11); const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 4800;
      const g = envGain(ac, out, t, 0.22 * v, 0.003, 0.0005, 1.5); n.connect(hp); hp.connect(g);
      break;
    }
    case "bass": {
      const f = mtof(e.midi);
      const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.value = f;
      const s = ac.createOscillator(); s.type = "sine"; s.frequency.value = f;
      const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.Q.value = 3;
      lp.frequency.setValueAtTime(1500, t); lp.frequency.exponentialRampToValueAtTime(420, t + 0.12);
      const g = envGain(ac, out, t, 0.32 * v, 0.004, 0.22 * v, 0.08, t + e.dur);
      const sg = ac.createGain(); sg.gain.value = 0.8;
      o.connect(lp); s.connect(sg); sg.connect(lp); lp.connect(g);
      o.start(t); s.start(t); o.stop(t + e.dur + 0.1); s.stop(t + e.dur + 0.1);
      break;
    }
    case "pad": {
      const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1500; lp.Q.value = 0.6;
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.06 * v, t + 0.09); g.gain.setValueAtTime(0.06 * v, t + e.dur - 0.05);
      g.gain.linearRampToValueAtTime(0.0001, t + e.dur + 0.12);
      lp.connect(g); g.connect(out);
      e.notes.forEach((m) => [-8, 8].forEach((dt) => {
        const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.value = mtof(m); o.detune.value = dt;
        o.connect(lp); o.start(t); o.stop(t + e.dur + 0.15);
      }));
      break;
    }
    case "pluck": {
      const o = ac.createOscillator(); o.type = "sawtooth"; o.frequency.value = mtof(e.midi);
      const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.setValueAtTime(3600, t); lp.frequency.exponentialRampToValueAtTime(500, t + 0.15);
      const g = envGain(ac, out, t, 0.07 * v, 0.002, 0.0005, 0.2); o.connect(lp); lp.connect(g); o.start(t); o.stop(t + 0.25);
      break;
    }
    case "lead": {
      const f = mtof(e.midi);
      const o1 = ac.createOscillator(); o1.type = "square"; o1.frequency.value = f;
      const o2 = ac.createOscillator(); o2.type = "triangle"; o2.frequency.value = f * 2; 
      const lfo = ac.createOscillator(); lfo.frequency.value = 5.6; const lg = ac.createGain(); lg.gain.value = f * 0.007;
      lfo.connect(lg); lg.connect(o1.frequency);
      const m1 = ac.createGain(); m1.gain.value = 0.55; const m2 = ac.createGain(); m2.gain.value = 0.35;
      const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2600; lp.Q.value = 1.2;
      const g = envGain(ac, out, t, 0.2 * v, 0.012, 0.14 * v, 0.12, t + e.dur);
      o1.connect(m1); o2.connect(m2); m1.connect(lp); m2.connect(lp); lp.connect(g);
      const end = t + e.dur + 0.1;
      [o1, o2, lfo].forEach((o) => { o.start(t); o.stop(end); });
      break;
    }
    case "buzz": {
      const dur = e.dur;
      const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 3.5;
      bp.frequency.setValueAtTime(600, t); bp.frequency.linearRampToValueAtTime(1900, t + dur * 0.55); bp.frequency.linearRampToValueAtTime(800, t + dur);
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.28 * v, t + dur * 0.35);
      g.gain.setValueAtTime(0.28 * v, t + dur * 0.7); g.gain.linearRampToValueAtTime(0.0001, t + dur);
      bp.connect(g); g.connect(out);
      [0, 13].forEach((dt) => {
        const o = ac.createOscillator(); o.type = "sawtooth"; o.detune.value = dt;
        o.frequency.setValueAtTime(165, t); o.frequency.linearRampToValueAtTime(232, t + dur * 0.5); o.frequency.linearRampToValueAtTime(150, t + dur);
        const lfo = ac.createOscillator(); lfo.frequency.value = 27 + dt * 0.2; const lg = ac.createGain(); lg.gain.value = 14;
        lfo.connect(lg); lg.connect(o.frequency); o.connect(bp);
        o.start(t); lfo.start(t); o.stop(t + dur + 0.05); lfo.stop(t + dur + 0.05);
      });
      break;
    }
    case "riser": {
      const n = noiseSrc(ac, noise, t, e.dur, k + 5); const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 5;
      bp.frequency.setValueAtTime(400, t); bp.frequency.exponentialRampToValueAtTime(7000, t + e.dur);
      const g = ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.5 * v, t + e.dur - 0.02); g.gain.linearRampToValueAtTime(0.0001, t + e.dur);
      n.connect(bp); bp.connect(g); g.connect(out);
      break;
    }
    case "hey": {
      const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 950; bp.Q.value = 1.4;
      const bp2 = ac.createBiquadFilter(); bp2.type = "bandpass"; bp2.frequency.value = 2300; bp2.Q.value = 2;
      const g = envGain(ac, out, t, 0.5 * v, 0.012, 0.001, 0.22);
      bp.connect(g); bp2.connect(g);
      [188, 211, 236, 262].forEach((f, i) => {
        const o = ac.createOscillator(); o.type = "sawtooth";
        o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.84, t + 0.22);
        o.connect(i % 2 ? bp2 : bp); o.start(t + i * 0.006); o.stop(t + 0.28);
      });
      const n = noiseSrc(ac, noise, t, 0.08, k + 9); const ng = envGain(ac, bp2, t, 0.6, 0.004, 0.001, 0.07); n.connect(ng);
      break;
    }
  }
}
// Rendered in short segments: each OfflineAudioContext only holds the events that
// start inside it (+ a tail), so node count per render stays small and fast.
const SEG_BARS = 4, TAIL = 2.0;
async function renderSegment(stemId, segIdx) {
  const s0 = segIdx * SEG_BARS * BAR, s1 = Math.min(DUR, s0 + SEG_BARS * BAR);
  const len = Math.ceil((s1 - s0 + TAIL) * SR);
  const ac = new OfflineAudioContext(1, len, SR);
  const noise = makeNoise(ac);
  const out = ac.createGain(); out.connect(ac.destination);
  EVENTS.forEach((e, k) => { if (e.stem === stemId && e.t >= s0 - 1e-6 && e.t < s1 - 1e-6) synth(ac, out, { ...e, t: e.t - s0 }, noise, k); });
  return { s0, buf: await ac.startRendering() };
}
async function renderStem(stemId) {
  const total = Math.ceil(DUR * SR);
  const segs = Math.ceil(TOTAL_BARS / SEG_BARS);
  const parts = await Promise.all(Array.from({ length: segs }, (_, i) => renderSegment(stemId, i)));
  const data = new Float32Array(total);
  parts.forEach(({ s0, buf }) => {
    const d = buf.getChannelData(0), off = Math.round(s0 * SR);
    // tails that run past the loop end wrap to the top so the loop is seamless
    for (let i = 0; i < d.length; i++) { const j = off + i; data[j < total ? j : j - total] += d[i]; }
  });
  return { length: total, getChannelData: () => data, data };
}
// ------------------------------------------------------------- audio engine
const A = {
  ctx: null, bufs: {}, env: {}, peaks: {}, master: null, comp: null, muteG: null, gains: {},
  sources: [], playing: false, startAt: 0, offset: 0, loop: true, muted: false, rendered: false,
  renderPromise: null, renderMs: 0, masterLevel: 1, vols: {}, mutes: {}, preset: "anthem", previewT: 0,
};
STEMS.forEach((s) => { A.vols[s.id] = s.vol; A.mutes[s.id] = false; });
const ENV_BLOCK = 1024;
function setStatus(msg) { const el = $("#render-status"); if (el) el.textContent = msg; }
function render() {
  if (A.renderPromise) return A.renderPromise;
  A.renderPromise = (async () => {
    const t0 = performance.now();
    for (const s of STEMS) {
      setStatus(`Mixing stems in your browser… ${s.name}`);
      const r = await renderStem(s.id);
      const buf = new AudioBuffer({ length: r.length, numberOfChannels: 1, sampleRate: SR });
      buf.copyToChannel(r.data, 0);
      A.bufs[s.id] = buf;
      const d = buf.getChannelData(0);
      const env = new Float32Array(Math.ceil(d.length / ENV_BLOCK));
      let peak = 0;
      for (let b = 0; b < env.length; b++) {
        let sum = 0; const end = Math.min(d.length, (b + 1) * ENV_BLOCK);
        for (let i = b * ENV_BLOCK; i < end; i++) { const x = d[i]; sum += x * x; if (x > peak) peak = x; else if (-x > peak) peak = -x; }
        env[b] = Math.sqrt(sum / ENV_BLOCK);
      }
      A.env[s.id] = env; A.peaks[s.id] = peak;
    }
    // estimate mix peak at default (anthem) levels to set master gain
    const len = A.bufs.drums.length; let mp = 0;
    const ch = STEMS.map((s) => [A.bufs[s.id].getChannelData(0), s.vol]);
    for (let i = 0; i < len; i += 7) { let x = 0; for (const [d, v] of ch) x += d[i] * v; if (Math.abs(x) > mp) mp = Math.abs(x); }
    A.masterLevel = Math.min(2, 0.92 / Math.max(0.05, mp));
    A.renderMs = Math.round(performance.now() - t0);
    A.rendered = true;
    setStatus(`Track mixed in ${(A.renderMs / 1000).toFixed(1)}s — 5 stems, ${SR / 1000} kHz, all synthesized.`);
    return stemReport();
  })();
  return A.renderPromise;
}
function stemReport() {
  const o = {};
  STEMS.forEach((s) => {
    const env = A.env[s.id]; let sum = 0; for (const x of env) sum += x;
    o[s.id] = { len: A.bufs[s.id].length, peak: +A.peaks[s.id].toFixed(4), rms: +(sum / env.length).toFixed(5) };
  });
  return { stems: o, ms: A.renderMs, duration: DUR, sampleRate: SR };
}
function ensureCtx() {
  if (A.ctx) return;
  A.ctx = new (window.AudioContext || window.webkitAudioContext)();
  A.master = A.ctx.createGain();
  A.comp = A.ctx.createDynamicsCompressor();
  A.comp.threshold.value = -8; A.comp.ratio.value = 4; A.comp.attack.value = 0.004; A.comp.release.value = 0.15;
  A.muteG = A.ctx.createGain();
  A.master.connect(A.comp); A.comp.connect(A.muteG); A.muteG.connect(A.ctx.destination);
  STEMS.forEach((s) => { const g = A.ctx.createGain(); g.connect(A.master); A.gains[s.id] = g; });
  applyGains();
}
function stemGain(id) { return A.mutes[id] ? 0 : A.vols[id]; }
function applyGains() {
  if (!A.ctx) return;
  const now = A.ctx.currentTime;
  STEMS.forEach((s) => A.gains[s.id].gain.setTargetAtTime(stemGain(s.id), now, 0.02));
  A.master.gain.setTargetAtTime(A.masterLevel, now, 0.02);
  A.muteG.gain.setTargetAtTime(A.muted ? 0 : 1, now, 0.02);
}
function stopSources() { A.sources.forEach((s) => { try { s.onended = null; s.stop(); } catch (_) {} }); A.sources = []; }
function startSources() {
  stopSources();
  const when = A.ctx.currentTime + 0.04;
  STEMS.forEach((s) => {
    const src = A.ctx.createBufferSource(); src.buffer = A.bufs[s.id]; src.loop = A.loop;
    src.connect(A.gains[s.id]); src.start(when, Math.min(A.offset, DUR - 0.01)); A.sources.push(src);
  });
  A.startAt = when - A.offset;
}
function position() {
  if (!A.playing || !A.ctx) return A.offset;
  let p = A.ctx.currentTime - A.startAt;
  if (p < 0) p = 0;
  if (A.loop) p = p % DUR;
  return Math.min(p, DUR);
}
async function play() {
  await render();
  ensureCtx(); applyGains();
  if (A.ctx.state !== "running") { try { await A.ctx.resume(); } catch (_) {} }
  if (A.playing) return;
  if (A.offset >= DUR - 0.05) A.offset = 0;
  A.playing = true; startSources(); syncButtons();
}
function pause() {
  if (!A.playing) return;
  A.offset = position(); A.playing = false; stopSources(); syncButtons();
}
function toggle() { A.playing ? pause() : play(); }
function seek(t) {
  t = Math.max(0, Math.min(DUR - 0.01, t));
  A.offset = t; A.previewT = t;
  if (A.playing) startSources();
}
function setLoop(on) { A.loop = on; if (A.playing) { A.offset = position(); startSources(); } }
function setMuted(on) { A.muted = on; applyGains(); syncButtons(); }
function setPreset(name) {
  const p = PRESETS[name]; if (!p) return;
  A.preset = name; Object.assign(A.vols, p.vols); STEMS.forEach((s) => (A.mutes[s.id] = false));
  applyGains(); buildMixer(); buildTracklist(); $("#now-track").textContent = trackLabel();
}
function trackLabel() { const keys = Object.keys(PRESETS); return `${keys.indexOf(A.preset) + 1} · ${PRESETS[A.preset].title}`; }

// WAV export (mono 16-bit) mixed with the current mixer settings
function mixdown() {
  const len = A.bufs.drums.length, out = new Float32Array(len);
  STEMS.forEach((s) => { const g = stemGain(s.id); if (!g) return; const d = A.bufs[s.id].getChannelData(0); for (let i = 0; i < len; i++) out[i] += d[i] * g; });
  let peak = 0; for (let i = 0; i < len; i++) { const x = Math.abs(out[i]); if (x > peak) peak = x; }
  const norm = peak > 0 ? 0.95 / peak : 1;
  for (let i = 0; i < len; i++) out[i] *= norm;
  return out;
}
function encodeWav(samples, sr) {
  const buf = new ArrayBuffer(44 + samples.length * 2), v = new DataView(buf);
  const w = (o, s) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, "RIFF"); v.setUint32(4, 36 + samples.length * 2, true); w(8, "WAVE"); w(12, "fmt ");
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true);
  v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, "data");
  v.setUint32(40, samples.length * 2, true);
  for (let i = 0, o = 44; i < samples.length; i++, o += 2) { const x = Math.max(-1, Math.min(1, samples[i])); v.setInt16(o, x < 0 ? x * 0x8000 : x * 0x7fff, true); }
  return new Blob([buf], { type: "audio/wav" });
}
async function wavBlob() { await render(); return encodeWav(mixdown(), SR); }
function rmsAt(id, t) { const e = A.env[id]; if (!e) return 0; const i = Math.floor((t * SR) / ENV_BLOCK); return e[Math.max(0, Math.min(e.length - 1, i))] || 0; }

// ----------------------------------------------------------------- drawing
const DISPLAY = 'Anton, Impact, "Arial Black", "Helvetica Neue", sans-serif';
const BODY = 'Inter, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
const PALETTES = [
  { name: "Classic", bg1: "#0f5a2c", bg2: "#03140a", gold: "#f5c518", gold2: "#c99a06", green: "#1f9d4c", ink: "#ffffff" },
  { name: "Night Game", bg1: "#132a1c", bg2: "#000000", gold: "#ffd23f", gold2: "#d4a00a", green: "#2ecc71", ink: "#f4fff6" },
  { name: "Gold Rush", bg1: "#1a7a3c", bg2: "#06210f", gold: "#ffcf33", gold2: "#e09b00", green: "#0b3d1e", ink: "#ffffff" },
];
let coverPal = 0;

function hexPath(c, x, y, r) {
  c.beginPath();
  for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i + Math.PI / 6; const px = x + r * Math.cos(a), py = y + r * Math.sin(a); i ? c.lineTo(px, py) : c.moveTo(px, py); }
  c.closePath();
}
function drawHornet(c, x, y, s, t = 0, flip = false, pal = PALETTES[0]) {
  c.save(); c.translate(x, y); c.scale(flip ? -s : s, s);
  const flap = Math.sin(t * 55) * 0.35;
  // wings (behind)
  c.save();
  c.translate(5, -18);
  [[-0.55 + flap, 62, 24, -20, -42], [-0.95 + flap * 0.8, 48, 18, -2, -46]].forEach(([rot, rx, ry, cx, cy]) => {
    c.save(); c.rotate(rot); c.beginPath(); c.ellipse(cx * 0.2 - 30, cy * 0.4, rx, ry, 0, 0, Math.PI * 2);
    c.fillStyle = "rgba(220,245,255,0.42)"; c.fill(); c.lineWidth = 3; c.strokeStyle = "rgba(255,255,255,0.85)"; c.stroke();
    c.beginPath(); c.moveTo(cx * 0.2 - 30 + rx * 0.9, cy * 0.4); c.lineTo(cx * 0.2 - 30 - rx * 0.7, cy * 0.4 - 3); c.lineWidth = 1.5; c.stroke();
    c.restore();
  });
  c.restore();
  // legs
  c.strokeStyle = "#0a0a0a"; c.lineWidth = 6; c.lineCap = "round";
  [[-6, 22, -18, 46], [10, 24, 6, 50], [24, 20, 34, 44]].forEach(([a, b, cx, cy]) => { c.beginPath(); c.moveTo(a, b); c.quadraticCurveTo(cx - 6, cy - 12, cx, cy); c.stroke(); });
  // stinger
  c.beginPath(); c.moveTo(-118, -8); c.lineTo(-152, 2); c.lineTo(-118, 10); c.closePath(); c.fillStyle = "#111"; c.fill();
  // abdomen with stripes
  c.save();
  c.beginPath(); c.ellipse(-62, 2, 62, 40, -0.08, 0, Math.PI * 2); c.closePath();
  c.fillStyle = pal.gold; c.fill(); c.clip();
  c.fillStyle = "#111";
  [-104, -74, -44].forEach((sx) => { c.beginPath(); c.moveTo(sx, -50); c.lineTo(sx + 14, -50); c.lineTo(sx + 10, 50); c.lineTo(sx - 4, 50); c.fill(); });
  c.fillStyle = "rgba(255,255,255,0.28)"; c.beginPath(); c.ellipse(-60, -20, 40, 9, -0.1, 0, Math.PI * 2); c.fill();
  c.restore();
  c.lineWidth = 4; c.strokeStyle = "#111"; c.beginPath(); c.ellipse(-62, 2, 62, 40, -0.08, 0, Math.PI * 2); c.stroke();
  // thorax
  c.beginPath(); c.ellipse(12, 0, 30, 27, 0, 0, Math.PI * 2); c.fillStyle = "#121212"; c.fill();
  c.fillStyle = pal.green; c.beginPath(); c.ellipse(8, -8, 16, 8, -0.3, 0, Math.PI * 2); c.fill();
  // head
  c.beginPath(); c.arc(56, -6, 27, 0, Math.PI * 2); c.fillStyle = pal.gold; c.fill(); c.lineWidth = 4; c.strokeStyle = "#111"; c.stroke();
  // eye
  c.beginPath(); c.ellipse(64, -12, 11, 14, 0.2, 0, Math.PI * 2); c.fillStyle = "#111"; c.fill();
  c.beginPath(); c.arc(67, -17, 4, 0, Math.PI * 2); c.fillStyle = "#fff"; c.fill();
  // determined brow + grin
  c.strokeStyle = "#111"; c.lineWidth = 5; c.beginPath(); c.moveTo(50, -30); c.lineTo(76, -24); c.stroke();
  c.lineWidth = 3.5; c.beginPath(); c.arc(64, 4, 11, 0.15, 1.3); c.stroke();
  // antennae
  c.lineWidth = 4; c.beginPath(); c.moveTo(50, -30); c.quadraticCurveTo(52, -62, 74, -72); c.stroke();
  c.beginPath(); c.moveTo(60, -31); c.quadraticCurveTo(72, -56, 94, -58); c.stroke();
  c.fillStyle = "#111"; c.beginPath(); c.arc(74, -72, 5, 0, Math.PI * 2); c.arc(94, -58, 5, 0, Math.PI * 2); c.fill();
  c.restore();
}
function drawBall(c, x, y, r) {
  c.save(); c.translate(x, y);
  c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fillStyle = "#fbfbf6"; c.fill();
  c.save(); c.clip();
  const pent = (cx, cy, pr, rot) => { c.beginPath(); for (let i = 0; i < 5; i++) { const a = rot + (i * 2 * Math.PI) / 5; const px = cx + pr * Math.cos(a), py = cy + pr * Math.sin(a); i ? c.lineTo(px, py) : c.moveTo(px, py); } c.closePath(); c.fill(); };
  c.fillStyle = "#151515";
  pent(0, 0, r * 0.3, -Math.PI / 2);
  c.strokeStyle = "#151515"; c.lineWidth = r * 0.035;
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    const ax = r * 0.3 * Math.cos(a), ay = r * 0.3 * Math.sin(a);
    const b = a + Math.PI / 5;
    c.beginPath(); c.moveTo(ax, ay); c.lineTo(r * 0.62 * Math.cos(a), r * 0.62 * Math.sin(a)); c.stroke();
    pent(r * 0.92 * Math.cos(b), r * 0.92 * Math.sin(b), r * 0.3, b);
    c.beginPath(); c.moveTo(r * 0.62 * Math.cos(a), r * 0.62 * Math.sin(a)); c.lineTo(r * 0.92 * Math.cos(b) - r * 0.25 * Math.cos(b - 0.5), r * 0.92 * Math.sin(b) - r * 0.25 * Math.sin(b - 0.5)); c.stroke();
    c.beginPath(); c.moveTo(r * 0.62 * Math.cos(a), r * 0.62 * Math.sin(a)); c.lineTo(r * 0.92 * Math.cos(b - 2 * Math.PI / 5) - r * 0.25 * Math.cos(b - 2 * Math.PI / 5 + 0.5), r * 0.92 * Math.sin(b - 2 * Math.PI / 5) - r * 0.25 * Math.sin(b - 2 * Math.PI / 5 + 0.5)); c.stroke();
  }
  c.restore();
  const sh = c.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
  sh.addColorStop(0, "rgba(255,255,255,0.35)"); sh.addColorStop(0.7, "rgba(0,0,0,0)"); sh.addColorStop(1, "rgba(0,0,0,0.35)");
  c.fillStyle = sh; c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill();
  c.lineWidth = r * 0.03; c.strokeStyle = "#111"; c.stroke();
  c.restore();
}
function fitText(c, text, maxW, size, weight = "400", family = DISPLAY) {
  let s = size; c.font = `${weight} ${s}px ${family}`;
  while (c.measureText(text).width > maxW && s > 10) { s -= 2; c.font = `${weight} ${s}px ${family}`; }
  return s;
}
function drawCover(c, W = 1000, palIdx = coverPal) {
  const p = PALETTES[palIdx % PALETTES.length], k = W / 1000;
  c.save(); c.scale(k, k);
  c.beginPath(); c.rect(0, 0, 1000, 1000); c.clip();
  const g = c.createRadialGradient(500, 470, 60, 500, 500, 760);
  g.addColorStop(0, p.bg1); g.addColorStop(1, p.bg2);
  c.fillStyle = g; c.fillRect(0, 0, 1000, 1000);
  // honeycomb
  const r = 46, hw = Math.sqrt(3) * r;
  for (let row = -1; row < 14; row++) for (let col = -1; col < 13; col++) {
    const x = col * hw + (row % 2 ? hw / 2 : 0), y = row * r * 1.5;
    const d = Math.hypot(x - 500, y - 480);
    hexPath(c, x, y, r - 3);
    c.lineWidth = 2.5; c.strokeStyle = `rgba(245,197,24,${Math.max(0.04, 0.32 - d / 1900)})`; c.stroke();
    if ((row * 7 + col * 3 + palIdx) % 11 === 0) { c.fillStyle = "rgba(245,197,24,0.10)"; c.fill(); }
  }
  // lightning bolts
  const bolt = (ox, oy, sc, rot) => {
    c.save(); c.translate(ox, oy); c.rotate(rot); c.scale(sc, sc);
    c.beginPath(); c.moveTo(0, -120); c.lineTo(46, -120); c.lineTo(18, -20); c.lineTo(60, -20); c.lineTo(-20, 130); c.lineTo(4, 10); c.lineTo(-36, 10); c.closePath();
    c.fillStyle = p.gold; c.shadowColor = p.gold; c.shadowBlur = 30; c.fill(); c.restore();
  };
  bolt(150, 520, 0.9, -0.25); bolt(860, 470, 0.75, 0.3);
  // halo + ball
  const hg = c.createRadialGradient(500, 520, 100, 500, 520, 360);
  hg.addColorStop(0, "rgba(245,197,24,0.45)"); hg.addColorStop(1, "rgba(245,197,24,0)");
  c.fillStyle = hg; c.beginPath(); c.arc(500, 520, 360, 0, Math.PI * 2); c.fill();
  drawBall(c, 560, 600, 165);
  // motion lines
  c.strokeStyle = "rgba(255,255,255,0.55)"; c.lineWidth = 7; c.lineCap = "round";
  [[150, 400, 300], [120, 450, 280], [170, 500, 260]].forEach(([x1, y1, len]) => { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 + len * 0.6, y1); c.stroke(); });
  drawHornet(c, 470, 430, 2.0, 0.37, false, p);
  // title block
  c.textAlign = "center"; c.textBaseline = "alphabetic";
  c.fillStyle = p.ink; fitText(c, "GREEN HORNETS", 880, 128);
  c.shadowColor = "rgba(0,0,0,0.6)"; c.shadowOffsetY = 6; c.shadowBlur = 0;
  c.fillText("GREEN HORNETS", 500, 150);
  c.font = `700 30px ${BODY}`; c.fillStyle = p.gold; c.shadowOffsetY = 3;
  c.fillText("1 2 U   ·   S O C C E R   ·   T E A M   A N T H E M", 500, 198);
  // bottom banner
  c.shadowOffsetY = 0;
  c.save(); c.translate(500, 880); c.rotate(-0.03);
  c.fillStyle = "#0a0a0a"; c.fillRect(-470, -78, 940, 132);
  c.fillStyle = p.gold; c.fillRect(-470, -78, 940, 10); c.fillRect(-470, 44, 940, 10);
  c.fillStyle = p.gold; fitText(c, "BUZZ LIKE THUNDER", 880, 104); c.fillText("BUZZ LIKE THUNDER", 0, 22);
  c.restore();
  // badge
  c.save(); c.translate(860, 300); c.rotate(0.18);
  c.beginPath(); c.arc(0, 0, 70, 0, Math.PI * 2); c.fillStyle = p.green === "#0b3d1e" ? "#1f9d4c" : p.green; c.fill();
  c.lineWidth = 6; c.strokeStyle = p.gold; c.stroke();
  c.fillStyle = "#fff"; c.font = `400 36px ${DISPLAY}`; c.fillText("128", 0, 2); c.font = `800 16px ${BODY}`; c.fillText("BPM", 0, 26);
  c.restore();
  c.font = `800 15px ${BODY}`; c.fillStyle = "rgba(255,255,255,0.75)"; c.textAlign = "left";
  c.fillText("FAMILY FRIENDLY · SIDELINE APPROVED", 34, 980);
  c.textAlign = "right"; c.fillText(`${p.name.toUpperCase()} EDITION`, 966, 980);
  c.restore();
}
function drawLogo(c, S) {
  c.clearRect(0, 0, S, S);
  hexPath(c, S / 2, S / 2, S * 0.48); c.fillStyle = "#0d4d25"; c.fill(); c.lineWidth = S * 0.05; c.strokeStyle = "#f5c518"; c.stroke();
  drawHornet(c, S * 0.56, S * 0.56, S / 320, 0.2);
}

// lyric video ---------------------------------------------------------
const HEXES = [];
(() => { const r = 38, hw = Math.sqrt(3) * r; for (let row = -1; row < 22; row++) for (let col = -1; col < 22; col++) HEXES.push([col * hw + (row % 2 ? hw / 2 : 0), row * r * 1.5]); })();
const SPARKS = Array.from({ length: 46 }, (_, i) => ({ x: (i * 397) % 1280, y: (i * 211) % 720, s: 1.5 + (i % 4), v: 0.4 + (i % 5) * 0.18, ph: i * 1.7 }));
function drawVideo(c, t) {
  const W = 1280, H = 720, sec = sectionAt(t);
  const beatPhase = (t / BEAT) % 1, pulse = Math.exp(-beatPhase * 5);
  const chorus = sec.kind === "chorus";
  const g = c.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, chorus ? "#0f6a33" : "#0a3d1f"); g.addColorStop(1, "#020a05");
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // honeycomb pulse wave
  c.lineWidth = 2;
  for (const [x, y] of HEXES) {
    if (x > W + 40 || y > H + 40) continue;
    const d = Math.hypot(x - W / 2, y - H / 2);
    const wave = 0.5 + 0.5 * Math.sin(d / 70 - t * 5);
    const a = 0.05 + (chorus ? 0.3 : 0.16) * pulse * wave;
    hexPath(c, x, y, 34); c.strokeStyle = `rgba(245,197,24,${a.toFixed(3)})`; c.stroke();
    if (wave > 0.94 && pulse > 0.5) { c.fillStyle = `rgba(245,197,24,${(0.07 * pulse).toFixed(3)})`; c.fill(); }
  }
  // sparks
  for (const s of SPARKS) {
    const y = (s.y - t * s.v * 60) % H, yy = y < 0 ? y + H : y;
    const x = s.x + Math.sin(t * 1.3 + s.ph) * 18;
    c.fillStyle = `rgba(255,214,70,${(0.25 + 0.5 * pulse * (s.s / 4)).toFixed(3)})`;
    c.beginPath(); c.arc(x, yy, s.s, 0, Math.PI * 2); c.fill();
  }
  // equalizer from stem envelopes
  const N = 40, bw = W / N;
  for (let i = 0; i < N; i++) {
    const st = STEMS[i % 5].id;
    let lv = A.rendered ? Math.min(1, rmsAt(st, t - (i % 7) * 0.01) * 4.2 * (stemGain(st) + 0.15)) : pulse * 0.5;
    lv *= 0.55 + 0.45 * Math.abs(Math.sin(i * 1.91 + t * 3.2));
    const h = 8 + lv * 150;
    const eg = c.createLinearGradient(0, H - 40 - h, 0, H - 40);
    eg.addColorStop(0, "rgba(245,197,24,0.55)"); eg.addColorStop(1, "rgba(31,157,76,0.25)");
    c.fillStyle = eg; c.fillRect(i * bw + 3, H - 40 - h, bw - 6, h);
  }
  // flying hornet
  const hx = W / 2 + 500 * Math.sin(t * 0.55), hy = 150 + 50 * Math.sin(t * 1.4);
  const dir = Math.cos(t * 0.55) < 0;
  c.save(); c.shadowColor = "rgba(0,0,0,0.5)"; c.shadowBlur = 20; drawHornet(c, hx, hy, 0.55 + 0.05 * pulse, t, dir); c.restore();
  // header
  c.textBaseline = "alphabetic"; c.textAlign = "left";
  c.fillStyle = SEC_COLORS[sec.kind]; c.font = `800 20px ${BODY}`;
  c.fillText(sec.name.toUpperCase(), 40, 50);
  c.fillStyle = "rgba(255,255,255,0.6)"; c.font = `600 16px ${BODY}`;
  const barNo = Math.floor(t / BAR) + 1; c.fillText(`bar ${barNo} / ${TOTAL_BARS}`, 40, 74);
  c.textAlign = "right"; c.fillStyle = "rgba(255,255,255,0.85)"; c.font = `400 26px ${DISPLAY}`;
  c.fillText("BUZZ LIKE THUNDER", W - 40, 50);
  c.font = `600 15px ${BODY}`; c.fillStyle = "#f5c518"; c.fillText("GREEN HORNETS 12U · OFFICIAL LYRIC VIDEO", W - 40, 74);

  const L = lineAt(t);
  if (t < 2 * BAR) {
    // title card
    const k = t / (2 * BAR), fade = Math.min(1, (2 * BAR - t) / 0.5, t / 0.3 + 0.2);
    c.save(); c.globalAlpha = Math.max(0, fade); c.translate(W / 2, 360); const sc = 0.9 + 0.1 * k; c.scale(sc, sc);
    c.textAlign = "center"; c.fillStyle = "#f5c518"; c.shadowColor = "rgba(245,197,24,0.6)"; c.shadowBlur = 30;
    c.font = `400 120px ${DISPLAY}`; c.fillText("BUZZ LIKE THUNDER", 0, 20);
    c.shadowBlur = 0; c.fillStyle = "#fff"; c.font = `700 28px ${BODY}`; c.fillText("The Green Hornets 12U", 0, 76);
    c.restore();
    if (L.next) drawUpNext(c, L.next, 520, 0.55);
  } else if (t >= DUR - BAR) {
    c.save(); c.translate(W / 2, 370); const sc = 1 + 0.06 * pulse; c.scale(sc, sc); c.textAlign = "center";
    c.fillStyle = "#f5c518"; c.shadowColor = "rgba(245,197,24,0.8)"; c.shadowBlur = 40; c.font = `400 150px ${DISPLAY}`;
    c.fillText("GO HORNETS!", 0, 30); c.shadowBlur = 0; c.fillStyle = "#fff"; c.font = `700 28px ${BODY}`;
    c.fillText("Loop it · sing it · win it", 0, 90); c.restore();
  } else if (L.line) {
    if (L.prev && t - L.line.t0 < BAR * 2) drawUpNext(c, L.prev, 268, 0.32, 34);
    drawKaraoke(c, L.line, t, 388);
    if (L.next) drawUpNext(c, L.next, 486, 0.6, 38);
  } else if (L.next) {
    drawUpNext(c, L.next, 388, 0.7, 46);
  }
  // progress bar w/ section segments
  const px = 40, pw = W - 80, py = H - 22;
  SECTIONS.forEach((s) => { c.fillStyle = SEC_COLORS[s.kind] + "55"; c.fillRect(px + (s.t0 / DUR) * pw + 1, py, ((s.t1 - s.t0) / DUR) * pw - 2, 6); });
  c.fillStyle = "#f5c518"; c.fillRect(px, py, (t / DUR) * pw, 6);
  c.beginPath(); c.arc(px + (t / DUR) * pw, py + 3, 7, 0, Math.PI * 2); c.fill();
  if (chorus && beatPhase < 0.12 && Math.floor(t / BEAT) % 4 === 0) { c.fillStyle = `rgba(255,255,255,${(0.06 * pulse).toFixed(3)})`; c.fillRect(0, 0, W, H); }
}
function drawUpNext(c, line, y, alpha, size = 38) {
  c.save(); c.globalAlpha = alpha; c.textAlign = "center"; c.fillStyle = "#e9f7ee";
  fitText(c, line.text, 1100, size); c.fillText(line.text, 640, y); c.restore();
}
function drawKaraoke(c, line, t, y) {
  const size = fitText(c, line.text, 1160, 70);
  c.font = `400 ${size}px ${DISPLAY}`;
  const space = c.measureText(" ").width;
  const widths = line.words.map((w) => c.measureText(w.w).width);
  const total = widths.reduce((a, b) => a + b, 0) + space * (widths.length - 1);
  let x = 640 - total / 2;
  c.textAlign = "left";
  line.words.forEach((w, i) => {
    const ww = widths[i];
    const p = t < w.t0 ? 0 : Math.min(1, (t - w.t0) / Math.max(0.1, (w.t1 - w.t0) * 0.7));
    const active = t >= w.t0 && t < w.t1;
    const bounce = active ? -10 * Math.exp(-(t - w.t0) * 9) : 0;
    c.fillStyle = "rgba(255,255,255,0.92)"; c.shadowColor = "rgba(0,0,0,0.55)"; c.shadowBlur = 0; c.shadowOffsetY = 4;
    c.fillText(w.w, x, y + bounce);
    if (p > 0) {
      c.save(); c.beginPath(); c.rect(x - 4, y - size * 1.2, (ww + 8) * p, size * 1.6); c.clip();
      c.fillStyle = "#f5c518"; c.shadowColor = "rgba(245,197,24,0.85)"; c.shadowBlur = 22; c.shadowOffsetY = 0;
      c.fillText(w.w, x, y + bounce); c.restore();
    }
    if (active) { c.fillStyle = "#f5c518"; c.fillRect(x, y + 18, ww * p, 5); }
    x += ww + space;
  });
  c.shadowOffsetY = 0; c.shadowBlur = 0;
}
function drawShare(c, lineText) {
  const W = 1080, H = 1350;
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#0d4d25"); g.addColorStop(1, "#020a05");
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.lineWidth = 2;
  HEXES.forEach(([x, y]) => { if (y > 900 && y < H + 40) { hexPath(c, x, y, 34); c.strokeStyle = "rgba(245,197,24,0.12)"; c.stroke(); } });
  const cs = 760, cx = (W - cs) / 2, cy = 70;
  c.save(); c.shadowColor = "rgba(0,0,0,0.6)"; c.shadowBlur = 40; c.shadowOffsetY = 20; c.fillStyle = "#000"; c.fillRect(cx, cy, cs, cs); c.restore();
  c.save(); c.translate(cx, cy); drawCover(c, cs); c.restore();
  c.textAlign = "center"; c.fillStyle = "#f5c518"; c.font = `800 26px ${BODY}`;
  c.fillText("N E W   T E A M   A N T H E M", W / 2, 900);
  c.fillStyle = "#fff"; c.font = `400 92px ${DISPLAY}`; c.fillText("BUZZ LIKE THUNDER", W / 2, 1000);
  // wrapped quote
  c.font = `italic 700 42px ${BODY}`; c.fillStyle = "#f5c518";
  const words = `“${lineText}”`.split(" "), lines = []; let cur = "";
  words.forEach((w) => { const tt = cur ? cur + " " + w : w; if (c.measureText(tt).width > 900) { lines.push(cur); cur = w; } else cur = tt; });
  lines.push(cur);
  const ql = lines.slice(0, 2), qy = ql.length === 1 ? 1090 : 1078;
  ql.forEach((l, i) => c.fillText(l, W / 2, qy + i * 54));
  const fy = qy + (ql.length - 1) * 54;
  c.fillStyle = "rgba(255,255,255,0.8)"; c.font = `600 26px ${BODY}`;
  c.fillText("The Green Hornets 12U · 128 BPM · 1:15", W / 2, fy + 82);
  c.fillStyle = "#f5c518"; c.fillRect(W / 2 - 60, fy + 112, 120, 4);
  c.font = `400 40px ${DISPLAY}`;
  c.fillText("HORNETS ON THREE — 1 · 2 · 3 — HORNETS!", W / 2, fy + 172);
}
function drawPattern(c, t) {
  const W = c.canvas.width, H = c.canvas.height;
  c.fillStyle = "#04120a"; c.fillRect(0, 0, W, H);
  const rows = [["Kick", (e) => e.type === "kick", "#f5c518"], ["Snare", (e) => e.type === "snare", "#ffe08a"], ["Clap", (e) => e.type === "clap", "#ffb84d"],
    ["Hats", (e) => e.type === "hat" || e.type === "ohat", "#8ff0b0"], ["Bass", (e) => e.type === "bass", "#1f9d4c"], ["Chords", (e) => e.type === "pad" || e.type === "pluck", "#5fd38d"],
    ["Lead", (e) => e.type === "lead", "#ffffff"], ["Buzz FX", (e) => e.stem === "fx", "#ff7a59"]];
  const bar = Math.min(TOTAL_BARS - 1, Math.floor(t / BAR)), step = Math.floor(((t % BAR) / BAR) * 16);
  const lx = 70, cw = (W - lx - 10) / 16, rh = (H - 30) / rows.length;
  const evs = EVENTS.filter((e) => Math.floor(e.beat / 4 + 1e-6) === bar);
  c.font = `700 12px ${BODY}`; c.textBaseline = "middle";
  rows.forEach(([nm, f, col], r) => {
    c.fillStyle = "#9fb8a7"; c.textAlign = "left"; c.fillText(nm, 8, 24 + r * rh + rh / 2);
    for (let s = 0; s < 16; s++) {
      const on = evs.some((e) => f(e) && Math.round((e.beat - bar * 4) * 4) === s);
      c.fillStyle = on ? col : (s % 4 === 0 ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.04)");
      if (on && s === step && A.playing) c.fillStyle = "#fff";
      c.fillRect(lx + s * cw + 2, 24 + r * rh + 2, cw - 4, rh - 4);
    }
  });
  c.fillStyle = "rgba(245,197,24,0.18)"; c.fillRect(lx + step * cw, 22, cw, H - 26);
  c.fillStyle = "#f5c518"; c.textAlign = "left"; c.fillText(`Bar ${bar + 1} · ${sectionAt(t).name} · chord ${sectionAt(t).chords[bar - sectionAt(t).startBar]}`, lx, 11);
}

// ---------------------------------------------------------------------- UI
function $(s) { return document.querySelector(s); }
function $$(s) { return Array.from(document.querySelectorAll(s)); }
const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
let curTab = "release";
function setTab(name) {
  curTab = name;
  $$(".tab").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
  $$(".panel").forEach((p) => p.classList.toggle("active", p.id === "panel-" + name));
  if (name === "share") redrawShare();
}
function download(blob, name) {
  const url = URL.createObjectURL(blob); const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
function syncButtons() {
  const sym = A.playing ? "❚❚" : "▶";
  $("#btn-play").textContent = sym; $("#btn-play-big").textContent = sym;
  $("#btn-video-play").textContent = A.playing ? "❚❚ Pause" : "▶ Play";
  $("#btn-mute").textContent = A.muted ? "🔇" : "🔊";
}
function buildTracklist() {
  const ol = $("#tracklist"); ol.innerHTML = "";
  const subs = { anthem: "full mix with guide melody", instrumental: "no lead — you sing it", chant: "drums, buzz & HEY! only" };
  Object.entries(PRESETS).forEach(([k, p], i) => {
    const li = document.createElement("li"); if (k === A.preset) li.className = "active";
    li.innerHTML = `<span class="n">${i + 1}</span><span class="t">${p.title}<br><span class="s">${subs[k]}</span></span><span class="d">${fmt(DUR)}</span>`;
    li.onclick = () => { setPreset(k); seek(0); play(); };
    ol.appendChild(li);
  });
}
function buildMixer() {
  const m = $("#mixer"); m.innerHTML = "";
  STEMS.forEach((s) => {
    const row = document.createElement("div"); row.className = "stem";
    row.innerHTML = `<div class="nm">${s.name}<small>${s.sub}</small></div><input type="range" min="0" max="120" value="${Math.round(A.vols[s.id] * 100)}" data-stem="${s.id}"><span class="v">${Math.round(A.vols[s.id] * 100)}%</span><button class="m ${A.mutes[s.id] ? "on" : ""}" data-mute="${s.id}">M</button><div class="meter"><i data-meter="${s.id}"></i></div>`;
    m.appendChild(row);
  });
  $$("#mixer input[type=range]").forEach((r) => r.oninput = () => { A.vols[r.dataset.stem] = r.value / 100; r.nextElementSibling.textContent = r.value + "%"; applyGains(); });
  $$("#mixer [data-mute]").forEach((b) => b.onclick = () => { const id = b.dataset.mute; A.mutes[id] = !A.mutes[id]; b.classList.toggle("on", A.mutes[id]); applyGains(); });
}
function buildArrangement() {
  const wrap = $("#arrangement"); wrap.innerHTML = '<div class="arr"></div>';
  const arr = wrap.firstChild;
  SECTIONS.forEach((s) => {
    const d = document.createElement("div"); d.style.flex = s.bars; d.style.background = SEC_COLORS[s.kind]; d.dataset.sec = s.id;
    d.innerHTML = `<span>${s.name}<small>${s.bars} bars</small></span>`; d.title = `Jump to ${s.name}`;
    d.onclick = () => seek(s.t0 + 0.001); arr.appendChild(d);
  });
}
function buildSheet() {
  const body = $("#sheet-body"); body.innerHTML = "";
  let chorusShown = 0;
  SECTIONS.forEach((s) => {
    const st = document.createElement("div"); st.className = "stanza" + (s.kind === "chorus" ? " chorus" : "");
    const label = s.kind === "chorus" ? (chorusShown++ ? "Chorus (again — louder!)" : "Chorus") : s.name;
    st.innerHTML = `<h4>${label}</h4>`;
    LINES.filter((l) => l.sec === s).forEach((l) => {
      const p = document.createElement("p"); p.className = "lyr"; p.dataset.line = l.index;
      p.innerHTML = `<span class="ch">${l.chords.join("  ·  ")}</span>${l.text.replace(/ (—|…)/g, "\u00a0$1")}`; st.appendChild(p);
    });
    body.appendChild(st);
  });
}
function buildShareLines() {
  const box = $("#share-lines"); box.innerHTML = "";
  const opts = [...new Set(LINES.filter((l) => l.sec.kind === "chorus" || l.sec.kind === "outro").map((l) => l.text))];
  opts.forEach((txt, i) => {
    const lab = document.createElement("label");
    lab.innerHTML = `<input type="radio" name="share-line" ${i === 0 ? "checked" : ""}> <span>${txt}</span>`;
    lab.querySelector("input").onchange = () => { shareLine = txt; redrawShare(); };
    box.appendChild(lab);
  });
}
let shareLine = "Buzz, buzz! Green Hornets rise,";
function redrawShare() { drawShare($("#share").getContext("2d"), shareLine); }
function redrawCover() { const c = $("#cover").getContext("2d"); drawCover(c, 1000, coverPal); }

let lastSec = null, lastLine = -2;
function frame() {
  const t = A.playing ? position() : A.previewT;
  if (A.playing && !A.loop && A.ctx && A.ctx.currentTime - A.startAt >= DUR) { pause(); A.offset = 0; A.previewT = 0; }
  $("#time-cur").textContent = fmt(t);
  $("#progress-fill").style.width = (t / DUR) * 100 + "%";
  const L = lineAt(t);
  const li = L.line ? L.line.index : -1;
  if (li !== lastLine) {
    lastLine = li;
    $("#now-line").textContent = L.line ? `♪ ${L.line.text}` : t < 2 * BAR ? "♪ (hornet buzz intro…)" : "♪ GO HORNETS!";
    $$(".lyr.live").forEach((e) => e.classList.remove("live"));
    if (L.line) { const el = document.querySelector(`.lyr[data-line="${li}"]`); if (el) el.classList.add("live"); }
  }
  if (curTab === "video" || REC.active) drawVideo($("#video").getContext("2d"), t);
  if (curTab === "studio") {
    const sec = sectionAt(t);
    if (sec !== lastSec) { lastSec = sec; $$(".arr div").forEach((d) => d.classList.toggle("cur", d.dataset.sec === sec.id)); }
    drawPattern($("#pattern").getContext("2d"), t);
    STEMS.forEach((s) => { const el = document.querySelector(`[data-meter="${s.id}"]`); if (el) el.style.width = (A.playing ? Math.min(100, rmsAt(s.id, t) * 400 * stemGain(s.id)) : 0) + "%"; });
  }
  if (REC.active && A.playing && A.ctx.currentTime - A.startAt >= DUR - 0.03) stopRecording();
  requestAnimationFrame(frame);
}

// recording (MediaRecorder: canvas + audio)
const REC = { active: false, rec: null, chunks: [], dest: null, prevLoop: true };
async function startRecording() {
  if (typeof MediaRecorder === "undefined") { $("#rec-status").textContent = "Recording not supported in this browser."; return; }
  await render(); ensureCtx();
  if (!REC.dest) { REC.dest = A.ctx.createMediaStreamDestination(); A.comp.connect(REC.dest); }
  const vs = $("#video").captureStream(30);
  const stream = new MediaStream([...vs.getVideoTracks(), ...REC.dest.stream.getAudioTracks()]);
  const mime = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((m) => MediaRecorder.isTypeSupported(m)) || "";
  REC.chunks = []; REC.rec = new MediaRecorder(stream, mime ? { mimeType: mime } : {});
  REC.rec.ondataavailable = (e) => e.data.size && REC.chunks.push(e.data);
  REC.rec.onstop = () => {
    const blob = new Blob(REC.chunks, { type: "video/webm" });
    $("#rec-status").textContent = `Saved ${(blob.size / 1e6).toFixed(1)} MB lyric video.`;
    download(blob, "buzz-like-thunder-lyric-video.webm");
  };
  REC.prevLoop = A.loop; pause(); A.loop = false; seek(0);
  REC.active = true; REC.rec.start(250); await play();
  $("#btn-record").textContent = "⏹ Stop recording"; $("#rec-status").textContent = "Recording full song (1:15)…";
}
function stopRecording() {
  if (!REC.active) return;
  REC.active = false; try { REC.rec.stop(); } catch (_) {}
  pause(); A.loop = REC.prevLoop; $("#chk-loop").checked = A.loop;
  $("#btn-record").textContent = "⏺ Record .webm";
}

function init() {
  drawLogo($("#logo").getContext("2d"), 88);
  drawLogo($("#sheet-logo").getContext("2d"), 120);
  redrawCover(); buildTracklist(); buildMixer(); buildArrangement(); buildSheet(); buildShareLines();
  $("#meta-dur").textContent = fmt(DUR); $("#time-dur").textContent = fmt(DUR);
  const marks = $("#progress-marks");
  SECTIONS.slice(1).forEach((s) => { const sp = document.createElement("span"); sp.style.left = (s.t0 / DUR) * 100 + "%"; sp.title = s.name; marks.appendChild(sp); });
  $$(".tab").forEach((b) => (b.onclick = () => setTab(b.dataset.tab)));
  $$("[data-goto]").forEach((b) => (b.onclick = () => setTab(b.dataset.goto)));
  $$("[data-preset]").forEach((b) => (b.onclick = () => setPreset(b.dataset.preset)));
  $("#btn-play").onclick = toggle; $("#btn-play-big").onclick = toggle; $("#btn-video-play").onclick = toggle;
  $("#btn-mute").onclick = () => setMuted(!A.muted);
  $("#btn-video-restart").onclick = () => { seek(0); play(); };
  $("#btn-video-chorus").onclick = () => { seek(SECTIONS.find((s) => s.kind === "chorus").t0); play(); };
  $("#chk-loop").onchange = (e) => setLoop(e.target.checked);
  $("#chk-chords").onchange = (e) => $("#lyric-sheet").classList.toggle("nochords", !e.target.checked);
  $("#btn-print").onclick = () => window.print();
  $("#btn-record").onclick = () => (REC.active ? stopRecording() : startRecording());
  $("#progress").onclick = (e) => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * DUR); };
  $("#video").onclick = (e) => { const r = e.currentTarget.getBoundingClientRect(); const y = (e.clientY - r.top) / r.height; if (y > 0.93) seek(((e.clientX - r.left) / r.width - 40 / 1280) / (1200 / 1280) * DUR); else toggle(); };
  $("#btn-cover-png").onclick = () => $("#cover").toBlob((b) => download(b, "green-hornets-buzz-like-thunder-cover.png"), "image/png");
  $("#btn-cover-remix").onclick = () => { coverPal = (coverPal + 1) % PALETTES.length; redrawCover(); };
  $("#btn-share-png").onclick = () => $("#share").toBlob((b) => download(b, "buzz-like-thunder-share-card.png"), "image/png");
  $("#btn-wav").onclick = async () => {
    const btn = $("#btn-wav"); btn.disabled = true; btn.textContent = "Mixing WAV…";
    const b = await wavBlob(); download(b, `buzz-like-thunder-${A.preset}.wav`);
    btn.disabled = false; btn.textContent = `⬇ Download WAV (${(b.size / 1e6).toFixed(1)} MB)`;
  };
  document.addEventListener("keydown", (e) => { if (e.code === "Space" && e.target.tagName !== "INPUT") { e.preventDefault(); toggle(); } });
  syncButtons();
  requestAnimationFrame(frame);
  setTimeout(() => render(), 250);
}

// ------------------------------------------------------------- test API
window.__HA__ = {
  SONG: { title: "Buzz Like Thunder", bpm: BPM, bars: TOTAL_BARS, duration: DUR, sampleRate: SR },
  SECTIONS: SECTIONS.map((s) => ({ id: s.id, kind: s.kind, name: s.name, bars: s.bars, t0: s.t0, t1: s.t1 })),
  LINES: LINES.map((l) => ({ text: l.text, t0: l.t0, t1: l.t1, words: l.words.length, section: l.sec.id })),
  EVENT_COUNT: EVENTS.length,
  eventsByStem: () => STEMS.reduce((o, s) => ((o[s.id] = EVENTS.filter((e) => e.stem === s.id).length), o), {}),
  render, play, pause, seek, toggle, setTab, setPreset, setMuted, setLoop, position,
  lineAt: (t) => { const L = lineAt(t); return { line: L.line ? L.line.text : null, wordIdx: L.wordIdx, word: L.line && L.wordIdx >= 0 ? L.line.words[L.wordIdx].w : null, section: sectionAt(t).id }; },
  preview: (t) => { pause(); seek(t); A.previewT = t; drawVideo($("#video").getContext("2d"), t); drawPattern($("#pattern").getContext("2d"), t); return lineAt(t).line ? lineAt(t).line.text : null; },
  getState: () => ({ tab: curTab, playing: A.playing, pos: +position().toFixed(3), preset: A.preset, muted: A.muted, rendered: A.rendered, loop: A.loop, ctxState: A.ctx ? A.ctx.state : "none" }),
  coverDataURL: () => $("#cover").toDataURL("image/png"),
  shareDataURL: () => $("#share").toDataURL("image/png"),
  remixCover: () => { coverPal = (coverPal + 1) % PALETTES.length; redrawCover(); return PALETTES[coverPal].name; },
  wavInfo: async () => { const b = await wavBlob(); const h = new Uint8Array(await b.slice(0, 44).arrayBuffer()); return { size: b.size, header: String.fromCharCode(...h.slice(0, 4)) + "/" + String.fromCharCode(...h.slice(8, 12)), sr: new DataView(h.buffer).getUint32(24, true) }; },
  canvasStats: (sel) => {
    const c = $(sel), x = c.getContext("2d"), d = x.getImageData(0, 0, c.width, c.height).data;
    let gold = 0, sum = 0, sum2 = 0, n = 0;
    for (let i = 0; i < d.length; i += 16) { const r = d[i], g = d[i + 1], b = d[i + 2]; if (r > 200 && g > 160 && b < 90) gold++; const l = (r + g + b) / 3; sum += l; sum2 += l * l; n++; }
    const mean = sum / n; return { gold, mean: +mean.toFixed(1), std: +Math.sqrt(sum2 / n - mean * mean).toFixed(1) };
  },
  sheetLines: () => $$(".lyr").length,
  liveSheetLine: () => { const e = $(".lyr.live"); return e ? e.dataset.line : null; },
  stemReport: () => (A.rendered ? stemReport() : null),
};

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
