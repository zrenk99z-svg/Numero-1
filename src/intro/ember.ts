import {Easing, interpolate, random} from 'remotion';
import {
  DOT_CX,
  DOT_CY,
  IGNITION,
  NX,
  SEPARATION,
  SKELETONS,
  pointOnSkeleton,
} from './geometry';
import type {IntroTiming} from './timings';

export type EmberSample = {
  x: number;
  y: number;
  /** 0..1 — drives glow intensity and light spill */
  heat: number;
  visible: boolean;
  mode: 'off' | 'ignite' | 'rise' | 'draw' | 'ride' | 'descend' | 'rest';
};

const CLAMP = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

/** Horizontal offset of a glyph group before/during the magnetic merge. */
export const groupOffsetX = (
  frame: number,
  t: IntroTiming,
  glyph: 'R' | 'N',
): number => {
  const apart = interpolate(frame, [t.attractStart, t.impact], [1, 0], {
    ...CLAMP,
    easing: Easing.in(Easing.cubic), // magnetic: slow pull, accelerating snap
  });
  return (glyph === 'R' ? -1 : 1) * (SEPARATION / 2) * apart;
};

/** Glyph-local point → mark space (adds N translation + merge offset). */
const toWorld = (
  frame: number,
  t: IntroTiming,
  glyph: 'R' | 'N',
  p: {x: number; y: number},
) => ({
  x: p.x + (glyph === 'N' ? NX : 0) + groupOffsetX(frame, t, glyph),
  y: p.y,
});

const cubic = (
  p0: {x: number; y: number},
  p1: {x: number; y: number},
  p2: {x: number; y: number},
  p3: {x: number; y: number},
  u: number,
) => {
  const v = 1 - u;
  return {
    x: v * v * v * p0.x + 3 * v * v * u * p1.x + 3 * v * u * u * p2.x + u * u * u * p3.x,
    y: v * v * v * p0.y + 3 * v * v * u * p1.y + 3 * v * u * u * p2.y + u * u * u * p3.y,
  };
};

const skelStart = (frame: number, t: IntroTiming, i: number) =>
  toWorld(frame, t, SKELETONS[i].glyph, pointOnSkeleton(i, 0));
const skelEnd = (frame: number, t: IntroTiming, i: number) =>
  toWorld(frame, t, SKELETONS[i].glyph, pointOnSkeleton(i, 1));

/** Smooth banked noise, deterministic per seed lane. */
export const noise = (frame: number, lane: string) => {
  const f0 = Math.floor(frame);
  const u = frame - f0;
  const a = random(`${lane}-${f0}`) - 0.5;
  const b = random(`${lane}-${f0 + 1}`) - 0.5;
  return a + (b - a) * u;
};

/** The ember's full journey, as a pure function of the frame. */
export const emberAt = (frame: number, t: IntroTiming): EmberSample => {
  // Scene 1 — ignition
  if (frame < t.ignite) {
    return {x: IGNITION.x, y: IGNITION.y, heat: 0, visible: false, mode: 'off'};
  }
  if (frame < t.riseStart) {
    const ramp = interpolate(frame, [t.ignite, t.ignite + 5], [0.3, 0.95], CLAMP);
    // hard 1-frame stutters, like a coal catching
    const stutter = random(`ign-${Math.floor(frame)}`) < 0.22 ? 0.45 : 1;
    return {
      x: IGNITION.x + noise(frame, 'igx') * 6,
      y: IGNITION.y + noise(frame, 'igy') * 6,
      heat: ramp * stutter,
      visible: true,
      mode: 'ignite',
    };
  }

  // Scene 2 — the ascent onto the R stem
  if (frame < t.riseEnd) {
    const u = interpolate(frame, [t.riseStart, t.riseEnd], [0, 1], {
      ...CLAMP,
      easing: Easing.inOut(Easing.cubic),
    });
    const target = skelStart(frame, t, 0);
    const p = cubic(
      IGNITION,
      {x: IGNITION.x - 30, y: IGNITION.y - 190},
      {x: target.x + 260, y: target.y + 160},
      target,
      u,
    );
    return {x: p.x, y: p.y, heat: 1, visible: true, mode: 'rise'};
  }

  // Scene 2/3 — writing the letters (with small whoosh-hops between strokes)
  const lastDrawEnd = t.draw[t.draw.length - 1][1];
  if (frame < lastDrawEnd) {
    for (let i = 0; i < t.draw.length; i++) {
      const [from, to] = t.draw[i];
      if (frame <= to) {
        if (frame >= from) {
          const u = interpolate(frame, [from, to], [0, 1], CLAMP);
          const local = pointOnSkeleton(i, u);
          const w = toWorld(frame, t, SKELETONS[i].glyph, local);
          return {x: w.x, y: w.y, heat: 1, visible: true, mode: 'draw'};
        }
        // gap before segment i: fly from the previous stroke's end
        const a = skelEnd(frame, t, i - 1);
        const b = skelStart(frame, t, i);
        const u = interpolate(frame, [t.draw[i - 1][1], from], [0, 1], {
          ...CLAMP,
          easing: Easing.inOut(Easing.quad),
        });
        const lift = Math.sin(u * Math.PI) * (i === 3 ? 120 : 46);
        return {
          x: a.x + (b.x - a.x) * u,
          y: a.y + (b.y - a.y) * u - lift,
          heat: 1,
          visible: true,
          mode: 'draw',
        };
      }
    }
  }

  // Scene 3 — riding the N's shoulder through the merge, kicked by the impact
  if (frame < t.descentStart) {
    const anchor = skelEnd(frame, t, 5);
    const kick =
      frame >= t.impact
        ? Math.max(0, 1 - (frame - t.impact) / 5) ** 2
        : 0;
    return {
      x: anchor.x + 14 + noise(frame, 'rdx') * 7 + kick * noise(frame, 'kx') * 30,
      y: anchor.y - 24 + noise(frame, 'rdy') * 7 - kick * 34,
      heat: 0.82,
      visible: true,
      mode: 'ride',
    };
  }

  // Scene 4 — the graceful arc down to the period
  if (frame < t.land) {
    const u = interpolate(frame, [t.descentStart, t.land], [0, 1], {
      ...CLAMP,
      easing: Easing.inOut(Easing.cubic),
    });
    const start = {x: NX + 726 + 14, y: 36};
    const p = cubic(
      start,
      {x: start.x + 190, y: -40},
      {x: DOT_CX + 92, y: 330},
      {x: DOT_CX, y: DOT_CY},
      u,
    );
    return {x: p.x, y: p.y, heat: 0.95, visible: true, mode: 'descend'};
  }

  // Scenes 4–6 — at rest: the ember is the brand period, breathing
  return {
    x: DOT_CX + noise(frame * 0.4, 'rsx') * 1.6,
    y: DOT_CY + noise(frame * 0.4, 'rsy') * 1.6,
    heat: 0.75,
    visible: true,
    mode: 'rest',
  };
};

/** Breathing wave, 0..1, peaking exactly at landing and every 2.6 s after. */
export const breathAt = (frame: number, t: IntroTiming) => {
  const phase = ((frame - t.land) / t.pulsePeriod) * Math.PI * 2;
  const wave = 0.5 + 0.5 * Math.cos(phase);
  return wave ** 1.4;
};
