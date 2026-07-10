# REFÚGIO NERD — Intro "A Brasa Que Não Apaga" · Production Specification

**Master:** 3840×2160 · 16:9 · 24 fps · 168 frames · 7.000 s · hard cut out
**Versions:** 3 s short (Scenes 4–6, 72 frames) · 9:16 vertical 1080×1920
**Implementation:** this repository (Remotion). `npm i && npm run dev` → composition `RefugioNerdIntro`.
**Single source of truth for timing:** `src/intro/timings.ts` (frames @ 24 fps).

Concept: from a dead-black void, one ember ignites, rises, engraves the RN
monogram like hot steel, welds the R's leg into the N at the fusion impact,
then signs the brand by landing as the glowing period after the N —
*the ember that never dies*.

---

## 1 · Frame-by-frame storyboard

TC = `s:frames`. All colors from the fixed palette — Black `#141210`,
Ember `#FF7A2E`, Cream `#E7DFCE`. The ember is the scene's only light source.

| # | TC in–out | Frames | Scene | Action | Camera | Light / FX | Audio |
|---|---|---|---|---|---|---|---|
| 01 | 0:00–0:12 | 0–12 | 1 · Void | Pure `#141210`. −8% vignette. 24 near-invisible dust motes (4.5% opacity) drifting. | Static (handheld drift ±3 px, ±0.05°, always on). | None. Darkness is rich, not gray. | Room tone / silence. |
| 02 | 0:12–0:19 | 12–19 | 1 · Ignition | Ember ignites slightly below frame center; tiny coal r≈7→14 u, hard 1-frame flicker stutters (22% chance/frame, dips to 45% heat). | Static. | Warm radial spill fades in around the coal (11% ember @ 900 px + 14% @ 330 px). Dust brightens near it. | **Match strike** at f12 (0:00.5). Crackle bed starts, runs to 6:16. |
| 03 | 0:19–0:26 | 19–26 | 2 · Liftoff | Ember rises in an S-curve (ease-in-out cubic) from ignition point to the R stem's baseline start. Trail sparks begin (2/frame, gravity-fall, 0.3–0.6 s lives). | Push-in starts f26. | Spill follows the ember. Bokeh (6 warm discs, ≤7% opacity, 30 px blur) fades in — shallow-DOF illusion. | Low drone (55 Hz det.) swells. |
| 04 | 0:26–0:31 | 26–31 | 2 · R stem | Ember climbs the stem; cream letterform revealed behind it through a 310 u round-brush mask; ember-orange glow strokes underneath; molten interior (42% ember fill, 26 u blur) — "illuminated from within". Hot tip: 130 u ember window + cream needle at the leading edge. | Push-in 1.00→1.045 (f26→f66, ease-in-out cubic). | Sparks now 3/frame; 20% are foreground (blurred 7 u, 1.8× size) for DOF. | Calligraphic **whoosh #1** (0:01.05–0:01.65). |
| 05 | 0:31–0:36.5 | 31–36.5 | 2 · R bowl | Tip sweeps the top bar, around the counter, back to the stem. | (cont.) | Glow cools per stroke: opacity 1→0.45 over 24 f after each stroke finishes. | Whoosh #1 tail. |
| 06 | 0:37.5–0:40 | 37.5–40 | 2 · R leg | Tip kicks down the leg to the baseline. R complete at f40. Glyphs sit **±110 u apart** (R left, N right). | (cont.) | — | Riser (noise sweep 320→3600 Hz) building under everything (1:00→2:18). |
| 07 | 0:40–0:42 | 40–42 | 2 · The hop | Ember flies leg-tip → N stem base; arc lift 120 u; spark scatter. | (cont.) | — | **Hop whoosh** (0:01.67). |
| 08 | 0:42–0:53 | 42–53 | 2 · N | N left stem up (42–45.5), diagonal down (46.5–49.5), right stem up (50.5–53). Ember finishes on the N's top-right shoulder. Writing accelerates (~30% faster than the R). | (cont.) | Same reveal/glow language. | **Whoosh #2** (0:01.78–0:02.2), riser cresting. |
| 09 | 0:53–0:66 | 53–66 | 3 · Attraction | The two glyphs slide together magnetically — ease-**in** cubic (slow pull, accelerating snap), R +110→0, N −110→0. Ember rides the N shoulder. | Push-in completing. | Glow still warm; letters read cream. | Riser peaks; 60 ms of near-silence right before the hit. |
| 10 | **f66** (0:02.75) | 66 | 3 · **FUSION** | R leg welds into the N stem — the ligature. Monogram snaps to final tight tracking (−150 u). | **Shake: 2% of height, 6 f, (1−t)² decay** + ±0.28° roll. | **Burst: 36 ember particles**, radial, 22–62 u/f, gravity, all dead ≤0.42 s. Fusion-point flare (150 u, 60 u blur). Lens flash 10%→0 in 4 f. Letterform flash 34%→6%. | **Sub-bass impact** (78→30 Hz) at 0:02.75. |
| 11 | 0:66–0:84 | 66–84 | 3 · Cooling | All orange dies over 12–14 f: monogram settles to solid crisp cream. Faint permanent cream aura (6%, 55 u blur). Ember pops upward off the shoulder (kick, 5 f) and hovers, flickering. | Slow creep 1.045→1.058 (f66→f108). | Bokeh fades out by f96. | Impact tail rings; crackle continues. |
| 12 | 0:84–0:96 | 84–96 | 4 · Signature | Ember departs the shoulder in a graceful arc (ease-in-out cubic, 12 f) — over the N, swooping right and down; swells r 14→32 u. | (creep cont.) | 1 trail spark/frame, softer. | **Descent whoosh** (falling, 0:03.5–0:04.0). |
| 13 | **f96** (0:04.0) | 96 | 4 · **LANDING** | Ember lands after the N, ON the baseline — becomes the brand period: r 34→103→**92 u** in 4 f (soft overshoot). This is the sacred moment. | (cont.) | **Radial ripple**: ember ring r 92→302 u, 3 f, 50%→0. 9 micro-sparks fan upward. Breathing begins — cycle exactly 2.6 s, peak at landing. | **Muted thump + brief shimmer** at 0:04.0. Pulse bed (90 BPM feel) from here. |
| 14 | 0:96–0:110 | 96–110 | 4→5 | Stillness. Monogram cream; ember breathing (halo 165+60·wave u, opacity 26+24·wave %). | Pull-back starts f108: 1.058→1.00 (f108→f146, ease-in-out cubic). | — | Warm resolution begins. |
| 15 | 0:110–0:120 | 110–120 | 5 · Title | **REFÚGIO NERD** — Archivo Black, cream, +2% tracking — reveals with a bottom-to-top wipe, 0.4 s, ease-out cubic, plus 34 px settle-up. | (pull cont.) | — | Resolution chord. |
| 16 | 0:122–0:129 | 122–129 | 5 · Tagline | **FILMES · SÉRIES · HQs** — Space Mono, +62% tracking, 72% cream (separators 55%) — fades in over 0.3 s. | (pull cont.) | — | — |
| 17 | 0:144–0:156 | 144–156 | 6 · Breath | Everything still except the ember. Exposure settles **−5% over 0.5 s**. | Pull-back done f146; only drift. | Grain (ISO-800 feel, 5%+2.5% two scales) never stops. | Music resolves to the pulse. |
| 18 | 0:158–0:168 | 158–168 | 6 · Final pulse | Ember's second breath peaks ≈ f158 and is mid-exhale at the cut. | Static + drift. | — | **f164–168: 4 frames of TRUE silence.** |
| 19 | **f168** (0:07.0) | 168 | Cut | **Hard cut** into content. No fade. | — | — | Content audio starts clean. |

