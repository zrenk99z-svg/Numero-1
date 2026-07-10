import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {COLORS} from '../constants';
import {MARK_CY, worldToScreen, type Layout} from '../geometry';
import type {IntroTiming} from '../timings';

const CLAMP = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

type Props = {t: IntroTiming; layout: Layout};

/**
 * Scene 5 — REFÚGIO NERD (Archivo Black, bottom-to-top wipe) and
 * FILMES · SÉRIES · HQs (Space Mono, wide tracking, fade-in).
 */
export const TitleLockup: React.FC<Props> = ({t, layout}) => {
  const frame = useCurrentFrame();
  const {K} = layout;

  const wipe = interpolate(frame, [t.titleIn, t.titleInEnd], [0, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });
  const tagFade = interpolate(frame, [t.tagIn, t.tagInEnd], [0, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.quad),
  });

  if (wipe <= 0 && tagFade <= 0) return null;

  // anchor under the monogram's baseline (mark y = 760)
  const baseline = worldToScreen(layout, MARK_CY, 760).y;
  const titleSize = 190 * K;
  const tagSize = 52 * K;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: baseline + 108 * K,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 64 * K,
      }}
    >
      <div
        style={{
          fontFamily: "'Archivo Black', sans-serif",
          fontWeight: 400,
          fontSize: titleSize,
          lineHeight: 1.04,
          color: COLORS.cream,
          letterSpacing: '0.02em',
          marginRight: '-0.02em',
          clipPath: `inset(${(1 - wipe) * 104}% -10% -10% -10%)`,
          transform: `translateY(${(1 - wipe) * 34 * K}px)`,
          whiteSpace: 'nowrap',
        }}
      >
        REFÚGIO NERD
      </div>
      <div
        style={{
          fontFamily: "'Space Mono', monospace",
          fontWeight: 400,
          fontSize: tagSize,
          color: COLORS.cream,
          opacity: tagFade * 0.72,
          letterSpacing: '0.62em',
          marginRight: '-0.62em',
          whiteSpace: 'nowrap',
        }}
      >
        FILMES <span style={{opacity: 0.55}}>·</span> SÉRIES{' '}
        <span style={{opacity: 0.55}}>·</span> HQs
      </div>
    </div>
  );
};
