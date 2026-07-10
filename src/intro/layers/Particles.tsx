import React from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import {COLORS, EMBER_RGB} from '../constants';
import {emberAt} from '../ember';
import {DOT_CX, DOT_CY, FUSION, MARK_CX, MARK_CY, type Layout} from '../geometry';
import type {IntroTiming} from '../timings';

type Props = {t: IntroTiming; layout: Layout};

type Spark = {
  x: number;
  y: number;
  r: number;
  opacity: number;
  cream: boolean;
  blur: number;
};

const CLAMP = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

/**
 * All spark systems, fully deterministic (remotion random(seed)):
 *  – trail sparks shed by the ember while it rises and writes,
 *  – the radial fusion burst (36 particles, dead within 0.4 s),
 *  – a handful of micro-sparks when the ember lands as the period.
 * Rendered in mark space so sizes/positions scale with the monogram.
 */
export const Particles: React.FC<Props> = ({t, layout}) => {
  const frame = useCurrentFrame();
  const {K, cx, cy} = layout;
  const sparks: Spark[] = [];

  // ---- trail sparks -------------------------------------------------------
  const lastDrawEnd = t.draw[t.draw.length - 1][1];
  const trailFrom = Math.max(t.riseStart, Math.ceil(frame) - 16);
  for (let sf = trailFrom; sf <= frame; sf++) {
    const inWriting = sf >= t.riseStart && sf <= lastDrawEnd;
    const inDescent = sf >= t.descentStart && sf <= t.land;
    if (!inWriting && !inDescent) continue;
    const count = inDescent ? 1 : sf < t.riseEnd ? 2 : 3;
    const origin = emberAt(sf, t);
    const originPrev = emberAt(sf - 1, t);
    const vx = (origin.x - originPrev.x) * 0.16;
    const vy = (origin.y - originPrev.y) * 0.16;
    for (let i = 0; i < count; i++) {
      const seed = `tr-${sf}-${i}`;
      const life = 7 + random(`${seed}l`) * 7;
      const age = frame - sf;
      if (age < 0 || age > life) continue;
      const u = age / life;
      const dirX = (random(`${seed}x`) - 0.5) * 5.2 - vx;
      const dirY = (random(`${seed}y`) - 0.5) * 4 - vy - 1.2;
      const gravity = 0.62 * age * age * 0.5;
      const foreground = random(`${seed}f`) < 0.2;
      sparks.push({
        x: origin.x + dirX * age + Math.sin((frame + sf) / 7 + i) * 2,
        y: origin.y + dirY * age + gravity,
        r: (foreground ? 8.5 : 4.8) * (1 - u * 0.85) * (0.7 + random(`${seed}r`) * 0.6),
        opacity: 0.9 * (1 - u) * (1 - u),
        cream: random(`${seed}c`) < 0.3,
        blur: foreground ? 7 : 1.2,
      });
    }
  }

  // ---- fusion burst: 36 radial particles, extinguished in 0.4 s ----------
  const BURST_N = 36;
  const burstAge = frame - t.impact;
  if (burstAge >= 0 && burstAge <= 10) {
    for (let i = 0; i < BURST_N; i++) {
      const seed = `bu-${i}`;
      const life = 6 + random(`${seed}l`) * 4; // ≤ 10 frames = 0.42 s
      if (burstAge > life) continue;
      const u = burstAge / life;
      const ang = random(`${seed}a`) * Math.PI * 2;
      const speed = 22 + random(`${seed}s`) * 40;
      const decel = 1 - 0.5 * u;
      const dist = speed * burstAge * decel;
      sparks.push({
        x: FUSION.x + Math.cos(ang) * dist * 1.2,
        y: FUSION.y + Math.sin(ang) * dist - 14 * burstAge * 0.3 + 0.8 * burstAge * burstAge,
        r: 10.5 * (1 - u) * (0.6 + random(`${seed}r`) * 0.7),
        opacity: 1.15 * (1 - u) * (1 - u),
        cream: random(`${seed}c`) < 0.4,
        blur: random(`${seed}f`) < 0.25 ? 6 : 1.2,
      });
    }
  }

  // ---- landing micro-sparks ----------------------------------------------
  const landAge = frame - t.land;
  if (landAge >= 0 && landAge <= 7) {
    for (let i = 0; i < 9; i++) {
      const seed = `ld-${i}`;
      const life = 4 + random(`${seed}l`) * 3;
      if (landAge > life) continue;
      const u = landAge / life;
      const ang = Math.PI + random(`${seed}a`) * Math.PI; // upward fan
      const speed = 6 + random(`${seed}s`) * 12;
      sparks.push({
        x: DOT_CX + Math.cos(ang) * speed * landAge,
        y: DOT_CY + Math.sin(ang) * speed * landAge + 0.9 * landAge * landAge,
        r: 4.5 * (1 - u),
        opacity: 0.8 * (1 - u),
        cream: random(`${seed}c`) < 0.3,
        blur: 1.2,
      });
    }
  }

  if (sparks.length === 0) return null;

  // ambient dim on everything as exposure settles
  const settle = interpolate(frame, [t.exposureStart, t.exposureEnd], [1, 0.94], CLAMP);

  return (
    <g
      transform={`translate(${cx} ${cy}) scale(${K}) translate(${-MARK_CX} ${-MARK_CY})`}
      opacity={settle}
    >
      {sparks.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={Math.max(0.4, s.r)}
          fill={s.cream ? COLORS.cream : `rgba(${EMBER_RGB}, 1)`}
          opacity={Math.max(0, Math.min(1, s.opacity))}
          style={s.blur > 2 ? {filter: `blur(${s.blur}px)`} : undefined}
        />
      ))}
    </g>
  );
};