---

## 2 · Layer-by-layer animation spec

Code = ground truth: `src/intro/` (`timings.ts`, `geometry.ts`, `ember.ts`, `layers/*`).
"u" = mark units (monogram cap height = 760 u; 1 u ≈ 0.90 px at 4K master).

### 2.1 Camera (`CameraRig.tsx`)
| Property | Keys (frame→value) | Easing | Notes |
|---|---|---|---|
| Dolly (scale) | 0→1.000 · 26→1.000 · 66→1.045 · 108→1.058 · 146→1.000 · 168→1.000 | ease-in-out cubic per segment | Origin 50% / 44.5% (42% vertical version). |
| Impact shake | f66–f72: amp = 2% of frame height × (1−t)², per-frame seeded noise X/Y + roll ±0.28°×(1−t) | quadratic decay | Exactly 6 frames. |
| Handheld drift | always: x = 3.4 sin(f/31)+2.2 sin(f/12.7+1.7) px · y = 2.8 cos(f/27)+1.8 sin(f/15.3+0.6) px · roll 0.05° sin(f/47) | — | Sub-pixel life; scales with resolution. |

### 2.2 Ember (`ember.ts`, `layers/Ember.tsx`)
| Phase | Frames | Motion | Easing |
|---|---|---|---|
| Ignition | 12–19 | Fixed at ignition point (700, 980 u — below frame center); jitter ±6 u; heat 0.3→0.95 with 1-frame stutters (22%/frame → 45% heat) | linear ramp |
| Rise | 19–26 | Cubic Bézier (700,980)→(670,790)→(+260,+160 rel. target)→R-stem base | ease-in-out cubic |
| Writing | 26–53 | Rides the active skeleton at draw progress; hops between strokes are position lerps with sinusoidal lift (120 u for the R→N flight, 46 u otherwise) | linear on path; ease-in-out quad hops |
| Ride | 53–84 | Anchored to N top-right shoulder (+14, −24 u), riding the merge slide; impact kick −34 u × (1−t)² over 5 f + noise | — |
| Descent | 84–96 | Bézier (1449,36)→(1639,−40)→(1789,330)→(**1697, 668**) = dot center | ease-in-out cubic |
| Rest | 96–168 | Dot position ±1.6 u slow noise | — |
| Size | — | core r: 7→14 u (ignite, 6 f) · 14 u flight · 14→32 u during descent · 34→103→92 u landing pop (f96–f100) | clamped lerps |
| Breathing | 96+ | wave = (½+½cos(2π(f−96)/62.4))^1.4 — **peaks at landing, period 2.6 s** (next peak ≈ f158) · halo r = 165+60·wave u @ blur 70 u · halo opacity 26+24·wave % · core stays solid `#FF7A2E` | cosine, shaped ^1.4 |
| Ripple | 96–99 | ring r 92→302 u, stroke 6→1 u, opacity 50→0% | linear, 3 f |
| Fringe | always | +1.2 px offset ember dup @ 35% (chromatic aberration ≤ ~1 px) | — |

