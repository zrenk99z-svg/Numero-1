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
  /** current velocity (u/frame) — young fast sparks render as motion streaks */
  vx?: number;
  vy?: number;
  age?: number;
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
        vx: dirX,
        vy: dirY + 0.62 * age,
        age,
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
      const velNow = speed * decel * (1 - 0.5 * u);
      sparks.push({
        x: FUSION.x + Math.cos(ang) * dist * 1.2,
        y: FUSION.y + Math.sin(ang) * dist - 14 * burstAge * 0.3 + 0.8 * burstAge * burstAge,
        r: 10.5 * (1 - u) * (0.6 + random(`${seed}r`) * 0.7),
        opacity: 1.15 * (1 - u) * (1 - u),
        cream: random(`${seed}c`) < 0.4,
        blur: random(`${seed}f`) < 0.25 ? 6 : 1.2,
        vx: Math.cos(ang) * velNow * 1.2,
        vy: Math.sin(ang) * velNow,
        age: burstAge,
      });
    }
  }

  // ---- Scenes 5–6: the ember that never dies sheds a tiny spark now & then
  if (frame > t.land + 16) {
    for (let k = 0; k < 4; k++) {
      const sf = t.land + 20 + k * 44 + Math.floor(random(`nd-${k}`) * 18);
      const age = frame - sf;
      const life = 24;
      if (age < 0 || age > life) continue;
      const u = age / life;
      sparks.push({
        x: DOT_CX + (random(`nd-${k}x`) - 0.5) * 30 + Math.sin(age / 5 + k) * 9,
        y: DOT_CY - 30 - age * (2.2 + random(`nd-${k}v`) * 1.6),
        r: 3.2 * (1 - u * 0.7),
        opacity: 0.5 * Math.sin(Math.PI * Math.min(1, u * 1.15)),
        cream: false,
        blur: 1.2,
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

  // ---- fusion shockwave + one-frame white-hot core flash ------------------
  const waveU = interpolate(frame, [t.impact, t.impact + 5], [0, 1], CLAMP);
  const showWave = frame >= t.impact && waveU < 1;
  const flashU = interpolate(frame, [t.impact, t.impact + 2], [0, 1], CLAMP);
  const showFlash = frame >= t.impact && flashU < 1;

  if (sparks.length === 0 && !showWave && !showFlash) return null;

  // ambient dim on everything as exposure settles
  const settle = interpolate(frame, [t.exposureStart, t.exposureEnd], [1, 0.94], CLAMP);

  return (
    <g
      transform={`translate(${cx} ${cy}) scale(${K}) translate(${-MARK_CX} ${-MARK_CY})`}
      opacity={settle}
    >
      {showWave ? (
        <circle
          cx={FUSION.x}
          cy={FUSION.y}
          r={40 + waveU * 400}
          fill="none"
          stroke={`rgba(${EMBER_RGB}, 1)`}
          strokeWidth={26 * (1 - waveU) + 2}
          opacity={0.55 * (1 - waveU) ** 1.5}
          style={{filter: 'blur(9px)'}}
        />
      ) : null}
      {showFlash ? (
        <circle
          cx={FUSION.x}
          cy={FUSION.y}
          r={60 + flashU * 130}
          fill={COLORS.cream}
          opacity={0.55 * (1 - flashU)}
          style={{filter: 'blur(22px)'}}
        />
      ) : null}
      {sparks.map((s, i) => {
        const color = s.cream ? COLORS.cream : `rgba(${EMBER_RGB}, 1)`;
        const opacity = Math.max(0, Math.min(1, s.opacity));
        const fast =
          s.vx !== undefined &&
          s.vy !== undefined &&
          (s.age ?? 99) < 3.5 &&
          Math.hypot(s.vx, s.vy) > 5;
        // young fast sparks stretch along their velocity — cheap motion blur
        return fast ? (
          <line
            key={i}
            x1={s.x}
            y1={s.y}
            x2={s.x - (s.vx as number) * 1.7}
            y2={s.y - (s.vy as number) * 1.7}
            stroke={color}
            strokeWidth={Math.max(0.8, s.r * 1.5)}
            strokeLinecap="round"
            opacity={opacity}
            style={s.blur > 2 ? {filter: `blur(${s.blur}px)`} : undefined}
          />
        ) : (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={Math.max(0.4, s.r)}
            fill={color}
            opacity={opacity}
            style={s.blur > 2 ? {filter: `blur(${s.blur}px)`} : undefined}
          />
        );
      })}
    </g>
  );
};
