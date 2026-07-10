/**
 * "Brasa Sem Honra" — original driving action cue for the Refúgio Nerd intro.
 * Kill-Bill-adjacent energy (relentless eighth-note bass riff, brass-like
 * stabs, dry backbeat) but 100% original composition, synthesized from
 * scratch. Sync grid: 96 BPM, beat = 0.625 s, grid origin 0.25 s, so the
 * fusion impact (2.75 s) lands on beat 4 and the ember landing (4.0 s) on
 * beat 6 — the visual hits ARE the downbeats.
 *
 * Writes public/audio/intro-battle.wav (7 s, mirrors src/intro/timings.ts).
 * Run: node scripts/generate-music.mjs
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
const rng = mulberry(19731129);

const DUR = 7;
const N = DUR * SR;
const L = new Float64Array(N);
const R = new Float64Array(N);

const BEAT = 0.625; // 96 BPM
const T0 = 0.25;
const beat = (b) => T0 + b * BEAT;

// ---------------------------------------------------------------- voices ---
/** band-limited saw-ish voice: stacked detuned harmonics, exp envelope */
const voice = (
  t0,
  dur,
  freq,
  {
    amp = 0.2,
    cutoff = 4200,
    detunes = [0],
    attack = 0.004,
    tau = 0.25,
    sustain = 0,
    release = 0.05,
    sub = 0,
    vib = 0,
    pan = 0,
  } = {},
) => {
  const start = Math.round(t0 * SR);
  const n = Math.round(dur * SR);
  const K = Math.max(1, Math.min(18, Math.floor(cutoff / freq)));
  let norm = 0;
  for (let k = 1; k <= K; k++) norm += 1 / k;
  const phases = detunes.map(() => rng() * Math.PI * 2);
  let subPh = rng() * Math.PI * 2;
  for (let i = 0; i < n && start + i < N; i++) {
    const t = i / SR;
    const env =
      Math.min(1, t / attack) *
      (Math.exp(-t / tau) * (1 - sustain) + sustain) *
      Math.min(1, Math.max(0, (dur - t) / release));
    const vibr = vib ? 1 + vib * Math.sin(2 * Math.PI * 5.2 * t) * Math.min(1, t / 0.12) : 1;
    let s = 0;
    for (let v = 0; v < detunes.length; v++) {
      phases[v] += (2 * Math.PI * freq * (1 + detunes[v]) * vibr) / SR;
      for (let k = 1; k <= K; k++) s += Math.sin(k * phases[v]) / k;
    }
    s /= norm * detunes.length;
    if (sub > 0) {
      subPh += (2 * Math.PI * freq * 0.5) / SR;
      s += Math.sin(subPh) * sub;
    }
    const out = Math.tanh(s * 1.6) * amp * env;
    L[start + i] += out * (1 - Math.max(0, pan));
    R[start + i] += out * (1 + Math.min(0, pan));
  }
};

const noiseHit = (t0, dur, {amp = 0.1, lp = 6000, hp = 2000, tau = 0.05, pan = 0} = {}) => {
  const start = Math.round(t0 * SR);
  const n = Math.round(dur * SR);
  let lpv = 0;
  let hpv = 0;
  const aLp = 1 - Math.exp((-2 * Math.PI * lp) / SR);
  const aHp = 1 - Math.exp((-2 * Math.PI * hp) / SR);
  for (let i = 0; i < n && start + i < N; i++) {
    const t = i / SR;
    const white = rng() * 2 - 1;
    lpv += aLp * (white - lpv);
    hpv += aHp * (lpv - hpv);
    const v = (lpv - hpv) * amp * Math.exp(-t / tau) * Math.min(1, i / (SR * 0.001));
    L[start + i] += v * (1 - Math.max(0, pan));
    R[start + i] += v * (1 + Math.min(0, pan));
  }
};

const sine = (t0, dur, f0, f1, amp, tau) => {
  const start = Math.round(t0 * SR);
  const n = Math.round(dur * SR);
  let ph = 0;
  for (let i = 0; i < n && start + i < N; i++) {
    const t = i / SR;
    const f = f0 * Math.pow(f1 / f0, i / n);
    ph += (2 * Math.PI * f) / SR;
    const v = Math.sin(ph) * amp * Math.exp(-t / tau) * Math.min(1, i / (SR * 0.003));
    L[start + i] += v;
    R[start + i] += v;
  }
};