### 2.3 Monogram (`layers/Monogram.tsx`, `geometry.ts`)
Exact Archivo Black outlines (extracted, `glyphs.ts`), cap height 760 u,
fused tracking −150 u (N stem overlaps the R leg's foot → the ligature reads
as one continuous stroke). **Never distorted — translation only.**

| Element | Value / animation |
|---|---|
| Skeleton draw windows | R stem 26–31 · R bowl 31–36.5 · R leg 37.5–40 · N stem L 42–45.5 · N diag 46.5–49.5 · N stem R 50.5–53 (linear within each stroke) |
| Reveal | Round-brush stroke masks (310–390 u wide) over the true glyph fills; safety seal rect fades in f53.5–55.5 |
| Under-glow | Two ember stroke layers: +120 u @ blur 85 u @ 16% · +30 u @ blur 30 u @ 30%; each stroke cools 100→45% over 24 f after it finishes; ALL orange → 0 across f66–78 |
| Molten interior | Ember copy of the glyph fill inside the mask, blur 26 u, 42%→0 over f66–80 |
| Hot tip | Leading 130 u of the active stroke: ember @ 85% width blur 14 u + cream needle @ 36% width blur 5 u; 1.5 f afterglow |
| Merge | Group offsets: R −110→0, N +110→0 u, f53→66, **ease-in cubic** (magnetic acceleration). |
| Impact flash | Letterform cream flash 0→34%→22%→6% (f66/f68/f80, blur 55 u — the 6% aura is permanent) + fusion-point ember flare 50%→0 in 8 f + full-frame lens flash 10%→0 in 4 f |
| Final state | Solid `#E7DFCE`, perfectly crisp, no stroke, no gradient. |

