/**
 * Procedural placeholder mix for the Refúgio Nerd intro (temp track).
 * Mirrors the frame timings in src/intro/timings.ts (24 fps):
 *   full : strike 0.5s · whooshes 1.05/1.75s · fusion impact 2.75s ·
 *          landing thump 4.0s · pulse bed · silence from 6.833s (f164)
 *   short: descent whoosh 0.4s · thump 1.083s · silence from 2.833s (f68)
 *
 * Replace with the licensed final mix (target −14 LUFS) for production.
 * Run: node scripts/generate-audio.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const SR = 48000;
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

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

const makeBuf = (seconds) => ({
  L: new Float64Array(Math.round(seconds * SR)),
  R: new Float64Array(Math.round(seconds * SR)),
  len: Math.round(seconds * SR),
});

const addSine = (buf, t0, dur, f0, f1, amp, decayTau, pan = 0) => {
  const start = Math.max(0, Math.round(t0 * SR));
  const n = Math.round(dur * SR);
  let phase = 0;
  for (let i = 0; i < n && start + i < buf.len; i++) {
    const u = i / n;
    const t = i / SR;
    const freq = f0 * Math.pow(f1 / f0, u);
    phase += (2 * Math.PI * freq) / SR;
    const env = Math.exp(-t / decayTau) * Math.min(1, i / (SR * 0.004));
    const v = Math.sin(phase) * amp * env;
    buf.L[start + i] += v * (1 - Math.max(0, pan));
    buf.R[start + i] += v * (1 + Math.min(0, pan));
  }
};

// filtered-noise event: one-pole LP whose cutoff sweeps c0→c1
const addNoise = (buf, rng, t0, dur, c0, c1, amp, attack, release, pan = 0) => {
  const start = Math.max(0, Math.round(t0 * SR));
  const n = Math.round(dur * SR);
  let lp = 0;
  let hp = 0;
  for (let i = 0; i < n && start + i < buf.len; i++) {
    const u = i / n;
    const cutoff = c0 * Math.pow(c1 / c0, u);
    const alpha = 1 - Math.exp((-2 * Math.PI * cutoff) / SR);
    const white = rng() * 2 - 1;
    lp += alpha * (white - lp);
    // gentle high-pass to remove rumble
    hp += 0.002 * (lp - hp);
    const attEnv = Math.min(1, (i / SR) / Math.max(attack, 1e-4));
    const relEnv = Math.min(1, ((n - i) / SR) / Math.max(release, 1e-4));
    const v = (lp - hp) * amp * attEnv * relEnv;
    buf.L[start + i] += v * (1 - Math.max(0, pan));
    buf.R[start + i] += v * (1 + Math.min(0, pan));
  }
};

const addCrackle = (buf, rng, t0, t1, rate, amp) => {
  let t = t0;
  while (t < t1) {
    t += -Math.log(1 - rng()) / rate; // poisson gaps
    if (t >= t1) break;
    const dur = 0.002 + rng() * 0.008;
    addNoise(buf, rng, t, dur, 900 + rng() * 2600, 500, amp * (0.4 + rng()), 0.0005, 0.002, (rng() - 0.5) * 0.7);
  }
};

const strike = (buf, rng, t) => {
  addNoise(buf, rng, t, 0.05, 4000, 2500, 0.5, 0.001, 0.01);
  addNoise(buf, rng, t + 0.02, 0.4, 2600, 700, 0.16, 0.005, 0.3);
};

const whoosh = (buf, rng, t0, dur, amp, upward = true) => {
  addNoise(buf, rng, t0, dur, upward ? 500 : 2400, upward ? 2600 : 600, amp, dur * 0.55, dur * 0.35);
};

const fusionImpact = (buf, rng, t) => {
  addSine(buf, t, 1.1, 78, 30, 0.6, 0.32);
  addNoise(buf, rng, t, 0.1, 700, 250, 0.28, 0.001, 0.07);
  addNoise(buf, rng, t + 0.03, 0.85, 2400, 300, 0.09, 0.01, 0.7);
  addSine(buf, t, 0.06, 190, 70, 0.2, 0.03);
};

const landingThump = (buf, rng, t) => {
  addSine(buf, t, 0.5, 95, 44, 0.34, 0.09);
  addNoise(buf, rng, t, 0.06, 500, 200, 0.12, 0.001, 0.04);
  // brief warm shimmer — detuned pairs beating softly
  for (const f of [2350, 3140, 3920]) {
    addSine(buf, t + 0.02, 0.5, f, f, 0.012, 0.16, 0.3);
    addSine(buf, t + 0.02, 0.5, f + 4, f + 4, 0.012, 0.16, -0.3);
  }
};

const drone = (buf, t0, t1, amp) => {
  const start = Math.round(t0 * SR);
  const end = Math.min(buf.len, Math.round(t1 * SR));
  let p1 = 0;
  let p2 = 0;
  let p3 = 0;
  for (let i = start; i < end; i++) {
    const t = (i - start) / SR;
    const total = (end - start) / SR;
    const u = t / total;
    const swell = Math.sin(Math.PI * Math.min(1, u * 1.15)) ** 1.3;
    p1 += (2 * Math.PI * 55) / SR;
    p2 += (2 * Math.PI * 55.35) / SR;
    p3 += (2 * Math.PI * 110.2) / SR;
    const v = (Math.sin(p1) + Math.sin(p2) * 0.8 + Math.sin(p3) * 0.25) * amp * swell;
    buf.L[i] += v * 0.95;
    buf.R[i] += v;
  }
};

const pulseBed = (buf, rng, times, amp) => {
  for (const [t, a] of times) {
    addSine(buf, t, 0.4, 62, 40, amp * a, 0.14);
  }
  void rng;
};

const finalize = (buf, silenceFrom, fadeStart) => {
  const fs0 = Math.round(fadeStart * SR);
  const s0 = Math.round(silenceFrom * SR);
  for (let i = 0; i < buf.len; i++) {
    if (i >= s0) {
      buf.L[i] = 0;
      buf.R[i] = 0;
    } else if (i >= fs0) {
      const g = 1 - (i - fs0) / (s0 - fs0);
      buf.L[i] *= g;
      buf.R[i] *= g;
    }
  }
  let peak = 0;
  for (let i = 0; i < buf.len; i++) {
    peak = Math.max(peak, Math.abs(buf.L[i]), Math.abs(buf.R[i]));
  }
  const gain = peak > 0 ? 0.71 / peak : 1; // ≈ −3 dBFS true peak headroom
  for (let i = 0; i < buf.len; i++) {
    buf.L[i] *= gain;
    buf.R[i] *= gain;
  }
};

const writeWav = (buf, file) => {
  const n = buf.len;
  const data = Buffer.alloc(44 + n * 4);
  data.write('RIFF', 0);
  data.writeUInt32LE(36 + n * 4, 4);
  data.write('WAVE', 8);
  data.write('fmt ', 12);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(2, 22);
  data.writeUInt32LE(SR, 24);
  data.writeUInt32LE(SR * 4, 28);
  data.writeUInt16LE(4, 32);
  data.writeUInt16LE(16, 34);
  data.write('data', 36);
  data.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(buf.L[i] * 32767))), 44 + i * 4);
    data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(buf.R[i] * 32767))), 46 + i * 4);
  }
  fs.writeFileSync(path.join(root, file), data);
  console.log('wrote', file, (data.length / 1024 / 1024).toFixed(2), 'MB');
};

// ---------------------------------------------------------------- full (7 s)
{
  const rng = mulberry(20260710);
  const buf = makeBuf(7);
  strike(buf, rng, 0.5);
  addCrackle(buf, rng, 0.55, 4.0, 9, 0.055);
  addCrackle(buf, rng, 4.0, 6.6, 5, 0.038);
  drone(buf, 0.5, 3.4, 0.13);
  // riser into the fusion — cut dead 60 ms before the hit
  addNoise(buf, rng, 1.0, 1.69, 320, 3600, 0.13, 1.5, 0.05);
  whoosh(buf, rng, 1.05, 0.6, 0.1); // carving the R
  whoosh(buf, rng, 1.67, 0.16, 0.07); // the hop
  whoosh(buf, rng, 1.78, 0.44, 0.11); // carving the N
  fusionImpact(buf, rng, 2.75);
  whoosh(buf, rng, 3.5, 0.5, 0.055, false); // the graceful descent
  landingThump(buf, rng, 4.0);
  pulseBed(buf, rng, [[4.667, 1], [5.333, 0.7], [6.0, 0.45]], 0.1);
  drone(buf, 4.1, 6.5, 0.05);
  finalize(buf, 164 / 24, 6.55); // 4 frames of true silence before the cut
  writeWav(buf, 'public/audio/intro-full.wav');
}

// --------------------------------------------------------------- short (3 s)
{
  const rng = mulberry(19990417);
  const buf = makeBuf(3);
  addCrackle(buf, rng, 0.0, 2.6, 6, 0.045);
  whoosh(buf, rng, 0.38, 0.6, 0.075, false);
  landingThump(buf, rng, 26 / 24);
  pulseBed(buf, rng, [[1.75, 1], [2.417, 0.55]], 0.09);
  drone(buf, 1.2, 2.6, 0.045);
  finalize(buf, 68 / 24, 2.6);
  writeWav(buf, 'public/audio/intro-short.wav');
}
