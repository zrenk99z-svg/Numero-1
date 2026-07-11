import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  interpolate,
  random,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {COLORS, CREAM_RGB, EMBER_RGB} from '../intro/constants';
import {getLength, getPointAtLength} from '@remotion/paths';
import {BRAND_R_D, DOT_CX, DOT_CY, DOT_R, MARK_LEFT, MARK_RIGHT, NX} from '../intro/geometry';
import {GLYPH_N} from '../intro/glyphs';

const CLAMP = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

/** breathing wave shared with the intro's ember (2.6 s cycle) */
const PULSE = 62.4;
const breath = (frame: number, phase = 0) =>
  (0.5 + 0.5 * Math.cos(((frame - phase) / PULSE) * Math.PI * 2)) ** 1.4;

const GRAIN_TILE = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0.85  0 0 0 0 0.82  0 0 0 0 0.76  0 0 0 0.75 0"/></filter><rect width="420" height="420" filter="url(#n)"/></svg>`,
)}`;

export type EndCardProps = {
  title: string;
  leftLabel: string;
  rightLabel: string;
  subscribeLabel: string;
  subscribeNote: string;
};

const roundedRectPath = (x: number, y: number, w: number, h: number, r: number) =>
  [
    `M ${x + r} ${y}`,
    `L ${x + w - r} ${y}`,
    `A ${r} ${r} 0 0 1 ${x + w} ${y + r}`,
    `L ${x + w} ${y + h - r}`,
    `A ${r} ${r} 0 0 1 ${x + w - r} ${y + h}`,
    `L ${x + r} ${y + h}`,
    `A ${r} ${r} 0 0 1 ${x} ${y + h - r}`,
    `L ${x} ${y + r}`,
    `A ${r} ${r} 0 0 1 ${x + r} ${y}`,
  ].join(' ');

/**
 * REFÚGIO NERD — end card. The ember from the intro engraves the two
 * recommended-video frames and the subscribe ring (the brand period, grown),
 * then everything settles into a calm breathing loop so YouTube's overlay
 * elements can sit on top. 12 s @ 24 fps.
 */
export const EndCard: React.FC<EndCardProps> = ({
  title,
  leftLabel,
  rightLabel,
  subscribeLabel,
  subscribeNote,
}) => {
  const frame = useCurrentFrame();
  const {width: W, height: H} = useVideoConfig();
  const su = H / 2160;

  // ---- layout -------------------------------------------------------------
  const panelW = 0.29 * W;
  const panelH = (panelW * 9) / 16;
  const panelY = 0.53 * H - panelH / 2;
  const leftX = 0.27 * W - panelW / 2;
  const rightX = 0.73 * W - panelW / 2;
  const ringR = 0.068 * W;
  const ringCx = 0.5 * W;
  const ringCy = 0.53 * H;
  const cornerR = 26 * su;

  const leftPath = roundedRectPath(leftX, panelY, panelW, panelH, cornerR);
  const rightPath = roundedRectPath(rightX, panelY, panelW, panelH, cornerR);
  const leftLen = getLength(leftPath);
  const rightLen = getLength(rightPath);

  // ---- animation timings (frames) -----------------------------------------
  const fadeIn = interpolate(frame, [0, 8], [0, 1], CLAMP);
  const titleWipe = interpolate(frame, [6, 18], [0, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.cubic),
  });
  const dotPop = interpolate(frame, [16, 19, 22], [0, 1.25, 1], CLAMP);
  const leftDraw = interpolate(frame, [10, 32], [0, 1], {
    ...CLAMP,
    easing: Easing.inOut(Easing.cubic),
  });
  const rightDraw = interpolate(frame, [14, 36], [0, 1], {
    ...CLAMP,
    easing: Easing.inOut(Easing.cubic),
  });
  const ringDraw = interpolate(frame, [18, 40], [0, 1], {
    ...CLAMP,
    easing: Easing.inOut(Easing.cubic),
  });
  const labelsIn = interpolate(frame, [30, 42], [0, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.quad),
  });
  const subIn = interpolate(frame, [36, 48], [0, 1], {
    ...CLAMP,
    easing: Easing.out(Easing.quad),
  });
  const markIn = interpolate(frame, [42, 54], [0, 1], CLAMP);

  const wave = breath(frame, 19); // peaks when the title dot pops
  const flicker = 0.92 + 0.08 * (random(`fl-${Math.floor(frame)}`) - 0.5) * 2;

  // ember tips tracing the shapes
  const tips: {x: number; y: number; heat: number}[] = [];
  if (leftDraw > 0.005 && leftDraw < 0.995) {
    const p = getPointAtLength(leftPath, leftDraw * leftLen);
    tips.push({x: p.x, y: p.y, heat: 1});
  }
  if (rightDraw > 0.005 && rightDraw < 0.995) {
    const p = getPointAtLength(rightPath, rightDraw * rightLen);
    tips.push({x: p.x, y: p.y, heat: 1});
  }
  if (ringDraw > 0.005 && ringDraw < 0.995) {
    const a = -Math.PI / 2 + ringDraw * Math.PI * 2;
    tips.push({x: ringCx + Math.cos(a) * ringR, y: ringCy + Math.sin(a) * ringR, heat: 1});
  }
  // idle: a tiny spark orbits the subscribe ring, nudging the eye toward it
  if (frame > 48) {
    const a = -Math.PI / 2 + ((frame - 48) / 190) * Math.PI * 2;
    const or = ringR + 26 * su;
    tips.push({
      x: ringCx + Math.cos(a) * or,
      y: ringCy + Math.sin(a) * or,
      heat: 0.5 + 0.25 * wave,
    });
  }

  const panel = (path: string, draw: number) => (
    <>
      {/* soft ember glow behind the frame while it's being engraved */}
      <path
        d={path}
        fill="none"
        stroke={`rgba(${EMBER_RGB}, 1)`}
        strokeWidth={14 * su}
        pathLength={100}
        strokeDasharray={`${draw * 100} 140`}
        opacity={0.35 * interpolate(frame, [40, 64], [1, 0.25], CLAMP)}
        style={{filter: `blur(${16 * su}px)`}}
      />
      {/* the frame line itself */}
      <path
        d={path}
        fill={`rgba(20, 18, 16, ${0.9 * draw})`}
        stroke={`rgba(${CREAM_RGB}, 0.9)`}
        strokeWidth={4 * su}
        pathLength={100}
        strokeDasharray={`${draw * 100} 140`}
      />
    </>
  );

  const labelStyle: React.CSSProperties = {
    position: 'absolute',
    fontFamily: "'Space Mono', monospace",
    fontSize: 34 * su,
    letterSpacing: '0.38em',
    marginRight: '-0.38em',
    color: COLORS.cream,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    transform: 'translateX(-50%)',
  };

  // mini RN. mark (reuses the exact brand geometry)
  const markW = MARK_RIGHT - MARK_LEFT;
  const markH = 96 * su;
  const markScale = markH / 760;

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.black, overflow: 'hidden'}}>
      <Audio src={staticFile('audio/endcard.wav')} />

      {/* warm light pooling from the center — the room remembers the ember */}
      <AbsoluteFill
        style={{
          opacity: fadeIn,
          background: `radial-gradient(ellipse 62% 55% at 50% 52%, rgba(${EMBER_RGB}, ${
            (0.05 + 0.025 * wave) * flicker
          }) 0%, transparent 70%)`,
        }}
      />

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute'}}>
        {/* dust motes */}
        {Array.from({length: 20}, (_, i) => {
          const bx = random(`dx-${i}`) * W;
          const by = random(`dy-${i}`) * H;
          const x = bx + Math.sin(frame / 80 + i * 2.1) * 16 * su;
          const y = by + Math.cos(frame / 95 + i * 1.7) * 12 * su - frame * 0.04 * su;
          const tw = 0.6 + 0.4 * Math.sin(frame / (10 + random(`dt-${i}`) * 12) + i);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={(1.6 + random(`dr-${i}`) * 2.2) * su}
              fill={`rgba(${CREAM_RGB}, 1)`}
              opacity={0.05 * tw * fadeIn}
              style={{filter: `blur(${1.4 * su}px)`}}
            />
          );
        })}

        {panel(leftPath, leftDraw)}
        {panel(rightPath, rightDraw)}

        {/* subscribe ring — the brand period, grown into a portal */}
        <circle
          cx={ringCx}
          cy={ringCy}
          r={ringR}
          fill="none"
          stroke={`rgba(${EMBER_RGB}, 1)`}
          strokeWidth={22 * su}
          pathLength={100}
          strokeDasharray={`${ringDraw * 100} 140`}
          transform={`rotate(-90 ${ringCx} ${ringCy})`}
          opacity={0.3 + 0.22 * wave}
          style={{filter: `blur(${18 * su}px)`}}
        />
        <circle
          cx={ringCx}
          cy={ringCy}
          r={ringR}
          fill={`rgba(20, 18, 16, ${0.9 * ringDraw})`}
          stroke={COLORS.ember}
          strokeWidth={7 * su}
          pathLength={100}
          strokeDasharray={`${ringDraw * 100} 140`}
          transform={`rotate(-90 ${ringCx} ${ringCy})`}
        />

        {/* ember tips */}
        {tips.map((t, i) => (
          <g key={i}>
            <circle
              cx={t.x}
              cy={t.y}
              r={26 * su * t.heat}
              fill={`rgba(${EMBER_RGB}, 1)`}
              opacity={0.45 * t.heat}
              style={{filter: `blur(${14 * su}px)`}}
            />
            <circle cx={t.x} cy={t.y} r={7 * su * t.heat} fill={COLORS.ember} />
            <circle cx={t.x} cy={t.y} r={3 * su * t.heat} fill={COLORS.cream} opacity={0.9} />
          </g>
        ))}

        {/* RN. watermark */}
        <g
          opacity={markIn * 0.9}
          transform={`translate(${W / 2 - (markW * markScale) / 2 - MARK_LEFT * markScale} ${
            H * 0.905
          }) scale(${markScale})`}
        >
          <path d={BRAND_R_D} fill={COLORS.cream} />
          <g transform={`translate(${NX} 0)`}>
            <path d={GLYPH_N.d} fill={COLORS.cream} />
          </g>
          <circle
            cx={DOT_CX}
            cy={DOT_CY}
            r={DOT_R * (1 + 0.06 * wave)}
            fill={COLORS.ember}
          />
          <circle
            cx={DOT_CX}
            cy={DOT_CY}
            r={DOT_R * 2.1}
            fill={`rgba(${EMBER_RGB}, 1)`}
            opacity={0.18 + 0.16 * wave}
            style={{filter: 'blur(55px)'}}
          />
        </g>
      </svg>

      {/* title with the breathing ember period */}
      <div
        style={{
          position: 'absolute',
          top: H * 0.115,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'baseline',
          gap: 26 * su,
          clipPath: `inset(${(1 - titleWipe) * 104}% -5% -5% -5%)`,
          transform: `translateY(${(1 - titleWipe) * 30 * su}px)`,
        }}
      >
        <span
          style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: 128 * su,
            color: COLORS.cream,
            letterSpacing: '0.015em',
            whiteSpace: 'nowrap',
            lineHeight: 1,
          }}
        >
          {title}
        </span>
        {/* the brand period: bottom tangent on the text baseline, like the logo */}
        <span
          style={{
            width: 38 * su * dotPop * (1 + 0.05 * wave),
            height: 38 * su * dotPop * (1 + 0.05 * wave),
            borderRadius: '50%',
            background: COLORS.ember,
            boxShadow: `0 0 ${46 * su * (0.5 + 0.5 * wave)}px rgba(${EMBER_RGB}, 0.55)`,
          }}
        />
      </div>

      {/* labels */}
      <div style={{...labelStyle, left: 0.27 * W, top: panelY - 76 * su, opacity: labelsIn * 0.62}}>
        {leftLabel}
      </div>
      <div style={{...labelStyle, left: 0.73 * W, top: panelY - 76 * su, opacity: labelsIn * 0.62}}>
        {rightLabel}
      </div>
      <div
        style={{
          position: 'absolute',
          left: ringCx,
          top: ringCy + ringR + 36 * su,
          transform: 'translateX(-50%)',
          textAlign: 'center',
          opacity: subIn,
        }}
      >
        <div
          style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: 52 * su,
            color: COLORS.cream,
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}
        >
          {subscribeLabel}
        </div>
        <div
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 28 * su,
            color: COLORS.cream,
            opacity: 0.5,
            marginTop: 10 * su,
            letterSpacing: '0.22em',
            marginRight: '-0.22em',
            whiteSpace: 'nowrap',
          }}
        >
          {subscribeNote}
        </div>
      </div>

      {/* grain + vignette + fade from black */}
      <AbsoluteFill
        style={{
          backgroundImage: `url("${GRAIN_TILE}")`, // eslint-disable-line @remotion/no-background-image -- inline data URI
          backgroundSize: `${420 * su}px ${420 * su}px`,
          backgroundPosition: `${Math.floor(random(`g-${frame}`) * 420) * su}px ${
            Math.floor(random(`g2-${frame}`) * 420) * su
          }px`,
          opacity: 0.045,
          mixBlendMode: 'overlay',
        }}
      />
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 74% 64% at 50% 50%, transparent 56%, rgba(0,0,0,0.30) 100%)',
        }}
      />
      <AbsoluteFill style={{background: '#000', opacity: 1 - fadeIn}} />
    </AbsoluteFill>
  );
};
