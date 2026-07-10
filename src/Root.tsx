import './index.css';
import './fonts';
import {Composition} from 'remotion';
import {RefugioNerdIntro} from './intro/RefugioNerdIntro';
import {TIMINGS} from './intro/timings';

/**
 * REFÚGIO NERD — channel intro package.
 *
 *  RefugioNerdIntro          7 s master, 3840×2160 @ 24 fps
 *  RefugioNerdIntroShort     3 s version (Scenes 4–6 only)
 *  RefugioNerdIntroVertical  7 s, 1080×1920 (9:16 Shorts)
 *
 * Render: npx remotion render RefugioNerdIntro out/intro-4k.mp4
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="RefugioNerdIntro"
        component={RefugioNerdIntro}
        durationInFrames={TIMINGS.full.duration}
        fps={24}
        width={3840}
        height={2160}
        defaultProps={{variant: 'full' as const}}
      />
      <Composition
        id="RefugioNerdIntroNoTagline"
        component={RefugioNerdIntro}
        durationInFrames={TIMINGS.full.duration}
        fps={24}
        width={3840}
        height={2160}
        defaultProps={{variant: 'full' as const, showTagline: false}}
      />
      <Composition
        id="RefugioNerdIntroShort"
        component={RefugioNerdIntro}
        durationInFrames={TIMINGS.short.duration}
        fps={24}
        width={3840}
        height={2160}
        defaultProps={{variant: 'short' as const}}
      />
      <Composition
        id="RefugioNerdIntroVertical"
        component={RefugioNerdIntro}
        durationInFrames={TIMINGS.full.duration}
        fps={24}
        width={1080}
        height={1920}
        defaultProps={{variant: 'full' as const}}
      />
    </>
  );
};
