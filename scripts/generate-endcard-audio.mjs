/**
 * Quiet ambient bed for the end card (12 s): ember crackle, a low warm
 * drone, and a sub pulse breathing on the same 2.6 s cycle as the visuals.
 * Deliberately low level — outro voice/music sits on top.
 * Run: node scripts/generate-endcard-audio.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 48000;
const DUR = 12;
const N = SR * DUR;
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const L = new Float64Array(N);
const R = new Float64Array(N);

const mulberry = (seed) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let z = s;
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
};
const rng = mulberry(20260710);

const noiseHit = (t0, dur, amp, lp, hp, tau, pan = 0) => {
  const start = Math.round(t0 * SR);
  const n = Math.round(dur * SR);
  let lpv = 0;
  let hpv = 0;
  const aLp = 1 - Math.exp((-2 * Math.PI * lp) / SR);
  const aHp = 1 - Math.exp((-2 * Math.PI * hp) / SR);
  for (let i = 0; i < n && start + i < N; i++) {
    const white = rng() * 2 - 1;
    lpv += aLp * (white - lpv);
    hpv += aHp * (lpv - hpv);
    const v = (lpv - hpv) * amp * Math.exp(-(i / SR) / tau);
    L[start + i] += v * (1 - Math.max(0, pan));
    R[start + i] += v * (1 + Math.min(0, pan));
  }
};

// crackle
let t = 0.2;
while (t < 11.4) {
  t += -Math.log(1 - rng()) / 5;
  if (t >= 11.4) break;
  noiseHit(t, 0.003 + rng() * 0.007, 0.03 * (0.4 + rng()), 3200 + rng() * 2400, 700, 0.004, (rng() - 0.5) * 0.7);
}

// warm drone + breathing sub pulse (peaks at 0.79s + k·2.6 — matches wave)
let p1 = 0;
let p2 = 0;
for (let i = 0; i < N; i++) {
  const tt = i / SR;
  const swell = Math.min(1, tt / 1.2) * Math.min(1, Math.max(0, (DUR - tt) / 0.8));
  p1 += (2 * Math.PI * 55) / SR;
  p2 += (2 * Math.PI * 55.4) / SR;
  const breathPhase = ((tt - 19 / 24) / 2.6) * Math.PI * 2;
  const wave = (0.5 + 0.5 * Math.cos(breathPhase)) ** 1.4;
  const v = (Math.sin(p1) + Math.sin(p2) * 0.7) * 0.028 * swell * (0.55 + 0.45 * wave);
  L[i] += v * 0.95;
  R[i] += v;
}

let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const g = peak > 0 ? 0.4 / peak : 1; // intentionally quiet bed
for (let i = 0; i < N; i++) {
  L[i] *= g;
  R[i] *= g;
}

const out = Buffer.alloc(44 + N * 4);
out.write('RIFF', 0);
out.writeUInt32LE(36 + N * 4, 4);
out.write('WAVE', 8);
out.write('fmt ', 12);
out.writeUInt32LE(16, 16);
out.writeUInt16LE(1, 20);
out.writeUInt16LE(2, 22);
out.writeUInt32LE(SR, 24);
out.writeUInt32LE(SR * 4, 28);
out.writeUInt16LE(4, 32);
out.writeUInt16LE(16, 34);
out.write('data', 36);
out.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  out.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(L[i] * 32767))), 44 + i * 4);
  out.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(R[i] * 32767))), 46 + i * 4);
}
fs.writeFileSync(path.join(root, 'public/audio/endcard.wav'), out);
console.log('wrote public/audio/endcard.wav');
