import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame} from 'remotion';
import type {Layout} from './geometry';
import type {IntroTiming} from './timings';

type Props = {t: IntroTiming; layout: Layout; children: React.ReactNode};

/**
 * The camera: 4% dolly push-in during the ascent, a slow creep while the
 * ember signs, the Scene 5 pull-back, a 2% / 6-frame decaying shake at the
 * fusion impact, and a permanent sub-pixel handheld drift.
 */
export const CameraRig: React.FC<Props> = ({t, layout, children}) => {
  const frame = useCurrentFrame();
  const {height, su, portrait} = layout;

  const scale = interpolate(
    frame,
    t.camera.map((k) => k.f),
    t.camera.map((k) => k.s),
    {
      easing: Easing.inOut(Easing.cubic),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    },
  );

  // fusion shake: 2% of frame height, 6 frames, quadratic decay
  const shakeT = (frame - t.impact) / 6;
  const shakeAmp =
    shakeT >= 0 && shakeT < 1 ? 0.02 * height * (1 - shakeT) * (1 - shakeT) : 0;
  const f0 = Math.floor(frame);
  const shakeX = shakeAmp * (random(`shx-${f0}`) - 0.5) * 2;
  const shakeY = shakeAmp * (random(`shy-${f0}`) - 0.5) * 2;
  const shakeRot = shakeAmp > 0 ? 0.28 * (1 - shakeT) * (random(`shr-${f0}`) - 0.5) : 0;

  // handheld drift — never perfectly still
  const driftX = (3.4 * Math.sin(frame / 31) + 2.2 * Math.sin(frame / 12.7 + 1.7)) * su;
  const driftY = (2.8 * Math.cos(frame / 27) + 1.8 * Math.sin(frame / 15.3 + 0.6)) * su;
  const driftRot = 0.05 * Math.sin(frame / 47);

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale}) translate(${shakeX + driftX}px, ${shakeY + driftY}px) rotate(${shakeRot + driftRot}deg)`,
        transformOrigin: portrait ? '50% 42%' : '50% 44.5%',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
