# Refúgio Nerd — Intro "A Brasa Que Não Apaga"

The channel's opening animation, built entirely in [Remotion](https://remotion.dev).
From a dead-black void, a single ember ignites, engraves the RN monogram like
hot steel, and signs the brand as the glowing period after the N — *the ember
that never dies*.

**Full production spec** (storyboard, layer-by-layer animation tables, AI-video
prompts, soundtrack brief, version notes): [`docs/INTRO_SPEC.md`](docs/INTRO_SPEC.md).

## Compositions

| ID | Format | Duration |
|---|---|---|
| `RefugioNerdIntro` | 3840×2160 · 24 fps | 7 s (168 f) — master |
| `RefugioNerdIntroNoTagline` | 3840×2160 · 24 fps | 7 s — master without the FILMES · SÉRIES · HQs line |
| `RefugioNerdIntroShort` | 3840×2160 · 24 fps | 3 s (72 f) — Scenes 4–6 |
| `RefugioNerdIntroVertical` | 1080×1920 · 24 fps | 7 s — Shorts/Reels |

## Commands

```console
npm i               # install
npm run dev         # Remotion Studio preview
npx remotion render RefugioNerdIntro out/intro-4k.mp4
npx remotion render RefugioNerdIntroShort out/intro-short.mp4
npx remotion render RefugioNerdIntroVertical out/intro-vertical.mp4
```

In sandboxed/CI environments without network access to Remotion's headless
Chrome download, point at a system Chromium:
`REMOTION_BROWSER_EXECUTABLE=/path/to/chromium npx remotion render …`

## Project layout

```
src/intro/
  timings.ts        every animated event, in frames (single source of truth)
  geometry.ts       monogram layout, stroke skeletons, responsive mapping
  glyphs.ts         exact Archivo Black R/N outlines (generated)
  ember.ts          the ember's full journey + breathing
  CameraRig.tsx     dolly, impact shake, handheld drift
  layers/           Monogram · Ember · Particles · Atmosphere · TitleLockup · Framing
scripts/
  extract-glyphs.mjs   regenerate glyphs.ts from the bundled font
  generate-audio.mjs   regenerate the placeholder sound mix
public/fonts/          Archivo Black + Space Mono (SIL OFL)
public/audio/          placeholder mixes — replace with the licensed final mix
```

## Brand guardrails (baked in)

Palette is fixed (`#141210` / `#FF7A2E` / `#E7DFCE`); the ember is the only
light source; the ember only ever rests after the N, on the baseline; the
monogram is never distorted; total length never exceeds 7 seconds.
