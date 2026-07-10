import {getLength, getPointAtLength} from '@remotion/paths';
import {GLYPH_N, GLYPH_R} from './glyphs';

/**
 * Mark space: the fused "RN." monogram laid out in glyph design units.
 * Cap height = 760, baseline at y = 760. R sits at x = 0; N is translated
 * right by NX. Negative tracking fuses the R leg into the N left stem
 * ("a fusão R+N garante a leitura" — brand rule nº 3).
 */
export const TRACKING = -150;
export const NX = GLYPH_R.advance + TRACKING;

/**
 * Brand-adjusted R: the official monogram's counter (the hole in the R) is
 * noticeably larger and rounder than stock Archivo Black. The outer contour
 * is untouched; only the counter subpath is replaced (scaled ×1.6 vertically
 * about its center, cap radius follows) to match the approved logo.
 */
const R_OUTER = GLYPH_R.d.slice(0, GLYPH_R.d.indexOf('ZM') + 1);
const BRAND_R_COUNTER =
  'M595.61 287.12Q595.61 239.41 563.81 207.59Q532.00 175.81 486.05 175.81' +
  'L325.87 175.81L325.87 400.21L486.05 400.21' +
  'Q532.00 400.21 563.81 367.51Q595.61 334.81 595.61 287.12Z';
export const BRAND_R_D = `${R_OUTER}${BRAND_R_COUNTER}`;

export const DOT_R = 84;
export const DOT_GAP = 44;
export const DOT_CX = NX + GLYPH_N.bbox.x2 + DOT_GAP + DOT_R;
export const DOT_CY = 760 - DOT_R; // ember rests ON the baseline

export const MARK_LEFT = GLYPH_R.bbox.x1;
export const MARK_RIGHT = DOT_CX + DOT_R;
export const MARK_W = MARK_RIGHT - MARK_LEFT;
export const MARK_CX = (MARK_LEFT + MARK_RIGHT) / 2;
export const MARK_CY = 380;

/** Horizontal distance between the two glyph groups before the merge. */
export const SEPARATION = 220;

/** Fusion point: where the R leg welds into the N left stem (world units). */
export const FUSION = {x: 760, y: 700};

/** Where the ember first ignites (mark units, below frame center). */
export const IGNITION = {x: 700, y: 980};

/**
 * Stroke skeletons: hand-drawn center-lines matching Archivo Black's R and N.
 * They drive (a) the reveal mask that "engraves" the real glyph outlines,
 * (b) the ember-orange glow strokes and (c) the ember's flight path.
 * Coordinates are glyph-local (R local / N local). Draw order = array order.
 */
export type Skeleton = {
  d: string;
  w: number;
  len: number;
  glyph: 'R' | 'N';
};

const sk = (d: string, w: number, glyph: 'R' | 'N'): Skeleton => ({
  d,
  w,
  len: getLength(d),
  glyph,
});

export const SKELETONS: Skeleton[] = [
  // R stem, drawn upward (the ember keeps rising straight into the letter)
  sk('M 196 760 L 196 60', 310, 'R'),
  // R bowl: across the top, around the counter, back into the stem
  sk(
    'M 196 87 L 470 87 C 650 87 716 150 716 243 C 716 336 650 398 470 398 L 300 398',
    280,
    'R',
  ),
  // R leg, kicked down to the baseline
  sk('M 530 450 L 688 760', 300, 'R'),
  // N left stem, upward
  sk('M 194 760 L 194 60', 310, 'N'),
  // N diagonal, downward
  sk('M 300 120 L 620 640', 390, 'N'),
  // N right stem, upward — the ember finishes at the N's top-right shoulder
  sk('M 726 760 L 726 60', 310, 'N'),
];

export const pointOnSkeleton = (index: number, progress: number) => {
  const s = SKELETONS[index];
  return getPointAtLength(s.d, Math.max(0, Math.min(1, progress)) * s.len);
};

/** Responsive layout: how mark space maps onto the output frame. */
export type Layout = {
  width: number;
  height: number;
  portrait: boolean;
  /** mark units → screen px */
  K: number;
  /** screen position of the mark center */
  cx: number;
  cy: number;
  /** generic screen-space unit (1 at 4K landscape) for atmosphere FX */
  su: number;
};

export const makeLayout = (width: number, height: number): Layout => {
  const portrait = height > width;
  const widthFrac = portrait ? 0.68 : 0.4;
  const K = (width * widthFrac) / MARK_W;
  return {
    width,
    height,
    portrait,
    K,
    cx: width / 2,
    cy: height * (portrait ? 0.42 : 0.445),
    su: portrait ? width / 1080 : height / 2160,
  };
};

export const worldToScreen = (l: Layout, x: number, y: number) => ({
  x: l.cx + (x - MARK_CX) * l.K,
  y: l.cy + (y - MARK_CY) * l.K,
});
