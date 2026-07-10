/**
 * Single source of truth for every animated event, in frames @ 24 fps.
 *
 * The 'short' variant (3 s, Scenes 4–6 only) reuses the exact same component:
 * pre-merge events sit at negative frames, so every clamped interpolation
 * resolves to its completed state on frame 0.
 */
export type Variant = 'full' | 'short';

export type CameraKey = {f: number; s: number};

export type IntroTiming = {
  duration: number;
  /** ember ignites (Scene 1) */
  ignite: number;
  /** ember lifts off and rises to the R stem (Scene 2) */
  riseStart: number;
  riseEnd: number;
  /** draw window [from, to] per skeleton (same order as SKELETONS) */
  draw: [number, number][];
  /** magnetic attraction of the two glyphs (Scene 3) */
  attractStart: number;
  /** fusion impact: shake, burst, monogram solidifies */
  impact: number;
  /** ember departs the N shoulder (Scene 4) */
  descentStart: number;
  /** ember lands as the brand period */
  land: number;
  /** camera dolly keyframes (scale factor) */
  camera: CameraKey[];
  /** REFÚGIO NERD wipe (Scene 5) */
  titleIn: number;
  titleInEnd: number;
  /** FILMES · SÉRIES · HQs fade */
  tagIn: number;
  tagInEnd: number;
  /** exposure settles −5% (Scene 6) */
  exposureStart: number;
  exposureEnd: number;
  /** ember breathing cycle: 2.6 s */
  pulsePeriod: number;
  audioFile: string;
};

export const TIMINGS: Record<Variant, IntroTiming> = {
  full: {
    duration: 168,
    ignite: 12, // 0:00.5
    riseStart: 19,
    riseEnd: 26,
    draw: [
      [26, 31], // R stem
      [31, 36.5], // R bowl
      [37.5, 40], // R leg
      [42, 45.5], // N left stem
      [46.5, 49.5], // N diagonal
      [50.5, 53], // N right stem
    ],
    attractStart: 53, // 2:2.2
    impact: 66, // 0:02.75 — fusion
    descentStart: 84, // 0:03.5
    land: 96, // 0:04.0
    camera: [
      {f: 0, s: 1},
      {f: 26, s: 1},
      {f: 66, s: 1.045}, // 4% push-in through the ascent
      {f: 108, s: 1.058}, // slow creep while the ember signs
      {f: 146, s: 1}, // pull-back reveal
      {f: 168, s: 1},
    ],
    titleIn: 110,
    titleInEnd: 120, // 0.4 s wipe
    tagIn: 122,
    tagInEnd: 129, // 0.3 s fade
    exposureStart: 144,
    exposureEnd: 156,
    pulsePeriod: 62.4,
    audioFile: 'audio/intro-full.wav',
  },
  short: {
    duration: 72,
    ignite: -999,
    riseStart: -60,
    riseEnd: -55,
    draw: [
      [-54, -53],
      [-53, -52],
      [-52, -51],
      [-50, -49],
      [-49, -48],
      [-48, -47],
    ],
    attractStart: -40,
    impact: -30,
    descentStart: 6, // brief hover, then the swoop
    land: 26, // ~1.08 s
    camera: [
      {f: 0, s: 1.055},
      {f: 30, s: 1.055},
      {f: 58, s: 1},
      {f: 72, s: 1},
    ],
    titleIn: 32,
    titleInEnd: 42,
    tagIn: 44,
    tagInEnd: 51,
    exposureStart: 58,
    exposureEnd: 66,
    pulsePeriod: 62.4,
    audioFile: 'audio/intro-short.wav',
  },
};