### 2.4 Particles (`layers/Particles.tsx`) — all deterministic (seeded)
| System | Spawn | Count | Life | Motion | Size / color |
|---|---|---|---|---|---|
| Trail | f19–53 (writing), f84–96 (descent) | 3/f writing · 2/f rise · 1/f descent | 7–14 f | inherit −16% ember velocity + random spread; gravity 0.62 u/f²; sinusoidal wind | 4.8 u (fg 8.5 u, blur 7 u = DOF); 70% ember / 30% cream; opacity (1−t)² |
| **Fusion burst** | f66, at weld point (760, 700 u) | **36** | 6–10 f (**all ≤ 0.42 s**) | radial 22–62 u/f, −50% decel, gravity 0.8, slight up-kick | 10.5 u→0; 60% ember / 40% cream |
| Landing fan | f96 | 9 | 4–7 f | upward fan 6–18 u/f + gravity | 4.5 u→0 |
| Dust | whole film | 24 | ∞ | slow sine drift ±14 px, gentle up-current | 1.6–4.2 px, cream, 4.5% + up to +16% within the ember's light |
| Bokeh | f19 → f96 (gone) | 6 | — | ±30 px slow orbit | 42–94 px discs, blur 30 px, ember tone, 3–6.5% |

### 2.5 Typography (`layers/TitleLockup.tsx`)
| Element | Spec | Animation |
|---|---|---|
| REFÚGIO NERD | Archivo Black 400 (the black weight), cream, uppercase, tracking +0.02 em, size 190 u | clip-path wipe bottom→top + 34 px rise, f110–120 (0.4 s), ease-out cubic |
| FILMES · SÉRIES · HQs | Space Mono 400, tracking +0.62 em, 72% cream, separators 55% | opacity fade f122–129 (0.3 s), ease-out quad |
| Layout | Title top = baseline + 108 u; gap 64 u; lockup optically centered with monogram at 44.5% frame height | — |

### 2.6 Lens (`layers/Framing.tsx`)
| Element | Spec |
|---|---|
| Vignette | radial ellipse 72%×62% at 50%/46%: transparent 55% → rgba(0,0,0,0.30) edges (≈ −8%) — constant |
| Grain | Two overlay layers of a 420 px turbulence tile, re-seeded position/rotation every frame: 5% fine + 2.5% coarse (ISO-800 feel) |
| Exposure settle | Black overlay 0→5%, f144–156 (0.5 s), linear |
| Impact lens flash | radial at fusion point, 10%→0, 4 f |

---

## 3 · AI-video generation prompts (model-agnostic)

Use with any text-to-video model (Veo, Sora, Runway Gen-4, Kling…).
**Same seed for all shots** (e.g. `1412 10`), append the STYLE BLOCK and the
NEGATIVE PROMPT to every scene prompt; generate at the highest fidelity, 24 fps.
The typographic lockup should still be compositited/finished in post — AI video
cannot be trusted with exact letterforms; render text from this Remotion project.

**STYLE BLOCK (append to every prompt):**
> Ultra-dark cinematic macro scene, pure near-black background hex #141210, the
> only light source is a single glowing ember of exact color #FF7A2E, warm
> highlights 2200–2600K, cool neutral shadows, rich deep blacks (never gray),
> subtle 35mm film grain ISO 800, faint chromatic aberration under half a
> pixel, shallow depth of field with warm bokeh, slow handheld micro-drift,
> 24fps, photoreal fire-physics sparks, no other colors, no text unless
> specified. Mood: a dark movie theater meets a blacksmith's forge. Seed 141210.

**NEGATIVE PROMPT (append to every prompt):**
> chrome, metallic 3D, lens flare streaks, glitch, datamosh, gradient
> background, green, purple, smoke plumes, clapperboard, film reel, popcorn,
> camera cuts, extra text, watermark, gray haze, daylight.

