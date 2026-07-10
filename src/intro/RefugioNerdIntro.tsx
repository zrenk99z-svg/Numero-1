import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, staticFile, useVideoConfig} from 'remotion';
import {CameraRig} from './CameraRig';
import {COLORS} from './constants';
import {makeLayout} from './geometry';
import {Atmosphere} from './layers/Atmosphere';
import {Ember} from './layers/Ember';
import {Framing} from './layers/Framing';
import {Monogram} from './layers/Monogram';
import {Particles} from './layers/Particles';
import {TitleLockup} from './layers/TitleLockup';
import {TIMINGS, type Variant} from './timings';

export type RefugioNerdIntroProps = {
  variant: Variant;
  /** omit the FILMES · SÉRIES · HQs line (default: shown) */
  showTagline?: boolean;
  /** override the soundtrack (path under public/), e.g. the original score */
  audioFile?: string;
};

/**
 * REFÚGIO NERD — "A brasa que não apaga" / The ember that never dies.
 * 7 s master intro (or the 3 s short: Scenes 4–6). See docs/INTRO_SPEC.md.
 */
export const RefugioNerdIntro: React.FC<RefugioNerdIntroProps> = ({
  variant,
  showTagline = true,
  audioFile,
}) => {
  const {width, height} = useVideoConfig();
  const t = TIMINGS[variant];
  const layout = useMemo(() => makeLayout(width, height), [width, height]);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.black, overflow: 'hidden'}}>
      <Audio src={staticFile(audioFile ?? t.audioFile)} />
      <CameraRig t={t} layout={layout}>
        <Atmosphere t={t} layout={layout} />
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{position: 'absolute'}}
        >
          <Monogram t={t} layout={layout} variant={variant} />
          <Particles t={t} layout={layout} />
          <Ember t={t} layout={layout} />
        </svg>
        <TitleLockup t={t} layout={layout} showTagline={showTagline} />
      </CameraRig>
      <Framing t={t} layout={layout} />
    </AbsoluteFill>
  );
};
