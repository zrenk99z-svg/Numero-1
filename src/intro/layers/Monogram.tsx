import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {COLORS, EMBER_RGB} from '../constants';
import {groupOffsetX} from '../ember';
import {MARK_CX, MARK_CY, NX, SKELETONS, type Layout} from '../geometry';
import {GLYPH_N, GLYPH_R} from '../glyphs';
import type {IntroTiming} from '../timings';

const CLAMP = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

type Props = {t: IntroTiming; layout: Layout; variant: string};

/**
 * The RN monogram: exact Archivo Black outlines revealed through animated
 * stroke masks, as if a burning ember were engraving them into the dark.
 * Ember-orange glow strokes ride the same skeletons and cool to cream.
 */
export const Monogram: React.FC<Props> = ({t, layout, variant}) => {
  const frame = useCurrentFrame();
  const {K, cx, cy} = layout;

  const lastDrawEnd = t.draw[t.draw.length - 1][1];
  // safety seal: guarantees the mask fully covers the glyphs once drawn
  const seal = interpolate(frame, [lastDrawEnd + 0.5, lastDrawEnd + 2.5], [0, 1], CLAMP);

  // molten interior cooling: fully cream shortly after the fusion impact
  const innerHeat =
    interpolate(frame, [t.impact, t.impact + 14], [0.42, 0], CLAMP) *
    interpolate(frame, [t.draw[0][0], t.draw[0][0] + 2], [0, 1], CLAMP);

  // orange glow around the strokes: alive while writing, dies after impact
  const glowLife = interpolate(
    frame,
    [t.draw[0][0], t.draw[0][0] + 3, t.impact, t.impact + 12],
    [0, 1, 1, 0],
    CLAMP,
  );

  // impact flash on the letterforms + the permanent faint cream aura
  const aura = interpolate(
    frame,
    [t.impact - 0.01, t.impact, t.impact + 2, t.impact + 14],
    [0, 0.34, 0.22, 0.06],
    CLAMP,
  );

  const drawn = t.draw.map(([from, to], i) => {
    const p = interpolate(frame, [from, to], [0, 1], CLAMP);
    return p * SKELETONS[i].len;
  });

  const glyphTransform = (glyph: 'R' | 'N') =>
    `translate(${(glyph === 'N' ? NX : 0) + groupOffsetX(frame, t, glyph)} 0)`;

  // NOTE: zero-length dashes still paint their round caps as dots, so any
  // stroke with nothing drawn yet must not be rendered at all.
  const renderMaskStrokes = (glyph: 'R' | 'N') =>
    SKELETONS.map((s, i) =>
      s.glyph === glyph && drawn[i] > 1 ? (
        <path
          key={i}
          d={s.d}
          fill="none"
          stroke="white"
          strokeWidth={s.w}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${drawn[i]} ${s.len + 400}`}
        />
      ) : null,
    );

  // each stroke's glow cools individually once the ember has moved on
  const segmentCool = (i: number) =>
    interpolate(frame, [t.draw[i][1], t.draw[i][1] + 24], [1, 0.45], CLAMP);

  const renderGlowStrokes = (glyph: 'R' | 'N', width: number, extra: number) =>
    SKELETONS.map((s, i) =>
      s.glyph === glyph && drawn[i] > 1 ? (
        <path
          key={i}
          d={s.d}
          fill="none"
          stroke={COLORS.ember}
          strokeWidth={s.w * width + extra}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${drawn[i]} ${s.len + 400}`}
          opacity={segmentCool(i)}
        />
      ) : null,
    );

  // the hot tip: a short ember-bright window at the leading edge of the
  // stroke currently being written
  const TIP = 130;
  const renderTip = (glyph: 'R' | 'N') =>
    SKELETONS.map((s, i) => {
      if (s.glyph !== glyph) return null;
      const [from, to] = t.draw[i];
      if (frame < from || frame > to + 1.5) return null;
      const tipLen = Math.min(TIP, drawn[i]);
      if (tipLen < 1) return null;
      const fade = interpolate(frame, [to, to + 1.5], [1, 0.4], CLAMP);
      return (
        <g key={`tip-${i}`}>
          <path
            d={s.d}
            fill="none"
            stroke={COLORS.ember}
            strokeWidth={s.w * 0.85}
            strokeLinecap="round"
            strokeDasharray={`${tipLen} ${s.len + 400}`}
            strokeDashoffset={-(drawn[i] - tipLen)}
            opacity={0.95 * fade}
            style={{filter: `blur(${14}px)`}}
          />
          <path
            d={s.d}
            fill="none"
            stroke={COLORS.cream}
            strokeWidth={s.w * 0.36}
            strokeLinecap="round"
            strokeDasharray={`${tipLen * 0.6} ${s.len + 400}`}
            strokeDashoffset={-(drawn[i] - tipLen * 0.6)}
            opacity={0.9 * fade}
            style={{filter: `blur(${5}px)`}}
          />
        </g>
      );
    });

  const glyphGroup = (glyph: 'R' | 'N') => {
    const maskId = `rn-mask-${glyph}-${variant}`;
    const d = glyph === 'R' ? GLYPH_R.d : GLYPH_N.d;
    return (
      <g transform={glyphTransform(glyph)}>
        <defs>
          <mask
            id={maskId}
            maskUnits="userSpaceOnUse"
            x={-400}
            y={-400}
            width={1800}
            height={1700}
          >
            {renderMaskStrokes(glyph)}
            <rect x={-400} y={-400} width={1800} height={1700} fill="white" opacity={seal} />
          </mask>
        </defs>

        {/* wide ambient ember glow around the strokes being written */}
        <g opacity={0.16 * glowLife} style={{filter: 'blur(85px)'}}>
          {renderGlowStrokes(glyph, 1, 120)}
        </g>
        <g opacity={0.3 * glowLife} style={{filter: 'blur(30px)'}}>
          {renderGlowStrokes(glyph, 1, 30)}
        </g>

        {/* the letterform itself, revealed along the engraving */}
        <g mask={`url(#${maskId})`}>
          <path d={d} fill={COLORS.cream} />
          {/* molten interior while hot */}
          <path
            d={d}
            fill={COLORS.ember}
            opacity={innerHeat}
            style={{filter: 'blur(26px)'}}
          />
        </g>

        {/* impact flash / persistent whisper of light around the glyph */}
        <path d={d} fill={COLORS.cream} opacity={aura} style={{filter: 'blur(55px)'}} />

        {renderTip(glyph)}
      </g>
    );
  };

  return (
    <g transform={`translate(${cx} ${cy}) scale(${K}) translate(${-MARK_CX} ${-MARK_CY})`}>
      {glyphGroup('R')}
      {glyphGroup('N')}
      {/* fusion hotspot: a brief ember flare exactly where leg meets stem */}
      <circle
        cx={760}
        cy={690}
        r={150}
        fill={`rgba(${EMBER_RGB}, 1)`}
        opacity={interpolate(
          frame,
          [t.impact - 0.01, t.impact, t.impact + 1.5, t.impact + 8],
          [0, 0.5, 0.32, 0],
          CLAMP,
        )}
        style={{filter: 'blur(60px)'}}
      />
    </g>
  );
};