| Scene | Prompt |
|---|---|
| 1 (0–0.8 s) | "Absolute darkness. Nearly invisible dust motes float. At half a second, a single tiny ember ignites slightly below the center of frame — a living coal flickering like real charcoal, color #FF7A2E, casting a faint warm pool of light into the void. Static camera. 0.8 seconds." |
| 2 (0.8–2.2 s) | "The tiny ember rises in a smooth S-curve, shedding glowing sparks that fall and fade naturally, leaving a warm light trail. As it climbs it engraves wide cream-colored letterform strokes (#E7DFCE) in midair — first a bold letter R, then a bold letter N floating slightly apart — like a burning tip carving steel in darkness; strokes stay lit from within, molten orange cooling to cream behind the tip. Slow 4% camera push-in. Shallow depth of field, warm particle bokeh. 1.4 seconds." |
| 3 (2.2–3.5 s) | "The two floating cream glyphs R and N attract each other magnetically, sliding together with accelerating speed until the leg of the R welds perfectly into the stem of the N. At the exact instant of fusion: deep cinematic impact, 2% camera shake for a quarter second, a radial burst of about thirty-six ember sparks (#FF7A2E) that extinguish within 0.4 seconds, and a brief warm flash. The finished monogram becomes solid crisp cream. The small ember survives, hovering at the N's upper right shoulder. 1.3 seconds." |
| 4 (3.5–4.5 s) | "The surviving ember leaves the monogram's shoulder and descends in one graceful arc, swelling slightly, and lands after the letter N exactly on the baseline, becoming a glowing round period of color #FF7A2E. On landing: a muted thump, a single-frame radial ripple of warm light, a few micro sparks. The ember then breathes with a gentle pulse every 2.6 seconds. Camera perfectly still except micro-drift. 1 second." |
| 5 (4.5–6.0 s) | "The camera pulls back slowly (about 6%) revealing the final centered lockup on the black void: the cream RN monogram with its glowing ember period. Below it the words 'REFÚGIO NERD' appear via a bottom-to-top wipe over 0.4 seconds (heavy black grotesque capitals, cream), then 'FILMES · SÉRIES · HQs' fades in over 0.3 seconds in a wide-tracked monospace. Nothing else appears. 1.5 seconds." |
| 6 (6.0–7.0 s) | "Total stillness. Only the ember period breathes. Overall exposure settles down five percent over half a second. On the ember's next pulse peak the film hard-cuts to black. 1 second." |

---

## 4 · Soundtrack

### 4.1 Composer brief
- **Language:** dark cinematic minimalism; forge intimacy, not trailer bombast. Think a single struck anvil resonating in a black theater.
- **Tempo/grid:** 90 BPM (beat = 0.667 s) — but hit points override the grid.
- **Structure:** Rise (0:00–0:02.7) → **Impact (0:02.75)** → Resolution (0:04.0–0:07).
- **Key:** A minor, low register (A1 = 55 Hz drone root).
- **Hit points (SMPTE @ 24):** match strike 00:00:00:12 · fusion sub-hit 00:00:02:18 · landing thump 00:00:04:00 · final pulse swell ≈ 00:00:06:14 · **absolute silence 00:00:06:20 → 00:00:07:00 (4 frames)** · tail may ring past the cut in the mix bus of the episode, not in this file.
- **SFX cues:** match-strike/flint (f12) · continuous soft ember crackle (bed) · two calligraphic whooshes (R: 0:01.05, N: 0:01.78) + small hop whoosh (0:01.67) · sub-bass impact ≤ 40 Hz fundamental with a hard 60 ms pre-gap (f64.5–66) · muted felt-piano-like thump + 0.3 s shimmer at landing · room goes DEAD at f164.
- **Mix:** dialogue-ready; master **−14 LUFS integrated**, true peak ≤ −1 dBTP, zero clipping on impacts; mono-compatible lows.

### 4.2 AI-music prompt (Suno/Udio-style)
> Dark minimal cinematic logo sting, 7 seconds, 90 bpm, A minor. 0.0–2.7s: a
> low 55Hz drone with detuned beating, soft ember crackles, a rising filtered
> noise sweep and two short airy calligraphic whooshes. At exactly 2.75s: one
> deep clean sub-bass impact (78 to 30 Hz), tight, no clipping, followed by a
> warm decaying tail. At exactly 4.0s: a muted low thump with a brief golden
> shimmer. 4.0–6.6s: warm quiet resolution, soft low pulses every 0.667s,
> intimate and precise. 6.6–6.83s: fade to absolute digital silence for the
> final four frames. No melody, no strings, no braams, no risers after the
> impact. Mastered around −14 LUFS, huge headroom, cinematic, expensive.

### 4.3 Placeholder in repo
`public/audio/intro-full.wav` + `intro-short.wav` are procedurally synthesized
temp mixes (`node scripts/generate-audio.mjs`) that hit every cue above.
**Replace with the licensed final mix before publishing.**