// drums
const kick = (t, amp = 0.3) => {
  sine(t, 0.35, 118, 42, amp, 0.11);
  noiseHit(t, 0.02, {amp: amp * 0.5, lp: 4000, hp: 800, tau: 0.008});
};
const snare = (t, amp = 0.16) => {
  noiseHit(t, 0.22, {amp, lp: 7500, hp: 1400, tau: 0.055});
  sine(t, 0.09, 210, 150, amp * 0.7, 0.04);
};
const hat = (t, amp = 0.05, open = false) => {
  noiseHit(t, open ? 0.3 : 0.06, {amp, lp: 11000, hp: 6200, tau: open ? 0.12 : 0.018, pan: 0.35});
};
const tom = (t, f = 130, amp = 0.18) => {
  sine(t, 0.25, f, f * 0.72, amp, 0.09);
  noiseHit(t, 0.02, {amp: amp * 0.3, lp: 3000, hp: 500, tau: 0.01});
};
const crash = (t, amp = 0.11) => {
  noiseHit(t, 1.4, {amp, lp: 12000, hp: 2800, tau: 0.5, pan: -0.2});
};

// notes (Hz)
const E1 = 41.2, G1 = 49.0, A1 = 55.0;
const E2 = 82.4, G2 = 98.0, B2 = 123.5;
const E3 = 164.8, G3 = 196.0, A3 = 220.0;

const bass = (b, note = E1, len = 0.5, amp = 0.24) => {
  const t = beat(b) + (rng() - 0.5) * 0.003; // human timing
  voice(t, len * BEAT, note, {
    amp,
    cutoff: 2600,
    detunes: [0, 0.004],
    tau: 0.16,
    release: 0.03,
    sub: 0.5,
  });
  // pick transient — the "chug"
  noiseHit(t, 0.008, {amp: amp * 0.35, lp: 5200, hp: 1200, tau: 0.004});
  // gritty guitar double one octave up, palm-muted
  voice(t, len * BEAT * 0.8, note * 2, {
    amp: amp * 0.62,
    cutoff: 3800,
    detunes: [-0.007, 0.007],
    tau: 0.11,
    release: 0.025,
    pan: -0.18,
  });
};

const stab = (b, notes, amp = 0.16, tau = 0.32, dur = 1.4, cutoff = 3400) => {
  for (const f of notes) {
    voice(beat(b), dur, f, {
      amp: amp / Math.sqrt(notes.length),
      cutoff,
      detunes: [-0.006, 0, 0.006],
      attack: 0.006,
      tau,
      release: 0.2,
    });
  }
};

const lead = (b, f, lenBeats, amp = 0.11) =>
  voice(beat(b), lenBeats * BEAT, f, {
    amp,
    cutoff: 3600,
    detunes: [-0.004, 0.004],
    attack: 0.012,
    tau: 0.6,
    sustain: 0.55,
    release: 0.09,
    vib: 0.004,
    pan: 0.15,
  });

// ------------------------------------------------------------- diegetics ---
// (kept from the sound-design mix so picture sync is preserved)
const strike = (t) => {
  noiseHit(t, 0.05, {amp: 0.26, lp: 9000, hp: 2400, tau: 0.012});
  noiseHit(t + 0.02, 0.35, {amp: 0.06, lp: 5000, hp: 900, tau: 0.16});
};
const crackle = (t0, t1, rate, amp) => {
  let t = t0;
  while (t < t1) {
    t += -Math.log(1 - rng()) / rate;
    if (t >= t1) break;
    noiseHit(t, 0.004 + rng() * 0.008, {
      amp: amp * (0.4 + rng()),
      lp: 3400 + rng() * 2600,
      hp: 700,
      tau: 0.004,
      pan: (rng() - 0.5) * 0.7,
    });
  }
};
const whoosh = (t0, dur, amp) => {
  const start = Math.round(t0 * SR);
  const n = Math.round(dur * SR);
  let lpv = 0;
  for (let i = 0; i < n && start + i < N; i++) {
    const u = i / n;
    const cutoff = 500 * Math.pow(5.2, u);
    const a = 1 - Math.exp((-2 * Math.PI * cutoff) / SR);
    lpv += a * (rng() * 2 - 1 - lpv);
    const env = Math.sin(Math.PI * u) ** 1.4;
    const v = lpv * amp * env;
    L[start + i] += v * 0.9;
    R[start + i] += v;
  }
};

