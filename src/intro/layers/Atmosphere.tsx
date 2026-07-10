import React from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {CREAM_RGB, EMBER_RGB} from '../constants';
import {emberAt} from '../ember';
import {worldToScreen, type Layout} from '../geometry';
import type {IntroTiming} from '../timings';

const CLAMP = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

type Props = {t: IntroTiming; layout: Layout};

/**
 * Everything the ember's light touches: drifting dust motes, warm out-of-focus
 * bokeh (shallow-DOF illusion) and the radial light spill that makes the ember
 * feel like the scene's only light source.
 */
export const Atmosphere: React.FC<Props> = ({t, layout}) => {
  const frame = useCurrentFrame();
  const {width, height, su} = layout;
  const e = emberAt(frame, t);
  const es = worldToScreen(layout, e.x, e.y);

  // spill breathes with the ember's heat
  const spill = e.visible ? e.heat : 0;

  // dust motes — nearly invisible, only alive near the light
  const motes: React.ReactNode[] = [];
  for (let i = 0; i < 24; i++) {
    const seed = `dust-${i}`;
    const bx = random(`${seed}x`) * width;
    const by = random(`${seed}y`) * height;
    const drift = 14 * su;
    const x = bx + Math.sin(frame / 70 + i * 2.3) * drift + frame * 0.12 * su * (random(`${seed}w`) - 0.5);
    const y = by + Math.cos(frame / 90 + i * 1.7) * drift * 0.7 - frame * 0.05 * su;
    const dist = Math.hypot(x - es.x, y - es.y);
    const lightBoost = e.visible ? 0.16 * Math.exp(-(dist * dist) / (2 * (620 * su) ** 2)) * e.heat : 0;
    const opacity = 0.045 + lightBoost;
    const r = (1.6 + random(`${seed}r`) * 2.6) * su;
    motes.push(
      <circle
        key={i}
        cx={x}
        cy={y}
        r={r}
        fill={`rgba(${CREAM_RGB}, 1)`}
        opacity={opacity}
        style={{filter: `blur(${1.4 * su}px)`}}
      />,
    );
  }

  // warm bokeh — few, large, very soft; strongest while the ember writes
  const bokehLife = interpolate(
    frame,
    [t.riseStart, t.riseStart + 8, t.impact + 8, t.impact + 30],
    [0, 1, 1, 0],
    CLAMP,
  );
  const bokeh: React.ReactNode[] = [];
  for (let i = 0; i < 6; i++) {
    const seed = `bok-${i}`;
    const bx = (0.2 + random(`${seed}x`) * 0.6) * width;
    const by = (0.35 + random(`${seed}y`) * 0.55) * height;
    const x = bx + Math.sin(frame / 110 + i * 2.9) * 30 * su;
    const y = by + Math.cos(frame / 130 + i * 2.1) * 22 * su;
    const r = (42 + random(`${seed}r`) * 52) * su;
    bokeh.push(
      <circle
        key={i}
        cx={x}
        cy={y}
        r={r}
        fill={`rgba(${EMBER_RGB}, 1)`}
        opacity={(0.03 + random(`${seed}o`) * 0.035) * bokehLife}
        style={{filter: `blur(${30 * su}px)`}}
      />,
    );
  }

  return (
    <AbsoluteFill>
      {/* ember light spill — the room faintly remembers the fire */}
      {e.visible ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: es.x - 900 * su,
              top: es.y - 900 * su,
              width: 1800 * su,
              height: 1800 * su,
              background: `radial-gradient(circle, rgba(${EMBER_RGB}, ${0.11 * spill}) 0%, rgba(${EMBER_RGB}, ${0.045 * spill}) 34%, transparent 68%)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: es.x - 330 * su,
              top: es.y - 330 * su,
              width: 660 * su,
              height: 660 * su,
              background: `radial-gradient(circle, rgba(${EMBER_RGB}, ${0.14 * spill}) 0%, transparent 62%)`,
            }}
          />
        </>
      ) : null}
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute'}}>
        {bokeh}
        {motes}
      </svg>
    </AbsoluteFill>
  );
};
