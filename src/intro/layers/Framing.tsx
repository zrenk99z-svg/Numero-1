import React, {useMemo} from 'react';
import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {EMBER_RGB} from '../constants';
import {worldToScreen, type Layout} from '../geometry';
import {FUSION} from '../geometry';
import type {IntroTiming} from '../timings';

const CLAMP = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;

type Props = {t: IntroTiming; layout: Layout};

// Static film-grain tile (SVG turbulence), transformed every frame.
const GRAIN_TILE = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="420"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 0.85  0 0 0 0 0.82  0 0 0 0 0.76  0 0 0 0.75 0"/></filter><rect width="420" height="420" filter="url(#n)"/></svg>`,
)}`;

/**
 * Lens-level framing: −8% vignette, ISO-800-ish living grain, the fusion
 * flash, and the Scene 6 exposure settle (−5% over 0.5 s).
 * Sits OUTSIDE the camera rig — these belong to the lens, not the world.
 */
export const Framing: React.FC<Props> = ({t, layout}) => {
  const frame = useCurrentFrame();
  const {su} = layout;

  const exposure = interpolate(frame, [t.exposureStart, t.exposureEnd], [0, 0.05], CLAMP);

  const flash = interpolate(
    frame,
    [t.impact - 0.01, t.impact, t.impact + 1, t.impact + 4],
    [0, 0.1, 0.06, 0],
    CLAMP,
  );
  const fusionScreen = useMemo(
    () => worldToScreen(layout, FUSION.x, FUSION.y),
    [layout],
  );

  const gx = Math.floor(random(`gx-${frame}`) * 420);
  const gy = Math.floor(random(`gy-${frame}`) * 420);
  const gr = Math.floor(random(`gr-${frame}`) * 4) * 90;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* fusion flash — light kissing the lens for two frames */}
      {flash > 0 ? (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at ${fusionScreen.x}px ${fusionScreen.y}px, rgba(${EMBER_RGB}, ${flash}) 0%, transparent 55%)`,
          }}
        />
      ) : null}

      {/* film grain, two scales, re-seeded every frame */}
      {/* eslint-disable @remotion/no-background-image -- inline data URI, no network fetch */}
      <AbsoluteFill
        style={{
          backgroundImage: `url("${GRAIN_TILE}")`,
          backgroundSize: `${420 * su}px ${420 * su}px`,
          backgroundPosition: `${gx * su}px ${gy * su}px`,
          transform: `rotate(${gr}deg) scale(1.5)`,
          opacity: 0.05,
          mixBlendMode: 'overlay',
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `url("${GRAIN_TILE}")`,
          backgroundSize: `${840 * su}px ${840 * su}px`,
          backgroundPosition: `${gy * su}px ${gx * su}px`,
          opacity: 0.025,
          mixBlendMode: 'overlay',
        }}
      />
      {/* eslint-enable @remotion/no-background-image */}

      {/* −8% vignette — rich, never gray */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 72% 62% at 50% 46%, transparent 55%, rgba(0,0,0,0.30) 100%)',
        }}
      />

      {/* Scene 6 exposure settle */}
      <AbsoluteFill style={{background: '#000', opacity: exposure}} />
    </AbsoluteFill>
  );
};