// ============================================================ arrangement ==
// Mix philosophy: the score LEADS; diegetic SFX sit underneath it.
// Scene 1 — void; the match strike is the pickup
strike(0.5);
crackle(0.55, 6.5, 7, 0.022);

// Bar 1 (beats 1–4): liftoff → engraving. The riff wakes up and drives.
const riffBar1 = [
  [1, E1], [1.5, E1], [2, E1], [2.5, E1], [3, G1], [3.5, A1],
];
for (const [b, n] of riffBar1) {
  const ramp = 0.18 + 0.15 * ((b - 1) / 2.5); // crescendo into the hit
  bass(b, n, 0.48, ramp);
}
for (let b = 1; b <= 3.5; b += 0.5) hat(beat(b), 0.034 + 0.014 * (b / 3.5));
// tom fill sprinting into the fusion
tom(beat(3.25), 150, 0.16);
tom(beat(3.5), 130, 0.2);
tom(beat(3.75), 110, 0.25);
// riser under the engraving whooshes (ducked under the riff)
whoosh(1.05, 0.6, 0.05); // carving the R
whoosh(1.78, 0.42, 0.055); // carving the N
noiseHit(1.1, 1.58, {amp: 0.03, lp: 3200, hp: 300, tau: 1.6});

// Beat 4 (2.75 s) — FUSION: the hit
sine(2.75, 1.0, 78, 30, 0.55, 0.3); // sub drop
kick(beat(4), 0.42);
crash(beat(4), 0.13);
stab(4, [E2, B2, E3, G3], 0.23, 0.38); // Em power stab, brass-like

// Bar 2 (beats 4–8): full groove, monogram cooling, ember signing
const riffBar2 = [
  [4.5, E1], [5, E1], [5.5, E1], [6.5, E1], [7, G1], [7.5, A1], [8, E1],
];
for (const [b, n] of riffBar2) bass(b, n, 0.48, 0.3);
kick(beat(5), 0.3);
snare(beat(5), 0.19);
kick(beat(7), 0.26);
snare(beat(7), 0.2);
// sixteenth hats with eighth-note accents — drive without harshness
for (let b = 4.25; b <= 8.75; b += 0.25) {
  const accent = (b * 4) % 2 === 0;
  hat(beat(b) + (rng() - 0.5) * 0.003, accent ? 0.05 : 0.024);
}

// Beat 6 (4.0 s) — THE LANDING: tight accent, then the horn hook signs off
kick(beat(6), 0.38);
stab(6, [G2, E3], 0.14, 0.2);
lead(6.5, E3, 0.5, 0.15);
lead(7, G3, 0.5, 0.15);
lead(7.5, A3, 1.0, 0.15);
lead(8.5, G3, 0.45, 0.12);

// Beat 9 (5.875 s) — final chord: an octave deeper, dark, ringing long
kick(beat(9), 0.36);
stab(9, [E2, G2, B2], 0.26, 1.15, 2.4, 2300); // low Em, muted top, long decay
sine(beat(9), 1.6, 55, 41.2, 0.14, 0.55); // sub root sinking to E1
hat(beat(9), 0.05, true);

// low pulse aligned with the ember's breathing resolution
sine(6.25, 0.4, 55, 41, 0.08, 0.16);