---

## 5 · Versions

### 5.1 · 3-second short (implemented: `RefugioNerdIntroShort`)
Scenes 4–6 only, 72 frames. The monogram is already formed at frame 0; the
ember hovers on the N's shoulder for 0.25 s, then:
descent f6–26 · **landing f26 (0:01.08)** · title wipe f32–42 · tagline f44–51 ·
exposure settle f58–66 · silence f68–72 · hard cut. Camera starts at 1.055 and
pulls to 1.0 over f30–58. Same breathing (peak at landing).

### 5.2 · 9:16 vertical (implemented: `RefugioNerdIntroVertical`, 1080×1920)
Same 7 s choreography. Adaptation rules:
- Monogram scales to **68% of width** (vs 40%); lockup centers at 42% height — clears Shorts/Reels top & bottom UI zones (keep the lockup inside the central 60% of height).
- Ignition stays "slightly below center"; all mark-space choreography identical.
- Title ≈ 2 in-app text-safe margins: nothing within 220 px of top / 320 px of bottom.
- Camera origin 50%/42%; dolly percentages unchanged.
- For a vertical **3 s** cut, render `RefugioNerdIntroShort` at 1080×1920 by duplicating the composition with `variant: 'short'` (two-line change in `src/Root.tsx`).

---

## 6 · Restrictions compliance (hard checklist)
- ☑ No metallic/chrome 3D, clapperboards, reels, popcorn, green, purple, stock flares, glitch, datamosh, flat gradient backgrounds.
- ☑ Exactly 7.000 s (168 f) / 3.000 s (72 f).
- ☑ Only text: `RN`, `REFÚGIO NERD`, `FILMES · SÉRIES · HQs`.
- ☑ The ember only ever *rests* after the N, on the baseline (brand rule nº 1); every other position is transit.
- ☑ Ember color is exclusively `#FF7A2E` (glows are the same hue at reduced alpha; hot cores use palette cream).
- ☑ The monogram is never stretched, warped, skewed or bent — translation only.
- ☑ Background is solid `#141210` + vignette; light spills are light, not background gradients.

## 7 · Asset manifest
| Asset | Status |
|---|---|
| Archivo Black / Space Mono (TTF, SIL OFL) | ✔ bundled `public/fonts/` |
| RN letterforms | ✔ extracted from Archivo Black into `src/intro/glyphs.ts` (regenerate: `node scripts/extract-glyphs.mjs`). The R's counter is brand-adjusted (enlarged ×1.6 vertically, `BRAND_R_D` in `geometry.ts`) and the dot is r 84 u with a 44 u gap, matching the approved logo. If an official vector exists, drop its path `d` strings in. |
| Sound mix | ⚠ placeholder synth included — **needs licensed final mix (−14 LUFS)** |
| Everything else (particles, glow, grain, camera) | ✔ procedural, deterministic |

## 8 · Render commands
```bash
npm i
npm run dev                                             # Remotion Studio preview
npx remotion render RefugioNerdIntro out/intro-4k.mp4   # 7 s master 3840×2160
npx remotion render RefugioNerdIntroShort out/short.mp4 # 3 s version
npx remotion render RefugioNerdIntroVertical out/vertical.mp4  # 9:16
# ProRes master for the edit suite:
npx remotion render RefugioNerdIntro out/intro.mov --codec=prores --prores-profile=hq
```

## 9 · Director's notes (deliberate deviations)
1. **Fusion at 0:02.75, not 0:02.2** — the brief marks "impact at the merge (0:02.2)", which is when the *attraction* begins; the glyphs need ~0.55 s of magnetic acceleration for the hit to feel earned. The musical impact is therefore cued at 0:02.75.
2. **Ripple is 3 frames, not 1** — at 24 fps a single-frame ripple reads as a flicker artifact; 3 frames (125 ms) reads as intentional. The *flash* component is 1 frame.
3. **Ignition sits ~5% left of center** — it travels left onto the R stem; a dead-center ignition makes the rise feel like a detour. "Slightly below center" is preserved.
4. **The ember writes the letters itself** (rather than strokes appearing while it only rises) — one continuous journey: rise → R → N → ride the merge → sign the period. One protagonist, zero cuts.
