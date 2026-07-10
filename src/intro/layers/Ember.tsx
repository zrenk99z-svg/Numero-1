import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS, EMBER_RGB} from '../constants';
import {breathAt, emberAt} from '../ember';
import {DOT_CX, DOT_CY, DOT_R, MARK_CX, MARK_CY, type Layout} from '../geometry';
import type {IntroTiming} from '../timings';

const CLAMP = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

type Props = {t: IntroTiming; layout: Layout};

/**
 * The ember itself — a tiny living coal that flies, signs and finally rests
 * as the brand period, breathing every 2.6 s. Rendered in mark space.
 */
export const Ember: React.FC<Props> = ({t, layout}) => {
  const frame = useCurrentFrame();
  const {K, cx, cy} = layout;
  const e = emberAt(frame, t);
  if (!e.visible) return null;

  const landed = frame >= t.land;
  const breath = breathAt(frame, t);

  // flying coal size (mark units); grows into the full period on landing
  const coreR = landed
    ? interpolate(frame, [t.land, t.land + 1.5, t.land + 4], [34, 103, DOT_R], CLAMP)
    : interpolate(
        frame,
        [t.ignite, t.ignite + 6, t.descentStart, t.land - 0.5],
        [7, 14, 14, 32], // swells as it dives toward its resting place
        CLAMP,
      );

  const heat = landed ? 0.72 + 0.28 * breath : e.heat;
  const glowR = landed ? 165 + 60 * breath : coreR * (5 + 1.2 * heat);
  const glowOp = landed ? 0.26 + 0.24 * breath : 0.4 * heat;

  // one-frame radial light ripple on landing
  const rippleU = interpolate(frame, [t.land, t.land + 3], [0, 1], CLAMP);
  const showRipple = frame >= t.land && rippleU < 1;

  return (
    <g transform={`translate(${cx} ${cy}) scale(${K}) translate(${-MARK_CX} ${-MARK_CY})`}>
      {/* wide warm halo — the only light source in the void */}
      <circle
        cx={e.x}
        cy={e.y}
        r={glowR}
        fill={`rgba(${EMBER_RGB}, 1)`}
        opacity={glowOp}
        style={{filter: 'blur(70px)'}}
      />
      {/* tight glow */}
      <circle
        cx={e.x}
        cy={e.y}
        r={coreR * 1.9}
        fill={`rgba(${EMBER_RGB}, 1)`}
        opacity={0.5 * heat + (landed ? 0.15 * breath : 0)}
        style={{filter: 'blur(18px)'}}
      />
      {/* warm chromatic fringe (kept under ~1px on screen) */}
      <circle
        cx={e.x + 1.2 / K}
        cy={e.y}
        r={coreR * 1.12}
        fill={`rgba(${EMBER_RGB}, 1)`}
        opacity={0.35 * heat}
        style={{filter: 'blur(3px)'}}
      />
      {/* the coal / the period — always pure #FF7A2E */}
      <circle cx={e.x} cy={e.y} r={coreR} fill={COLORS.ember} opacity={Math.min(1, 0.55 + 0.5 * heat)} />
      {/* white-hot heart while flying (cream, per palette) */}
      {!landed ? (
        <circle
          cx={e.x}
          cy={e.y}
          r={coreR * 0.45}
          fill={COLORS.cream}
          opacity={0.85 * heat}
          style={{filter: 'blur(1.5px)'}}
        />
      ) : null}
      {showRipple ? (
        <circle
          cx={DOT_CX}
          cy={DOT_CY}
          r={DOT_R + rippleU * 210}
          fill="none"
          stroke={`rgba(${EMBER_RGB}, 1)`}
          strokeWidth={6 * (1 - rippleU) + 1}
          opacity={0.5 * (1 - rippleU)}
        />
      ) : null}
    </g>
  );
};