// ----------------------------------------------------------------- master --
// 1) Glue reverb: Schroeder combs + allpass on a high-passed wet bus (bass
//    stays dry and tight), 14% mix — room instead of beeps in a vacuum.
{
  const hpA = 1 - Math.exp((-2 * Math.PI * 420) / SR);
  const wet = new Float64Array(N);
  let hp = 0;
  for (let i = 0; i < N; i++) {
    const m = (L[i] + R[i]) * 0.5;
    hp += hpA * (m - hp);
    wet[i] = m - hp;
  }
  const combs = [
    [Math.round(0.0297 * SR), 0.72],
    [Math.round(0.0371 * SR), 0.68],
    [Math.round(0.0411 * SR), 0.64],
  ];
  const acc = new Float64Array(N);
  for (const [d, g] of combs) {
    const buf = new Float64Array(d);
    for (let i = 0; i < N; i++) {
      const j = i % d;
      const y = wet[i] + buf[j] * g;
      acc[i] += buf[j];
      buf[j] = y;
    }
  }
  const ap = Math.round(0.005 * SR);
  const apBuf = new Float64Array(ap);
  for (let i = 0; i < N; i++) {
    const j = i % ap;
    const x = acc[i] / 3;
    const y = -0.5 * x + apBuf[j];
    apBuf[j] = x + 0.5 * y;
    // slightly decorrelated L/R for width
    L[i] += y * 0.14;
    R[i] += y * 0.13;
  }
  // tiny Haas offset for width on the wet tail
  for (let i = N - 1; i >= 97; i--) R[i] += (acc[i - 97] / 3) * 0.035;
}

// 1b) Ending hall: a longer, darker reverb fed only by the final chord
//     (from beat 9), so the intro closes in a big black room.
{
  const t0 = Math.round(beat(9) * SR);
  const t1 = Math.round(6.7 * SR);
  const src = new Float64Array(N);
  for (let i = t0; i < Math.min(t1, N); i++) src[i] = (L[i] + R[i]) * 0.5;
  const combs = [
    [Math.round(0.0563 * SR), 0.8],
    [Math.round(0.0717 * SR), 0.77],
    [Math.round(0.0837 * SR), 0.74],
  ];
  const acc = new Float64Array(N);
  for (const [d, g] of combs) {
    const buf = new Float64Array(d);
    for (let i = t0; i < N; i++) {
      const j = i % d;
      const y = src[i] + buf[j] * g;
      acc[i] += buf[j];
      buf[j] = y;
    }
  }
  // darken the tail (one-pole LP ~2.2 kHz) and spread it slightly
  const lpA = 1 - Math.exp((-2 * Math.PI * 2200) / SR);
  let lpL = 0;
  let lpR = 0;
  const off = Math.round(0.0021 * SR);
  for (let i = t0; i < N; i++) {
    lpL += lpA * (acc[i] / 3 - lpL);
    const k = i - off;
    lpR += lpA * ((k >= 0 ? acc[k] : 0) / 3 - lpR);
    L[i] += lpL * 0.3;
    R[i] += lpR * 0.3;
  }
}

// 2) Bus compressor: envelope follower, ~3:1 above the knee — raises RMS
{
  let env = 0;
  const atk = 1 - Math.exp(-1 / (0.005 * SR));
  const rel = 1 - Math.exp(-1 / (0.13 * SR));
  for (let i = 0; i < N; i++) {
    const x = Math.max(Math.abs(L[i]), Math.abs(R[i]));
    env += (x > env ? atk : rel) * (x - env);
    const over = Math.max(0, env - 0.32);
    const g = 1 / (1 + 2.2 * over);
    L[i] *= g;
    R[i] *= g;
  }
}

// 3) Fade + mandated 4 frames of true silence (tail breathes until 6.6 s)
const FADE_START = 6.6;
const SILENCE = 164 / 24;
const fs0 = Math.round(FADE_START * SR);
const s0 = Math.round(SILENCE * SR);
for (let i = 0; i < N; i++) {
  if (i >= s0) {
    L[i] = 0;
    R[i] = 0;
  } else if (i >= fs0) {
    const g = 1 - (i - fs0) / (s0 - fs0);
    L[i] *= g * g;
    R[i] *= g * g;
  }
}

// 4) Hot but clean limiter: normalize toward -1 dBFS with soft knee
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
const gain = peak > 0 ? 0.98 / peak : 1;
for (let i = 0; i < N; i++) {
  L[i] = Math.tanh(L[i] * gain * 1.35) / Math.tanh(1.35);
  R[i] = Math.tanh(R[i] * gain * 1.35) / Math.tanh(1.35);
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
fs.writeFileSync(path.join(root, 'public/audio/intro-battle.wav'), out);
console.log('wrote public/audio/intro-battle.wav', (out.length / 1024 / 1024).toFixed(2), 'MB');
