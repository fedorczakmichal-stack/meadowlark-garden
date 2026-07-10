// Combined fable animals (no modules) — generated for standalone export
(function(){
// frig.js — helpers for the fable-style Motion Atlas animals
const TAU = Math.PI * 2;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const mix = (a, b, t) => a + (b - a) * t;
const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const wrap = ph => ((ph % 1) + 1) % 1;
const win = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
const wins = (t, a, b) => smooth(win(t, a, b));
// 0 → 1 → 0 bump inside [a,b]
const pulse = (t, a, b) => { const p = win(t, a, b); return p <= 0 || p >= 1 ? 0 : Math.sin(p * Math.PI); };
const osc = (ph, k = 1, off = 0) => Math.sin(TAU * (ph * k + off));
// When the meadow director moves an animal along a rove lane, damp in-gait vertical bob —
// the lane handles travel; the gait should sell the stride, not add a second bounce.
const laneDy = v => window.__FABLE_ROAM ? v * 0.55 : v;
const lanePitch = v => window.__FABLE_ROAM ? v * 0.7 : v;
const N = v => Math.round(v * 100) / 100;
const rot = (a, cx = 0, cy = 0) => `rotate(${N(a)} ${N(cx)} ${N(cy)})`;
const trl = (x, y) => `translate(${N(x)} ${N(y)})`;
const scl = (sx, sy, cx = 0, cy = 0) => `translate(${N(cx)} ${N(cy)}) scale(${N(sx)} ${N(sy)}) translate(${N(-cx)} ${N(-cy)})`;
const g = (tf, inner) => `<g transform="${tf}">${inner}</g>`;
const go = (op, inner) => `<g opacity="${N(op)}">${inner}</g>`;

// Keyframe interpolation. frames = [[t, {channels}], ...] sorted by t.
function keys(t, frames, ease = smooth) {
  if (t <= frames[0][0]) return { ...frames[0][1] };
  for (let i = 0; i < frames.length - 1; i++) {
    const [ta, A] = frames[i], [tb, B] = frames[i + 1];
    if (t <= tb) {
      const p = ease(win(t, ta, tb)), o = {};
      for (const k in A) { const a = A[k], b = (k in B) ? B[k] : a; o[k] = typeof a === 'number' ? a + (b - a) * p : a; }
      return o;
    }
  }
  return { ...frames[frames.length - 1][1] };
}

// Soft contact shadow. h = height above ground (art units), squish shrinks + fades it.
function shadow(x, gy, rx, h = 0, maxH = 22) {
  const k = clamp(1 - h / maxH, 0.3, 1);
  return `<ellipse cx="${N(x)}" cy="${N(gy + 0.6)}" rx="${N(rx * (0.62 + 0.38 * k))}" ry="${N(rx * 0.16 * (0.6 + 0.4 * k))}" fill="rgba(80,58,30,${N(0.15 * k)})"/>`;
}

// Scrolling pebbles + grass tufts to sell in-place travel. o={y,x1,x2,v,n,s(scale)}
function groundTicks(ph, o) {
  if (window.__FABLE_NO_TICKS) return '';
  const span = o.x2 - o.x1, n = o.n ?? 7, s = o.s ?? 1;
  let out = `<g fill="none" stroke-linecap="round">`;
  for (let i = 0; i < n; i++) {
    let x = ((i + 0.35) / n) * span - wrap(ph) * (o.v % span);
    x = ((x % span) + span) % span;
    const fade = Math.min(1, 4 * Math.min(x / span, 1 - x / span) + 0.05);
    const X = o.x1 + x, y = o.y;
    if (i % 3 === 2) {
      out += `<circle cx="${N(X)}" cy="${N(y - 0.5 * s)}" r="${N(0.62 * s)}" fill="#C9B88F" stroke="none" opacity="${N(0.75 * fade)}"/>`;
    } else {
      out += `<path d="M${N(X - s)} ${N(y)} L${N(X - 0.5 * s)} ${N(y - 2.4 * s)} M${N(X)} ${N(y)} L${N(X + 0.28 * s)} ${N(y - 3.2 * s)} M${N(X + s)} ${N(y)} L${N(X + 1.4 * s)} ${N(y - 2.1 * s)}" stroke="#A9A06B" stroke-width="${N(0.55 * s)}" opacity="${N(0.8 * fade)}"/>`;
    }
  }
  return out + `</g>`;
}

// Drifting surface ripples for water. o={y,x1,x2,v,n,s}
function rippleTicks(ph, o) {
  if (window.__FABLE_NO_TICKS) return '';
  const span = o.x2 - o.x1, n = o.n ?? 5, s = o.s ?? 1;
  let out = `<g fill="none" stroke="${o.tone ?? '#8FA093'}" stroke-linecap="round">`;
  for (let i = 0; i < n; i++) {
    let x = ((i + 0.5) / n) * span - wrap(ph) * (o.v % span);
    x = ((x % span) + span) % span;
    const fade = Math.min(1, 4 * Math.min(x / span, 1 - x / span));
    const X = o.x1 + x, w = (4 + (i % 3) * 2) * s;
    out += `<path d="M${N(X - w / 2)} ${N(o.y)} q ${N(w * 0.25)} ${N(1.1 * s)} ${N(w / 2)} 0 q ${N(w * 0.25)} ${N(-1.1 * s)} ${N(w / 2)} 0" stroke-width="${N(0.6 * s)}" opacity="${N(0.5 * fade)}"/>`;
  }
  return out + `</g>`;
}

// Drifting air streaks for flight. o={x1,x2,y,h,v,n,s}
function airTicks(ph, o) {
  if (window.__FABLE_NO_TICKS) return '';
  const span = o.x2 - o.x1, n = o.n ?? 4, s = o.s ?? 1;
  let out = `<g stroke="#CFC09B" stroke-linecap="round" fill="none">`;
  for (let i = 0; i < n; i++) {
    let x = ((i + 0.3) / n) * span - wrap(ph * (o.k ?? 1)) * (o.v % span);
    x = ((x % span) + span) % span;
    const fade = Math.min(1, 4 * Math.min(x / span, 1 - x / span));
    const X = o.x1 + x, y = o.y + (i % 3) * (o.h ?? 10) / 2;
    out += `<line x1="${N(X)}" y1="${N(y)}" x2="${N(X + (4 + (i % 2) * 3) * s)}" y2="${N(y)}" stroke-width="${N(0.55 * s)}" opacity="${N(0.65 * fade)}"/>`;
  }
  return out + `</g>`;
}

// Downward-scrolling bark nicks along a vertical trunk edge, sells climbing up.
function barkTicks(ph, o) {
  const span = o.y2 - o.y1, n = o.n ?? 6;
  let out = `<g stroke="${o.tone ?? '#57432E'}" stroke-linecap="round" fill="none">`;
  for (let i = 0; i < n; i++) {
    let y = ((i + 0.4) / n) * span + wrap(ph) * (o.v % span);
    y = ((y % span) + span) % span;
    const fade = Math.min(1, 4 * Math.min(y / span, 1 - y / span));
    const Y = o.y1 + y;
    out += `<line x1="${N(o.x + (i % 2))}" y1="${N(Y)}" x2="${N(o.x + 2.6 + (i % 2))}" y2="${N(Y + 0.7)}" stroke-width="0.6" opacity="${N(0.55 * fade)}"/>`;
  }
  return out + `</g>`;
}

function zzz(ph, o) {
  const n = o.n ?? 3, s = o.s ?? 1;
  let out = `<g font-family="EB Garamond,Georgia,serif" font-style="italic" text-anchor="middle" fill="${o.tone ?? '#8A7C5C'}">`;
  for (let i = 0; i < n; i++) {
    const p = wrap(ph + i / n);
    const fade = Math.pow(Math.sin(Math.PI * p), 1.5);
    const x = o.x + (o.drift ?? 5) * p + 1.1 * s * Math.sin(TAU * (p * 1.3 + i * 0.37));
    const y = o.y - (o.rise ?? 11) * p;
    const fs = s * (2.4 + 2.4 * p);
    out += `<text x="${N(x)}" y="${N(y)}" font-size="${N(fs)}" opacity="${N(0.8 * fade)}">z</text>`;
  }
  return out + `</g>`;
}

// Downward-scrolling bark nicks along a vertical trunk edge, sells climbing up.

const __REG = {};

// ── v73: every species rebuilt from the design pack's ESM modules (corrected odonata,
//    dedicated NIGHT motions sleep/roost/rest, freshest art); garden lane-damping re-applied ──
__REG["fox"] = (function(){
// Red Fox — fable style
const C = { rust: '#E08A4A', deep: '#DB7E40', shade: '#C56F36', cream: '#F4ECE2', dark: '#5A3A2E', eye: '#2A2326' };
const GY = 14.6;

// legs: [pivotX, pivotY, pathD, footX, footY, color]
const LEGS = {
  ff: [6.8, 6, 'M5.4 4 L8.2 4 L7.8 13.2 L5.8 13.2 Z', 6.8, 13.4, C.shade],
  fh: [-6.2, 6, 'M-7.6 4 L-4.8 4 L-5.2 13.2 L-7.2 13.2 Z', -6.2, 13.4, C.shade],
  nf: [9.4, 6, 'M8 4 L10.8 4 L10.4 13.6 L8.4 13.6 Z', 9.4, 13.8, C.rust],
  nh: [-4, 6, 'M-5.4 4 L-2.6 4 L-3 13.6 L-5 13.6 Z', -4, 13.8, C.rust]
};
const leg = (k, a) => {
  const [px, py, d, fx, fy, col] = LEGS[k];
  return g(rot(a, px, py), `<path d="${d}" fill="${col}"/><ellipse cx="${fx}" cy="${fy}" rx="1.9" ry="1.2" fill="${C.dark}"/>`);
};

const tail = (a, tip) =>
  g(rot(a, -9, 6.5) + ' ' + rot(tip || 0, -19, -3),
    `<path d="M-9 7 C -22 8 -27 -3 -19 -11 C -23 -7 -23 -1 -19 2 C -16 -4 -12 -7 -8 -8 C -13 -3 -12 3 -8 5 Z" fill="${C.deep}"/>` +
    `<path d="M-19 -10 C -23 -6 -23 -1 -19 2 C -18 -2 -18 -6 -17 -10 C -18 -11 -18.5 -11 -19 -10 Z" fill="${C.cream}"/>` +
    `<ellipse cx="-15.5" cy="-2" rx="2.6" ry="6.5" fill="${C.shade}" opacity=".5"/>`);

// P: headA, earL, earR, earB (0..1 pinned back), blink
function head(P) {
  const eL = -24 * (P.earL || 0) + 26 * (P.earB || 0);
  const eR = -26 * (P.earR || 0) + 26 * (P.earB || 0);
  const eyes = (P.blink || 0) > 0.5
    ? `<path d="M8.7 -3.4 L10.5 -3.4 M13.5 -3.4 L15.3 -3.4" stroke="${C.eye}" stroke-width=".7" fill="none" stroke-linecap="round"/>`
    : `<circle cx="9.6" cy="-3.4" r="1.5" fill="${C.eye}"/><circle cx="14.4" cy="-3.4" r="1.5" fill="${C.eye}"/>` +
      `<circle cx="10.1" cy="-3.9" r=".5" fill="#FBF7F2"/><circle cx="14.9" cy="-3.9" r=".5" fill="#FBF7F2"/>`;
  return g(rot(P.headA || 0, 5, 3),
    g(rot(eR, 17, -10), `<path d="M19 -9 L 22 -19 C 17.5 -18 15 -15 14 -11 Z" fill="${C.rust}"/><path d="M18.5 -10 L 20.5 -16 C 18 -15.5 16.5 -13.5 15.5 -11.5 Z" fill="${C.dark}"/>`) +
    g(rot(eL, 6, -10), `<path d="M5 -9 L 1.5 -19 C 6 -18 9 -15 10 -11 Z" fill="${C.rust}"/><path d="M5.5 -10 L 3.5 -16 C 6 -15.5 7.5 -13.5 8.5 -11.5 Z" fill="${C.dark}"/>`) +
    `<path d="M5 -10 C 8 -13 16 -13 19 -10 C 21 -6 20 0 17 3 C 13 6 7 6 4 3 C 1 0 2 -6 5 -10 Z" fill="${C.rust}"/>` +
    `<path d="M5 -10 C 8 -8 8 -4 6 0 C 9 1 14 1 17 0 C 19 -4 18 -8 19 -10 C 16 -13 8 -13 5 -10 Z" fill="${C.cream}" opacity=".22"/>` +
    `<path d="M12 -2 C 9 -1 7 1 7 3 C 7 5 9 6 12 6 C 15 6 17 5 17 3 C 17 1 15 -1 12 -2 Z" fill="${C.cream}"/>` +
    `<path d="M12 4.2 C 10.6 4.2 9.4 5 9.4 6 C 9.4 7.4 10.8 8 12 8 C 13.2 8 14.6 7.4 14.6 6 C 14.6 5 13.4 4.2 12 4.2 Z" fill="#3A2E2A"/>` +
    eyes +
    `<ellipse cx="8" cy="0.5" rx="1.8" ry="1.3" fill="#F0A86A" opacity=".45"/>`);
}

// P: dx dy pitch sx sy legs{ff,fh,nf,nh} tailA tailTip headA earL earR earB blink ticks
function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  s += shadow(dx - 1, GY, 19, Math.max(0, -dy));
  const L = P.legs || { ff: 0, fh: 0, nf: 0, nh: 0 };
  const inner =
    tail(P.tailA ?? 0, P.tailTip) +
    leg('ff', L.ff) + leg('fh', L.fh) + leg('nf', L.nf) + leg('nh', L.nh) +
    `<path d="M-9 6 C -9 -2 -3 -6 3 -6 C 10 -6 13 0 12.5 5 C 12 9 8 11 2 11 C -4 11 -9 10 -9 6 Z" fill="${C.rust}"/>` +
    `<path d="M-7 8 C -7 3 -2 0 4 0 C 10 0 13 3 12.5 6 C 6 5 0 6 -7 8 Z" fill="${C.cream}" opacity=".95"/>` +
    `<ellipse cx="2" cy="9" rx="6.5" ry="2.6" fill="${C.cream}"/>` +
    `<path d="M12.8 -8.5 C 14.6 -5 14.6 -0.5 12.4 2.8 C 10.6 -0.5 10.4 -4.8 11.4 -8.2 Z" fill="${C.cream}" opacity=".92"/>` +
    head(P);
  return s + g(trl(dx, dy) + ' ' + scl(P.sx ?? 1, P.sy ?? 1, 0, GY) + ' ' + rot(P.pitch || 0, 0, 3), inner);
}

const walkLegs = (t, offs, amp) => ({
  ff: amp * osc(t - offs.ff), fh: amp * osc(t - offs.fh),
  nf: amp * osc(t - offs.nf), nh: amp * osc(t - offs.nh)
});

const POUNCE = [
  [0.00, { dx: -4, dy: 0, pitch: 0, sx: 1, sy: 1, lf: 0, lh: 0, headA: 0, earB: 0, tailA: 0, tailTip: 0 }],
  [0.12, { dx: -3, dy: 2.2, pitch: 3, sx: 1.04, sy: 0.92, lf: -8, lh: 10, headA: 6, earB: 0, tailA: 8, tailTip: 6 }],
  [0.36, { dx: -2.4, dy: 2.8, pitch: 4, sx: 1.05, sy: 0.9, lf: -10, lh: 12, headA: 7, earB: 0, tailA: 10, tailTip: 10 }],
  [0.44, { dx: 0, dy: -13, pitch: -22, sx: 1.05, sy: 0.98, lf: 28, lh: -26, headA: -6, earB: .8, tailA: -18, tailTip: -8 }],
  [0.52, { dx: 3, dy: -20, pitch: -4, sx: 1, sy: 1, lf: 10, lh: -12, headA: 4, earB: 1, tailA: -26, tailTip: -12 }],
  [0.60, { dx: 6, dy: -7, pitch: 24, sx: 1, sy: 1, lf: -24, lh: 16, headA: 14, earB: 1, tailA: -30, tailTip: -10 }],
  [0.66, { dx: 7.5, dy: 1.4, pitch: 12, sx: 1.06, sy: 0.88, lf: -14, lh: 8, headA: 16, earB: .5, tailA: -16, tailTip: 4 }],
  [0.78, { dx: 6.5, dy: 0.2, pitch: 3, sx: 1, sy: 1, lf: -4, lh: 2, headA: 6, earB: 0, tailA: 0, tailTip: 4 }],
  [1.00, { dx: -4, dy: 0, pitch: 0, sx: 1, sy: 1, lf: 0, lh: 0, headA: 0, earB: 0, tailA: 0, tailTip: 0 }]
];

return {
  id: 'fox', view: [-46, -42, 94, 62], groundY: GY,
  thumb: { m: 'stand', t: 0.05 },
  motions: [
    { id: 'stand', label: 'Stand', short: 'Stand', dur: 4.2, env: { t: 'ground' }, speed: '0 km/h', beat: 'Idle · slow breath',
      desc: 'The fox at ease: weight square over slender legs, brush low, nothing moving but the ribs and the radar of the ears.',
      anim: 'Hold the silhouette still and spend the frames on the ears — one clean flick reads louder than any body shift. Blink on threes.' },
    { id: 'walk', label: 'Walk', short: 'Walk', dur: 1.05, env: { t: 'ground' }, speed: '6–8 km/h', beat: '4-beat lateral · duty 62%',
      desc: 'A narrow, direct-registering walk: each hind paw lands in the print of the forepaw, on a single line like stitching.',
      anim: 'Four even beats, order LH–LF–RH–RF. Keep the topline level; all the action is below the elbow, and the head nods only a degree or two.' },
    { id: 'trot', label: 'Trot', short: 'Trot', dur: 0.62, env: { t: 'ground' }, speed: '10–13 km/h', beat: '2-beat diagonal',
      desc: 'The travelling gait — diagonal pairs, light and level, the pace a fox can hold from dusk to dawn.',
      anim: 'Two beats with a whisper of suspension. Let the brush float a few frames behind the pelvis as a follow-through curve.' },
    { id: 'gallop', label: 'Gallop', short: 'Gallop', dur: 0.48, env: { t: 'ground' }, speed: 'to 50 km/h', beat: '4-beat rotary + suspension',
      desc: 'Flat-out rotary gallop: the back coils and releases like a spring, hind feet overtaking the front on every bound.',
      anim: 'One breath of the spine per stride — gather, fire, stretch. Ears pinned, tail streaming as a one-beat-late echo of the spine.' },
    { id: 'pounce', label: 'Mouse pounce', short: 'Pounce', dur: 3.6, env: { t: 'ground' }, speed: 'arc ≈ 1 m high', beat: 'Stalk → arc → pin',
      desc: 'The mousing leap: a frozen stalk, a gathered wiggle, then a high vertical arc ending nose-first in the grass.',
      anim: 'The anticipation is the shot. Hold the crouch, wiggle twice, then commit in six frames — full stretch at the apex, folded to a dart on entry.' }
    ,{ id: 'sleep', label: 'Sleep', short: 'Sleep', dur: 6.5, env: { t: 'ground' }, night: true, speed: '0 km/h', beat: 'Deep rest · slow breath',
      desc: 'Curled nose-to-brush on the den floor, the great tail drawn round the body as blanket and pillow at once, ears folded flat to the world.',
      anim: 'Hold everything still; spend the whole cycle on one long flank-breath and a single drowsy ear-flick to prove it lives.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'sleep') {
      const b1 = Math.pow(0.5 + 0.5 * Math.sin(TAU * t * 2), 1.35);
      const sigh = pulse(t, .40, .62);
      const br = 1 + 0.022 * b1 + 0.032 * sigh;
      const hd = -(br - 1) * 9;
      const ear = 4 * pulse(t, .55, .60) + 3 * pulse(t, .88, .925);
      const tip = -9 * pulse(t, .70, .84);
      const body =
        `<path d="M-13 8 C -24 4 -23 -11 -7 -13.5 C 5 -15 15 -11 18 -3 C 13 -8 2 -9 -7 -6.5 C -16 -4 -18 3 -13 9 Z" fill="${C.deep}"/>` +
        `<path d="M-13.5 8.5 C -17 2 -13 -3 -6 -4.6" stroke="${C.shade}" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".5"/>` +
        `<ellipse cx="-1" cy="4.5" rx="15" ry="9.8" fill="${C.rust}"/>` +
        `<path d="M-12 10.5 C -15 6.5 -14 1 -11 -1.5 C -8 4 3 7 11 4.5 C 8 10.5 -6 13 -12 10.5 Z" fill="${C.cream}" opacity=".85"/>`;
      const headG =
        g(rot(-ear, 9, -2),
          `<path d="M9.6 -1.2 C 6 -4.2 2.6 -5.8 0.8 -5.6 C 2.4 -2.8 5.4 -0.6 8.8 0.4 C 9.6 0.2 9.8 -0.4 9.6 -1.2 Z" fill="${C.rust}"/>` +
          `<path d="M7.9 -1.7 C 5.4 -3.7 3.4 -4.7 2.1 -4.7 C 3.5 -2.7 5.4 -1.2 7.6 -0.4 Z" fill="${C.dark}" opacity=".5"/>`) +
        `<path d="M13.8 -2.2 C 10.8 -5.2 8 -6.8 6.2 -6.7 C 8 -4 10.6 -1.8 13.2 -1 C 13.9 -1.1 14 -1.7 13.8 -2.2 Z" fill="${C.rust}"/>` +
        `<ellipse cx="10.5" cy="3" rx="7.2" ry="6.6" fill="${C.rust}"/>` +
        `<path d="M4 3.6 C 7 6.8 13 6.8 16 3.4 C 13 8 6.4 8 4 4.2 Z" fill="${C.cream}"/>` +
        `<ellipse cx="4.4" cy="5.6" rx="1.6" ry="1.1" fill="${C.dark}"/>` +
        `<path d="M8.8 1.4 C 9.8 2.3 11.4 2.3 12.5 1.5" stroke="${C.eye}" stroke-width=".75" fill="none" stroke-linecap="round"/>`;
      const tipG = g(trl(0, hd * 0.7) + ' ' + rot(tip, 16.2, 5.2),
        `<path d="M18 -3 C 19.7 -0.4 18.7 3.8 15.3 5.6 C 15.1 2 16 -0.6 17 -3.2 Z" fill="${C.cream}"/>`);
      return shadow(-1, GY, 19, 0) + zzz(t, { x: 9, y: -11, rise: 13, drift: 5 }) +
        g(scl(1, br, 0, GY), body) + g(trl(0, hd), headG) + tipG;
    }
    if (mid === 'stand') {
      return draw({
        dy: -0.5 * Math.max(0, osc(t, 3)),
        legs: { ff: 0, fh: 0, nf: 0, nh: 0 },
        headA: 1.5 * osc(t, 1, .1) - 5 * pulse(t, .42, .6),
        earL: pulse(t, .28, .35), earR: pulse(t, .62, .69),
        tailA: 3 * osc(t, 1, .5), tailTip: 7 * osc(t, 2, .2),
        blink: pulse(t, .5, .535) + pulse(t, .84, .875)
      });
    }
    if (mid === 'pounce') {
      const K = keys(t, POUNCE);
      const wig = pulse(t, .16, .38);
      K.pitch += wig * 1.4 * Math.sin(TAU * t * 13);
      K.dy += wig * 0.5 * Math.sin(TAU * t * 26);
      K.legs = { ff: K.lf, nf: K.lf * 0.9, fh: K.lh, nh: K.lh * 0.9 };
      K.blink = pulse(t, .6, .68);
      return draw(K);
    }
    if (mid === 'trot') {
      return draw({
        dy: laneDy(-1.1 * osc(t, 2, .3)), pitch: lanePitch(1.4 * osc(t, 2, .1)),
        legs: walkLegs(t, { nf: 0, fh: 0, ff: .5, nh: .5 }, 19),
        headA: 1.6 * osc(t, 2, .55), tailA: 10 + 5 * osc(t, 1, .3), tailTip: 8 * osc(t, 2, .1),
        ticks: groundTicks(t, { y: GY, x1: -43, x2: 45, v: 52, n: 7, s: 1.15 })
      });
    }
    if (mid === 'gallop') {
      return draw({
        dy: laneDy(-2.4 * osc(t, 1, .1)), pitch: lanePitch(5.5 * osc(t, 1, .35)),
        sx: 1 + .04 * osc(t, 1, .55), sy: 1 - .03 * osc(t, 1, .55),
        legs: walkLegs(t, { nf: 0, ff: .12, nh: .5, fh: .62 }, 28),
        headA: -4 + 3 * osc(t, 1, .5), earB: 1,
        tailA: -14 + 6 * osc(t, 1, .5), tailTip: -8 + 6 * osc(t, 1, .6),
        ticks: groundTicks(t, { y: GY, x1: -43, x2: 45, v: 76, n: 7, s: 1.15 })
      });
    }
    // walk
    return draw({
      dy: laneDy(-0.6 * osc(t, 2, .12)), pitch: lanePitch(0.8 * osc(t, 2, .4)),
      legs: walkLegs(t, { nh: 0, nf: .25, fh: .5, ff: .75 }, 13),
      headA: 2 * osc(t, 2, .55), tailA: 4 * osc(t, 2, .3), tailTip: 6 * osc(t, 2, .05),
      blink: pulse(t, .7, .73),
      ticks: groundTicks(t, { y: GY, x1: -43, x2: 45, v: 34, n: 7, s: 1.15 })
    });
  }
};

})();
__REG["deer"] = (function(){
// Red Deer — fable style
const C = { coat: '#B08960', dark: '#9C7650', belly: '#E8D3B8', cream: '#F4ECE2', hoof: '#3A2E2A', eye: '#2A2326' };
const GY = 19.4;

const LEGS = {
  ff: [8.7, 8, 'M7 8 L10.4 8 L9.8 17.5 L7.4 17.5 Z', 8.6, 17.8, C.dark],
  fh: [-5.3, 8, 'M-7 8 L-3.6 8 L-4.2 17.5 L-6.6 17.5 Z', -5.4, 17.8, C.dark],
  nf: [6.7, 8.5, 'M5 8.5 L8.4 8.5 L7.8 18 L5.4 18 Z', 6.6, 18.3, C.coat],
  nh: [-7.3, 8.5, 'M-9 8.5 L-5.6 8.5 L-6.2 18 L-8.6 18 Z', -7.4, 18.3, C.coat]
};
const leg = (k, a) => {
  const [px, py, d, fx, fy, col] = LEGS[k];
  return g(rot(a, px, py), `<path d="${d}" fill="${col}"/><ellipse cx="${fx}" cy="${fy}" rx="1.9" ry="1.1" fill="${C.hoof}"/>`);
};

// P: headA (deg, + = down/forward, − = up), headDy, earA (flick), earF (0..1 fwd), blink
// The neck is drawn dynamically from the shoulder to the head so it stretches
// instead of collapsing when the head goes down to graze.
function head(P) {
  const aDeg = P.headA || 0, aRad = aDeg * Math.PI / 180;
  const th = Math.atan2(-13, 6) + aRad;                      // standing neck direction + rotation
  const L = 14.3 * (1 + 0.32 * Math.max(0, Math.sin(aRad))); // neck extends as it lowers
  const ux = Math.cos(th), uy = Math.sin(th), px = -uy, py = ux;
  const hx = 6.5 + L * ux, hy = 1 + L * uy + (P.headDy || 0);
  const tilt = aDeg <= 30 ? aDeg : 30 + (aDeg - 30) * 0.5;   // head pitch follows, damped
  const ax2 = hx - 2.2 * ux, ay2 = hy - 2.2 * uy;
  const t1x = ax2 - 2.4 * px, t1y = ay2 - 2.4 * py, t2x = ax2 + 2.4 * px, t2y = ay2 + 2.4 * py;
  const m1x = (3.4 + t1x) / 2 - 1.1 * px, m1y = (-1.8 + t1y) / 2 - 1.1 * py;
  const m2x = (9.4 + t2x) / 2 + 0.9 * px, m2y = (2.4 + t2y) / 2 + 0.9 * py;
  const hlx = ax2 + 0.9 * px, hly = ay2 + 0.9 * py;
  const neck =
    `<path d="M3.4 -1.8 Q${N(m1x)} ${N(m1y)} ${N(t1x)} ${N(t1y)} L${N(t2x)} ${N(t2y)} Q${N(m2x)} ${N(m2y)} 9.4 2.4 Z" fill="${C.dark}"/>` +
    `<path d="M7.6 0.6 Q${N((7.6 + hlx) / 2 + 0.7 * px)} ${N((0.6 + hly) / 2 + 0.7 * py)} ${N(hlx)} ${N(hly)}" stroke="${C.coat}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".4"/>`;
  const earN = -(P.earF || 0) * 10 + 16 * (P.earA || 0);
  const earF2 = (P.earF || 0) * 8 + 12 * (P.earA || 0);
  const eye = (P.blink || 0) > 0.5
    ? `<path d="M12.6 -12.5 L15.4 -12.5" stroke="${C.eye}" stroke-width=".9" fill="none" stroke-linecap="round"/>`
    : `<circle cx="14" cy="-12.5" r="2.4" fill="${C.eye}"/><circle cx="14.9" cy="-13.3" r=".75" fill="#fff"/><circle cx="13.4" cy="-11.7" r=".35" fill="#fff" opacity=".7"/>`;
  return neck + g(trl(hx - 12.5, hy + 12) + ' ' + rot(tilt, 12.5, -12),
    // antlers behind head
    `<g stroke="${C.dark}" fill="none" stroke-linecap="round">` +
    `<path d="M8.5 -18 C 7 -24 7.5 -29 10 -32" stroke-width="2.3"/>` +
    `<path d="M8.1 -24 C 5.9 -25.4 3.9 -25.8 2.5 -25.4" stroke-width="2.1"/>` +
    `<path d="M8.9 -27.5 C 7.1 -28.9 5.1 -29.4 3.6 -29" stroke-width="2"/>` +
    `<path d="M15.5 -18.5 C 17 -24 17.5 -29 16 -32.5" stroke-width="2.3"/>` +
    `<path d="M16.3 -24 C 18.5 -25.6 20.7 -26.1 22.2 -25.7" stroke-width="2.1"/>` +
    `<path d="M15.9 -27.8 C 17.5 -29.2 19.5 -29.8 21 -29.4" stroke-width="2"/></g>` +
    g(rot(earF2, 19, -15), `<path d="M18 -15.5 C 19.5 -19 22.5 -20 24.5 -19 C 23.5 -16.5 21 -14.8 18.5 -14.5 Z" fill="${C.dark}"/>`) +
    `<circle cx="12.5" cy="-12" r="6.8" fill="${C.coat}"/>` +
    `<path d="M14.5 -7 C 19 -7 21 -9.5 20.5 -12.5 C 17.5 -11.5 14 -11.5 12 -9.5 C 12 -8 13 -7 14.5 -7 Z" fill="${C.belly}"/>` +
    `<ellipse cx="17.8" cy="-9.2" rx="2" ry="1.6" fill="${C.hoof}"/>` +
    g(rot(earN, 9, -14.5), `<path d="M7 -15 C 5.5 -19 7.5 -21.5 10.5 -21 C 12 -19 11.5 -16 9.5 -14 Z" fill="${C.dark}"/><path d="M7.7 -15.5 C 6.9 -18 8.1 -19.6 9.9 -19.3 C 10.5 -18 10.3 -16.4 9.1 -15 Z" fill="#E0C9AC" opacity=".6"/>`) +
    eye);
}

// P: dx dy pitch sx sy legs tailA head-params sprig ticks
function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.sprig) s += P.sprig;
  s += shadow(dx + 1, GY, 15.5, Math.max(0, -dy));
  const L = P.legs || { ff: 0, fh: 0, nf: 0, nh: 0 };
  const inner =
    leg('ff', L.ff) + leg('fh', L.fh) + leg('nf', L.nf) + leg('nh', L.nh) +
    `<ellipse cx="0" cy="4.5" rx="11" ry="7.5" fill="${C.coat}"/>` +
    `<ellipse cx="-1" cy="6.8" rx="7.5" ry="4.8" fill="${C.belly}" opacity=".75"/>` +
    `<circle cx="-5" cy="1" r="1.2" fill="${C.belly}" opacity=".6"/><circle cx="1" cy="0" r="1.2" fill="${C.belly}" opacity=".55"/><circle cx="-2" cy="3.5" r="1" fill="${C.belly}" opacity=".5"/>` +
    g(rot(P.tailA || 0, -10.6, 2.5), `<path d="M-11 1.5 C -14 0.5 -15 3.5 -13 5.5 C -11.5 5.5 -10.5 3.5 -10.5 2 Z" fill="${C.cream}"/>`) +
    head(P);
  return s + g(trl(dx, dy) + ' ' + scl(P.sx ?? 1, P.sy ?? 1, 0, GY) + ' ' + rot(P.pitch || 0, 0, 4), inner);
}

const gaitLegs = (t, offs, amp) => ({
  ff: amp * osc(t - offs.ff), fh: amp * osc(t - offs.fh),
  nf: amp * osc(t - offs.nf), nh: amp * osc(t - offs.nh)
});

const ALERT = [
  [0.00, { headA: 26, headDy: 2, pitch: 2, tailA: 0, earF: 0, stampA: 0 }],
  [0.06, { headA: -16, headDy: 0, pitch: -2.5, tailA: -26, earF: 1, stampA: 0 }],
  [0.11, { headA: -9, headDy: 0, pitch: -1.5, tailA: -30, earF: 1, stampA: 0 }],
  [0.55, { headA: -9, headDy: 0, pitch: -1.5, tailA: -30, earF: 1, stampA: 0 }],
  [0.59, { headA: -9, headDy: 0, pitch: -1.5, tailA: -30, earF: 1, stampA: -22 }],
  [0.63, { headA: -9, headDy: 0, pitch: -1.5, tailA: -30, earF: 1, stampA: 0 }],
  [0.86, { headA: -7, headDy: 0, pitch: -1, tailA: -24, earF: 1, stampA: 0 }],
  [1.00, { headA: 26, headDy: 2, pitch: 2, tailA: 0, earF: 0, stampA: 0 }]
];

return {
  id: 'deer', view: [-40, -41, 84, 66], groundY: GY,
  thumb: { m: 'alert', t: 0.3 },
  motions: [
    { id: 'graze', label: 'Graze', short: 'Graze', dur: 4.6, env: { t: 'ground' }, speed: '~0 km/h', beat: 'Crop · chew · lift',
      desc: 'Head down among the grasses, cropping in slow sweeps, lifting halfway to chew and glance before dipping again.',
      anim: 'The neck does all the travelling; the legs are architecture. Never stop the jaw — a deer chews through every pose, even mid-lift.' },
    { id: 'walk', label: 'Walk', short: 'Walk', dur: 1.25, env: { t: 'ground' }, speed: '5–7 km/h', beat: '4-beat lateral · duty 64%',
      desc: 'A high-headed, economical walk, the hooves flicked forward from the knee, covering ground without spending anything.',
      anim: 'Long limbs mean visible overlap: the knee leads, the hoof trails two frames behind. Keep the head counter-nod subtler than a horse’s.' },
    { id: 'trot', label: 'Trot', short: 'Trot', dur: 0.72, env: { t: 'ground' }, speed: '~15 km/h', beat: '2-beat diagonal + suspension',
      desc: 'A floating diagonal trot with real hang-time — the gait of a deer clearing ground without yet being afraid.',
      anim: 'Push the suspension a frame longer than feels right; the float is what reads as deer. Toes point down the moment a foot leaves earth.' },
    { id: 'gallop', label: 'Gallop', short: 'Gallop', dur: 0.56, env: { t: 'ground' }, speed: 'to 70 km/h', beat: '4-beat + suspension',
      desc: 'The full red-deer gallop: enormous drive from the haunch, the back flexing, each stride swallowing five metres.',
      anim: 'Drive from the haunch, not the shoulder. Give extension and gather each their own full pose, with the neck reaching a beat after the spine.' },
    { id: 'alert', label: 'Alert', short: 'Alert', dur: 3.8, env: { t: 'ground' }, speed: '0 km/h', beat: 'Snap → freeze → stamp',
      desc: 'The freeze: head thrown high in three frames, ears locked forward, then one forefoot stamping the alarm into the ground.',
      anim: 'Snap up with an overshoot, then hold dead still — after the snap, stillness is the performance. The stamp is a single sharp accent, no bounce.' }
    ,{ id: 'sleep', label: 'Sleep', short: 'Sleep', dur: 6.5, env: { t: 'ground' }, night: true, speed: '0 km/h', beat: 'Deep rest · slow breath',
      desc: 'Bedded in the bracken, legs folded beneath and the long neck held up in a drowse, antlers tipped, eyes gone to slits.',
      anim: 'A cud-less doze: only the ribs rise and fall, with a slow half-blink and the odd rotation of one ear.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'sleep') {
      const br = 1 + 0.016 * Math.sin(TAU * t);
      const ear = 6 * pulse(t, .5, .55);
      const inner =
        `<path d="M4 18 C 6 14 10 13 13 14 C 12 16 9 18 6 18.4 Z" fill="${C.dark}"/>` +
        `<path d="M-2 18.2 C 0 15 4 14 7 14.6 C 6 16.5 3 18.2 0 18.6 Z" fill="${C.coat}"/>` +
        `<ellipse cx="-3" cy="11" rx="13" ry="7.5" fill="${C.coat}"/>` +
        `<ellipse cx="-4" cy="13.5" rx="9" ry="4.4" fill="${C.belly}" opacity=".7"/>` +
        `<path d="M6 8 C 7 3 10 -1 14 -3 L17 1.5 C 13.5 3.5 11 6.5 10.5 10 C 9 9 7 8.4 6 8 Z" fill="${C.coat}"/>` +
        g(rot(6, 15, -4),
          `<g stroke="${C.dark}" fill="none" stroke-linecap="round" stroke-width="1.8"><path d="M13 -6 C 12 -12 12.5 -16 15 -19"/><path d="M12.8 -11 C 11 -12.2 9.2 -12.5 8 -12"/><path d="M17 -6.5 C 18.5 -12 19 -16 17.5 -19.5"/><path d="M17.5 -11 C 19.3 -12.4 21 -12.8 22.2 -12.4"/></g>` +
          `<circle cx="15" cy="-3.5" r="5" fill="${C.coat}"/>` +
          `<path d="M17 0 C 20.5 0 22 -2 21.5 -4.5 C 19 -3.5 16 -3.5 14.5 -1.5 C 14.5 -0.4 15.5 0 17 0 Z" fill="${C.belly}"/>` +
          `<ellipse cx="19.6" cy="-2" rx="1.6" ry="1.2" fill="${C.hoof}"/>` +
          g(rot(-ear, 10, -5), `<path d="M9 -4.5 C 7 -8 8.5 -10.5 11.5 -10 C 13 -8 12.5 -5.5 10.5 -3.5 Z" fill="${C.dark}"/>`) +
          `<path d="M12.6 -4 C 13.5 -3.3 14.7 -3.3 15.6 -4" stroke="${C.eye}" stroke-width=".8" fill="none" stroke-linecap="round"/>`);
      return shadow(-1, GY, 16, 0) + g(scl(1, br, 0, GY), inner);
    }
    if (mid === 'graze') {
      const K = keys(t, [
        [0.00, { headA: 8, pitch: 0, sprig: 0 }],
        [0.10, { headA: 98, pitch: 3, sprig: 1 }],
        [0.36, { headA: 98, pitch: 3, sprig: 1 }],
        [0.46, { headA: 34, pitch: 1, sprig: 0 }],
        [0.60, { headA: 32, pitch: 1, sprig: 0 }],
        [0.68, { headA: 98, pitch: 3, sprig: 1 }],
        [0.88, { headA: 98, pitch: 3, sprig: 1 }],
        [1.00, { headA: 8, pitch: 0, sprig: 0 }]
      ]);
      const nib = pulse(t, .12, .36) + pulse(t, .7, .88);
      K.headA += nib * 2.2 * Math.sin(TAU * t * 12);
      const chew = pulse(t, .44, .62);
      K.headA += chew * 1.6 * Math.sin(TAU * t * 9);
      // tall grass sprigs at the muzzle spot, nibbled shorter while grazing
      const gh = 9 - 2.6 * K.sprig;
      K.sprig = `<path d="M25.5 ${N(GY)} L26.4 ${N(GY - gh)} M27.6 ${N(GY)} L28.1 ${N(GY - gh - 1.2)} M29.6 ${N(GY)} L29 ${N(GY - gh + 1)} M23.8 ${N(GY)} L24.2 ${N(GY - gh + 1.6)}" stroke="#8A8A50" stroke-width=".9" fill="none" stroke-linecap="round"/>`;
      K.legs = { ff: 0, fh: 0, nf: 0, nh: 0 };
      K.tailA = 10 * pulse(t, .5, .58) + 10 * pulse(t, .93, .99);
      K.blink = pulse(t, .52, .56);
      return draw(K);
    }
    if (mid === 'alert') {
      const K = keys(t, ALERT);
      K.legs = { ff: 0, fh: 0, nf: K.stampA, nh: 0 };
      K.dy = -0.4 * Math.max(0, osc(t, 3));
      K.blink = pulse(t, .35, .38);
      return draw(K);
    }
    if (mid === 'trot') {
      return draw({
        dy: laneDy(-1.5 * osc(t, 2, .28)), pitch: lanePitch(1.6 * osc(t, 2, .1)),
        legs: gaitLegs(t, { nf: 0, fh: 0, ff: .5, nh: .5 }, 20),
        headA: -3 + 2 * osc(t, 2, .5), tailA: 8 * osc(t, 2, .2), earA: .2 * osc(t, 2, .3),
        ticks: groundTicks(t, { y: GY, x1: -37, x2: 41, v: 56, n: 7, s: 1.2 })
      });
    }
    if (mid === 'gallop') {
      return draw({
        dy: -2.6 * osc(t, 1, .08), pitch: 5.5 * osc(t, 1, .35),
        sx: 1 + .045 * osc(t, 1, .55), sy: 1 - .035 * osc(t, 1, .55),
        legs: gaitLegs(t, { nf: 0, ff: .1, nh: .5, fh: .6 }, 30),
        headA: -8 + 5 * osc(t, 1, .5), earF: 0, tailA: -22 + 8 * osc(t, 1, .55),
        ticks: groundTicks(t, { y: GY, x1: -37, x2: 41, v: 92, n: 7, s: 1.2 })
      });
    }
    // walk
    return draw({
      dy: laneDy(-0.7 * osc(t, 2, .12)), pitch: lanePitch(0.9 * osc(t, 2, .4)),
      legs: gaitLegs(t, { nh: 0, nf: .25, fh: .5, ff: .75 }, 13),
      headA: 2.4 * osc(t, 2, .5), tailA: 5 * osc(t, 1, .3),
      blink: pulse(t, .66, .69),
      ticks: groundTicks(t, { y: GY, x1: -37, x2: 41, v: 30, n: 7, s: 1.2 })
    });
  }
};

})();
__REG["horse"] = (function(){
// Horse — fable style
const C = { coat: '#A9713F', dark: '#8F5E36', light: '#C08B57', mane: '#5A4636', maneHi: '#7A5F4B', cream: '#E8D3B8', hoof: '#4A3B31', eye: '#2A2326' };
const GY = 20;

const LEGS = {
  fh: [-9.5, 6, 'M-10.9 1.5 L-8.1 1.5 L-8.6 18.2 L-10.6 18.2 Z', -9.6, 18.4, C.dark],
  ff: [6.5, 6, 'M5.1 1.5 L7.9 1.5 L7.4 18.2 L5.4 18.2 Z', 6.4, 18.4, C.dark],
  nh: [-7.1, 6.4, 'M-8.5 1.5 L-5.7 1.5 L-6.2 18.8 L-8.2 18.8 Z', -7.2, 19, C.coat],
  nf: [8.9, 6.4, 'M7.5 1.5 L10.3 1.5 L9.8 18.8 L7.8 18.8 Z', 8.8, 19, C.coat]
};
const leg = (k, a) => {
  const [px, py, d, fx, fy, col] = LEGS[k];
  return g(rot(a, px, py), `<path d="${d}" fill="${col}"/><ellipse cx="${fx}" cy="${fy}" rx="1.7" ry="1.1" fill="${C.hoof}"/>`);
};

// P: neckA, earA, blink
function neck(P) {
  const eyes = (P.blink || 0) > 0.5
    ? `<path d="M15.4 -14.2 L17.8 -14.2" stroke="${C.eye}" stroke-width=".8" fill="none" stroke-linecap="round"/>`
    : `<circle cx="16.6" cy="-14.2" r="1.5" fill="${C.eye}"/><circle cx="17.1" cy="-14.7" r=".5" fill="#fff"/>`;
  return g(rot(P.neckA || 0, 5, -2),
    `<path d="M3 -3.5 C 4.5 -9 8 -13.5 12.8 -16.4 L16.2 -10.6 C 12.8 -7.4 10 -3.6 8.6 0.6 C 6.6 -1.2 4.6 -2.6 3 -3.5 Z" fill="${C.coat}"/>` +
    `<path d="M12.4 -16.8 C 9 -14.2 6.2 -10 4.4 -4.6" stroke="${C.mane}" stroke-width="3" fill="none" stroke-linecap="round"/>` +
    g(scl(1.14, 1.14, 15, -13),
    `<path d="M11 -16.6 C 13.6 -19.4 17.2 -19.2 19.4 -16.8 C 20.8 -15.2 21.8 -13.6 23.6 -12.6 C 24.8 -11.9 24.7 -10.3 23.4 -9.9 C 21 -9.2 18 -9.6 15.8 -11.2 C 13.2 -13 11.2 -15 11 -16.6 Z" fill="${C.coat}"/>` +
    g(rot(12 * (P.earA || 0), 14, -18),
      `<path d="M13.2 -17.8 L12.8 -22.2 C 15 -21.5 16.2 -19.8 16.1 -17.7 Z" fill="${C.coat}"/>` +
      `<path d="M13.9 -18.3 L13.8 -20.7 C 15 -20.2 15.6 -19.2 15.6 -18.1 Z" fill="${C.cream}" opacity=".6"/>`) +
    `<path d="M11 -17.6 C 12.8 -19.2 14.8 -19.2 16 -17.8 C 14.4 -17.3 13.1 -16.6 12 -15.6 Z" fill="${C.mane}"/>` +
    `<ellipse cx="21.9" cy="-11.3" rx="2.9" ry="2.2" fill="${C.cream}"/>` +
    `<circle cx="22.9" cy="-11.8" r=".55" fill="#3A2E2A"/>` +
    eyes));
}

// P: dx dy pitch sx sy legs tailA neckA earA blink ticks
function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  s += shadow(dx, GY, 17, Math.max(0, -dy));
  const L = P.legs || { ff: 0, fh: 0, nf: 0, nh: 0 };
  const inner =
    g(rot(P.tailA || 0, -13.5, -1.5),
      `<path d="M-13 -3 C -17.8 -2.4 -20 2.4 -19 10.6 C -17 11.8 -15 10.8 -14.6 8.2 C -15.8 5.4 -15.4 1.6 -12.6 -0.8 Z" fill="${C.mane}"/>` +
      `<path d="M-18.3 1.6 C -18.9 5 -18.5 8.4 -17.4 10.6" stroke="${C.maneHi}" stroke-width="1" fill="none" stroke-linecap="round" opacity=".8"/>`) +
    leg('fh', L.fh) + leg('ff', L.ff) + leg('nh', L.nh) + leg('nf', L.nf) +
    `<ellipse cx="-1.5" cy="1" rx="13.5" ry="8" fill="${C.coat}"/>` +
    `<ellipse cx="-1" cy="4" rx="9" ry="4.4" fill="${C.light}" opacity=".7"/>` +
    `<path d="M-13 -2.5 C -8 -7.5 3 -8.5 9 -6 C 3 -7.5 -7 -6 -12 -1 Z" fill="${C.dark}" opacity=".45"/>` +
    neck(P);
  return s + g(trl(dx, dy) + ' ' + scl(P.sx ?? 1, P.sy ?? 1, 0, GY) + ' ' + rot(P.pitch || 0, -1, 1), inner);
}

const gaitLegs = (t, offs, amp) => ({
  ff: amp * osc(t - offs.ff), fh: amp * osc(t - offs.fh),
  nf: amp * osc(t - offs.nf), nh: amp * osc(t - offs.nh)
});

return {
  id: 'horse', view: [-46, -38, 94, 64], groundY: GY,
  thumb: { m: 'walk', t: 0.12 },
  motions: [
    { id: 'walk', label: 'Walk', short: 'Walk', dur: 1.2, env: { t: 'ground' }, speed: '~6 km/h', beat: '4-beat lateral · duty 65%',
      desc: 'The four-beat walk, lateral sequence LH–LF–RH–RF — at every instant two or three hooves carry the ground.',
      anim: 'Muybridge\u2019s plates begin here. The head nods once per forelimb strike; hips and shoulders rock in counter-phase. No suspension, ever.' },
    { id: 'trot', label: 'Trot', short: 'Trot', dur: 0.74, env: { t: 'ground' }, speed: '~13 km/h', beat: '2-beat diagonal + suspension',
      desc: 'Diagonal pairs strike together with a beat of suspension between — the most symmetric, metronomic gait a horse owns.',
      anim: 'Two beats, perfectly even. Keep the head still and the topline level; the bounce lives in the legs and the fetlocks\u2019 give.' },
    { id: 'canter', label: 'Canter', short: 'Canter', dur: 0.64, env: { t: 'ground' }, speed: '~20 km/h', beat: '3-beat + suspension · right lead',
      desc: 'The rocking three-beat gait: outside hind, then the diagonal pair together, then the leading foreleg — then a beat of silence.',
      anim: 'Think rocking-horse: croup rises as the lead reaches. The nose draws a shallow ellipse, one loop per stride, timed to the third beat.' },
    { id: 'gallop', label: 'Gallop', short: 'Gallop', dur: 0.5, env: { t: 'ground' }, speed: '40–70 km/h', beat: '4-beat transverse + suspension',
      desc: 'The transverse gallop that settled Muybridge\u2019s wager in 1878: all four feet airborne once each stride — under the gathered belly, not outstretched.',
      anim: 'Four fast beats then flight. Give extension and gather their full poses; the neck pumps with the stride and the tail streams a beat behind.' },
    { id: 'stand', label: 'Stand at rest', short: 'Stand', dur: 4.6, env: { t: 'ground' }, speed: '0 km/h', beat: 'Idle · weight shift',
      desc: 'At rest: one hip slack, a hind toe tipped, the tail swishing flies and the head sinking by slow degrees.',
      anim: 'Weight shifts read through the hip and croup, never the legs. One tail swish and an ear flick every few seconds keep a hold alive.' }
    ,{ id: 'sleep', label: 'Doze', short: 'Doze', dur: 6, env: { t: 'ground' }, night: true, speed: '0 km/h', beat: 'Standing sleep · slow breath',
      desc: 'Asleep on its feet — one hip dropped, a hind toe tipped, the head hung low and the lower lip gone slack.',
      anim: 'Sell standing-sleep through stillness: the head sinks by degrees, the ears loll sideways, and only the breath moves the barrel.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'sleep') {
      return draw({
        dy: -0.4 * Math.max(0, Math.sin(TAU * t)),
        neckA: 13 + 0.5 * Math.sin(TAU * t),
        legs: { ff: 0, fh: 0, nf: 0, nh: -9 },
        tailA: 5 * osc(t, 1, .2),
        earA: -0.6 + 0.6 * pulse(t, .6, .66),
        blink: 1
      });
    }
    if (mid === 'stand') {
      const K = keys(t, [
        [0.00, { neckA: 0, pitch: 0, nhA: 0 }],
        [0.30, { neckA: 4, pitch: 0.8, nhA: 0 }],
        [0.52, { neckA: 4.5, pitch: 0.8, nhA: 0 }],
        [0.58, { neckA: 1, pitch: -0.3, nhA: -7 }],
        [0.66, { neckA: 0.5, pitch: 0, nhA: 0 }],
        [1.00, { neckA: 0, pitch: 0, nhA: 0 }]
      ]);
      return draw({
        dy: -0.4 * Math.max(0, osc(t, 3)),
        neckA: K.neckA, pitch: K.pitch,
        legs: { ff: 0, fh: 0, nf: 0, nh: K.nhA },
        tailA: 24 * pulse(t, .28, .42) - 20 * pulse(t, .72, .86),
        earA: pulse(t, .18, .25) - pulse(t, .62, .69),
        blink: pulse(t, .48, .52) + pulse(t, .9, .93)
      });
    }
    if (mid === 'trot') {
      return draw({
        dy: -1.6 * osc(t, 2, .3), pitch: 1.2 * osc(t, 2, .1),
        legs: gaitLegs(t, { nf: 0, fh: 0, ff: .5, nh: .5 }, 20),
        neckA: 0.8 * osc(t, 2, .5), tailA: 9 * osc(t, 2, .15) + 6,
        ticks: groundTicks(t, { y: GY, x1: -43, x2: 45, v: 58, n: 7, s: 1.25 })
      });
    }
    if (mid === 'canter') {
      return draw({
        dy: -2.1 * osc(t, 1, .15), pitch: 3.6 * osc(t, 1, .6),
        legs: gaitLegs(t, { fh: 0, nh: .3, ff: .3, nf: .6 }, 24),
        neckA: 4 * osc(t, 1, .7), tailA: 12 + 7 * osc(t, 1, .4),
        ticks: groundTicks(t, { y: GY, x1: -43, x2: 45, v: 72, n: 7, s: 1.25 })
      });
    }
    if (mid === 'gallop') {
      return draw({
        dy: -2.8 * osc(t, 1, .05), pitch: 5 * osc(t, 1, .35),
        sx: 1 + .04 * osc(t, 1, .55), sy: 1 - .03 * osc(t, 1, .55),
        legs: gaitLegs(t, { nf: 0, ff: .13, nh: .5, fh: .63 }, 30),
        neckA: 6 * osc(t, 1, .5), tailA: 26 + 6 * osc(t, 1, .55),
        ticks: groundTicks(t, { y: GY, x1: -43, x2: 45, v: 96, n: 7, s: 1.25 })
      });
    }
    // walk
    return draw({
      dy: laneDy(-0.7 * osc(t, 2, .12)), pitch: lanePitch(0.9 * osc(t, 2, .4)),
      legs: gaitLegs(t, { nh: 0, nf: .25, fh: .5, ff: .75 }, 11),
      neckA: 2.6 * osc(t, 2, .5), tailA: 5 * osc(t, 1, .3),
      blink: pulse(t, .7, .73),
      ticks: groundTicks(t, { y: GY, x1: -43, x2: 45, v: 32, n: 7, s: 1.25 })
    });
  }
};

})();
__REG["rabbit"] = (function(){
// European Rabbit — fable style
const C = { coat: '#C9A07A', shade: '#B68A63', light: '#E0BE97', eye: '#3A3450', nose: '#B6826A' };
const GY = 14.6;

// P: sx sy (about 0,13), pitch, pawA (front-paw wash), noseA, blink, earA (group), earSoft
function body(P) {
  const eyes = (P.blink || 0) > 0.5
    ? `<path d="M16.6 -5.5 L19.4 -5.5" stroke="${C.eye}" stroke-width=".9" fill="none" stroke-linecap="round"/>`
    : `<circle cx="18" cy="-5.5" r="1.7" fill="${C.eye}"/><circle cx="18.6" cy="-6.2" r=".5" fill="#FFFFFF" opacity=".9"/>`;
  const inner =
    `<ellipse cx="-15" cy="6" rx="5" ry="4.5" fill="${C.coat}"/>` +
    `<ellipse cx="-15.5" cy="6.5" rx="3.4" ry="3" fill="${C.light}" opacity=".85"/>` +
    `<path d="M-2 13 C -10 13 -15 9 -15 2 C -15 -8 -8 -13 1 -13 C 11 -13 16 -7 16 2 C 16 9 10 13 2 13 Z" fill="${C.coat}"/>` +
    `<path d="M-9 12 C -13 9 -14 4 -13 -1 C -10 5 -3 8 4 8 C 9 8 13 6 15 2 C 15 8 10 12 3 12.5 C -1 12.8 -5 13 -9 12 Z" fill="${C.shade}" opacity=".55"/>` +
    `<ellipse cx="-3" cy="6" rx="9" ry="6.5" fill="${C.light}" opacity=".75"/>` +
    `<ellipse cx="-4" cy="12.4" rx="6" ry="2" fill="${C.coat}"/>` +
    `<ellipse cx="-6.8" cy="12.7" rx="2.6" ry="1.1" fill="${C.shade}" opacity=".6"/>` +
    g(rot(P.pawA || 0, 12.5, 9),
      `<ellipse cx="11" cy="12.2" rx="2.2" ry="1.4" fill="${C.coat}"/>` +
      `<ellipse cx="14.6" cy="11.2" rx="2" ry="1.3" fill="${C.coat}"/>`) +
    `<path d="M9 -5 C 9 -11 13 -14 17 -14 C 21.5 -14 24.5 -10 24 -4.5 C 23.6 0.5 19.5 3.5 15.5 3 C 11.5 2.5 9 -0.5 9 -5 Z" fill="${C.coat}"/>` +
    `<path d="M19.5 -8 C 21 -7 22 -5 21.7 -2.8 C 21.4 -0.5 19.5 0.8 17.7 0.4 C 19 -1 19.6 -3 19.3 -5 C 19.1 -6.2 19.2 -7.2 19.5 -8 Z" fill="${C.shade}" opacity=".5"/>` +
    eyes +
    `<ellipse cx="14" cy="-1.5" rx="2.4" ry="1.8" fill="${C.light}" opacity=".55"/>` +
    g(rot(P.noseA || 0, 23.2, -3.2), `<ellipse cx="23.2" cy="-3.2" rx="1.2" ry="1" fill="${C.nose}" opacity=".85"/>`) +
    `<path d="M-8 -6 C -4 -9 2 -9 5 -7" fill="none" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round" opacity=".3"/>`;
  const ears = g(rot(P.earA || 0, 13, -11),
    g(rot(P.earSoft || 0, 12, -11),
      `<path d="M10.5 -11 C 9.2 -23 9.5 -31 12.3 -36 C 15.2 -32.5 15.4 -22 14.2 -10.5 C 13 -9 11.5 -9.2 10.5 -11 Z" fill="${C.coat}"/>` +
      `<path d="M11.7 -12.5 C 10.8 -21 11 -27.5 12.8 -31.5 C 14.3 -27.8 14.3 -19.5 13.6 -12.8 C 13 -11.8 12.3 -11.8 11.7 -12.5 Z" fill="${C.light}" opacity=".7"/>`) +
    `<path d="M16.5 -10 C 16 -22 17.2 -30 20.3 -34 C 22.8 -30 22.2 -20 20 -9.5 C 18.8 -8.2 17.4 -8.4 16.5 -10 Z" fill="${C.coat}"/>` +
    `<path d="M17.6 -11.5 C 17.2 -20 18.2 -26.5 20.1 -30 C 21.6 -26.5 21.1 -18.5 19.6 -11.5 C 19 -10.6 18.2 -10.7 17.6 -11.5 Z" fill="${C.light}" opacity=".6"/>`);
  return g(scl(P.sx ?? 1, P.sy ?? 1, 0, 13) + ' ' + rot(P.pitch || 0, 2, 11), ears + inner);
}

// P adds: dx dy ticks
function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  s += shadow(dx + 2, GY, 20, Math.max(0, -dy), 18);
  return s + g(trl(dx, dy), body(P));
}

// one full bound as keyframes (used by hop + sprint)
const bound = (t, big) => {
  const k = big ? 1.35 : 1;
  return keys(t, [
    [0.00, { dy: 0, sx: 1, sy: 1, pitch: 0, earA: 0, earSoft: 0 }],
    [0.16, { dy: 1.2, sx: 1.07, sy: 0.88, pitch: 4, earA: 6, earSoft: 4 }],
    [0.30, { dy: -6 * k, sx: 0.95, sy: 1.09, pitch: -9 * k, earA: 12, earSoft: 9 }],
    [0.48, { dy: -11 * k, sx: 1.0, sy: 1.0, pitch: -3, earA: 16, earSoft: 12 }],
    [0.64, { dy: -5 * k, sx: 1.0, sy: 1.02, pitch: 7, earA: 8, earSoft: 5 }],
    [0.76, { dy: 0.8, sx: 1.08, sy: 0.87, pitch: 3, earA: -3, earSoft: -3 }],
    [1.00, { dy: 0, sx: 1, sy: 1, pitch: 0, earA: 0, earSoft: 0 }]
  ]);
};

return {
  id: 'rabbit', view: [-40, -62, 86, 82], groundY: GY,
  thumb: { m: 'sit', t: 0.02 },
  motions: [
    { id: 'sit', label: 'Sit & sniff', short: 'Sit', dur: 3.8, env: { t: 'ground' }, speed: '0 km/h', beat: 'Idle · nose 5/s',
      desc: 'Hunched at rest, hind feet loaded beneath — a rabbit sits inside its own starting-block, nose reading the air.',
      anim: 'The nose never stops: a 4–5 per second twitch, in bursts. Everything else can hold for seconds at a time between ear swivels.' },
    { id: 'hop', label: 'Hop', short: 'Hop', dur: 0.75, env: { t: 'ground' }, speed: '8–12 km/h', beat: 'Bound · hinds together',
      desc: 'The easy travelling bound: forepaws touch briefly, then both hind feet swing past and outside them to land ahead.',
      anim: 'Hind feet work as one spring. Compress, release, and let the ears trail half a bound behind the body\u2019s arc.' },
    { id: 'sprint', label: 'Sprint', short: 'Sprint', dur: 0.42, env: { t: 'ground' }, speed: 'to 45 km/h', beat: 'Full bound + suspension',
      desc: 'Flat-out escape: back fully folding and firing, ears pinned along the spine, two airborne phases per bound.',
      anim: 'Stretch and fold the spine to its limits — the silhouette should alternate between an arrow and a ball. Ears glued flat.' },
    { id: 'alert', label: 'Upright alert', short: 'Alert', dur: 3.2, env: { t: 'ground' }, speed: '0 km/h', beat: 'Rise → scan → drop',
      desc: 'Up on the hind legs, forepaws tucked to the chest, ears working independently like a pair of dishes.',
      anim: 'Rise in 4 frames with a small overshoot. While holding, move only the ears — and never both at once.' },
    { id: 'groom', label: 'Groom', short: 'Groom', dur: 3.4, env: { t: 'ground' }, speed: '0 km/h', beat: 'Paw-wash cycles',
      desc: 'Face-washing: the head dips and each forepaw in turn wipes down over ear and muzzle in quick strokes.',
      anim: 'Strokes come in twos and threes, fast (3–4 frames each) with tiny holds between sets. Keep the hindquarters immobile.' }
    ,{ id: 'sleep', label: 'Sleep', short: 'Sleep', dur: 6, env: { t: 'ground' }, night: true, speed: '0 km/h', beat: 'Deep rest · slow breath',
      desc: 'Melted into a loaf, feet tucked from sight and the long ears laid flat down the back — a stone that breathes.',
      anim: 'Keep the outline a smooth dome; the only life is the slow breath and a rare, half-hearted ear-twitch.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'sleep') {
      const br = 1 + 0.018 * Math.sin(TAU * t);
      const ear = 3 * pulse(t, .55, .6);
      const inner =
        `<path d="M-2 -4 C -12 -5.5 -20 -5 -25 -2.5 C -20 -1 -12 -1.5 -3 -1 Z" fill="${C.coat}"/>` +
        g(rot(ear, -2, -3), `<path d="M-1 -6 C -11 -8 -19 -7.5 -24 -5 C -19 -3.5 -11 -4 -2 -3.5 Z" fill="${C.coat}"/><path d="M-4 -6 C -11 -7.2 -17 -6.8 -21 -5 C -17 -4 -11 -4.4 -4 -4.2 Z" fill="${C.light}" opacity=".6"/>`) +
        `<path d="M-16 13.6 C -17 3 -9 -5 3 -5 C 15 -5 19 3 17 10 C 16 13 8 14 -3 14 C -11 14 -16 13.6 -16 13.6 Z" fill="${C.coat}"/>` +
        `<path d="M-14 12 C -10 13.5 12 13.5 16 9.5 C 15 13 7 14 -3 14 C -10 14 -14 13.4 -14 12 Z" fill="${C.shade}" opacity=".5"/>` +
        `<ellipse cx="-2" cy="2" rx="12" ry="5.5" fill="${C.light}" opacity=".55"/>` +
        `<ellipse cx="12" cy="6" rx="6.5" ry="6" fill="${C.coat}"/>` +
        `<ellipse cx="13" cy="8" rx="3.5" ry="2.4" fill="${C.light}" opacity=".55"/>` +
        `<path d="M12.5 4.6 C 13.4 5.4 14.6 5.4 15.5 4.7" stroke="${C.eye}" stroke-width=".8" fill="none" stroke-linecap="round"/>` +
        `<ellipse cx="17.6" cy="6.4" rx="1.2" ry="1" fill="${C.nose}" opacity=".85"/>`;
      return shadow(2, GY, 19, 0, 18) + g(scl(1, br, 0, GY), inner);
    }
    if (mid === 'hop' || mid === 'sprint') {
      const K = bound(t, mid === 'sprint');
      if (mid === 'sprint') { K.earA = -26; K.earSoft = -8 + 3 * osc(t, 1, .3); }
      K.ticks = groundTicks(t, { y: GY, x1: -37, x2: 42, v: mid === 'sprint' ? 66 : 40, n: 7, s: 1.15 });
      return draw(K);
    }
    if (mid === 'alert') {
      const K = keys(t, [
        [0.00, { sy: 1, sx: 1, earA: 0 }],
        [0.08, { sy: 1.14, sx: 0.93, earA: -9 }],
        [0.12, { sy: 1.1, sx: 0.95, earA: -7 }],
        [0.74, { sy: 1.1, sx: 0.95, earA: -7 }],
        [0.86, { sy: 1, sx: 1, earA: 0 }],
        [1.00, { sy: 1, sx: 1, earA: 0 }]
      ]);
      K.earSoft = 6 * pulse(t, .3, .4) - 6 * pulse(t, .52, .62);
      K.noseA = 10 * Math.sin(TAU * t * 16) * (pulse(t, .2, .44) + pulse(t, .6, .8));
      K.blink = pulse(t, .48, .51);
      return draw(K);
    }
    if (mid === 'groom') {
      const wash = pulse(t, .12, .46) + pulse(t, .56, .88);
      return draw({
        pitch: 8 * wash, sy: 1 - 0.04 * wash, sx: 1 + 0.02 * wash,
        pawA: wash * 24 * Math.sin(TAU * t * 10),
        earA: 9 * wash, earSoft: 7 * wash,
        blink: wash > 0.6 ? 1 : 0,
        noseA: 0
      });
    }
    // sit & sniff
    const sniff = pulse(t, .08, .3) + pulse(t, .48, .64) + pulse(t, .8, .94);
    return draw({
      sy: 1 + 0.015 * osc(t, 3), sx: 1 - 0.008 * osc(t, 3),
      noseA: 11 * Math.sin(TAU * t * 18) * sniff,
      earA: 5 * pulse(t, .34, .46) - 5 * pulse(t, .68, .8),
      earSoft: 3 * pulse(t, .36, .48),
      blink: pulse(t, .55, .585)
    });
  }
};

})();
__REG["bear"] = (function(){
// Brown Bear — fable style
const C = { fur: '#7A5A42', dark: '#6E4F39', light: '#8F6B4C', muzzle: '#C9B291', nose: '#3A2E2A', paw: '#4E382A', eye: '#2A2326' };
const GY = 19;

const LEGS = {
  fh: [-8.2, 8, 'M-10 8 L-6.4 8 L-6.9 17 L-9.5 17 Z', -8.2, 17.3, C.dark],
  ff: [5.8, 8, 'M4 8 L7.6 8 L7.1 17 L4.5 17 Z', 5.8, 17.3, C.dark],
  nh: [-10.2, 8.5, 'M-12 8.5 L-8.4 8.5 L-8.9 17.4 L-11.5 17.4 Z', -10.2, 17.7, C.fur],
  nf: [8.2, 8.5, 'M6.4 8.5 L10 8.5 L9.5 17.4 L6.9 17.4 Z', 8.2, 17.7, C.fur]
};
const leg = (k, a) => {
  const [px, py, d, fx, fy, col] = LEGS[k];
  return g(rot(a, px, py), `<path d="${d}" fill="${col}"/><ellipse cx="${fx}" cy="${fy}" rx="2.6" ry="1.3" fill="${C.paw}"/>`);
};

// P: headA, earA, blink, jawOpen
function head(P) {
  const eyes = (P.blink || 0) > 0.5
    ? `<path d="M7.4 -7.5 L9.6 -7.5 M12.4 -8 L14.6 -8" stroke="${C.eye}" stroke-width=".8" fill="none" stroke-linecap="round"/>`
    : `<circle cx="8.5" cy="-7.5" r="1.4" fill="${C.eye}"/><circle cx="13.5" cy="-8" r="1.4" fill="${C.eye}"/>` +
      `<circle cx="9" cy="-8" r=".4" fill="#fff"/><circle cx="14" cy="-8.5" r=".4" fill="#fff"/>`;
  return g(rot(P.headA || 0, 10, -6),
    g(rot(-6 * (P.earA || 0), 5.5, -13), `<circle cx="5.5" cy="-13" r="3.2" fill="${C.fur}"/><circle cx="5.5" cy="-13" r="1.6" fill="${C.light}"/>`) +
    `<circle cx="16.5" cy="-12.5" r="3.2" fill="${C.fur}"/><circle cx="16.5" cy="-12.5" r="1.6" fill="${C.light}"/>` +
    `<circle cx="11" cy="-6" r="8.5" fill="${C.fur}"/>` +
    `<ellipse cx="14" cy="-3" rx="5" ry="4" fill="${C.muzzle}"/>` +
    `<ellipse cx="15.5" cy="-3.5" rx="1.6" ry="1.2" fill="${C.nose}"/>` +
    (P.jaw ? `<path d="M13.2 -0.8 q1.6 ${N(1.2 * P.jaw)} 3.2 0" stroke="${C.nose}" stroke-width=".9" fill="none" stroke-linecap="round"/>` : '') +
    eyes);
}

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  s += shadow(dx - 1, GY, 17, Math.max(0, -dy));
  const L = P.legs || { ff: 0, fh: 0, nf: 0, nh: 0 };
  const inner =
    leg('fh', L.fh) + leg('ff', L.ff) + leg('nh', L.nh) + leg('nf', L.nf) +
    `<ellipse cx="-1" cy="4" rx="14" ry="10" fill="${C.fur}"/>` +
    `<ellipse cx="-1" cy="6.5" rx="9.5" ry="6.5" fill="${C.light}" opacity=".7"/>` +
    head(P);
  return s + g(trl(dx, dy) + ' ' + scl(P.sx ?? 1, P.sy ?? 1, 0, GY) + ' ' + rot(P.pitch || 0, -2, 6), inner);
}

const gaitLegs = (t, offs, amp) => ({
  ff: amp * osc(t - offs.ff), fh: amp * osc(t - offs.fh),
  nf: amp * osc(t - offs.nf), nh: amp * osc(t - offs.nh)
});

return {
  id: 'bear', view: [-42, -40, 88, 64], groundY: GY,
  thumb: { m: 'amble', t: 0.1 },
  motions: [
    { id: 'amble', label: 'Amble', short: 'Amble', dur: 1.7, env: { t: 'ground' }, speed: '~5 km/h', beat: 'Pacing amble · rolling',
      desc: 'The bear\u2019s travelling gait is a pace — both legs of one side swinging near-together, so the whole body rolls like a barrel afloat.',
      anim: 'Same-side legs move as loose pairs and the weight sways side to side; sell it with a slow roll and a heavy, late head-bob.' },
    { id: 'sniff', label: 'Stand & sniff', short: 'Sniff', dur: 4.2, env: { t: 'ground' }, speed: '0 km/h', beat: 'Nose up · slow sweeps',
      desc: 'A bear reads the valley by nose: muzzle raised and swinging in slow arcs, tasting the air a kilometre downwind.',
      anim: 'The head sweeps are slow and weighted, with a hold at each end of the arc. One ear flick per sweep keeps the mass alive.' },
    { id: 'rear', label: 'Rear up', short: 'Rear up', dur: 4.4, env: { t: 'ground' }, speed: '0 km/h', beat: 'Rise → survey → drop',
      desc: 'Rising onto the hind feet is not a threat but a lookout: two metres of bear, forepaws hanging, reading the horizon.',
      anim: 'Take four frames to gather back onto the haunches, then rise in one push with a small overshoot. The drop is faster than the rise.' }
    ,{ id: 'sleep', label: 'Sleep', short: 'Sleep', dur: 7, env: { t: 'ground' }, night: false, speed: '0 km/h', beat: 'Deep rest · heavy breath',
      desc: 'Flat out in the leaf-litter, chin on the forepaws, the whole mountain of it rising and falling with each slow breath.',
      anim: 'Everything is weight and stillness — let one deep breath swell the flank, and hold the muzzle heavy on the paws.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'sleep') {
      const br = 1 + 0.02 * Math.sin(TAU * t);
      const inner =
        `<ellipse cx="-6" cy="9" rx="18" ry="9" fill="${C.fur}"/>` +
        `<ellipse cx="-9" cy="11" rx="10" ry="5.5" fill="${C.light}" opacity=".5"/>` +
        `<path d="M8 15.5 C 8 12 12 11 16 11 C 20 11 22 12.5 22 15 C 22 16.5 20 17 16 17 C 12 17 8 17 8 15.5 Z" fill="${C.paw}"/>` +
        `<path d="M12 12.6 C 12 11 13.5 10.5 15.5 10.5 C 18 10.5 19.5 11.3 19.5 12.9 C 19.5 13.7 18 14 15.5 14 C 13.5 14 12 13.9 12 12.6 Z" fill="${C.dark}"/>` +
        `<ellipse cx="13" cy="7.5" rx="8" ry="6.6" fill="${C.fur}"/>` +
        `<circle cx="8" cy="1.6" r="3" fill="${C.fur}"/><circle cx="8" cy="1.6" r="1.5" fill="${C.light}"/>` +
        `<circle cx="16.5" cy="1" r="3" fill="${C.fur}"/><circle cx="16.5" cy="1" r="1.5" fill="${C.light}"/>` +
        `<ellipse cx="18.5" cy="10" rx="5" ry="3.6" fill="${C.muzzle}"/>` +
        `<ellipse cx="22" cy="10" rx="1.5" ry="1.1" fill="${C.nose}"/>` +
        `<path d="M11 6.6 C 12 7.4 13.4 7.4 14.4 6.6" stroke="${C.eye}" stroke-width=".9" fill="none" stroke-linecap="round"/>`;
      return shadow(-2, GY, 21, 0) + g(scl(1, br, 0, GY), inner);
    }
    if (mid === 'sniff') {
      const K = keys(t, [
        [0.00, { headA: 0 }], [0.12, { headA: -16 }], [0.30, { headA: -20 }],
        [0.46, { headA: -6 }], [0.62, { headA: -22 }], [0.82, { headA: -18 }], [1.00, { headA: 0 }]
      ]);
      K.headA += 1.6 * Math.sin(TAU * t * 9) * (pulse(t, .14, .34) + pulse(t, .58, .8));
      K.dy = -0.5 * Math.max(0, osc(t, 2, .1));
      K.earA = pulse(t, .38, .46) + pulse(t, .84, .92);
      K.blink = pulse(t, .5, .54);
      K.jaw = 0;
      return draw(K);
    }
    if (mid === 'rear') {
      const K = keys(t, [
        [0.00, { pitch: 0, headA: 0, lf: 0, dy: 0 }],
        [0.10, { pitch: 4, headA: 4, lf: 4, dy: 1 }],
        [0.20, { pitch: -46, headA: 34, lf: 38, dy: -3 }],
        [0.26, { pitch: -41, headA: 31, lf: 34, dy: -2.6 }],
        [0.62, { pitch: -42, headA: 32, lf: 35, dy: -2.6 }],
        [0.74, { pitch: 0, headA: -2, lf: 2, dy: 0.6 }],
        [0.80, { pitch: 0, headA: 0, lf: 0, dy: 0 }],
        [1.00, { pitch: 0, headA: 0, lf: 0, dy: 0 }]
      ]);
      const up = Math.min(1, Math.max(0, -K.pitch / 42));
      K.legs = { ff: K.lf, nf: K.lf * 0.85, fh: -K.pitch * 0.9, nh: -K.pitch * 0.9 };
      K.headA += 1.2 * osc(t, 5, .2) * up;
      K.blink = pulse(t, .44, .48);
      return draw(K);
    }
    // amble — pacing: same-side pairs nearly together
    return draw({
      dy: laneDy(-0.8 * osc(t, 2, .12)), pitch: lanePitch(1.4 * osc(t, 1, .3)),
      legs: gaitLegs(t, { nh: 0, nf: .16, fh: .5, ff: .66 }, 13),
      headA: 3 * osc(t, 1, .45), earA: 0,
      blink: pulse(t, .7, .73),
      ticks: groundTicks(t, { y: GY, x1: -39, x2: 42, v: 26, n: 7, s: 1.2 })
    });
  }
};

})();
__REG["boar"] = (function(){
// Wild Boar — fable style (rebuilt silhouette)
const C = { hide: '#5E5148', dark: '#4A4038', bristle: '#3A322B', light: '#8A7A6C', legN: '#4A4038', legF: '#39312A', hoof: '#28211C', snout: '#9C8878', snoutD: '#3A2E2A', tusk: '#EFE6D0', eye: '#2A2326' };
const GY = 16.2;

const LEGS = {
  ff: [7.2, 7, 'M5.8 3 L8.8 3 L8.3 14.6 L6.5 14.6 Z', 7.4, 14.8, C.legF],
  fh: [-8.8, 7, 'M-10.3 3 L-7.3 3 L-7.8 14.6 L-9.6 14.6 Z', -8.7, 14.8, C.legF],
  nf: [10, 6.5, 'M8.5 4.5 L11.7 4.5 L11.1 15 L9.2 15 Z', 10.1, 15.2, C.legN],
  nh: [-6, 6.5, 'M-7.5 3 L-4.3 3 L-4.9 15 L-6.8 15 Z', -5.9, 15.2, C.legN]
};
const leg = (k, a) => {
  const [px, py, d, fx, fy, col] = LEGS[k];
  return g(rot(a, px, py), `<path d="${d}" fill="${col}"/><ellipse cx="${fx}" cy="${fy}" rx="1.8" ry="1.05" fill="${C.hoof}"/>`);
};

// P: headA, earA, blink
function head(P) {
  const eye = (P.blink || 0) > 0.5
    ? `<path d="M13.5 -3 L15.7 -3" stroke="${C.eye}" stroke-width=".8" fill="none" stroke-linecap="round"/>`
    : `<circle cx="14.6" cy="-3" r="1.35" fill="${C.eye}"/><circle cx="15.1" cy="-3.5" r=".42" fill="#fff"/>`;
  return g(rot(P.headA || 0, 9, -2),
    g(rot(-8 * (P.earA || 0), 9.2, -8),
      `<path d="M7.6 -6.3 L9.2 -13 C 11.5 -11.6 12.4 -9.1 11.8 -6.4 C 10.4 -5.7 8.9 -5.7 7.6 -6.3 Z" fill="${C.dark}"/>`) +
    `<path d="M7.5 -8 C 11.5 -9.6 16 -7.4 18.4 -4 C 20 -1.7 21.6 0.9 22.6 3.1 C 23.2 4.4 22.4 5.7 20.9 5.7 C 17.7 5.8 12.6 4.9 9.9 2.7 C 7.2 0.5 6.4 -3.6 7.5 -8 Z" fill="${C.hide}"/>` +
    `<path d="M9.9 2.7 C 12.6 4.9 17.7 5.8 20.9 5.7 C 18.6 6.4 14 6 11 4.4 C 9.6 3.6 8.5 2.3 8 0.9 C 8.5 1.6 9.2 2.2 9.9 2.7 Z" fill="${C.dark}" opacity=".55"/>` +
    `<path d="M9.2 -7.3 C 13 -8.5 16.8 -6.6 19 -3.3" stroke="${C.light}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".4"/>` +
    g(rot(10 * (P.earA || 0), 12.4, -8),
      `<path d="M10.8 -6.7 L13 -13.8 C 15.5 -12.1 16.4 -9.4 15.6 -6.4 C 13.9 -5.6 12.1 -5.7 10.8 -6.7 Z" fill="${C.hide}"/>` +
      `<path d="M11.8 -7.3 L13.3 -12 C 14.8 -10.7 15.2 -8.9 14.7 -7.1 C 13.6 -6.6 12.6 -6.7 11.8 -7.3 Z" fill="${C.bristle}" opacity=".55"/>`) +
    `<ellipse cx="21.8" cy="4.1" rx="1.75" ry="2.35" fill="${C.snout}" transform="rotate(22 21.8 4.1)"/>` +
    `<circle cx="21.5" cy="3.2" r=".55" fill="${C.snoutD}" opacity=".85"/><circle cx="22.2" cy="5" r=".55" fill="${C.snoutD}" opacity=".85"/>` +
    `<path d="M17.4 4.8 C 17 6.5 18 7.4 19.2 6.6 C 18.9 5.7 18.3 5.1 17.4 4.8 Z" fill="${C.tusk}"/>` +
    `<path d="M19.6 5.6 C 18.5 6 17.3 6 16.2 5.6" stroke="${C.snoutD}" stroke-width=".7" fill="none" stroke-linecap="round" opacity=".55"/>` +
    eye);
}

const tail = a => g(rot(a, -12.2, -1),
  `<path d="M-12.2 -1 C -14.8 -0.6 -16 1.6 -15.4 4.4" stroke="${C.dark}" stroke-width="1.3" fill="none" stroke-linecap="round"/>` +
  `<ellipse cx="-15.5" cy="5.3" rx="1.25" ry="1.85" fill="${C.bristle}" transform="rotate(14 -15.5 5.3)"/>`);

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.dirt) s += P.dirt;
  s += shadow(dx, GY, 16, Math.max(0, -dy));
  const L = P.legs || { ff: 0, fh: 0, nf: 0, nh: 0 };
  const inner =
    tail(P.tailA ?? 0) +
    leg('ff', L.ff) + leg('fh', L.fh) + leg('nf', L.nf) + leg('nh', L.nh) +
    `<path d="M8 -7.6 L8.6 -10.8 M5 -8.8 L5.4 -12 M1.8 -9.4 L2 -12.6 M-1.5 -9.5 L-1.8 -12.4 M-4.8 -9 L-5.2 -11.8 M-7.8 -8 L-8.3 -10.4 M-10.4 -6.4 L-11 -8.4" stroke="${C.bristle}" stroke-width="1.7" stroke-linecap="round"/>` +
    `<path d="M6.6 -8.3 L7 -10.9 M3.4 -9.2 L3.7 -11.9 M0.2 -9.6 L0.1 -12.1 M-3.2 -9.3 L-3.5 -11.7 M-6.4 -8.6 L-6.8 -10.7 M-9.2 -7.3 L-9.7 -9" stroke="${C.dark}" stroke-width="1.1" stroke-linecap="round"/>` +
    `<path d="M-12.8 2.5 C -13.6 -3.5 -9.5 -8.5 -3.5 -9.6 C 3 -10.7 9.5 -8.5 11.7 -3.5 C 13.2 0 12.8 4 10.5 6.5 C 6.5 9.8 -6 10.2 -11 7 C -12.4 6 -12.9 4.4 -12.8 2.5 Z" fill="${C.hide}"/>` +
    `<path d="M-11 7 C -6 10.2 6.5 9.8 10.5 6.5 C 11.2 5.7 11.8 4.8 12.1 3.8 C 6 7.4 -5.5 7.8 -11.8 4.8 C -11.7 5.6 -11.4 6.4 -11 7 Z" fill="${C.dark}" opacity=".55"/>` +
    `<path d="M1 -9.4 C 5.4 -9.7 9.3 -7.7 11.2 -4.4 C 9.2 -6.8 5.8 -8.3 2 -8.4 C 0.4 -8.4 -1.2 -8.2 -2.7 -7.8 C -1.5 -8.7 -0.3 -9.3 1 -9.4 Z" fill="${C.light}" opacity=".35"/>` +
    head(P);
  return s + g(trl(dx, dy) + ' ' + scl(P.sx ?? 1, P.sy ?? 1, 0, GY) + ' ' + rot(P.pitch || 0, 0, 2), inner);
}

const gaitLegs = (t, offs, amp) => ({
  ff: amp * osc(t - offs.ff), fh: amp * osc(t - offs.fh),
  nf: amp * osc(t - offs.nf), nh: amp * osc(t - offs.nh)
});

return {
  id: 'boar', view: [-42, -34, 86, 58], groundY: GY,
  thumb: { m: 'trot', t: 0.12 },
  motions: [
    { id: 'trot', label: 'Trot', short: 'Trot', dur: 0.9, env: { t: 'ground' }, speed: '~10 km/h', beat: '2-beat diagonal · busy',
      desc: 'The boar\u2019s default is a busy, head-down trot — short legs turning fast under a big keel of a body.',
      anim: 'Keep the strides short and the cadence high; the mass barely bobs. The head stays low, ploughing the air.' },
    { id: 'root', label: 'Root', short: 'Root', dur: 3.4, env: { t: 'ground' }, speed: '~0 km/h', beat: 'Plough · toss · plough',
      desc: 'Dinner is underground: the disc of the snout drives into the earth and levers up, turning turf like a spade.',
      anim: 'The push comes from the hind legs, through a stiff spine, into the nose. Add an upward toss every few seconds — soil should fly.' },
    { id: 'charge', label: 'Charge', short: 'Charge', dur: 0.55, env: { t: 'ground' }, speed: 'to 40 km/h', beat: '4-beat rush',
      desc: 'Provoked, the boar simply becomes a projectile: a flat-backed rush, astonishing for something built like a barrel.',
      anim: 'No majesty, all momentum — minimal vertical travel, maximum leg cadence, ears pinned along the skull.' }
    ,{ id: 'sleep', label: 'Sleep', short: 'Sleep', dur: 6.5, env: { t: 'ground' }, night: false, speed: '0 km/h', beat: 'Deep rest · heavy breath',
      desc: 'Collapsed on its side in the day-nest, legs loose, the bristled back a low ridge and the snout buried in the litter.',
      anim: 'A heavy, twitching sleep: mostly still, with the odd trotter-paddle or a shiver running down the bristles.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'sleep') {
      const br = 1 + 0.02 * Math.sin(TAU * t);
      const leg = 3 * pulse(t, .45, .5);
      const inner =
        g(rot(leg, -4, 10), `<path d="M-6 10 L-3 10 L-8 15.5 L-11 15 Z" fill="${C.legF}"/>`) +
        `<path d="M2 10 L5 10 L1 15.5 L-2 15 Z" fill="${C.legF}"/>` +
        `<ellipse cx="-2" cy="7" rx="17" ry="8" fill="${C.hide}"/>` +
        `<path d="M-17 8 C -10 12 12 12 17 6 C 16 11 8 12.5 -4 12.5 C -12 12.5 -17 10.5 -17 8 Z" fill="${C.dark}" opacity=".5"/>` +
        `<path d="M-14 0.5 L-14.6 -3 M-9 -1 L-9.4 -4.6 M-3 -1.6 L-3.2 -5.4 M3 -1.4 L3.2 -5 M9 -0.4 L9.6 -3.4" stroke="${C.bristle}" stroke-width="1.5" stroke-linecap="round"/>` +
        `<path d="M9 3 C 14 1.5 19 3 22 6.5 C 24 9 25 12 24 13.5 C 22.5 15 18 15 14 13.5 C 10 12 8 8 9 3 Z" fill="${C.hide}"/>` +
        `<ellipse cx="23" cy="12.5" rx="2" ry="2.6" fill="${C.snout}" transform="rotate(20 23 12.5)"/>` +
        `<circle cx="22.6" cy="11.6" r=".5" fill="${C.snoutD}" opacity=".85"/><circle cx="23.4" cy="13.4" r=".5" fill="${C.snoutD}" opacity=".85"/>` +
        `<path d="M10 1 L12 -5 C 14.5 -3.5 15.2 -0.8 14.2 2 C 12.6 2.6 11 2.2 10 1 Z" fill="${C.dark}"/>` +
        `<path d="M14.5 5.6 C 15.4 6.3 16.6 6.3 17.4 5.5" stroke="${C.eye}" stroke-width=".8" fill="none" stroke-linecap="round"/>`;
      return shadow(-2, GY, 19, 0) + g(scl(1, br, 0, GY), inner);
    }
    if (mid === 'root') {
      const K = keys(t, [
        [0.00, { headA: 8, dy: 0, pitch: 1 }],
        [0.10, { headA: 30, dy: 1, pitch: 4 }],
        [0.42, { headA: 32, dy: 1, pitch: 4 }],
        [0.50, { headA: 4, dy: -0.6, pitch: 0 }],
        [0.58, { headA: 28, dy: 0.8, pitch: 3.5 }],
        [0.88, { headA: 30, dy: 1, pitch: 4 }],
        [1.00, { headA: 8, dy: 0, pitch: 1 }]
      ]);
      const dig = pulse(t, .12, .42) + pulse(t, .6, .88);
      K.headA += 3 * Math.sin(TAU * t * 8) * dig;
      const toss = pulse(t, .46, .56);
      K.dirt = dig > 0.1 ? `<g fill="#8A7355" opacity="${N(.5 * dig)}"><circle cx="25" cy="${N(GY - 2)}" r="1"/><circle cx="28" cy="${N(GY - 1)}" r=".8"/><circle cx="23" cy="${N(GY - .6)}" r=".7"/></g>` : '';
      if (toss > 0.2) K.dirt += `<g fill="#8A7355" opacity="${N(.7 * toss)}"><circle cx="${N(24 + 3 * toss)}" cy="${N(GY - 6 - 6 * toss)}" r="1"/><circle cx="${N(27 + 2 * toss)}" cy="${N(GY - 4 - 8 * toss)}" r=".8"/></g>`;
      K.blink = dig > 0.6 ? 0.6 : 0;
      K.tailA = 8 * osc(t, 3, .2) * dig;
      return draw(K);
    }
    if (mid === 'charge') {
      return draw({
        dy: -1.6 * osc(t, 1, .1), pitch: 2.5 * osc(t, 1, .35),
        sx: 1 + .04 * osc(t, 1, .55), sy: 1 - .03 * osc(t, 1, .55),
        legs: gaitLegs(t, { nf: 0, ff: .12, nh: .5, fh: .62 }, 26),
        headA: 6 + 2 * osc(t, 1, .5), earA: -1,
        tailA: -10,
        ticks: groundTicks(t, { y: GY, x1: -39, x2: 41, v: 84, n: 7, s: 1.15 })
      });
    }
    // trot
    return draw({
      dy: -0.9 * osc(t, 2, .3), pitch: 1.2 * osc(t, 2, .1),
      legs: gaitLegs(t, { nf: 0, fh: 0, ff: .5, nh: .5 }, 17),
      headA: 4 + 1.5 * osc(t, 2, .5), earA: .3 * osc(t, 2, .3),
      tailA: 6 * osc(t, 2, .25),
      blink: pulse(t, .66, .69),
      ticks: groundTicks(t, { y: GY, x1: -39, x2: 41, v: 42, n: 7, s: 1.15 })
    });
  }
};

})();
__REG["cat"] = (function(){
// House Cat — fable style
const C = { fur: '#8E93A8', dark: '#767B90', stripe: '#6E7488', belly: '#C6CAD8', pink: '#E7B7BE', nose: '#E7A9B0', paw: '#5F6478', eye: '#2A2326' };
const GY = 18;

const LEGS = {
  fh: [-9, 8.4, 'M-10.4 3.5 L-7.6 3.5 L-8 16.8 L-10 16.8 Z', -9, 17, C.dark],
  ff: [7, 8.4, 'M5.6 3.5 L8.4 3.5 L8 16.8 L6 16.8 Z', 7, 17, C.dark],
  nh: [-7, 8, 'M-8.4 3.5 L-5.6 3.5 L-6 16.4 L-8 16.4 Z', -7, 16.6, C.fur],
  nf: [5, 8, 'M3.6 3.5 L6.4 3.5 L6 16.4 L4 16.4 Z', 5, 16.6, C.fur]
};
const leg = (k, a) => {
  const [px, py, d, fx, fy, col] = LEGS[k];
  return g(rot(a, px, py), `<path d="${d}" fill="${col}"/><ellipse cx="${fx}" cy="${fy}" rx="1.6" ry="1" fill="${C.paw}"/>`);
};

// Two-segment tail: base rooted deep in the rump (body paints over it), tip
// segment rotates about a rounded joint so the flick never opens a gap.
const tail = (a, tip) => g(rot(a, -11, 1.5),
  `<path d="M-7 4.8 C -12.4 4.4 -16.6 1.8 -17.82 -4.4 L-15.18 -4 C -14.5 -1.6 -12.6 0.3 -10.2 1.1 C -9.1 1.45 -8 1.68 -7 1.78 Z" fill="${C.fur}"/>` +
  g(rot(tip || 0, -16.5, -4.2),
    `<circle cx="-16.5" cy="-4.2" r="1.45" fill="${C.fur}"/>` +
    `<path d="M-17.8 -4.6 C -18.8 -6.3 -18.8 -8.1 -18 -9.5 C -17.6 -11.6 -15.4 -12 -14.9 -9.8 C -14.5 -7.9 -15.4 -5.9 -15.2 -4 Z" fill="${C.fur}"/>` +
    `<path d="M-17.9 -9.9 C -17.5 -11.5 -15.8 -11.8 -15.1 -10.4 C -15.5 -9.3 -16.9 -9 -17.9 -9.9 Z" fill="${C.dark}"/>`));

// P: headA, earA, blink
function head(P) {
  const eyes = (P.blink || 0) > 0.5
    ? `<path d="M8.1 -8.4 L10.5 -8.4 M13.5 -8.4 L15.9 -8.4" stroke="${C.eye}" stroke-width=".8" fill="none" stroke-linecap="round"/>`
    : `<circle cx="9.3" cy="-8.4" r="1.5" fill="${C.eye}"/><circle cx="14.7" cy="-8.4" r="1.5" fill="${C.eye}"/>` +
      `<circle cx="9.8" cy="-8.9" r=".5" fill="#fff"/><circle cx="15.2" cy="-8.9" r=".5" fill="#fff"/>`;
  return g(rot(P.headA || 0, 12, -1),
    g(rot(-14 * (P.earA || 0), 8.5, -13),
      `<path d="M6.1 -9 C 5.7 -13.6 6.1 -17.3 7 -19.5 C 9.5 -18.4 11.1 -15.7 11.3 -11.2 C 9.6 -11.6 7.8 -10.6 6.1 -9 Z" fill="${C.fur}"/>` +
      `<path d="M7 -12.2 C 6.8 -14.9 7.1 -16.9 7.7 -18.2 C 9.1 -17.3 10 -15.8 10.2 -13.6 C 9.1 -13.9 7.9 -13.5 7 -12.2 Z" fill="${C.pink}" opacity=".9"/>`) +
    `<path d="M17.9 -9 C 18.3 -13.6 17.9 -17.3 17 -19.5 C 14.5 -18.4 12.9 -15.7 12.7 -11.2 C 14.4 -11.6 16.2 -10.6 17.9 -9 Z" fill="${C.fur}"/>` +
    `<path d="M17 -12.2 C 17.2 -14.9 16.9 -16.9 16.3 -18.2 C 14.9 -17.3 14 -15.8 13.8 -13.6 C 14.9 -13.9 16.1 -13.5 17 -12.2 Z" fill="${C.pink}" opacity=".9"/>` +
    `<path d="M5.5 -6.5 C 5.5 -11.6 8.1 -14.6 12 -14.6 C 15.9 -14.6 18.5 -11.6 18.5 -6.5 C 18.5 -2.9 15.6 -0.4 12 -0.4 C 8.4 -0.4 5.5 -2.9 5.5 -6.5 Z" fill="${C.fur}"/>` +
    `<path d="M10.3 -14.2 C 10.6 -13.2 10.6 -12.3 10.3 -11.4 M12 -14.5 C 12.3 -13.4 12.3 -12.4 12 -11.4 M13.7 -14.2 C 14 -13.2 14 -12.3 13.7 -11.4" stroke="${C.stripe}" stroke-width="1" fill="none" stroke-linecap="round" opacity=".55"/>` +
    `<ellipse cx="12" cy="-4.3" rx="4" ry="2.9" fill="${C.belly}" opacity=".9"/>` +
    eyes +
    `<path d="M11.2 -5.5 L12.8 -5.5 L12 -4.4 Z" fill="${C.nose}"/>` +
    `<path d="M12 -4.4 C 12 -3.6 11.3 -3.2 10.6 -3.5 M12 -4.4 C 12 -3.6 12.7 -3.2 13.4 -3.5" stroke="${C.stripe}" stroke-width=".7" fill="none" stroke-linecap="round"/>` +
    `<path d="M6.6 -4.9 C 4.6 -4.7 3 -4.2 1.8 -3.6 M6.8 -3.5 C 5 -2.9 3.6 -2.3 2.6 -1.5 M17.4 -4.9 C 19.4 -4.7 21 -4.2 22.2 -3.6 M17.2 -3.5 C 19 -2.9 20.4 -2.3 21.4 -1.5" stroke="${C.stripe}" stroke-width=".6" fill="none" stroke-linecap="round" opacity=".7"/>`);
}

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  s += shadow(dx - 1, GY, 16, Math.max(0, -dy));
  const L = P.legs || { ff: 0, fh: 0, nf: 0, nh: 0 };
  const inner =
    tail(P.tailA ?? 0, P.tailTip) +
    leg('fh', L.fh) + leg('ff', L.ff) + leg('nh', L.nh) + leg('nf', L.nf) +
    `<path d="M-11 6.5 C -11 -1.5 -5.4 -6.2 1.6 -6.2 C 8.6 -6.2 12.4 -1.6 11.9 4 C 11.4 8.6 7 11.2 0.6 11.2 C -5.4 11.2 -11 10.2 -11 6.5 Z" fill="${C.fur}"/>` +
    `<ellipse cx="-1.5" cy="7.2" rx="7.6" ry="3.4" fill="${C.belly}" opacity=".8"/>` +
    `<path d="M-7.6 -4.6 C -6.9 -3 -6.9 -1.2 -7.6 0.4 M-3.2 -5.6 C -2.5 -3.8 -2.5 -2 -3.2 -0.4 M1.2 -5.7 C 1.9 -4.1 1.9 -2.5 1.2 -0.9" stroke="${C.stripe}" stroke-width="1.1" fill="none" stroke-linecap="round" opacity=".5"/>` +
    head(P);
  return s + g(trl(dx, dy) + ' ' + scl(P.sx ?? 1, P.sy ?? 1, 0, GY) + ' ' + rot(P.pitch || 0, -1, 4), inner);
}

const gaitLegs = (t, offs, amp) => ({
  ff: amp * osc(t - offs.ff), fh: amp * osc(t - offs.fh),
  nf: amp * osc(t - offs.nf), nh: amp * osc(t - offs.nh)
});

return {
  id: 'cat', view: [-42, -36, 86, 60], groundY: GY,
  thumb: { m: 'idle', t: 0.05 },
  motions: [
    { id: 'walk', label: 'Walk', short: 'Walk', dur: 1.2, env: { t: 'ground' }, speed: '~4 km/h', beat: '4-beat · silk-level',
      desc: 'The domestic panther walk: direct-registering, dead level, the tail carried as a slow question mark.',
      anim: 'The topline must not bob — pour the motion through the legs only. Let the raised tail-tip trace a lazy curve half a beat behind.' },
    { id: 'stretch', label: 'Stretch', short: 'Stretch', dur: 4.2, env: { t: 'ground' }, speed: '0 km/h', beat: 'Bow → quiver → fold',
      desc: 'The full ceremony: forepaws walked out, chest to the floor, rump aloft, one long shiver running nose to tail-tip.',
      anim: 'Ease into the bow over many frames and hold it with a fine quiver at the deepest point. The recovery is quick and offhand.' },
    { id: 'idle', label: 'Sit & tail-talk', short: 'Idle', dur: 4.6, env: { t: 'ground' }, speed: '0 km/h', beat: 'Still · tail 2/s bursts',
      desc: 'The body settles into stillness but the tail keeps thinking — soft flicks of the tip, one ear on every sound.',
      anim: 'Move the tail-tip and the ears on different beats, never together. A slow two-frame blink is the only face animation needed.' }
    ,{ id: 'sleep', label: 'Sleep', short: 'Sleep', dur: 6.5, env: { t: 'ground' }, night: true, speed: '0 km/h', beat: 'Deep rest · slow breath',
      desc: 'Wound into a perfect circle, tail curled up over the nose and the ears folded down — the hearth-cat’s deepest economy.',
      anim: 'The classic curl: breathe through the flank, lift the tail-tip once, and twitch an ear at some remembered mouse.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'sleep') {
      const br = 1 + 0.02 * Math.sin(TAU * t);
      const ear = 5 * pulse(t, .56, .6);
      const inner =
        `<path d="M-12 9 C -22 6 -21 -6 -6 -8 C 6 -9.5 15 -5 17 3 C 12 -2 1 -2.5 -7 -0.5 C -15 1.5 -16 7 -12 10 Z" fill="${C.dark}"/>` +
        `<ellipse cx="-1" cy="6" rx="14" ry="9.4" fill="${C.fur}"/>` +
        `<path d="M-11 11.5 C -14 7.5 -13 2 -10 -0.5 C -7 5 4 8 12 5.5 C 9 11.5 -5 14 -11 11.5 Z" fill="${C.belly}" opacity=".8"/>` +
        `<path d="M-7 -4 C -6 -1 -6 3 -8 6 M-2 -6 C -1 -3 -1 1 -3 4 M3 -6 C 4 -3.5 4 0.5 2 3.5" stroke="${C.stripe}" stroke-width=".9" fill="none" stroke-linecap="round" opacity=".45"/>` +
        g(rot(-ear, 8, -4),
          `<path d="M6.4 -3.6 C 5.2 -7.2 5.4 -9.8 6.6 -11 C 8 -9.6 9.1 -7.2 9.4 -4.2 Z" fill="${C.fur}"/>` +
          `<path d="M12.8 -3.8 C 13.4 -7 14.4 -9.2 16 -10.2 C 16.6 -8.2 16 -5.8 14.6 -3.8 Z" fill="${C.fur}"/>` +
          `<path d="M7.1 -4.8 C 6.7 -7 6.9 -8.6 7.6 -9.6 C 8.4 -8.4 8.8 -6.8 8.9 -5.2 Z" fill="${C.pink}" opacity=".6"/>` +
          `<ellipse cx="10.8" cy="2.6" rx="7" ry="6.2" fill="${C.fur}"/>` +
          `<ellipse cx="9.4" cy="5" rx="4.4" ry="3" fill="${C.belly}" opacity=".85"/>` +
          `<path d="M8.4 1.8 C 9.3 2.7 10.6 2.7 11.5 1.9" stroke="${C.eye}" stroke-width=".75" fill="none" stroke-linecap="round"/>` +
          `<path d="M6.4 3.6 C 4.6 3.4 3 3.6 1.8 4.2" stroke="${C.stripe}" stroke-width=".5" fill="none" stroke-linecap="round" opacity=".6"/>`) +
        `<path d="M8.5 3.3 L10.3 3.3 L9.4 4.6 Z" fill="${C.nose}"/>` +
        `<path d="M17 3 C 19 5.5 18 9.5 14.6 11 C 14.4 7.5 15.4 4.8 16 2.8 Z" fill="${C.dark}"/>`;
      return shadow(-1, GY, 17, 0) + g(scl(1, br, 0, GY), inner);
    }
    if (mid === 'stretch') {
      const K = keys(t, [
        [0.00, { pitch: 0, dy: 0, lf: 0, lh: 0, headA: 0, tailA: 0, tailTip: 0 }],
        [0.16, { pitch: 13, dy: 1.6, lf: 34, lh: -8, headA: -16, tailA: 26, tailTip: 14 }],
        [0.26, { pitch: 15, dy: 2, lf: 40, lh: -10, headA: -20, tailA: 30, tailTip: 18 }],
        [0.58, { pitch: 15, dy: 2, lf: 40, lh: -10, headA: -20, tailA: 30, tailTip: 18 }],
        [0.72, { pitch: 0, dy: 0, lf: 2, lh: 0, headA: 2, tailA: 6, tailTip: 4 }],
        [0.84, { pitch: 0, dy: 0, lf: 0, lh: 0, headA: 0, tailA: 0, tailTip: 0 }],
        [1.00, { pitch: 0, dy: 0, lf: 0, lh: 0, headA: 0, tailA: 0, tailTip: 0 }]
      ]);
      const q = pulse(t, .3, .58);
      K.pitch += 0.7 * Math.sin(TAU * t * 12) * q;
      K.legs = { ff: K.lf, nf: K.lf * 0.92, fh: K.lh, nh: K.lh * 0.9 };
      K.blink = q > 0.5 ? 1 : 0;
      return draw(K);
    }
    if (mid === 'idle') {
      return draw({
        dy: -0.4 * Math.max(0, osc(t, 2, .05)),
        tailA: 4 * osc(t, 1, .3), tailTip: 22 * pulse(t, .18, .3) - 18 * pulse(t, .34, .46) + 16 * pulse(t, .7, .8),
        headA: 2.5 * pulse(t, .5, .62) - 2 * pulse(t, .84, .94),
        earA: pulse(t, .12, .2) + pulse(t, .56, .64),
        blink: pulse(t, .4, .47)
      });
    }
    // walk
    return draw({
      dy: -0.3 * osc(t, 2, .12), pitch: 0.4 * osc(t, 2, .4),
      legs: gaitLegs(t, { nh: 0, nf: .25, fh: .5, ff: .75 }, 13),
      headA: 1.2 * osc(t, 2, .55),
      tailA: 6 + 3 * osc(t, 1, .3), tailTip: 10 * osc(t, 1, .55),
      blink: pulse(t, .7, .73),
      ticks: groundTicks(t, { y: GY, x1: -39, x2: 41, v: 26, n: 7, s: 1.1 })
    });
  }
};

})();
__REG["dog"] = (function(){
// Farm Dog — fable style
const C = { fur: '#D9A968', dark: '#C08B4A', deep: '#B37C3E', belly: '#F0E3CC', paw: '#96662F', tongue: '#E7899B', tongueD: '#C96A7E', nose: '#3A2E2A', eye: '#2A2326' };
const GY = 17;

const LEGS = {
  fh: [-8.5, 7, 'M-9.9 2.5 L-7.1 2.5 L-7.5 15.4 L-9.5 15.4 Z', -8.5, 15.6, C.deep],
  ff: [6.5, 7, 'M5.1 2.5 L7.9 2.5 L7.5 15.4 L5.5 15.4 Z', 6.5, 15.6, C.deep],
  nh: [-6.3, 7.4, 'M-7.7 2.5 L-4.9 2.5 L-5.3 15.8 L-7.3 15.8 Z', -6.3, 16, C.fur],
  nf: [8.7, 7.4, 'M7.3 2.5 L10.1 2.5 L9.7 15.8 L7.7 15.8 Z', 8.7, 16, C.fur]
};
const leg = (k, a) => {
  const [px, py, d, fx, fy, col] = LEGS[k];
  return g(rot(a, px, py), `<path d="${d}" fill="${col}"/><ellipse cx="${fx}" cy="${fy}" rx="1.6" ry="1" fill="${C.paw}"/>`);
};

const tail = a => g(rot(a, -10.5, 0.5),
  `<path d="M-10.2 1.2 C -14.8 0 -17.6 -3.6 -17 -8.4 C -14.7 -8.9 -12 -6.6 -11 -3.2 C -10.5 -1.7 -10.2 -0.2 -10.2 1.2 Z" fill="${C.dark}"/>` +
  `<path d="M-16.2 -7.6 C -14.4 -7.4 -12.6 -5.4 -11.9 -2.6 C -11.6 -1.4 -11.4 -0.2 -11.5 0.8 C -14.8 -0.4 -16.8 -3.6 -16.2 -7.6 Z" fill="${C.fur}" opacity=".6"/>`);

// P: headA, earA, blink, tongueS (0..1 pant)
function head(P) {
  const eyes = (P.blink || 0) > 0.5
    ? `<path d="M8.2 -9.6 L10.6 -9.6 M13.4 -9.6 L15.8 -9.6" stroke="${C.eye}" stroke-width=".8" fill="none" stroke-linecap="round"/>`
    : `<circle cx="9.4" cy="-9.6" r="1.5" fill="${C.eye}"/><circle cx="14.6" cy="-9.6" r="1.5" fill="${C.eye}"/>` +
      `<circle cx="9.9" cy="-10.1" r=".5" fill="#fff"/><circle cx="15.1" cy="-10.1" r=".5" fill="#fff"/>`;
  const ts = P.tongueS ?? 1;
  return g(rot(P.headA || 0, 12, -1),
    `<path d="M5 -7 C 5 -12.6 8 -15.6 12 -15.6 C 16 -15.6 19 -12.6 19 -7 C 19 -3.2 16.1 -0.6 12 -0.6 C 7.9 -0.6 5 -3.2 5 -7 Z" fill="${C.fur}"/>` +
    `<path d="M11.1 -15.5 C 11.4 -13 11.4 -10.6 11.2 -8.4 L12.8 -8.4 C 12.6 -10.6 12.6 -13 12.9 -15.5 C 12.3 -15.6 11.7 -15.6 11.1 -15.5 Z" fill="${C.belly}" opacity=".5"/>` +
    `<path d="M12 -0.8 C 9.5 -0.8 7.7 -2.3 7.7 -4.5 C 7.7 -6.5 9.6 -7.9 12 -7.9 C 14.4 -7.9 16.3 -6.5 16.3 -4.5 C 16.3 -2.3 14.5 -0.8 12 -0.8 Z" fill="${C.belly}"/>` +
    g(scl(1, ts, 13.5, -3.3) + ' ' + rot(-6, 13.5, -3.3),
      `<path d="M12.5 -3.5 C 12.2 -1.7 12.6 -0.1 13.7 0.6 C 14.8 0.1 15.3 -1.5 15.1 -3.4 C 14.2 -3.9 13.3 -3.9 12.5 -3.5 Z" fill="${C.tongue}"/>` +
      `<path d="M13.8 -2.9 C 13.8 -1.9 13.8 -0.9 13.8 -0.1" stroke="${C.tongueD}" stroke-width=".6" fill="none" stroke-linecap="round"/>`) +
    `<ellipse cx="12" cy="-5.9" rx="1.9" ry="1.5" fill="${C.nose}"/>` +
    `<circle cx="11.4" cy="-6.4" r=".5" fill="#fff" opacity=".8"/>` +
    `<path d="M12 -4.5 C 12 -3.7 11.2 -3.3 10.4 -3.6 M12 -4.5 C 12 -3.7 12.8 -3.3 13.6 -3.6" stroke="${C.paw}" stroke-width=".6" fill="none" stroke-linecap="round" opacity=".8"/>` +
    eyes +
    `<path d="M8.2 -12.1 L10.2 -12.5 M13.8 -12.5 L15.8 -12.1" stroke="${C.deep}" stroke-width=".9" fill="none" stroke-linecap="round" opacity=".8"/>` +
    g(rot(P.earA || 0, 7.9, -14.6),
      `<path d="M8 -15.4 C 4.8 -16 2.9 -13.7 3.1 -10.3 C 3.3 -7.4 4.7 -5.1 6.5 -5.2 C 7.9 -5.3 8.7 -7.2 8.7 -10.1 C 8.7 -12.1 8.5 -14 8 -15.4 Z" fill="${C.deep}"/>` +
      `<path d="M7.6 -14.4 C 6 -14.9 4.7 -14 4.2 -12.4" stroke="${C.dark}" stroke-width=".8" fill="none" stroke-linecap="round" opacity=".9"/>`) +
    g(rot(-(P.earA || 0) * 0.7, 16.1, -14.6),
      `<path d="M16 -15.4 C 19.2 -16 21.1 -13.7 20.9 -10.3 C 20.7 -7.4 19.3 -5.1 17.5 -5.2 C 16.1 -5.3 15.3 -7.2 15.3 -10.1 C 15.3 -12.1 15.5 -14 16 -15.4 Z" fill="${C.dark}"/>`));
}

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  s += shadow(dx - 1, GY, 16, Math.max(0, -dy));
  const L = P.legs || { ff: 0, fh: 0, nf: 0, nh: 0 };
  const inner =
    tail(P.tailA ?? 0) +
    leg('fh', L.fh) + leg('ff', L.ff) + leg('nh', L.nh) + leg('nf', L.nf) +
    `<path d="M-11.5 6 C -11.5 -2 -5.6 -6.6 1.6 -6.6 C 9 -6.6 12.6 -1.8 12.1 3.8 C 11.6 8.4 7.2 11 0.6 11 C -5.8 11 -11.5 10 -11.5 6 Z" fill="${C.fur}"/>` +
    `<path d="M-10.4 -1.2 C -5.8 -5.6 2 -6.8 7.8 -4.6 C 2.2 -5.6 -5 -4.2 -9.8 0.4 Z" fill="${C.dark}" opacity=".5"/>` +
    `<ellipse cx="-0.5" cy="6.8" rx="8" ry="3.6" fill="${C.belly}" opacity=".85"/>` +
    head(P);
  return s + g(trl(dx, dy) + ' ' + scl(P.sx ?? 1, P.sy ?? 1, 0, GY) + ' ' + rot(P.pitch || 0, -1, 3) + (P.rock ? ' ' + rot(P.rock, -6, 14) : ''), inner);
}

const gaitLegs = (t, offs, amp) => ({
  ff: amp * osc(t - offs.ff), fh: amp * osc(t - offs.fh),
  nf: amp * osc(t - offs.nf), nh: amp * osc(t - offs.nh)
});

return {
  id: 'dog', view: [-42, -36, 88, 60], groundY: GY,
  thumb: { m: 'wag', t: 0.1 },
  motions: [
    { id: 'trot', label: 'Trot', short: 'Trot', dur: 0.85, env: { t: 'ground' }, speed: '~10 km/h', beat: '2-beat diagonal · jaunty',
      desc: 'The working gait of every good dog: diagonal pairs, ears bouncing, tail up like a flag over the whole enterprise.',
      anim: 'Give the trot more bounce than efficiency wants — ears and tail overshoot every beat. Happiness is secondary motion.' },
    { id: 'wag', label: 'Pant & wag', short: 'Wag', dur: 2.4, env: { t: 'ground' }, speed: '0 km/h', beat: 'Tail 4/s · tongue 3/s',
      desc: 'Standing by, fully delighted: tongue keeping time, the tail wagging hard enough to steer the hindquarters with it.',
      anim: 'The tail drives, the rump follows a frame later — never wag the tail alone. Tongue and tail on slightly different frequencies.' },
    { id: 'bow', label: 'Play-bow', short: 'Bow', dur: 3.6, env: { t: 'ground' }, speed: '0 km/h', beat: 'Bow → bounce → invite',
      desc: 'The universal invitation: chest slammed to the grass, rump high, tail helicoptering — universally understood as "again!".',
      anim: 'Hit the bow fast and hold it alive with tail circles and a bounce or two. The pop back up is half anticipation for the next one.' },
    { id: 'zoom', label: 'Zoomies', short: 'Zoomies', dur: 0.45, env: { t: 'ground' }, speed: 'inexplicable', beat: 'Full gallop · no reason',
      desc: 'The evening madness: a flat-out gallop in great circles, tail tucked, ears flat, powered entirely by joy.',
      anim: 'Push the gallop past sense — maximum stretch and fold, body low, a frame of full flight each stride. Comedy lives in commitment.' }
    ,{ id: 'sleep', label: 'Sleep', short: 'Sleep', dur: 6.5, env: { t: 'ground' }, night: true, speed: '0 km/h', beat: 'Deep rest · slow breath',
      desc: 'Curled on its side, nose tucked toward the tail and one soft ear folded over — chasing something, feet twitching, in its sleep.',
      anim: 'Rest the whole frame heavy on the ground; add a rare paw-paddle and one deep breath to keep the sleep alive.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'sleep') {
      const br = 1 + 0.02 * Math.sin(TAU * t);
      const inner =
        `<path d="M-13 8 C -23 5 -22 -7 -7 -9 C 5 -10.5 14 -6.5 16 1 C 11 -4 0 -4.5 -8 -2.5 C -16 -0.5 -17 6 -13 9 Z" fill="${C.dark}"/>` +
        `<ellipse cx="-1" cy="5.5" rx="14.5" ry="9.6" fill="${C.fur}"/>` +
        `<path d="M-11 11 C -14 7 -13 1.5 -10 -1 C -7 4.5 5 7.5 13 5 C 10 11 -5 13.5 -11 11 Z" fill="${C.belly}" opacity=".8"/>` +
        `<ellipse cx="11" cy="3.5" rx="7" ry="6.4" fill="${C.fur}"/>` +
        `<path d="M4.6 4 C 7.6 7.2 13.6 7.2 16.4 3.8 C 13.6 8.6 6.8 8.6 4.6 4.6 Z" fill="${C.belly}"/>` +
        `<ellipse cx="4.9" cy="6" rx="1.7" ry="1.2" fill="${C.nose}"/>` +
        `<path d="M8.6 1.9 C 9.6 2.8 11 2.8 12 2" stroke="${C.eye}" stroke-width=".75" fill="none" stroke-linecap="round"/>` +
        `<path d="M11.5 -3.4 C 15.5 -3.8 18 -1 17.4 3.2 C 17 6 15.2 7.4 13.6 6.4 C 14 3.4 13 0.2 11 -1.4 C 10.8 -2.2 11 -3 11.5 -3.4 Z" fill="${C.deep}"/>` +
        `<path d="M12.4 -2.4 C 15.4 -2.7 17.2 -0.4 16.8 3.2 C 15.2 2 13.6 -0.2 12.2 -1.6 Z" fill="${C.dark}" opacity=".55"/>`;
      return shadow(-1, GY, 18, 0) + g(scl(1, br, 0, GY), inner);
    }
    if (mid === 'wag') {
      const wag = osc(t, 4, 0);
      return draw({
        dy: -0.4 * Math.max(0, osc(t, 2, .1)),
        rock: 2.2 * wag,
        tailA: 22 * wag,
        headA: 2 * osc(t, 1, .3),
        tongueS: 0.85 + 0.25 * Math.abs(osc(t, 6, .1)),
        earA: 3 * osc(t, 4, .12),
        blink: pulse(t, .55, .59)
      });
    }
    if (mid === 'bow') {
      const K = keys(t, [
        [0.00, { pitch: 0, dy: 0, lf: 0, lh: 0, headA: 0, tailA: 0 }],
        [0.10, { pitch: 14, dy: 1.8, lf: 38, lh: -8, headA: -14, tailA: 24 }],
        [0.62, { pitch: 14, dy: 1.8, lf: 38, lh: -8, headA: -14, tailA: 24 }],
        [0.72, { pitch: 2, dy: -1.5, lf: 6, lh: 0, headA: 2, tailA: 12 }],
        [0.80, { pitch: 0, dy: 0, lf: 0, lh: 0, headA: 0, tailA: 6 }],
        [1.00, { pitch: 0, dy: 0, lf: 0, lh: 0, headA: 0, tailA: 0 }]
      ]);
      const hold = pulse(t, .12, .62);
      K.tailA += 16 * osc(t, 5, .2) * hold;
      K.dy += 0.6 * Math.sin(TAU * t * 6) * hold;
      K.legs = { ff: K.lf, nf: K.lf * 0.92, fh: K.lh, nh: K.lh * 0.9 };
      K.tongueS = 1;
      K.blink = 0;
      return draw(K);
    }
    if (mid === 'zoom') {
      return draw({
        dy: -2.6 * osc(t, 1, .08), pitch: 6 * osc(t, 1, .35),
        sx: 1 + .05 * osc(t, 1, .55), sy: 1 - .04 * osc(t, 1, .55),
        legs: gaitLegs(t, { nf: 0, ff: .12, nh: .5, fh: .62 }, 30),
        headA: 3 * osc(t, 1, .5), tailA: -18, earA: -4,
        tongueS: 1.15,
        ticks: groundTicks(t, { y: GY, x1: -39, x2: 42, v: 92, n: 7, s: 1.15 })
      });
    }
    // trot
    return draw({
      dy: -1.2 * osc(t, 2, .3), pitch: 1.3 * osc(t, 2, .1),
      legs: gaitLegs(t, { nf: 0, fh: 0, ff: .5, nh: .5 }, 19),
      headA: 1.6 * osc(t, 2, .5), tailA: 10 + 8 * osc(t, 2, .2),
      earA: 4 * osc(t, 2, .3), tongueS: 1,
      blink: pulse(t, .7, .73),
      ticks: groundTicks(t, { y: GY, x1: -39, x2: 42, v: 46, n: 7, s: 1.15 })
    });
  }
};

})();
__REG["hedgehog"] = (function(){
// Hedgehog — fable style
const C = { body: '#A6906F', spikeD: '#6E5844', spikeM: '#8B7358', face: '#E8D3B8', nose: '#3A2E2A', foot: '#6E5844', footB: '#5A4636', eye: '#2A2326' };
const GY = 11.2;

const SPIKES_D = 'M-14.2 5.0 L-18.4 4.5 L-14.5 3.1 L-18.4 1.8 L-14.3 1.2 L-17.8 -0.9 L-13.5 -0.6 L-16.4 -3.4 L-12.2 -2.3 L-14.5 -5.6 L-10.5 -3.8 L-12.0 -7.5 L-8.4 -5.0 L-9.0 -9.0 L-5.9 -5.8 L-5.8 -10.0 L-3.3 -6.4 L-2.3 -10.5 L-0.6 -6.5 L1.2 -10.4 L2.0 -6.3 L4.6 -9.8 L4.6 -5.6 L7.8 -8.7 L6.9 -4.7 L10.7 -7.1 L9.0 -3.4 L13.0 -5.1 L10.6 -1.9 L14.8 -2.8 L11.7 -0.2 L16.0 -0.2 L12.4 1.7 Z';
const SPIKES_M = 'M-12.9 3.2 L-16.2 2.3 L-13.0 1.3 L-15.9 -0.2 L-12.4 -0.5 L-14.9 -2.7 L-11.4 -2.3 L-13.2 -5.0 L-9.8 -3.8 L-10.9 -6.9 L-7.8 -5.0 L-8.2 -8.3 L-5.4 -5.9 L-5.0 -9.3 L-2.9 -6.4 L-1.7 -9.7 L-0.2 -6.5 L1.7 -9.5 L2.4 -6.2 L4.9 -8.8 L4.8 -5.4 L7.8 -7.5 L7.0 -4.3 L10.3 -5.8 L8.8 -2.9 L12.3 -3.7 L10.1 -1.3 L13.6 -1.3 L10.8 0.5 Z';

// P: faceT (0 out → 1 tucked), noseA, blink, legA, legB, legT (tuck)
function hog(P) {
  const ft = P.faceT || 0, lt = 1 - 0.85 * (P.legT || 0);
  const eye = (P.blink || 0) > 0.5
    ? `<path d="M11 -1.2 L13 -1.2" stroke="${C.eye}" stroke-width=".7" fill="none" stroke-linecap="round"/>`
    : `<circle cx="12" cy="-1.2" r="1.4" fill="${C.eye}"/><circle cx="12.5" cy="-1.7" r=".4" fill="#fff"/>`;
  const face = g(trl(-4.5 * ft, 3 * ft) + ' ' + rot(-24 * ft, 9, 4) + ' ' + scl(1 - 0.9 * ft, 1 - 0.9 * ft, 9, 3),
    `<path d="M8 4 C 12 4 18 2 20 -1 C 18 -2 14 -1 10 0 C 8 0.6 7.5 3 8 4 Z" fill="${C.face}"/>` +
    g(rot(P.noseA || 0, 13, 1), `<circle cx="19.4" cy="-1" r="1.5" fill="${C.nose}"/><circle cx="19" cy="-1.6" r=".4" fill="#fff" opacity=".7"/>`) +
    eye +
    `<path d="M8.5 -2.5 C 9.5 -4 11.5 -4 12.5 -2.8 C 11 -2.2 9.8 -2.2 8.5 -2.5 Z" fill="${C.spikeM}"/>`);
  return g(rot(P.legA || 0, -6, 7) + ' ' + scl(lt, lt, -6, 8), `<ellipse cx="-6" cy="9.6" rx="2.4" ry="1.6" fill="${C.foot}"/>`) +
    g(rot(P.legB || 0, 5, 7) + ' ' + scl(lt, lt, 5, 8), `<ellipse cx="5" cy="9.6" rx="2.4" ry="1.6" fill="${C.footB}"/>`) +
    `<ellipse cx="-1" cy="3" rx="13.5" ry="9" fill="${C.body}"/>` +
    `<path d="${SPIKES_D}" fill="${C.spikeD}"/>` +
    `<path d="${SPIKES_M}" fill="${C.spikeM}"/>` +
    face;
}

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  s += shadow(dx, GY, 15, Math.max(0, -dy), 10);
  return s + g(trl(dx, dy) + ' ' + rot(P.pitch || 0, 0, 4) + ' ' + scl(P.sx ?? 1, P.sy ?? 1, 0, GY), hog(P));
}

return {
  id: 'hedgehog', view: [-33, -24, 68, 42], groundY: GY,
  thumb: { m: 'trundle', t: 0.1 },
  motions: [
    { id: 'trundle', label: 'Trundle', short: 'Trundle', dur: 0.9, env: { t: 'ground' }, speed: '~3 km/h', beat: 'Busy feet · level pincushion',
      desc: 'The evening beat: a brisk, flat-footed bustle along the hedge-bottom, spines riding level like a thatched roof.',
      anim: 'All hurry happens below the skirt — quick little steps, almost no bob. The nose leads by half a body-length of intention.' },
    { id: 'sniff', label: 'Sniff', short: 'Sniff', dur: 3.4, env: { t: 'ground' }, speed: '0 km/h', beat: 'Nose up · read the air',
      desc: 'Progress pauses; the wet nose comes up and works the air in quick strokes, hunting beetles by smell alone.',
      anim: 'The nose-tip jitters at 5–6 per second in bursts; the face lifts and settles slowly underneath it. Eyes are an afterthought.' },
    { id: 'curl', label: 'Curl up', short: 'Curl', dur: 4, env: { t: 'ground' }, speed: '0 km/h', beat: 'Startle → ball → peek',
      desc: 'The famous trick: face and feet vanish in a blink and the animal becomes a problem no fox has solved.',
      anim: 'Tuck in two frames flat — the snap is the gag. Hold the ball absolutely still, then let the nose peek out first, suspicious.' }
    ,{ id: 'sleep', label: 'Sleep', short: 'Sleep', dur: 5.5, env: { t: 'ground' }, night: false, speed: '0 km/h', beat: 'Deep rest · slow breath',
      desc: 'Rolled into the tight spined ball and simply left there — the day spent as a problem no fox has ever solved.',
      anim: 'Hold the ball dead still; the only tell that it sleeps rather than hides is the slow, even swell of breath.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'sleep') {
      const br = 1 + 0.025 * Math.sin(TAU * t);
      return draw({ faceT: 1, legT: 1, sx: 1, sy: br, pitch: 0, blink: 1, noseA: 0 });
    }
    if (mid === 'sniff') {
      const sn = pulse(t, .1, .4) + pulse(t, .56, .86);
      return draw({
        pitch: -3 * sn,
        noseA: -8 * sn + 4 * Math.sin(TAU * t * 14) * sn,
        blink: pulse(t, .46, .52),
        dy: -0.3 * Math.max(0, osc(t, 2, .1))
      });
    }
    if (mid === 'curl') {
      const K = keys(t, [
        [0.00, { faceT: 0, legT: 0, sy: 1, pitch: 0 }],
        [0.10, { faceT: 0, legT: 0, sy: 1, pitch: -2 }],
        [0.16, { faceT: 1, legT: 1, sy: 1.06, pitch: 3 }],
        [0.60, { faceT: 1, legT: 1, sy: 1.06, pitch: 3 }],
        [0.70, { faceT: 0.45, legT: 0.6, sy: 1.03, pitch: 1.5 }],
        [0.78, { faceT: 0.5, legT: 0.6, sy: 1.03, pitch: 1.5 }],
        [0.88, { faceT: 0, legT: 0, sy: 1, pitch: 0 }],
        [1.00, { faceT: 0, legT: 0, sy: 1, pitch: 0 }]
      ]);
      K.pitch += 1.4 * osc(t, 4, .1) * pulse(t, .2, .58);
      K.noseA = -6 * pulse(t, .68, .82);
      K.blink = pulse(t, .08, .16);
      return draw(K);
    }
    // trundle
    return draw({
      dy: -0.5 * Math.abs(osc(t, 2, .05)),
      legA: 22 * osc(t, 2), legB: 22 * osc(t, 2, .5),
      noseA: 4 * osc(t, 2, .25),
      blink: pulse(t, .66, .7),
      ticks: groundTicks(t, { y: GY, x1: -30, x2: 33, v: 22, n: 7, s: .9 })
    });
  }
};

})();
__REG["mouse"] = (function(){
// Wood Mouse — fable style
const C = { fur: '#A89A93', belly: '#C9BDB6', foot: '#8A7C76', pink: '#E7B7BE', nose: '#E7A9B0', eye: '#2A2326', tail: '#C9A6A0' };
const GY = 9.6;

// P: tailA, earS, headUp (whole-body pitch handled outside), noseA, blink, legA, legB, whA
function mouse(P) {
  const eye = (P.blink || 0) > 0.5
    ? `<path d="M11.4 -0.5 L13.6 -0.5" stroke="${C.eye}" stroke-width=".7" fill="none" stroke-linecap="round"/>`
    : `<circle cx="12.5" cy="-0.5" r="1.3" fill="${C.eye}"/><circle cx="13" cy="-1" r=".4" fill="#fff"/>`;
  return g(rot(P.tailA || 0, -9, 4),
      `<path d="M-9 4 C -17 3 -23 6 -25 1 C -23 4 -17 2 -10 3 Z" fill="${C.tail}"/>`) +
    g(rot(P.legA || 0, -3, 7), `<ellipse cx="-3" cy="8.4" rx="2" ry="1.2" fill="${C.foot}"/>`) +
    g(rot(P.legB || 0, 4, 7), `<ellipse cx="4" cy="8.4" rx="2" ry="1.2" fill="${C.foot}"/>`) +
    `<ellipse cx="-2" cy="3" rx="11" ry="7.5" fill="${C.fur}"/>` +
    `<ellipse cx="-3" cy="5" rx="7" ry="4.5" fill="${C.belly}" opacity=".7"/>` +
    `<path d="M6 2 C 6 -3 10 -6 14 -4.5 C 18 -3 18.5 2 15 4 C 11 6 6 6 6 2 Z" fill="${C.fur}"/>` +
    g(rot(0, 8, -6) + ' ' + scl(P.earS ?? 1, P.earS ?? 1, 8, -4),
      `<circle cx="8" cy="-6" r="4.2" fill="${C.fur}"/><circle cx="8" cy="-5.6" r="2.6" fill="${C.pink}"/>`) +
    g(rot(P.noseA || 0, 16.5, -0.5), `<circle cx="16.5" cy="-0.5" r="1.1" fill="${C.nose}"/>`) +
    eye +
    g(rot(P.whA || 0, 15, 1.5),
      `<path d="M15 1 C 18 1.5 21 1 23 0" stroke="${C.foot}" stroke-width=".4" fill="none"/>` +
      `<path d="M15 2 C 18 3 21 3.5 23 3.5" stroke="${C.foot}" stroke-width=".4" fill="none"/>`);
}

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  s += shadow(dx - 2, GY, 13, Math.max(0, -dy), 10);
  return s + g(trl(dx, dy) + ' ' + rot(P.pitch || 0, -6, 9) + ' ' + scl(P.sx ?? 1, P.sy ?? 1, 0, GY), mouse(P));
}

return {
  id: 'mouse', view: [-33, -22, 68, 38], groundY: GY,
  thumb: { m: 'nibble', t: 0.3 },
  motions: [
    { id: 'scurry', label: 'Scurry', short: 'Scurry', dur: 0.5, env: { t: 'ground' }, speed: '~8 km/h', beat: 'Blur of feet · darting',
      desc: 'Mouse travel is a nervous blur close to the ground, the long tail streaming as ballast behind.',
      anim: 'Legs faster than the eye, body nearly level, and stop-start rhythm — a mouse moves in commas, never sentences.' },
    { id: 'nibble', label: 'Sit & nibble', short: 'Nibble', dur: 3, env: { t: 'ground' }, speed: '0 km/h', beat: 'Seed spun · 6/s jaw',
      desc: 'Sat up on its haunches with a seed in both hands, the jaw a tiny sewing machine, whiskers going all the while.',
      anim: 'Tip the body up and let the jaw jitter carry the shot; whiskers and ears answer at their own frequencies.' },
    { id: 'alert', label: 'Freeze & listen', short: 'Alert', dur: 3.4, env: { t: 'ground' }, speed: '0 km/h', beat: 'Freeze · ears up',
      desc: 'At the smallest sound everything stops mid-step — ears cupped wide, nose the only thing still moving.',
      anim: 'The freeze must be absolute; hold longer than comfortable. The nose-twitch during the freeze is what keeps it alive.' }
    ,{ id: 'sleep', label: 'Sleep', short: 'Sleep', dur: 5.5, env: { t: 'ground' }, night: false, speed: '0 km/h', beat: 'Deep rest · quick breath',
      desc: 'A thumb-sized ball in the grass-nest, nose to belly and the long tail wound right around like a drawn string.',
      anim: 'Everything tiny and still; a five-per-second whisker tremor in short bursts is the whole performance.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'sleep') {
      const br = 1 + 0.025 * Math.sin(TAU * t);
      const wh = 1.2 * Math.sin(TAU * t * 5) * pulse(t, .4, .72);
      const inner =
        `<path d="M-1 8.6 C -12 9 -17.5 3.5 -15 -2.5 C -12.8 -7.6 -5 -9.4 3 -8.6" stroke="${C.tail}" stroke-width="1.5" fill="none" stroke-linecap="round"/>` +
        `<ellipse cx="0" cy="3" rx="9" ry="6.6" fill="${C.fur}"/>` +
        `<path d="M-7 7.5 C -9 4.5 -8.5 0.5 -6.5 -1.5 C -4 3 4 4.5 8.5 2.5 C 6.5 7 -3 9 -7 7.5 Z" fill="${C.belly}" opacity=".8"/>` +
        `<circle cx="6.4" cy="-3.6" r="4" fill="${C.fur}"/>` +
        `<circle cx="6.6" cy="-3.3" r="2.4" fill="${C.pink}" opacity=".75"/>` +
        `<ellipse cx="7" cy="3" rx="5" ry="4.4" fill="${C.fur}"/>` +
        `<ellipse cx="10.6" cy="3.5" rx="1.1" ry=".9" fill="${C.nose}"/>` +
        `<path d="M5.9 1.7 C 6.6 2.4 7.6 2.4 8.3 1.8" stroke="${C.eye}" stroke-width=".6" fill="none" stroke-linecap="round"/>` +
        g(rot(wh, 10.6, 3.5), `<path d="M10.6 3 C 13 3.4 15.5 3.2 17 2.6 M10.6 4 C 13 5 15 5.2 16.6 5" stroke="${C.foot}" stroke-width=".35" fill="none"/>`);
      return shadow(-1, GY, 11.5, 0, 10) + g(scl(1, br, 0, GY), inner);
    }
    if (mid === 'nibble') {
      const nib = pulse(t, .08, .42) + pulse(t, .56, .9);
      return draw({
        pitch: -14 - 1.5 * Math.max(0, osc(t, 2, .1)),
        legB: 24, legA: 0,
        noseA: 9 * Math.sin(TAU * t * 15) * nib,
        whA: 5 * Math.sin(TAU * t * 12) * nib,
        tailA: 4 * osc(t, 1, .3),
        earS: 1 + 0.08 * pulse(t, .46, .54),
        blink: pulse(t, .48, .53)
      });
    }
    if (mid === 'alert') {
      const K = keys(t, [
        [0.00, { pitch: 0, earS: 1, tailA: 0 }],
        [0.08, { pitch: -20, earS: 1.18, tailA: 10 }],
        [0.12, { pitch: -17, earS: 1.14, tailA: 8 }],
        [0.72, { pitch: -17, earS: 1.14, tailA: 8 }],
        [0.84, { pitch: 0, earS: 1, tailA: 0 }],
        [1.00, { pitch: 0, earS: 1, tailA: 0 }]
      ]);
      K.noseA = 8 * Math.sin(TAU * t * 16) * (pulse(t, .2, .4) + pulse(t, .5, .68));
      K.whA = 4 * Math.sin(TAU * t * 13) * pulse(t, .2, .68);
      K.blink = pulse(t, .76, .8);
      return draw(K);
    }
    // scurry
    return draw({
      dy: -0.7 * Math.abs(osc(t, 2)), pitch: 1.5 * osc(t, 2, .3),
      legA: 26 * osc(t, 2), legB: 26 * osc(t, 2, .5),
      tailA: 6 * osc(t, 2, .2), whA: 3 * osc(t, 4),
      noseA: 5 * osc(t, 4, .2),
      ticks: groundTicks(t, { y: GY, x1: -30, x2: 33, v: 40, n: 7, s: .85 })
    });
  }
};

})();
__REG["owl"] = (function(){
// Tawny Owl — fable style
const C = { body: '#8A6E52', wing: '#755B43', disc: '#C9B291', face: '#F4ECE2', eye: '#2A2326', beak: '#E8943E' };
const GY = 16;

// spread wing for flight modes; side = -1 (left/far) or 1 (right/near)
const spreadWing = (side, a) => {
  const s = side;
  const d = `M${8 * s} -3 C ${15 * s} -8.5 ${24 * s} -9 ${29.5 * s} -5 C ${31.2 * s} -3.8 ${31 * s} -1.8 ${29 * s} -0.8 C ${26.6 * s} 0.4 ${24.6 * s} 2 ${22 * s} 2.9 C ${19.4 * s} 3.8 ${17 * s} 3.4 ${15 * s} 4.4 C ${11.6 * s} 6 ${9 * s} 5.2 ${7.2 * s} 2.6 Z`;
  return g(rot(a * s, 7 * s, -1),
    `<path d="${d}" fill="${C.wing}"/>` +
    `<path d="M${8 * s} -3 C ${15 * s} -8.5 ${24 * s} -9 ${29.5 * s} -5 C ${24 * s} -5.6 ${15 * s} -4.8 ${9 * s} -1.4 Z" fill="${C.body}"/>`);
};

// P: headA, headSx (turn), blink (0..1), wingA (folded shrug), flight {wingA}, sy
function owl(P) {
  const blink = P.blink || 0;
  const pupils = g(scl(1, 1 - 0.92 * Math.min(1, blink), 0, -3),
    `<circle cx="-4.3" cy="-3" r="2.5" fill="${C.eye}"/><circle cx="4.3" cy="-3" r="2.5" fill="${C.eye}"/>` +
    `<circle cx="-3.4" cy="-3.9" r=".8" fill="#fff"/><circle cx="5.2" cy="-3.9" r=".8" fill="#fff"/>`);
  const back = (P.bk || 0) >= 0.5;
  const face = back
    ? `<path d="M-6.5 -7 C -3 -9.5 3 -9.5 6.5 -7" stroke="${C.wing}" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".8"/>` +
      `<path d="M-5.5 -1.5 C -2.5 -3.5 2.5 -3.5 5.5 -1.5" stroke="${C.wing}" stroke-width="1.3" fill="none" stroke-linecap="round" opacity=".65"/>` +
      `<path d="M-4 3.5 C -1.8 2 1.8 2 4 3.5" stroke="${C.wing}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".5"/>`
    : `<path d="M-9 -3 C -9 -9 -4 -12 0 -12 C 4 -12 9 -9 9 -3 C 9 3 4 6 0 6 C -4 6 -9 3 -9 -3 Z" fill="${C.disc}"/>` +
      `<circle cx="-4.3" cy="-3" r="4.2" fill="${C.face}"/><circle cx="4.3" cy="-3" r="4.2" fill="${C.face}"/>` +
      pupils +
      `<path d="M0 -1 L2.2 1.6 C 1 2.6 -1 2.6 -2.2 1.6 Z" fill="${C.beak}"/>`;
  const head = g(rot(P.headA || 0, 0, -3) + ' ' + scl(P.headSx ?? 1, 1, 0, -3),
    `<circle cx="0" cy="-3" r="11" fill="${C.body}"/>` +
    `<path d="M-9 -8 C -11 -14 -9 -18 -6 -18 C -5 -14 -5 -11 -6 -8 Z" fill="${C.body}"/>` +
    `<path d="M9 -8 C 11 -14 9 -18 6 -18 C 5 -14 5 -11 6 -8 Z" fill="${C.body}"/>` +
    face);
  const wings = P.spread
    ? spreadWing(-1, P.wingA || 0) + spreadWing(1, P.wingA || 0)
    : g(rot(-(P.wingA || 0), -8.5, 0), `<path d="M-11 2 C -12 10 -9 14 -6 15 C -8 10 -8 4 -7 -2 C -9 -4 -10.5 -2 -11 2 Z" fill="${C.wing}"/>`) +
      g(rot(P.wingA || 0, 8.5, 0), `<path d="M11 2 C 12 10 9 14 6 15 C 8 10 8 4 7 -2 C 9 -4 10.5 -2 11 2 Z" fill="${C.wing}"/>`);
  const body =
    `<path d="M-11 2 C -12 12 -6 16 0 16 C 6 16 12 12 11 2 C 10 -6 6 -11 0 -11 C -6 -11 -10 -6 -11 2 Z" fill="${C.body}"/>` +
    `<path d="M0 4 C 3 4 5 7 5 10 C 5 13 3 15 0 15 C -3 15 -5 13 -5 10 C -5 7 -3 4 0 4 Z" fill="${C.disc}" opacity=".5"/>`;
  return g(scl(P.sx ?? 1, P.sy ?? 1, 0, GY) + ' ' + rot(P.pitch || 0, 0, 2),
    P.spread ? body + wings + head : body + wings + head);
}

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.grounded) s += shadow(dx, GY + 1.2, 11, 0, 20);
  return s + g(trl(dx, dy), owl(P));
}

return {
  id: 'owl', view: [-31, -27, 64, 50], groundY: GY,
  thumb: { m: 'perch', t: 0.02 },
  motions: [
    { id: 'perch', label: 'Perch', short: 'Perch', dur: 4.4, env: { t: 'branch', y: 16 }, speed: '0 km/h', beat: 'Idle · statue-still',
      desc: 'On the day-roost: a soft column of feathers against the bark, betrayed only by a slow blink and a shifted foot.',
      anim: 'An owl at rest is a held pose, not a loop. Blink slowly — lids meeting over two frames — and let whole seconds pass empty.' },
    { id: 'headturn', label: 'Head turn', short: 'Head turn', dur: 3.6, env: { t: 'branch', y: 16 }, speed: '0 km/h', beat: 'Swivel to 270°',
      desc: 'The body never moves; the head pans from forward watch to full over-the-shoulder, fourteen neck vertebrae doing the work.',
      anim: 'Snap each swivel in 3–4 frames with a tiny overshoot, then freeze absolutely. The eyes never lead — they are fixed in the skull.' },
    { id: 'flight', label: 'Flight', short: 'Flight', dur: 0.85, env: { t: 'air' }, speed: '~40 km/h', beat: 'Deep beats · silent',
      desc: 'Slow, deep wingbeats on broad rounded wings — fringed feathers swallowing the sound of every stroke.',
      anim: 'Fewer, deeper beats than feel natural: the whole wing wraps down and around. Let the body rise and sink a full head-height per beat.' },
    { id: 'glide', label: 'Glide', short: 'Glide', dur: 2.4, env: { t: 'air' }, speed: '~30 km/h', beat: 'Set wings · drift',
      desc: 'Between beats the owl simply sails: wings set, body rocking a degree or two on the air it cannot be heard crossing.',
      anim: 'Nothing is truly still — give the glide a slow one-degree roll and a breath of lift and sink, or it reads as a freeze-frame.' }
    ,{ id: 'sleep', label: 'Day-roost', short: 'Roost', dur: 6, env: { t: 'branch', y: 16 }, night: false, speed: '0 km/h', beat: 'Asleep by day · slow breath',
      desc: 'The night-hunter’s rest: pressed to the bark by daylight, feathers loosened into a soft column, the great eyes shut to thin closed crescents.',
      anim: 'A held pose, barely breathing. Loosen the outline into a fluffed ball and keep the lids down — let whole seconds pass with only a feather-settle.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'sleep') {
      const br = 1 + 0.02 * Math.sin(TAU * t);
      const set = 0.7 * pulse(t, .48, .58);
      const inner =
        `<path d="M-12 2 C -13 13 -6 17 0 17 C 6 17 13 13 12 2 C 11 -7 6 -12 0 -12 C -6 -12 -11 -7 -12 2 Z" fill="${C.body}"/>` +
        `<path d="M0 3 C 3.5 3 6 6.5 6 10 C 6 13.5 3.5 15.5 0 15.5 C -3.5 15.5 -6 13.5 -6 10 C -6 6.5 -3.5 3 0 3 Z" fill="${C.disc}" opacity=".5"/>` +
        `<path d="M-11 1 C -12.5 9 -10 14 -7 15.5 C -8.5 10 -8.5 3 -7.5 -3 C -9.5 -4 -10.8 -2 -11 1 Z" fill="${C.wing}"/>` +
        `<path d="M11 1 C 12.5 9 10 14 7 15.5 C 8.5 10 8.5 3 7.5 -3 C 9.5 -4 10.8 -2 11 1 Z" fill="${C.wing}"/>` +
        g(rot(set, 0, -4),
          `<circle cx="0" cy="-4" r="10.5" fill="${C.body}"/>` +
          `<path d="M-8.5 -8 C -10.5 -14 -8.5 -18 -5.5 -18 C -4.5 -14 -4.5 -11 -5.5 -8.5 Z" fill="${C.body}"/>` +
          `<path d="M8.5 -8 C 10.5 -14 8.5 -18 5.5 -18 C 4.5 -14 4.5 -11 5.5 -8.5 Z" fill="${C.body}"/>` +
          `<path d="M-8.5 -4 C -8.5 -9.5 -4 -12.5 0 -12.5 C 4 -12.5 8.5 -9.5 8.5 -4 C 8.5 1.5 4 4.5 0 4.5 C -4 4.5 -8.5 1.5 -8.5 -4 Z" fill="${C.disc}"/>` +
          `<path d="M-6.5 -4 C -5.2 -2.5 -2.8 -2.5 -1.5 -4" stroke="${C.eye}" stroke-width=".9" fill="none" stroke-linecap="round"/>` +
          `<path d="M1.5 -4 C 2.8 -2.5 5.2 -2.5 6.5 -4" stroke="${C.eye}" stroke-width=".9" fill="none" stroke-linecap="round"/>` +
          `<path d="M0 -1.5 L1.8 0.8 C 0.8 1.6 -0.8 1.6 -1.8 0.8 Z" fill="${C.beak}"/>`) +
        `<g stroke="${C.wing}" stroke-width="1.4" stroke-linecap="round"><path d="M-3 16.5 l0 2 M-1 16.6 l0 2 M2 16.6 l0 2 M4 16.5 l0 2"/></g>`;
      return g(scl(1, br, 0, GY), inner);
    }
    if (mid === 'headturn') {
      const K = keys(t, [
        [0.00, { headSx: 1, headA: 0, bk: 0 }],
        [0.14, { headSx: 1, headA: 0, bk: 0 }],
        [0.19, { headSx: 0.15, headA: 2, bk: 0 }],
        [0.21, { headSx: 0.2, headA: 2, bk: 1 }],
        [0.27, { headSx: 1, headA: -4, bk: 1 }],
        [0.50, { headSx: 1, headA: -6, bk: 1 }],
        [0.55, { headSx: 0.15, headA: -2, bk: 1 }],
        [0.57, { headSx: 0.2, headA: 0, bk: 0 }],
        [0.63, { headSx: 1, headA: 0, bk: 0 }],
        [0.75, { headSx: 1, headA: 3, bk: 0 }],
        [0.84, { headSx: 1, headA: 0, bk: 0 }],
        [1.00, { headSx: 1, headA: 0, bk: 0 }]
      ]);
      // never let the face collapse to zero width mid-swivel
      if (Math.abs(K.headSx) < 0.18) K.headSx = K.headSx < 0 ? -0.18 : 0.18;
      K.grounded = true;
      K.dy = -0.4 * Math.max(0, osc(t, 2));
      K.blink = pulse(t, .58, .66) + pulse(t, .06, .1);
      return draw(K);
    }
    if (mid === 'flight') {
      const flap = osc(t, 1, .25);
      return draw({
        spread: true, wingA: -26 * flap - 4,
        dy: -3.2 * osc(t, 1, .5), pitch: -6 + 2 * osc(t, 1, .6),
        sy: 1 - 0.03 * Math.abs(flap),
        blink: 0,
        ticks: airTicks(t, { x1: -28, x2: 30, y: -14, h: 16, v: 40, n: 4, s: 1.2 })
      });
    }
    if (mid === 'glide') {
      return draw({
        spread: true, wingA: -14 + 2.5 * osc(t, 3, .1),
        dy: -1.4 * osc(t, 1, .25), pitch: -4 + 1.5 * osc(t, 1, .5),
        blink: pulse(t, .62, .68),
        ticks: airTicks(t, { x1: -28, x2: 30, y: -14, h: 16, v: 26, n: 4, s: 1.2 })
      });
    }
    // perch
    return draw({
      grounded: true,
      dy: -0.5 * Math.max(0, osc(t, 2, .05)),
      headA: 2.5 * osc(t, 1, .3) + 3 * pulse(t, .72, .8),
      wingA: 1.5 * pulse(t, .3, .4),
      pitch: 1.6 * pulse(t, .56, .62),
      blink: pulse(t, .22, .3) + pulse(t, .48, .58)
    });
  }
};

})();
__REG["mallard"] = (function(){
// Mallard — fable style (from the duck)
const C = { body: '#F4F1EA', shade: '#DED7C7', bill: '#E8A33E', billD: '#D08F2E', eye: '#2A2E26', water: '#7FB6C9' };
const GY = 9.5;

// P: headA, tailA, billGap
function duck(P) {
  const tail = g(rot(P.tailA || 0, -13, 1.5),
    `<path d="M-13 2.2 C -16 0.2 -19 0.2 -20.6 2.2 C -18.6 3.8 -15.4 3.8 -12.8 3 Z" fill="${C.body}"/>` +
    `<path d="M-12.8 3 C -15.4 3.8 -18.6 3.8 -20.6 2.2 C -18.2 4.4 -14.8 4.5 -12.6 3.6 Z" fill="${C.shade}"/>`);
  const head = g(rot(P.headA || 0, 11, -6),
    `<circle cx="11" cy="-8.5" r="6.2" fill="${C.body}"/>` +
    `<path d="M11 -2.6 C 14.5 -3 16.8 -5 17 -8 C 17 -5 15.5 -3.2 11 -2.6 Z" fill="${C.shade}"/>` +
    `<circle cx="9.4" cy="-9.6" r="2.8" fill="#FFFFFF" opacity=".3"/>` +
    `<path d="M16.3 -9.4 C 20 -9.6 23.2 -8.4 23.6 -7 C 23.2 -5.6 20 -5 16.3 -5.6 C 15 -7 15 -8.2 16.3 -9.4 Z" fill="${C.bill}"/>` +
    `<path d="M16.3 -6 C 19.5 -5.4 22.4 -5.6 23.4 -6.6 C 22.6 -5.2 19.6 -4.6 16.3 -5.2 Z" fill="${C.billD}"/>` +
    `<circle cx="12.2" cy="-9.4" r="1.5" fill="${C.eye}"/>` +
    `<circle cx="12.7" cy="-9.9" r=".5" fill="#FFFFFF"/>` +
    `<path d="M9.5 -6.4 C 11 -5.6 12.8 -5.6 14 -6.2" stroke="#EBC9A6" stroke-width=".9" fill="none" opacity=".45"/>`);
  return tail +
    `<path d="M-15 3.5 C -14.5 -4 -5 -6.5 4 -5 C 13 -3.5 16.5 1 13.5 6 C 7 9.5 -10 9.5 -15 3.5 Z" fill="${C.body}"/>` +
    `<path d="M-15 3.5 C -12 8 6 9 13.5 6 C 11 8.5 -10 9.5 -15 3.5 Z" fill="${C.shade}"/>` +
    `<path d="M-13 1 C -9 -3 0 -4 6 -3 C 1 -1 -8 0 -13 1 Z" fill="#FFFFFF" opacity=".3"/>` +
    `<path d="M-2 -2 C 3 -6 9 -6 13 -2 C 11 1 4 1 0 -1 Z" fill="#E7E0D0" opacity=".7"/>` +
    `<path d="M-2 -2 C 3 -5.5 8.5 -5.5 12 -2.5" stroke="${C.shade}" stroke-width="1" fill="none" opacity=".6"/>` +
    head;
}

function feet(step) {
  const dyL = -1.4 * Math.max(0, Math.sin(TAU * step)), dyR = -1.4 * Math.max(0, Math.sin(TAU * (step + .5)));
  return `<ellipse cx="-1" cy="${N(8.6 + dyL)}" rx="2.4" ry="1.1" fill="${C.billD}"/>` +
    `<ellipse cx="4" cy="${N(8.6 + dyR)}" rx="2.4" ry="1.1" fill="${C.bill}"/>`;
}

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.grounded) s += shadow(dx, GY + 0.4, 15, Math.max(0, -dy), 14);
  const inner = (P.feet !== undefined ? feet(P.feet) : '') + duck(P);
  return s + g(trl(dx, dy) + ' ' + rot(P.rock || 0, 0, 7), inner) + (P.over || '');
}

return {
  id: 'mallard', view: [-36, -28, 74, 46], groundY: GY,
  thumb: { m: 'waddle', t: 0.1 },
  motions: [
    { id: 'waddle', label: 'Waddle', short: 'Waddle', dur: 0.9, env: { t: 'ground' }, speed: '~3 km/h', beat: '2-beat · full-body rock',
      desc: 'Ashore the mallard walks with its whole body: legs set wide and far astern, so every stride rolls the hull above them.',
      anim: 'The rock IS the walk — rotate the body over each planted foot and let the head counter-swing half a beat late. Keep the tail wagging in counter-phase.' },
    { id: 'swim', label: 'Swim', short: 'Swim', dur: 2.4, env: { t: 'water', y: 6 }, speed: '~4 km/h', beat: 'Serene · hidden paddling',
      desc: 'Afloat it is all serenity — the hull glides level while the paddling stays invisible below the waterline.',
      anim: 'Resist the urge to bob: the body barely rises. Drift the ripples past, and give the head small independent holds and turns.' },
    { id: 'upend', label: 'Up-end', short: 'Up-end', dur: 3.2, env: { t: 'water', y: 6 }, speed: '0 km/h', beat: 'Tip → graze → right',
      desc: 'Feeding without diving: the duck tips right over, tail to the sky, grazing the pond floor at the length of its neck.',
      anim: 'Commit the tip in four frames and hold the vertical with a busy tail-wiggle — the comedy lives in how long it stays down.' },
    { id: 'shake', label: 'Tail-shake', short: 'Shake', dur: 2.2, env: { t: 'water', y: 6 }, speed: '0 km/h', beat: 'Burst · settle',
      desc: 'Surfacing housekeeping: a fast shiver runs stem to stern, flinging water off the oiled feathers, ending in one smug tail-wag.',
      anim: 'The shake is a 12-per-second jitter that decays over half a second. Finish with a clean, slow tail wag — the punctuation mark.' }
    ,{ id: 'sleep', label: 'Roost', short: 'Roost', dur: 6, env: { t: 'ground' }, night: true, speed: '0 km/h', beat: 'Deep rest · slow breath',
      desc: 'Settled on the bank as a smooth loaf, feet folded away, the head laid right back and the bill buried in the shoulder feathers.',
      anim: 'The bill-tuck is the whole pose — head reversed onto the back, one eye shut. Only a slow flank-breath and a rare bill-shuffle move.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'sleep') {
      const br = 1 + 0.02 * Math.sin(TAU * t);
      const inner =
        `<path d="M-17 5 C -16 -3 -3 -6.5 8 -4.5 C 15 -3 16 3.5 11 7 C 3 10.5 -12 10.5 -17 5 Z" fill="${C.body}"/>` +
        `<path d="M-17 5 C -11 9.5 6 10.5 11 7 C 8 9.8 -12 10.5 -17 5 Z" fill="${C.shade}"/>` +
        `<path d="M-15 2.5 C -19 0.5 -22 1 -22.5 3.5 C -20 4.8 -17 4 -14.5 3.4 Z" fill="${C.body}"/>` +
        `<path d="M0 -3.5 C -4 -3 -7.5 -2 -9 -0.5 C -6.5 -0.3 -3 -1 0 -2 Z" fill="${C.bill}"/>` +
        `<path d="M-9 -0.5 C -7.5 -0.9 -6 -1 -4.5 -1" stroke="${C.billD}" stroke-width=".5" fill="none" opacity=".6"/>` +
        `<circle cx="1" cy="-4.5" r="5.6" fill="${C.body}"/>` +
        `<path d="M1 1 C 4.5 0.6 6.6 -1.2 6.8 -4 C 6.8 -1.4 5.2 0.4 1 1 Z" fill="${C.shade}"/>` +
        `<path d="M-1.6 -5 C -0.7 -4.2 0.7 -4.2 1.6 -5" stroke="${C.eye}" stroke-width=".8" fill="none" stroke-linecap="round"/>` +
        `<path d="M-8 1 C -3 -1 3 -1.5 8 0" stroke="${C.shade}" stroke-width="1" fill="none" opacity=".6"/>`;
      return shadow(-1, GY + 0.4, 15, 0, 14) + g(scl(1, br, 0, GY), inner);
    }
    if (mid === 'swim') {
      return draw({
        dy: -0.8 * osc(t, 1, .1), rock: 1.5 * osc(t, 1, .35),
        headA: 4 * pulse(t, .3, .5) - 3 * pulse(t, .62, .8), tailA: 4 * osc(t, 2, .2),
        ticks: rippleTicks(t, { y: 6, x1: -33, x2: 36, v: 20, n: 5, s: 1.3, tone: '#85988B' }),
        over: `<path d="M14 5.6 q3 1.4 6 .4" stroke="#85988B" stroke-width=".7" fill="none" opacity=".5"/>`
      });
    }
    if (mid === 'upend') {
      const K = keys(t, [
        [0.00, { rock: 0, tailA: 0, dy: 0 }],
        [0.10, { rock: -6, tailA: 4, dy: .4 }],
        [0.20, { rock: 72, tailA: 8, dy: 2.5 }],
        [0.62, { rock: 72, tailA: 8, dy: 2.5 }],
        [0.74, { rock: -4, tailA: 2, dy: 0 }],
        [0.84, { rock: 2, tailA: -4, dy: 0 }],
        [1.00, { rock: 0, tailA: 0, dy: 0 }]
      ]);
      const under = win(K.rock, 30, 72);
      K.tailA += 9 * Math.sin(TAU * t * 9) * pulse(t, .24, .6);
      K.rock += 4 * Math.sin(TAU * t * 15) * pulse(t, .76, .86);
      K.ticks = rippleTicks(t, { y: 6, x1: -33, x2: 36, v: 8, n: 5, s: 1.3, tone: '#85988B' });
      // water sheet over the submerged half + bubbles — drawn on top of the duck
      const bub = under > 0.4 ? `<g fill="#FFFFFF" opacity="${N(under * .75)}"><circle cx="${N(10 + 2 * Math.sin(TAU * t * 3))}" cy="${N(13 - 6 * wrap(t * 2.3))}" r=".9"/><circle cx="${N(14 + 1.5 * Math.sin(TAU * t * 4))}" cy="${N(15 - 7 * wrap(t * 1.7 + .4))}" r=".7"/></g>` : '';
      K.over = `<rect x="-32" y="6.4" width="66" height="22" fill="rgba(126,147,133,${N(.34 * under)})"/>` + bub +
        `<g opacity="${N(under * .9)}"><path d="M6 5.4 q4 2 9 .6" stroke="#9CCBD9" stroke-width="1" fill="none"/><path d="M4 7.4 q6 2.4 13 .8" stroke="#85988B" stroke-width=".8" fill="none" opacity=".7"/></g>`;
      return draw(K);
    }
    if (mid === 'shake') {
      const A = pulse(t, .12, .5);
      const spray = A > 0.45 ? `<g fill="#9CCBD9" opacity="${N(A * .8)}"><circle cx="${N(-14 - 3 * A)}" cy="${N(-6 - 4 * A)}" r=".9"/><circle cx="${N(13 + 4 * A)}" cy="${N(-9 - 3 * A)}" r=".8"/><circle cx="${N(-3)}" cy="${N(-13 - 5 * A)}" r=".7"/></g>` : '';
      return draw({
        rock: A * 9 * Math.sin(TAU * t * 14), dy: -0.6 * A,
        headA: -A * 6 * Math.sin(TAU * t * 14),
        tailA: A * 14 * Math.sin(TAU * t * 14) + 16 * pulse(t, .62, .8) * Math.sin(TAU * t * 5),
        ticks: rippleTicks(t, { y: 6, x1: -33, x2: 36, v: 10, n: 5, s: 1.3, tone: '#85988B' }),
        over: spray
      });
    }
    // waddle
    return draw({
      grounded: true, feet: t * 2,
      dy: -0.6 * Math.abs(osc(t, 2)), rock: 8 * osc(t, 2, 0),
      headA: -5 * osc(t, 2, .12), tailA: -9 * osc(t, 2, .05),
      ticks: groundTicks(t, { y: GY + 1.4, x1: -33, x2: 36, v: 22, n: 7, s: 1 })
    });
  }
};

})();
__REG["stork"] = (function(){
// White Stork — fable style
const C = { body: '#F4F1EA', shade: '#DED7C7', black: '#33303B', blackHi: '#4A4655', leg: '#D4694F', legD: '#B85842', eye: '#2A2326' };
const GY = 23;

const legFar = a => g(rot(a, 1.6, 4.5),
  `<path d="M1 4.5 L2.4 4.5 L2.2 21.8 L1.1 21.8 Z" fill="${C.legD}"/><path d="M0.7 21.8 L3.6 22.9 L0.4 22.9 Z" fill="${C.legD}"/>`);
const legNear = a => g(rot(a, -0.6, 4.5),
  `<path d="M-1.2 4.5 L0.2 4.5 L0 21.8 L-1.1 21.8 Z" fill="${C.leg}"/><path d="M-1.5 21.8 L1.4 22.9 L-1.8 22.9 Z" fill="${C.leg}"/>`);

// P: neckA, jawA (lower mandible), clap lines
function neckHead(P) {
  const jaw = g(rot(P.jawA || 0, 16.9, -14.2),
    `<path d="M17 -15.3 L24.4 -14.9 L16.9 -13.6 C 16.6 -14.2 16.6 -14.8 17 -15.3 Z" fill="${C.legD}"/>`);
  return g(rot(P.neckA || 0, 4, -2),
    `<path d="M2.5 -1 C 6.5 -1.5 9.5 -4.5 9.8 -9 C 10 -12.4 10.8 -15.2 13 -16.6 L15.2 -13.4 C 13.6 -12.2 13 -10.4 12.9 -8.2 C 12.6 -2.6 8.5 1.5 3 1 Z" fill="${C.body}"/>` +
    `<circle cx="14.2" cy="-15.6" r="3.3" fill="${C.body}"/>` +
    `<path d="M17 -17.2 L24.4 -14.9 L16.9 -14.4 C 16.4 -15.4 16.4 -16.3 17 -17.2 Z" fill="${C.leg}"/>` +
    jaw +
    (P.clap ? `<g stroke="#B99A54" stroke-width=".7" fill="none" opacity="${N(P.clap)}"><path d="M25.6 -17.6 q1.6 1.2 1.8 3"/><path d="M27.3 -19 q2.2 1.6 2.5 4.2"/></g>` : '') +
    `<circle cx="15.3" cy="-16.3" r="1.05" fill="${C.eye}"/>` +
    `<circle cx="15.6" cy="-16.6" r=".35" fill="#fff" opacity=".9"/>`);
}

const foldedWing =
  `<path d="M-4.5 -2.5 C -9 -0.5 -13 1.5 -16.8 5.2 C -12 6 -6.5 4.6 -3 1.6 C -1.6 0.2 -2.4 -1.8 -4.5 -2.5 Z" fill="${C.black}"/>` +
  `<path d="M-15.4 3.4 C -13 2.2 -10.4 1.2 -7.8 0.6" stroke="${C.blackHi}" stroke-width=".9" fill="none" stroke-linecap="round" opacity=".7"/>`;

// spread wing, side view — sweeps back over the tail. lift (deg, - = raised), fold = wingtip fold on upstroke
const spreadWing = (lift, fold, far) => {
  const col = far ? C.shade : C.body;
  const tip = g(rot(-fold, -14, -4.5),
    `<path d="M-14 -6.5 C -17.5 -7.3 -20.8 -7 -23 -5.6 C -23.9 -5 -23.7 -3.8 -22.7 -3.4 C -20 -2.2 -16.8 -2.2 -14 -3.4 Z" fill="${col}"/>` +
    `<path d="M-14 -3.4 C -16.8 -2.2 -20 -2.2 -22.7 -3.4 C -20.4 -1.6 -16.4 -1.2 -13.4 -2.4 Z" fill="${C.black}"/>` +
    `<g stroke="${C.black}" stroke-width=".9" stroke-linecap="round"><line x1="-20.6" y1="-4.9" x2="-23.3" y2="-4.3"/><line x1="-19.8" y1="-3.7" x2="-22.4" y2="-2.7"/><line x1="-18.8" y1="-2.9" x2="-20.9" y2="-1.7"/></g>`);
  return g(rot(-lift, 1, -3) + (far ? ' ' + trl(1.5, -1) : ''),
    `<path d="M1 -3.5 C -4 -7 -10 -7.8 -14.8 -6.4 C -15.8 -6 -15.8 -4.8 -14.8 -4.2 C -11 -2 -6.5 -0.6 -2 -0.4 C 0.5 -0.3 1.8 -1.8 1 -3.5 Z" fill="${col}"/>` +
    `<path d="M-2 -0.4 C -6.5 -0.6 -11 -2 -14.8 -4.2 C -12 -1.4 -7 0.8 -1.6 0.9 C -0.4 0.9 0.2 0.3 -2 -0.4 Z" fill="${C.black}"/>` +
    tip);
};

// P: dx dy pitch legFarA legNearA neckA jawA clap wings {lift, fold} ticks grounded
function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.grounded) s += shadow(dx + 1, GY + 0.6, 9, 0, 20);
  const flying = !!P.wings;
  const inner =
    (flying ? spreadWing(P.wings.lift * 0.92, P.wings.fold, true) : '') +
    legFar(P.legFarA || 0) + legNear(P.legNearA || 0) +
    `<ellipse cx="-3" cy="0" rx="10.5" ry="6.4" fill="${C.body}"/>` +
    `<path d="M-12 2 C -7 5.8 1 6.2 6.5 3.6 C 2 6.8 -7 6.8 -12 2 Z" fill="${C.shade}"/>` +
    `<path d="M-5 -4.5 C -1 -6.3 3 -5.6 5.5 -3.4" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".5"/>` +
    (flying ? '' : foldedWing) +
    neckHead(P) +
    (flying ? spreadWing(P.wings.lift, P.wings.fold, false) : '');
  return s + g(trl(dx, dy) + ' ' + rot(P.pitch || 0, 0, 0), inner);
}

return {
  id: 'stork', view: [-34, -31, 72, 60], groundY: GY,
  thumb: { m: 'stride', t: 0.16 },
  motions: [
    { id: 'stride', label: 'Stride', short: 'Stride', dur: 1.3, env: { t: 'ground' }, speed: '~3 km/h', beat: '2-beat · high step',
      desc: 'The meadow patrol: long deliberate steps, each foot folded up and placed like an afterthought, head hunting all the while.',
      anim: 'The knee (really the ankle) folds backward — let the toes dangle through every swing and flick straight just before the plant.' },
    { id: 'flight', label: 'Flight', short: 'Flight', dur: 1, env: { t: 'air' }, speed: '~45 km/h', beat: 'Slow broad beats',
      desc: 'Neck straight out, legs trailed straight behind — a flying cross, rowing the air with deep unhurried beats.',
      anim: 'Neck and legs are rigid rails; all flexibility lives in the wings. Fold the hand feathers on the upstroke or the span looks wooden.' },
    { id: 'soar', label: 'Soar', short: 'Soar', dur: 3, env: { t: 'air' }, speed: '~60 km/h', beat: 'Set wings · thermal circle',
      desc: 'On a thermal the beats stop entirely: primaries splay like fingers and the whole bird banks in slow, patient circles.',
      anim: 'Sell the circling with a slow roll and heading drift — never a static hold. The fingered wingtips flutter at the smallest amplitude.' },
    { id: 'clatter', label: 'Bill-clatter', short: 'Clatter', dur: 2.8, env: { t: 'ground' }, speed: '0 km/h', beat: 'Throw-back + 10/s clap',
      desc: 'The stork’s only voice: head thrown right back along the spine, bill clattering like a wooden rattle.',
      anim: 'The throw-back is one confident arc, 6–8 frames. The clap is a 10-per-second jitter of the lower mandible only — the head stays parked.' }
    ,{ id: 'sleep', label: 'Roost', short: 'Roost', dur: 7, env: { t: 'ground' }, night: true, speed: '0 km/h', beat: 'One leg · slow sway',
      desc: 'Asleep on the nest-edge at night: balanced on a single leg, the other drawn up into the belly-down, the long bill laid back along the shoulders.',
      anim: 'Keep the standing leg a plumb-line and let the whole bird sway a degree or two on it. The tucked bill and folded leg do all the storytelling.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'sleep') {
      const br = 1 + 0.015 * Math.sin(TAU * t);
      const sway = 0.35 * Math.sin(TAU * t * 0.5);
      const inner =
        legFar(13) + legNear(-11) +
        `<ellipse cx="-2" cy="0" rx="10.5" ry="6.6" fill="${C.body}"/>` +
        `<path d="M-11 2.4 C -6 6 2 6.2 7 3.4 C 2 6.8 -8 6.8 -12 1.8 Z" fill="${C.shade}"/>` +
        foldedWing +
        `<path d="M3 -2 C 6 -3.6 6 -6.6 3 -8 C 1 -9 -1.6 -8.6 -2.6 -6.8 C -0.6 -6.6 1.4 -5.4 2.4 -3.8 C 2.8 -3.2 2.9 -2.6 3 -2 Z" fill="${C.body}"/>` +
        `<circle cx="0" cy="-7.6" r="3.3" fill="${C.body}"/>` +
        `<path d="M-1.6 -8.9 C -7 -9.1 -12.6 -8.1 -15.6 -6.6 C -12.6 -6.4 -7 -7 -1.8 -6.9 C -1.3 -7.7 -1.3 -8.3 -1.6 -8.9 Z" fill="${C.leg}"/>` +
        `<path d="M-1.8 -6.9 C -6.6 -7.1 -11 -6.7 -14 -6.6" stroke="${C.legD}" stroke-width=".5" fill="none" opacity=".6"/>` +
        `<path d="M-1.9 -8 C -1.2 -7.3 0 -7.3 0.7 -8" stroke="${C.eye}" stroke-width=".7" fill="none" stroke-linecap="round"/>`;
      return shadow(0, GY + 0.6, 9, 0, 20) + g(trl(sway, 0) + ' ' + scl(1, br, 0, GY), inner);
    }
    if (mid === 'flight') {
      const flap = osc(t, 1, .3);
      return draw({
        pitch: -5 + 1.5 * osc(t, 1, .55), dy: -3 * osc(t, 1, .55),
        wings: { lift: -30 * flap - 6, fold: flap > 0 ? 22 * flap : 0 },
        legFarA: 64, legNearA: 66, neckA: 33,
        ticks: airTicks(t, { x1: -31, x2: 34, y: -20, h: 18, v: 44, n: 4, s: 1.3 })
      });
    }
    if (mid === 'soar') {
      return draw({
        pitch: -3 + 2.5 * osc(t, 1, .3), dy: -1.8 * osc(t, 1, .55), dx: 2.5 * osc(t, 1, .05),
        wings: { lift: -10 + 2 * osc(t, 4, .1), fold: 3 + 2 * osc(t, 5, .4) },
        legFarA: 64, legNearA: 66, neckA: 33,
        ticks: airTicks(t, { x1: -31, x2: 34, y: -20, h: 18, v: 24, n: 4, s: 1.3 })
      });
    }
    if (mid === 'clatter') {
      const K = keys(t, [
        [0.00, { neckA: 0, pitch: 0 }],
        [0.10, { neckA: 4, pitch: 0 }],
        [0.22, { neckA: -98, pitch: 3 }],
        [0.66, { neckA: -98, pitch: 3 }],
        [0.80, { neckA: -2, pitch: 0 }],
        [1.00, { neckA: 0, pitch: 0 }]
      ]);
      const on = pulse(t, .24, .66);
      K.jawA = on * 13 * Math.abs(Math.sin(TAU * t * 12));
      K.clap = on;
      K.grounded = true;
      return draw(K);
    }
    // stride
    return draw({
      grounded: true,
      dy: -0.5 * Math.abs(osc(t, 2, .05)), pitch: 0.8 * osc(t, 2, .3),
      legFarA: 21 * osc(t, 1, 0), legNearA: 21 * osc(t, 1, .5),
      neckA: 4 * osc(t, 1, .2) + 13 * pulse(t, .55, .72),
      jawA: 3 * pulse(t, .62, .68),
      ticks: groundTicks(t, { y: GY, x1: -31, x2: 34, v: 26, n: 7, s: 1.1 })
    });
  }
};

})();
__REG["heron"] = (function(){
// Grey Heron — fable style (side view: grey wings, white head with black crest, tucked neck in flight, dagger strike)
const C = { grey: '#9AA0A8', greyD: '#7C828C', greyHi: '#AEB4BC', white: '#F2F0EC', black: '#33303B', bill: '#E8B84E', billD: '#C99A34', leg: '#9C7E58', legD: '#7E6444', eye: '#E4C24A', pupil: '#2A2326' };
const GY = 23;

const legFar = a => g(rot(a, 1.6, 4.5),
  `<path d="M1 4.5 L2.4 4.5 L2.2 21.8 L1.1 21.8 Z" fill="${C.legD}"/><path d="M0.7 21.8 L3.6 22.9 L0.4 22.9 Z" fill="${C.legD}"/>`);
const legNear = a => g(rot(a, -0.6, 4.5),
  `<path d="M-1.2 4.5 L0.2 4.5 L0 21.8 L-1.1 21.8 Z" fill="${C.leg}"/><path d="M-1.5 21.8 L1.4 22.9 L-1.8 22.9 Z" fill="${C.leg}"/>`);

// head + dagger bill (points +x) + trailing black crest, pivot at (hx,hy) rotated by ang
function headBill(hx, hy, ang) {
  return g(trl(hx, hy) + ' ' + rot(ang || 0, 0, 0),
    `<path d="M-2 -3 C -4.6 -4.8 -7.4 -5.2 -9.6 -4.8 C -6.8 -4.1 -4 -3.4 -1.8 -2.2 Z" fill="${C.black}"/>` +
    `<circle cx="0" cy="0" r="2.8" fill="${C.white}"/>` +
    `<path d="M-0.4 -2.4 C -2.8 -3.4 -5.2 -3.2 -6.8 -2.2 C -4.8 -2.6 -2.4 -2.4 -0.4 -1.6 Z" fill="${C.black}"/>` +
    `<path d="M1.8 -1.1 C 6 -1.5 11.6 -0.7 13.8 0 C 11.6 0.8 6 1.1 1.8 0.7 C 1.1 -0.1 1.1 -0.6 1.8 -1.1 Z" fill="${C.bill}"/>` +
    `<path d="M1.8 0.1 C 6 0.4 10.8 0.6 12.9 0.2 C 10.8 0.9 6 0.9 1.8 0.6 Z" fill="${C.billD}" opacity=".6"/>` +
    `<circle cx="0.6" cy="-0.6" r="1" fill="${C.eye}"/><circle cx="0.6" cy="-0.6" r=".45" fill="${C.pupil}"/>`);
}

// extended S-neck for stalk / strike. stab 0 = coiled up, 1 = fired down into the water
function extNeck(P) {
  const s = P.stab || 0;
  const hx = 12 + 9 * s, hy = -15 + 22 * s, cx = 6 - 2 * s, cy = -9 - 1 * s, ang = 8 + 52 * s;
  const d = `M3 -1.5 Q ${N(cx)} ${N(cy)} ${N(hx)} ${N(hy)}`;
  return `<path d="${d}" stroke="${C.white}" stroke-width="3.4" fill="none" stroke-linecap="round"/>` +
    `<path d="${d}" stroke="${C.greyD}" stroke-width=".5" fill="none" opacity=".3"/>` +
    headBill(hx, hy, ang);
}

// compact tucked neck for flight — head pulled back onto the shoulders, throat bulge below
function tuckNeck() {
  return `<path d="M2 -2 C 5 -3.2 8 -3.6 10 -6 C 11 -7.2 12.6 -7 13 -5.6 C 12 -3 9 -1 5 0 C 2 0.6 0 -0.4 2 -2 Z" fill="${C.white}"/>` +
    `<path d="M5 0 C 7 1.6 9 1.7 10.6 0.8 C 8.6 2.2 5.6 2 3.6 0.6 Z" fill="${C.greyHi}" opacity=".55"/>` +
    headBill(11, -6.4, -3);
}

// broad grey wing with black fingered tip. lift = raise, fold = tip fold on recovery, far = behind
const spreadWing = (lift, fold, far) => {
  const col = far ? C.greyD : C.grey;
  const tip = g(rot(-fold, -15, -5),
    `<path d="M-15 -6.8 C -19 -7.6 -22.6 -7.2 -25 -5.8 C -26 -5.2 -25.8 -4 -24.8 -3.6 C -21.8 -2.4 -18.4 -2.4 -15 -3.6 Z" fill="${col}"/>` +
    `<path d="M-15 -3.6 C -18.4 -2.4 -21.8 -2.4 -24.8 -3.6 C -22.2 -1.6 -18 -1.2 -14.6 -2.6 Z" fill="${C.black}"/>` +
    `<g stroke="${C.black}" stroke-width="1" stroke-linecap="round"><line x1="-22.4" y1="-5.2" x2="-25.4" y2="-4.6"/><line x1="-21.4" y1="-4" x2="-24.2" y2="-3"/><line x1="-20.2" y1="-3.1" x2="-22.6" y2="-1.9"/></g>`);
  return g(rot(-lift, 1, -3) + (far ? ' ' + trl(1.6, -1.2) : ''),
    `<path d="M1 -3.6 C -5 -7.4 -12 -8.4 -17.6 -6.8 C -18.8 -6.4 -18.8 -5 -17.6 -4.4 C -13 -1.8 -7 -0.4 -1.6 -0.2 C 1.2 -0.1 2 -1.9 1 -3.6 Z" fill="${col}"/>` +
    `<path d="M-1.6 -0.2 C -7 -0.4 -13 -1.8 -17.6 -4.4 C -14 -1.2 -8 1.2 -1.4 1.3 C 1 1.4 1.8 0.4 -1.6 -0.2 Z" fill="${C.greyD}"/>` +
    tip);
};

const foldedWing =
  `<path d="M-2 -3 C -8 -1.5 -14 1 -18.5 5 C -13 5.8 -6.5 4.4 -2.5 1.4 C -0.8 0.2 -0.6 -2 -2 -3 Z" fill="${C.grey}"/>` +
  `<path d="M-16.5 3.6 C -12 2 -7 1 -3 0.8" stroke="${C.greyHi}" stroke-width=".8" fill="none" stroke-linecap="round" opacity=".6"/>` +
  `<path d="M-17.5 4.6 C -13 3.6 -8 2.6 -4 2.2" stroke="${C.black}" stroke-width="1" fill="none" stroke-linecap="round" opacity=".4"/>`;

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.grounded) s += shadow(dx + 1, GY + 0.6, 9, 0, 20);
  const flying = !!P.wings;
  const neck = P.neck === 'tuck' ? tuckNeck() : extNeck(P);
  const inner =
    (flying ? spreadWing(P.wings.lift * 0.9, P.wings.fold, true) : '') +
    legFar(P.legFarA || 0) + legNear(P.legNearA || 0) +
    `<ellipse cx="-4" cy="0" rx="11" ry="6.6" fill="${C.grey}"/>` +
    `<path d="M-13 2.4 C -7 6.2 2 6.4 7 3.6 C 2 7 -8 7 -13 2.4 Z" fill="${C.greyD}"/>` +
    `<path d="M-6 -4.6 C -1 -6.4 4 -5.6 6.5 -3.4" stroke="${C.greyHi}" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".5"/>` +
    `<path d="M2 -4 C 3 -1 3.4 2 2.6 5" stroke="${C.black}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".5"/>` +
    (flying ? '' : foldedWing) +
    neck +
    (flying ? spreadWing(P.wings.lift, P.wings.fold, false) : '');
  return s + g(trl(dx, dy) + ' ' + rot(P.pitch || 0, 0, 0), inner) + (P.over || '');
}

return {
  id: 'heron', view: [-38, -33, 78, 64], groundY: GY,
  thumb: { m: 'stalk', t: 0.1 },
  motions: [
    { id: 'flight', label: 'Flight', short: 'Flight', dur: 1.15, env: { t: 'air' }, speed: '~35 km/h', beat: 'Slow deep bowed beats',
      desc: 'The give-away silhouette: neck folded hard back onto the shoulders, legs trailed straight behind, wings rowing the air in slow, deep, bowed strokes.',
      anim: 'Everything is in the wing — deep, arched downstrokes with a real fold on the recovery. Neck stays tucked, legs stay rigid; let the body rise and sink on the beat.' },
    { id: 'soar', label: 'Soar', short: 'Soar', dur: 3.2, env: { t: 'air' }, speed: '~45 km/h', beat: 'Set wings · circle',
      desc: 'On a thermal the beats stop: the broad wings set into a shallow bow and the whole bird wheels in slow, patient circles.',
      anim: 'Sell the circling with a slow roll and heading drift; the fingered wingtips flutter at the smallest amplitude. Neck stays tucked.' },
    { id: 'stalk', label: 'Stalk', short: 'Stalk', dur: 2.8, env: { t: 'water', y: 20 }, speed: '~1 km/h', beat: 'Freeze · lift · place',
      desc: 'The shallows hunter: a hunched, motionless wait broken by one impossibly slow lifted step, the neck coiled and ready above the water.',
      anim: 'Move as little as possible. The step is a single slow lift-and-place; the neck holds its coil and only weaves a fraction, tracking something below.' },
    { id: 'strike', label: 'Strike', short: 'Strike', dur: 2.4, env: { t: 'water', y: 20 }, speed: '0 km/h', beat: 'Coil · stab · recover',
      desc: 'The coiled neck released — the head fires down through the surface in a single frame and lifts with the catch, water flung from the bill.',
      anim: 'Hold the coil long and still, then fire: two or three frames to full stretch, a beat under water, and a slower, heavier recovery to the coil.' }
    ,{ id: 'sleep', label: 'Roost', short: 'Roost', dur: 7, env: { t: 'ground' }, night: true, speed: '0 km/h', beat: 'One leg · neck tucked',
      desc: 'Hunched down for the night on a single leg, the long neck folded right back into the shoulders and the dagger bill laid along the breast.',
      anim: 'Pull the neck into the tightest S and drop the shoulders; balance the whole grey bundle on one plumb leg and let it sway a hair.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'sleep') {
      return draw({
        neck: 'tuck', grounded: true,
        legFarA: 120,
        legNearA: 2 * Math.sin(TAU * t * 0.6),
        pitch: 2,
        dx: 0.5 * Math.sin(TAU * t * 0.6),
        dy: -0.25 * Math.max(0, Math.sin(TAU * t))
      });
    }
    if (mid === 'flight') {
      const flap = osc(t, 1, .3);
      return draw({
        neck: 'tuck', pitch: -4 + 2 * osc(t, 1, .55), dy: -4 * osc(t, 1, .55),
        wings: { lift: -34 * flap - 8, fold: flap > 0 ? 26 * flap : 0 },
        legFarA: 66, legNearA: 68,
        ticks: airTicks(t, { x1: -34, x2: 36, y: -22, h: 20, v: 42, n: 4, s: 1.4 })
      });
    }
    if (mid === 'soar') {
      return draw({
        neck: 'tuck', pitch: -3 + 2.5 * osc(t, 1, .3), dy: -2 * osc(t, 1, .55), dx: 2.5 * osc(t, 1, .05),
        wings: { lift: -8 + 2 * osc(t, 4, .1), fold: 4 + 2 * osc(t, 5, .4) },
        legFarA: 66, legNearA: 68,
        ticks: airTicks(t, { x1: -34, x2: 36, y: -22, h: 20, v: 24, n: 4, s: 1.4 })
      });
    }
    if (mid === 'strike') {
      const K = keys(t, [
        [0.00, { stab: 0 }],
        [0.40, { stab: 0 }],
        [0.49, { stab: 1 }],
        [0.60, { stab: 1 }],
        [0.80, { stab: 0.12 }],
        [1.00, { stab: 0 }]
      ]);
      K.neck = 'ext'; K.grounded = true; K.legFarA = 5; K.legNearA = -4;
      K.pitch = 5 * K.stab;
      const sp = pulse(t, .5, .64);
      K.ticks = rippleTicks(t, { y: 20, x1: -34, x2: 36, v: 6, n: 5, s: 1.4, tone: '#85988B' });
      K.over = sp > 0 ? `<g fill="#9CCBD9" opacity="${N(sp * .8)}"><circle cx="${N(20 + 3 * sp)}" cy="16" r="1"/><circle cx="${N(24 + 2 * sp)}" cy="14.5" r=".8"/><circle cx="18" cy="15.5" r=".7"/></g>` : '';
      return draw(K);
    }
    // stalk
    const K = keys(t, [
      [0.00, { ln: 0, dy: 0 }],
      [0.32, { ln: 0, dy: 0 }],
      [0.48, { ln: -28, dy: -0.6 }],
      [0.64, { ln: -12, dy: -0.3 }],
      [0.74, { ln: 0, dy: 0 }],
      [1.00, { ln: 0, dy: 0 }]
    ]);
    K.neck = 'ext'; K.grounded = true; K.legFarA = 0; K.legNearA = K.ln;
    K.stab = 0.04 + 0.03 * osc(t, 1, .1);
    K.ticks = rippleTicks(t, { y: 20, x1: -34, x2: 36, v: 5, n: 5, s: 1.4, tone: '#85988B' });
    return draw(K);
  }
};

})();
__REG["bird"] = (function(){
// Nuthatch — fable style
const C = { body: '#7BA0C9', wing: '#5E84AD', wingHi: '#6E93BD', wingFar: '#4E749E', wingFarD: '#456690', breast: '#EF9C7E', beak: '#E8943E', beakD: '#C9742A', eye: '#2A2326' };
const GY = 9;

// slender leaf-shaped feather from root (rx,ry) to tip (tx,ty)
const feather = (rx, ry, tx, ty, w, col) => {
  const mx = (rx + tx) / 2, my = (ry + ty) / 2;
  const dx = tx - rx, dy = ty - ry, l = Math.hypot(dx, dy) || 1;
  const ox = -dy / l * w, oy = dx / l * w;
  return `<path d="M${N(rx)} ${N(ry)} Q${N(mx + ox)} ${N(my + oy)} ${N(tx)} ${N(ty)} Q${N(mx - ox)} ${N(my - oy)} ${N(rx)} ${N(ry)} Z" fill="${col}"/>`;
};
// open flight wing: fan of primaries + covert cap at the shoulder
const wingOpen = (cCov, cPrim) =>
  feather(1.8, -1.2, -8.4, -10.4, 1.7, cPrim) +
  feather(1.8, -1.2, -10.9, -7.5, 1.8, cPrim) +
  feather(1.8, -1.2, -12.3, -4.3, 1.9, cPrim) +
  feather(1.8, -1.2, -11.2, -1.2, 2.0, cPrim) +
  feather(2.6, -0.6, -6.8, -3.6, 2.6, cCov) +
  `<path d="M2 -1.5 C -0.8 -3.5 -3.8 -4.3 -5.9 -3.9" stroke="#FFFFFF" stroke-width=".5" fill="none" opacity=".3"/>`;
// folded wing: teardrop lying along the flank, tip over the tail base
const wingFolded = (cMain, cLines) =>
  `<path d="M3.2 -1 C 0 -2 -3.8 -1.4 -6.6 0.6 C -8.3 1.9 -8.9 3.8 -8.1 5.3 C -5 5.2 -1.2 4.2 1.6 2.6 C 3.2 1.7 3.8 0.1 3.2 -1 Z" fill="${cMain}"/>` +
  `<path d="M-1.6 1.2 C -4 2.2 -6.3 3.5 -7.9 4.9 M0.4 2 C -1.9 2.8 -4.2 3.9 -6 5" stroke="${cLines}" stroke-width=".7" fill="none" stroke-linecap="round" opacity=".85"/>` +
  `<path d="M2.9 -0.9 C 0.4 -1.7 -2.7 -1.3 -5.2 0.1" stroke="#FFFFFF" stroke-width=".5" fill="none" opacity=".3"/>`;

// P: wingN, wingF (deg), fold (1 = wings folded), tailA, blink, notes (0..1), legA/legB (deg), legTuck (0..1)
function bird(P) {
  const open = !(P.fold ?? 1);
  const lt = P.legTuck || 0;
  const legs =
    g(rot((P.legA || 0) + 40 * lt, 0, 5) + ' ' + scl(1, 1 - 0.6 * lt, 0, 5),
      `<path d="M-0.6 5 L0.6 5 L0.5 8.7 L-0.5 8.7 Z" fill="${C.beakD}"/><path d="M-2 8.9 L1.6 8.9" stroke="${C.beakD}" stroke-width="1" stroke-linecap="round"/>`) +
    g(rot((P.legB || 0) + 40 * lt, 3.2, 5) + ' ' + scl(1, 1 - 0.6 * lt, 3.2, 5),
      `<path d="M2.6 5 L3.8 5 L3.7 8.7 L2.7 8.7 Z" fill="${C.beak}"/><path d="M1.2 8.9 L4.8 8.9" stroke="${C.beak}" stroke-width="1" stroke-linecap="round"/>`);
  const eye = (P.blink || 0) > 0.5
    ? `<path d="M9.2 -3.2 L11.4 -3.2" stroke="${C.eye}" stroke-width=".7" fill="none" stroke-linecap="round"/>`
    : `<circle cx="10.3" cy="-3.2" r="1.25" fill="${C.eye}"/><circle cx="10.7" cy="-3.6" r=".42" fill="#FFFFFF"/>`;
  return g(rot(P.tilt || 0, 0, 2),
    g(rot(P.tailA || 0, -5, 5), `<path d="M-3 3 C -5 5 -7 6.5 -9 7.5 C -7.5 6 -6 4.5 -5 3 Z" fill="${C.wing}"/>`) +
    legs +
    (open ? g(rot(P.wingF || 0, 2, -1), g('translate(3 -0.5) scale(0.92)', wingOpen(C.wingFar, C.wingFarD))) : '') +
    `<path d="M-8 1 C -2 -3 6 -3 9 0 C 9.5 3 6 6 1 6.5 C -4 7 -8 5 -8.5 2.5 C -8.6 1.9 -8.4 1.4 -8 1 Z" fill="${C.body}"/>` +
    `<path d="M-7 3 C -2 1.5 5 1.5 8 3.2 C 7.5 5.5 3 6.8 -1 6.6 C -4 6.5 -6.5 5.2 -7 3.6 Z" fill="${C.breast}" opacity=".92"/>` +
    `<path d="M-8 1 C -4 -2 3 -2.4 7 -0.8 C 4 -1 -3 -0.6 -7 1.4 C -7.6 1.6 -7.9 1.4 -8 1 Z" fill="#FFFFFF" opacity=".28"/>` +
    `<circle cx="9" cy="-2.6" r="4.4" fill="${C.body}"/>` +
    `<path d="M9.4 -6.6 C 11.6 -6.4 13.2 -4.8 13.4 -2.8 C 12 -4.6 10.4 -5.6 8.4 -6 C 8.7 -6.3 9 -6.5 9.4 -6.6 Z" fill="#FFFFFF" opacity=".3"/>` +
    `<path d="M12.6 -3.4 C 15 -3.6 17.6 -2.9 18.6 -2.2 C 17.4 -1.6 15 -1.3 12.8 -1.5 C 12.2 -2 12.2 -2.9 12.6 -3.4 Z" fill="${C.beak}"/>` +
    `<path d="M13 -2.6 C 14.8 -2.7 16.8 -2.3 17.8 -2 C 16.6 -1.8 14.6 -1.7 13 -1.9 Z" fill="${C.beakD}" opacity=".55"/>` +
    eye +
    `<ellipse cx="8" cy="-1.2" rx="1.5" ry="1.1" fill="${C.breast}" opacity=".4"/>` +
    (P.notes ? `<g stroke="#B99A54" stroke-width=".8" fill="none" stroke-linecap="round" opacity="${N(P.notes)}"><path d="M19.5 -6.5 q1.4 -1.6 3 -1.6"/><path d="M21 -9.8 q2 -2 4.4 -1.8"/><circle cx="19.3" cy="-6.3" r=".55" fill="#B99A54" stroke="none"/><circle cx="20.8" cy="-9.6" r=".55" fill="#B99A54" stroke="none"/></g>` : '') +
    g(rot(P.wingN || 0, 1, -1), open ? wingOpen(C.wingHi, C.wing) : wingFolded(C.wing, C.wingFarD)));
}

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.grounded) s += shadow(dx - 1, GY + 0.6, 8, Math.max(0, -dy), 10);
  return s + g(trl(dx, dy), bird(P));
}

return {
  id: 'bird', view: [-32, -26, 68, 42], groundY: GY,
  thumb: { m: 'sing', t: 0.05 },
  motions: [
    { id: 'hop', label: 'Hop', short: 'Hop', dur: 0.5, env: { t: 'ground' }, speed: '~2 km/h', beat: 'Both feet · bounce',
      desc: 'Songbirds do not walk — the ground is covered in brisk two-footed bounces, tail balancing every landing.',
      anim: 'The whole bird is one spring: squash on landing, stretch on lift. Flick the tail once per hop, a frame after touchdown.' },
    { id: 'flit', label: 'Flit', short: 'Flit', dur: 0.55, env: { t: 'air' }, speed: '~20 km/h', beat: 'Flap-burst · bound',
      desc: 'The flight is a stitched line of bursts and bounds — a flurry of beats, wings shut, and a little ballistic dip.',
      anim: 'Alternate flap-bursts with folded-wing bounds; the path must scallop. Undulation is the signature — never fly level.' },
    { id: 'sing', label: 'Perch & sing', short: 'Sing', dur: 3.2, env: { t: 'ground' }, speed: '0 km/h', beat: 'Phrase · pause · phrase',
      desc: 'Head back, beak wide, the whole body thrown into a phrase — then silence, a look around, and the phrase again.',
      anim: 'The song shakes the whole bird: tilt back and quiver through each phrase. The pauses between phrases sell the performance.' }
    ,{ id: 'sleep', label: 'Roost', short: 'Roost', dur: 6, env: { t: 'branch', y: 9 }, night: true, speed: '0 km/h', beat: 'Fluffed · quick breath',
      desc: 'Fluffed to a feathered ball on the roost-branch, head screwed right round and the bill pushed down into the back feathers for the night.',
      anim: 'Round the whole silhouette and bury the bill; a small, quick breath-swell is all that moves through the puffed plumage.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'sleep') {
      const br = 1 + 0.03 * Math.sin(TAU * t);
      const inner =
        `<path d="M-2 -6.5 C -6 -7 -9 -5 -9 -2 C -6 -3 -3 -4 0 -4.5 Z" fill="${C.beak}"/>` +
        `<path d="M-8 1 C -9 6 -5 9.5 1 9.5 C 7 9.5 10 6 9 0 C 8 -5 4 -7.5 0 -7.5 C -5 -7.5 -8 -4 -8 1 Z" fill="${C.body}"/>` +
        `<path d="M-3 3 C -3 6 -1 8 1.5 8 C 4 8 6 6 6 3.2 C 6 1 3.5 0 1 0 C -1 0 -3 1 -3 3 Z" fill="${C.breast}" opacity=".9"/>` +
        `<path d="M-8 0 C -4 -2 3 -2.2 8 -0.4" stroke="${C.wingFarD}" stroke-width=".6" fill="none" opacity=".5"/>` +
        `<circle cx="1" cy="-4.5" r="4.6" fill="${C.body}"/>` +
        `<path d="M-1.5 -4.6 C -0.6 -3.8 0.8 -3.8 1.7 -4.6" stroke="${C.eye}" stroke-width=".7" fill="none" stroke-linecap="round"/>` +
        `<g stroke="${C.beakD}" stroke-width=".9" stroke-linecap="round"><path d="M-1 9.2 l0 1.5 M2 9.2 l0 1.5"/></g>`;
      return g(scl(1, br, 0, GY), inner);
    }
    if (mid === 'flit') {
      const flap = osc(t, 2, 0);
      return draw({
        fold: 0,
        wingN: -26 * flap - 5, wingF: -28 * osc(t, 2, .07) - 7,
        legTuck: 1,
        dy: -3.4 * osc(t, 1, .3), dx: 2 * osc(t, 1, .05),
        tilt: -6 + 5 * osc(t, 1, .5), tailA: 6 * osc(t, 1, .4),
        ticks: airTicks(t, { x1: -29, x2: 32, y: -16, h: 14, v: 36, n: 4, s: 1 })
      });
    }
    if (mid === 'sing') {
      const phrase = pulse(t, .1, .38) + pulse(t, .55, .82);
      return draw({
        grounded: true,
        tilt: -7 * phrase + 0.8 * Math.sin(TAU * t * 11) * phrase,
        tailA: 8 * phrase + 6 * pulse(t, .44, .5),
        wingN: -5 * phrase,
        notes: phrase,
        blink: pulse(t, .46, .52),
        dy: -0.3 * Math.max(0, osc(t, 2, .1))
      });
    }
    // hop
    const K = keys(t, [
      [0.00, { dy: 0, tilt: 0, tailA: 0, legA: 0, legTuck: 0 }],
      [0.18, { dy: 0.7, tilt: -3, tailA: 6, legA: -14, legTuck: 0 }],
      [0.34, { dy: -3.6, tilt: 6, tailA: -8, legA: 18, legTuck: 0.5 }],
      [0.52, { dy: -4.6, tilt: 2, tailA: -4, legA: 20, legTuck: 0.55 }],
      [0.70, { dy: -1.5, tilt: -4, tailA: 4, legA: -8, legTuck: 0.1 }],
      [0.82, { dy: 0.5, tilt: -1, tailA: 10, legA: -4, legTuck: 0 }],
      [1.00, { dy: 0, tilt: 0, tailA: 0, legA: 0, legTuck: 0 }]
    ]);
    K.legB = K.legA;
    K.wingN = -16 * K.legTuck;
    K.grounded = true;
    K.blink = pulse(t, .1, .14);
    K.ticks = groundTicks(t, { y: GY + 1, x1: -29, x2: 32, v: 16, n: 6, s: .8 });
    return draw(K);
  }
};

})();
__REG["swallow"] = (function(){
// Barn Swallow — fable style (side view: steel-blue above, cream below, chestnut throat, deep forked tail)
const C = { blue: '#3B4A6B', blueHi: '#586A94', blueFar: '#32405E', blueFarD: '#28344C', dark: '#2A2E3C', cream: '#F0E7D2', rufous: '#C0673E', eye: '#2A2326', beak: '#23262E' };
const GY = 9;

// long pointed swept wing (a swallow scythe). lift = raise (deg), fold = primary-tip fold on upstroke, far = behind body
const wing = (lift, fold, far) => {
  const col = far ? C.blueFar : C.blue, edge = far ? C.blueFarD : C.dark;
  // outer primaries — long, sharply pointed, swept back; folds on the upstroke
  const tip = g(rot(-fold, -10.5, -5),
    `<path d="M-10 -5.8 C -14.6 -6.8 -18.8 -7 -22 -6.4 C -20.4 -4.9 -16.4 -3.7 -11 -3 C -10.6 -3.9 -10.2 -4.8 -10 -5.8 Z" fill="${col}"/>` +
    `<path d="M-11 -3 C -16.4 -3.7 -20.4 -4.9 -22 -6.4 C -18.4 -3.9 -12.8 -2.4 -10.4 -2.4 Z" fill="${edge}"/>`);
  // inner blade — broad root tapering to the primaries, concave trailing edge
  return g(rot(-lift, 2.4, -2.4) + (far ? ' ' + trl(1.2, -0.8) : ''),
    `<path d="M2.6 -3.2 C -2.4 -5.3 -7 -6 -10.6 -5.6 C -10.4 -4.5 -10.2 -3.6 -10 -2.6 C -6 -1.7 -1.4 -1.2 2.4 -1.6 C 2 -2.2 2.1 -2.8 2.6 -3.2 Z" fill="${col}"/>` +
    `<path d="M2.4 -1.6 C -1.4 -1.2 -6 -1.7 -10 -2.6 C -6.2 -0.7 -1.4 0.3 2 0.1 C 3 0.1 3.2 -0.7 2.4 -1.6 Z" fill="${edge}"/>` +
    `<path d="M0 -2.6 C -3.4 -3.2 -6.6 -4 -9.4 -5" stroke="${far ? C.blueFar : C.blueHi}" stroke-width=".5" fill="none" opacity=".5" stroke-linecap="round"/>` +
    tip);
};

const foldedWing =
  `<path d="M3 -1.6 C -3 -3 -10 -3.1 -16.5 -1.4 C -18.6 -0.8 -18.8 0.7 -16.8 1.2 C -10.5 1.6 -3 0.6 2 -0.6 C 3.4 -0.9 3.8 -1.1 3 -1.6 Z" fill="${C.blue}"/>` +
  `<path d="M-3 0.2 C -8 0.9 -13 1.2 -16.4 0.9 M-0.5 -0.7 C -5 -0.2 -10.5 0.3 -15.4 0.3" stroke="${C.blueFarD}" stroke-width=".5" fill="none" stroke-linecap="round" opacity=".7"/>`;

// deeply forked tail (extends left), spread 0..1 opens the fork
const tailFork = (spread) => {
  const s = spread || 0;
  const uT = [-21 - 2 * s, -2.2 - 3.2 * s], lT = [-20 - 2 * s, 6.6 + 3.2 * s];
  return `<path d="M-8 0.8 L${N(uT[0])} ${N(uT[1])} L-13.5 2.2 L${N(lT[0])} ${N(lT[1])} L-8 3.4 Z" fill="${C.blue}"/>` +
    `<path d="M-8 1.6 L${N(uT[0] + 1)} ${N(uT[1] + 0.7)} M-8 2.6 L${N(lT[0] + 1)} ${N(lT[1] - 0.7)}" stroke="${C.blueHi}" stroke-width=".5" fill="none" opacity=".4"/>`;
};

function sw(P) {
  const open = !(P.fold ?? 1);
  const foot = (x) => `<path d="M${x} 4.6 C ${N(x - 0.2)} 6 ${N(x + 0.2)} 7.1 ${N(x + 0.2)} 7.9"/>` +
    `<path d="M${N(x + 0.2)} 7.9 q -1.4 0.7 -2.2 1.8 M${N(x + 0.2)} 7.9 q 0.2 1 0.5 1.9 M${N(x + 0.2)} 7.9 q 1.3 0.7 2.2 0.7"/>`;
  const legs = P.perched
    ? `<g stroke="${C.beak}" stroke-width=".85" fill="none" stroke-linecap="round" stroke-linejoin="round">${foot(-0.8)}${foot(2.4)}</g>`
    : '';
  const eye = `<circle cx="10.6" cy="-2.2" r="1.15" fill="${C.eye}"/><circle cx="11" cy="-2.6" r=".38" fill="#FFFFFF"/>`;
  return g(rot(P.tilt || 0, 0, 1),
    g(rot(P.tailA || 0, -8, 2), tailFork(P.spread)) +
    (open ? wing(P.wings.lift * 0.9, P.wings.fold, true) : '') +
    legs +
    `<path d="M-8.5 1.4 C -3 -2.4 4.5 -2.8 9 -0.6 C 10.6 0.3 10.4 2.6 8.2 3.9 C 3 5.2 -4.5 5.2 -9 2.9 C -9.7 2.5 -9.4 1.8 -8.5 1.4 Z" fill="${C.blue}"/>` +
    `<path d="M-7.6 3.1 C -2 1.9 5 1.9 8.5 3.2 C 6 4.9 -0.6 5.3 -6.6 4.1 C -7.3 3.9 -7.9 3.5 -7.6 3.1 Z" fill="${C.cream}"/>` +
    `<path d="M-8.5 1.4 C -4.2 -1.4 2.6 -1.8 7 -0.6 C 3.6 -1 -3.4 -0.6 -7.6 1.5 C -8 1.6 -8.3 1.5 -8.5 1.4 Z" fill="${C.blueHi}" opacity=".3"/>` +
    `<circle cx="9.2" cy="-1.6" r="4.1" fill="${C.blue}"/>` +
    `<path d="M9.6 -5.5 C 11.7 -5.2 13.1 -3.7 13.3 -1.9 C 11.9 -3.6 10.4 -4.5 8.7 -4.9 Z" fill="${C.blueHi}" opacity=".35"/>` +
    `<path d="M7.6 0.6 C 9.6 1.5 11.8 1.2 13.2 0.1 C 12.6 2 10 2.6 7.8 1.9 C 7 1.6 7.1 0.9 7.6 0.6 Z" fill="${C.rufous}"/>` +
    `<path d="M12.7 -2.2 L18.2 -1.5 L12.7 -0.2 C 12.3 -0.9 12.3 -1.6 12.7 -2.2 Z" fill="${C.beak}"/>` +
    eye +
    (open ? wing(P.wings.lift, P.wings.fold, false) : foldedWing));
}

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.grounded) s += shadow(dx, GY + 0.6, 7, Math.max(0, -dy), 10);
  return s + g(trl(dx, dy) + ' ' + rot(P.roll || 0, 0, 0), sw(P));
}

return {
  id: 'swallow', view: [-34, -24, 66, 44], groundY: GY,
  thumb: { m: 'flight', t: 0.12 },
  motions: [
    { id: 'flight', label: 'Flight', short: 'Flight', dur: 0.5, env: { t: 'air' }, speed: '~35 km/h', beat: 'Fast swept flicks',
      desc: 'The tireless aerial hunter — quick, flicked wingbeats stitched to sudden banks and rolls, the forked tail steering every turn.',
      anim: 'Keep the beats fast and shallow and never let the path run straight; the fork opens in the turns and streams shut on the straights.' },
    { id: 'glide', label: 'Glide & bank', short: 'Glide', dur: 2.6, env: { t: 'air' }, speed: '~30 km/h', beat: 'Set wings · carve',
      desc: 'Between bursts it sets the long wings back and carves — leaning into slow banking arcs low over the meadow.',
      anim: 'Wings swept and near-still with a whisper of flutter; sell the carve with roll and a long curving drift, the tail fanning into the turn.' },
    { id: 'perch', label: 'Perch', short: 'Perch', dur: 3.6, env: { t: 'branch', y: 9 }, speed: '0 km/h', beat: 'Settle · look · flick',
      desc: 'Lined up on a wire between sorties: wings folded to a fine point past the tail, streamers crossed, head turning to mark every passing insect.',
      anim: 'Small life only — a shoulder shuffle, a tail flick, a quick head turn. The long folded wingtips and crossed streamers read even in stillness.' }
    ,{ id: 'sleep', label: 'Roost', short: 'Roost', dur: 6, env: { t: 'branch', y: 9 }, night: true, speed: '0 km/h', beat: 'On the wire · quick breath',
      desc: 'Perched in the roosting-line at dusk: puffed round, the long forked streamers crossed below, head turned back and the bill sunk into the mantle.',
      anim: 'Fluff the streamlined body into a ball and hang the fork straight down; only a fast, shallow breath disturbs the plumage.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'sleep') {
      const br = 1 + 0.03 * Math.sin(TAU * t);
      const inner =
        `<path d="M-7 2 L-18 4 L-12 5 L-19 8 L-6 5.5 Z" fill="${C.blue}"/>` +
        `<path d="M-8 1 C -9 5.5 -5 9 1 9 C 7 9 10 5.5 9 0 C 8 -5 4 -7 0 -7 C -5 -7 -8 -4 -8 1 Z" fill="${C.blue}"/>` +
        `<path d="M-4 3 C -4 6 -1 8 2 8 C 5 8 7 6 7 3.4 C 7 1.4 4.5 0.6 2 0.6 C -1 0.6 -4 1 -4 3 Z" fill="${C.cream}"/>` +
        `<path d="M-1 -5 C -4 -4.5 -6.5 -3.5 -7.5 -2.5 C -5 -3 -2 -3.8 0 -5 Z" fill="${C.beak}"/>` +
        `<circle cx="1.5" cy="-4" r="4.4" fill="${C.blue}"/>` +
        `<path d="M3 -2.6 C 5 -1.7 7 -2 8.4 -3.1 C 7.8 -1.1 5.2 -0.5 3.2 -1.2 Z" fill="${C.rufous}"/>` +
        `<path d="M-0.5 -4 C 0.3 -3.3 1.6 -3.3 2.4 -4" stroke="${C.eye}" stroke-width=".7" fill="none" stroke-linecap="round"/>` +
        `<g stroke="${C.beak}" stroke-width=".85" stroke-linecap="round"><path d="M-1 9 l0 1.4 M2 9 l0 1.4"/></g>`;
      return g(scl(1, br, 0, GY), inner);
    }
    if (mid === 'flight') {
      const flap = osc(t, 1, 0);
      return draw({
        fold: 0, wings: { lift: -32 * flap - 4, fold: flap > 0 ? 18 * flap : 0 },
        dy: -2.6 * osc(t, 1, .5), dx: 3 * osc(t, 1, .05),
        tilt: -6 + 5 * osc(t, 1, .5), roll: 6 * osc(t, 1, .3),
        tailA: 5 * osc(t, 1, .4), spread: 0.4 + 0.4 * Math.max(0, osc(t, 1, .25)),
        ticks: airTicks(t, { x1: -30, x2: 32, y: -16, h: 15, v: 40, n: 4, s: 1.1 })
      });
    }
    if (mid === 'glide') {
      return draw({
        fold: 0, wings: { lift: -4 + 3 * osc(t, 4, .1), fold: 8 + 3 * osc(t, 5, .3) },
        dy: -2.4 * osc(t, 1, .3), dx: 4 * osc(t, 1, .02),
        tilt: -3 + 3 * osc(t, 1, .3), roll: 10 * osc(t, 1, .5),
        tailA: 4 * osc(t, 1, .5), spread: 0.6 + 0.3 * osc(t, 1, .5),
        ticks: airTicks(t, { x1: -30, x2: 32, y: -16, h: 15, v: 26, n: 4, s: 1 })
      });
    }
    // perch
    const look = pulse(t, .2, .3) - pulse(t, .55, .68);
    return draw({
      perched: true, dy: 0,
      tilt: 1.5 * look, tailA: -5 * pulse(t, .4, .52) + 3 * look, spread: 0
    });
  }
};

})();
__REG["kestrel"] = (function(){
// Common Kestrel — fable style (side view: rufous back, grey head & tail, the hover as the star)
const C = { ruf: '#B2743F', rufFar: '#986130', rufFarD: '#7C4E27', tip: '#33303B', grey: '#6E7688', greyHi: '#8A93A6', cream: '#EFE6CF', barD: '#6B5A43', cere: '#E6B93E', beak: '#3A3640', malar: '#3A3640', eye: '#2A2326' };
const GY = 9;

// paddle-ish pointed wing. lift = raise (deg), fold = tip fold on upstroke, far = behind body
const wing = (lift, fold, far) => {
  const col = far ? C.rufFar : C.ruf, edge = far ? C.rufFarD : C.tip;
  const tip = g(rot(-fold, -13, -5),
    `<path d="M-12.5 -6.2 C -16.5 -7.6 -20.6 -7.8 -23.4 -6.6 C -24.4 -6.2 -24.2 -4.9 -23.1 -4.5 C -19.2 -3.1 -15 -3 -12.5 -4.2 Z" fill="${col}"/>` +
    `<path d="M-12.5 -4.2 C -15 -3 -19.2 -3.1 -23.1 -4.5 C -19.6 -2.2 -14.8 -1.8 -12.7 -3 Z" fill="${C.tip}"/>` +
    `<g stroke="${C.tip}" stroke-width=".85" stroke-linecap="round" opacity=".85"><line x1="-20.4" y1="-5.6" x2="-23.4" y2="-5"/><line x1="-19.2" y1="-4.4" x2="-22.2" y2="-3.6"/></g>`);
  return g(rot(-lift, 1, -3) + (far ? ' ' + trl(1.6, -1) : ''),
    `<path d="M1 -3.6 C -4.5 -7 -10.5 -8 -15.5 -6.8 C -16.6 -6.5 -16.6 -5.2 -15.5 -4.7 C -11 -2.3 -5.5 -0.8 -0.6 -0.6 C 2 -0.5 2.4 -2 1 -3.6 Z" fill="${col}"/>` +
    `<path d="M-0.6 -0.6 C -5.5 -0.8 -11 -2.3 -15.5 -4.7 C -12 -1.6 -6.5 0.6 -0.4 0.8 C 2 0.9 2.6 -0.2 -0.6 -0.6 Z" fill="${edge}"/>` +
    `<circle cx="-6" cy="-3.8" r=".5" fill="${C.tip}" opacity=".7"/><circle cx="-9" cy="-3.4" r=".5" fill="${C.tip}" opacity=".7"/>` +
    tip);
};

const foldedWing =
  `<path d="M3.5 -2 C -1 -3.4 -7 -3.6 -12.5 -2 C -14.4 -1.4 -14.8 0.2 -13 1 C -8 1.6 -2 0.6 3 -0.8 C 4.4 -1.1 4.4 -1.5 3.5 -2 Z" fill="${C.ruf}"/>` +
  `<g stroke="${C.rufFarD}" stroke-width=".7" fill="none" stroke-linecap="round" opacity=".8"><path d="M-1 -0.6 C -4 0.2 -7.5 0.6 -11 0.6"/><path d="M0.5 -1.6 C -3 -0.9 -7 -0.5 -10.6 -0.6"/></g>` +
  `<path d="M-13 1 C -11 0.6 -8.6 0.2 -6.4 -0.4" stroke="${C.tip}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".6"/>`;

// grey tail fan with a dark subterminal band. fan 0..1 opens it, tailA rotates it
const tail = (fan, tailA) => {
  const sp = fan || 0, top = -1.4 - 3.2 * sp, bot = 4.2 + 4 * sp, mid = (top + bot) / 2;
  return g(rot(tailA || 0, -9, 1.4),
    `<path d="M-9 -0.2 C -14 -0.9 -18.6 -1.1 -22.4 ${N(top)} C -23 ${N(mid)} -23 ${N(mid)} -22.4 ${N(bot)} C -18.6 3.9 -14 3.3 -9 3 Z" fill="${C.grey}"/>` +
    `<path d="M-21.2 ${N(top + 1.1)} C -21.7 ${N(mid)} -21.7 ${N(mid)} -21.2 ${N(bot - 1)}" stroke="${C.tip}" stroke-width="1.6" fill="none" stroke-linecap="round" opacity=".85"/>` +
    `<path d="M-9 0.2 C -13.5 -0.4 -17.6 -0.6 -21 ${N(top + 1.4)}" stroke="${C.greyHi}" stroke-width=".5" fill="none" opacity=".4"/>`);
};

const head = (P) => g(trl(0, P.headDy || 0) + ' ' + rot(P.headA || 0, 8, -3),
  `<path d="M2 -3 C 5 -5 9 -5 11.6 -3 C 9.5 -1.5 5 -1.5 2 -1.5 Z" fill="${C.ruf}"/>` +
  `<circle cx="8.5" cy="-4" r="4.3" fill="${C.grey}"/>` +
  `<path d="M8.5 -8.2 C 10.8 -8 12.4 -6.4 12.6 -4.4 C 11.2 -6.2 9.6 -7.2 7.8 -7.6 Z" fill="${C.greyHi}" opacity=".4"/>` +
  `<path d="M6 -2.2 C 8 -1.2 10.4 -1.2 12 -2.2 C 11.6 -0.4 9 0.2 6.6 -0.4 Z" fill="${C.cream}"/>` +
  `<path d="M10.5 -5.2 C 10.6 -3.6 10.1 -2.3 9.3 -1.1" stroke="${C.malar}" stroke-width="1.3" fill="none" stroke-linecap="round"/>` +
  `<path d="M11.6 -5 C 14.2 -5.2 16.2 -4.4 16.6 -3.4 C 15.4 -3.2 13.8 -3 12.2 -3.2 Z" fill="${C.cere}"/>` +
  `<path d="M15.4 -4.2 C 16.5 -4 17.1 -3.1 16.4 -2.3 C 15.8 -2.9 15.2 -3.4 14.6 -3.6 C 14.8 -4 15.1 -4.1 15.4 -4.2 Z" fill="${C.beak}"/>` +
  `<circle cx="9.6" cy="-4.6" r="1.5" fill="${C.eye}"/>` +
  `<circle cx="10.1" cy="-5.1" r=".45" fill="#FFFFFF"/>`);

function kes(P) {
  const open = !(P.fold ?? 1);
  const pivot = [5, -2];
  const legs = P.perched
    ? `<g stroke="${C.cere}" stroke-linecap="round"><line x1="1" y1="4.4" x2="1" y2="8.2" stroke-width="1.5"/><line x1="3.4" y1="4.4" x2="3.4" y2="8.2" stroke-width="1.5"/><path d="M-0.8 8.4 L2.2 8.4 M1.4 8.4 L4.6 8.4" stroke-width="1.2"/></g>`
    : '';
  const bodyGrp = g(rot(P.pitch || 0, pivot[0], pivot[1]),
    tail(P.fan, P.tailA) +
    (open ? wing(P.wings.lift * 0.9, P.wings.fold, true) : '') +
    legs +
    `<path d="M-10 0.5 C -4 -3.5 4 -3.8 9.5 -1.2 C 11.4 -0.1 11.2 3 8.5 4.6 C 3 6 -5 6 -10.4 3.4 C -11.2 3 -10.9 1.2 -10 0.5 Z" fill="${C.ruf}"/>` +
    `<path d="M-8.5 3 C -2.5 1.4 5 1.4 9 3.2 C 6 5.4 -1 6 -7.5 4.4 C -8.3 4.2 -9 3.6 -8.5 3 Z" fill="${C.cream}"/>` +
    `<g stroke="${C.barD}" stroke-width=".55" fill="none" stroke-linecap="round" opacity=".55"><path d="M-6 3.6 q1.4 .8 2.8 0"/><path d="M-2 4 q1.5 .8 3 0"/><path d="M2 3.9 q1.5 .8 3 0"/></g>` +
    `<circle cx="-5" cy="-1" r=".55" fill="${C.tip}" opacity=".6"/><circle cx="-1" cy="-1.6" r=".55" fill="${C.tip}" opacity=".6"/><circle cx="3" cy="-1.6" r=".55" fill="${C.tip}" opacity=".6"/>` +
    (open ? wing(P.wings.lift, P.wings.fold, false) : foldedWing));
  return bodyGrp + head(P);
}

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.grounded) s += shadow(dx, GY + 0.6, 9, Math.max(0, -dy), 14);
  return s + g(trl(dx, dy) + ' ' + rot(P.roll || 0, 0, 0), kes(P));
}

return {
  id: 'kestrel', view: [-36, -28, 76, 54], groundY: GY,
  thumb: { m: 'hover', t: 0.25 },
  motions: [
    { id: 'hover', label: 'Hover', short: 'Hover', dur: 0.26, env: { t: 'air' }, speed: '0 km/h · holding', beat: 'Fast beats · head locked',
      desc: 'The windhover’s trick: hung on a headwind with the body angled and the tail fanned down, the wings blurring while the head stays nailed to one point of grass.',
      anim: 'Everything moves but the head. Beat the wings fast and shallow, let the body bob a hair, and counter it exactly so the eye never drifts.' },
    { id: 'soar', label: 'Glide', short: 'Glide', dur: 2.8, env: { t: 'air' }, speed: '~40 km/h', beat: 'Set wings · bank',
      desc: 'Off the hover it tips forward and slides away on set wings, tail fanned, carving a long bank across the field.',
      anim: 'Wings out and near-still with a small tremble at the fingered tips; sell the slide with a slow roll and heading drift.' },
    { id: 'perch', label: 'Perch', short: 'Perch', dur: 3.6, env: { t: 'branch', y: 9 }, speed: '0 km/h', beat: 'Hold · scan · blink',
      desc: 'Set on a post with the tail hanging and the wings folded to sharp points — that same locked stare now sweeping the ground below.',
      anim: 'Hold the folded silhouette. All the life is in the head: slow deliberate swivels and the odd blink, with a tail-balance flick.' }
    ,{ id: 'sleep', label: 'Roost', short: 'Roost', dur: 6.5, env: { t: 'branch', y: 9 }, night: true, speed: '0 km/h', beat: 'Fluffed · slow breath',
      desc: 'The windhover at rest for the night: hunched and fluffed on a post, tail hanging, the grey head turned back with the bill tucked and the fierce eye finally shut.',
      anim: 'Loosen the sharp daytime outline into a soft ball; keep the head reversed and the eye closed, with only a slow breath in the mantle.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'sleep') {
      const br = 1 + 0.025 * Math.sin(TAU * t);
      const inner =
        `<path d="M-6 3 C -12 5 -17 8 -19 12 L-16 13 C -14 9 -10 6 -6 5 Z" fill="${C.grey}"/>` +
        `<path d="M-17 11 l2.6 -.6" stroke="${C.tip}" stroke-width="1.4" stroke-linecap="round"/>` +
        `<path d="M-9 1 C -10 7 -5 11 1 11 C 8 11 11 6 10 -1 C 9 -6 5 -8 0 -8 C -6 -8 -9 -5 -9 1 Z" fill="${C.ruf}"/>` +
        `<path d="M-4 3 C -4 7 -1 9.5 2.5 9.5 C 6 9.5 8 7 8 3.6 C 8 1.2 5 0.2 2 0.2 C -1 0.2 -4 0.8 -4 3 Z" fill="${C.cream}"/>` +
        `<g stroke="${C.barD}" stroke-width=".5" fill="none" opacity=".5"><path d="M-2 4 q2 .8 4 0"/><path d="M-2 6 q2 .8 4 0"/></g>` +
        `<path d="M0 -3.8 C -3 -3 -6 -1.5 -7 0 C -5 -0.6 -2 -2 0 -2.8 Z" fill="${C.beak}"/>` +
        `<circle cx="2" cy="-5" r="4.8" fill="${C.grey}"/>` +
        `<path d="M0 -5 C 0.9 -4.2 2.3 -4.2 3.2 -5" stroke="${C.eye}" stroke-width=".8" fill="none" stroke-linecap="round"/>` +
        `<g stroke="${C.cere}" stroke-width="1.4" stroke-linecap="round"><path d="M-1 11 l0 1.5 M2.4 11 l0 1.5"/></g>`;
      return g(scl(1, br, 0, GY), inner);
    }
    if (mid === 'hover') {
      const flap = osc(t, 1, 0), bob = 0.5 * osc(t, 1, .5);
      return draw({
        fold: 0, pitch: -30 + 2 * osc(t, 1, .5),
        wings: { lift: -42 * flap - 2, fold: flap > 0 ? 26 * flap : 4 },
        fan: 1, tailA: 6, dy: bob, headDy: -bob,
        ticks: airTicks(t, { x1: -32, x2: 34, y: -14, h: 16, v: 46, n: 5, s: 1.1 })
      });
    }
    if (mid === 'soar') {
      return draw({
        fold: 0, pitch: -6 + 3 * osc(t, 1, .3),
        wings: { lift: -8 + 3 * osc(t, 4, .1), fold: 5 + 3 * osc(t, 5, .3) },
        fan: 0.7, tailA: 2, dy: -1.6 * osc(t, 1, .3), dx: 3.5 * osc(t, 1, .02), roll: 9 * osc(t, 1, .5),
        ticks: airTicks(t, { x1: -32, x2: 34, y: -14, h: 16, v: 26, n: 4, s: 1 })
      });
    }
    // perch
    const scan = pulse(t, .15, .3) - pulse(t, .55, .72);
    return draw({ perched: true, fold: 1, pitch: -6, fan: 0, tailA: 0, headA: 8 * scan, blink: 0 });
  }
};

})();
__REG["butterfly"] = (function(){
// Red Admiral — fable style (front view, true colors: velvet black + red bands + white apex spots)
const C = { dark: '#3A3440', dark2: '#2A2530', band: '#D2503E', pale: '#FBF7F2', body: '#2A2530' };
const GY = 8.5;

const fold = a => Math.max(0.12, Math.cos(Math.min(88, Math.abs(a)) * Math.PI / 180));
const wingL = a => g(scl(fold(a), 1, -1, 0) + ' ' + rot(a * 0.55, -1, -2),
  `<path d="M-0.8 -4.6 C -4.6 -7.6 -9.4 -12.1 -13.8 -14.9 L-16.3 -10.3 C -15.1 -6.3 -11.5 -3.1 -7.4 -1.8 C -4.4 -0.9 -1.8 -1.8 -0.8 -3.2 Z" fill="${C.dark}"/>` +
  `<path d="M-0.9 -4.3 C -3.4 -6.2 -6.4 -8.9 -9.2 -11.6 C -8 -9.1 -5.6 -6.1 -2.6 -3.9 Z" fill="${C.dark2}" opacity=".7"/>` +
  `<path d="M-4.4 -3.1 C -8.4 -4.5 -12 -7.3 -14.5 -11.2" stroke="${C.band}" stroke-width="3" fill="none" stroke-linecap="round"/>` +
  `<circle cx="-12.4" cy="-13.4" r=".95" fill="${C.pale}"/><circle cx="-10.5" cy="-12.3" r=".7" fill="${C.pale}"/><circle cx="-13.9" cy="-12" r=".6" fill="${C.pale}"/><circle cx="-9.1" cy="-11.1" r=".5" fill="${C.pale}"/>` +
  `<path d="M-1 -1 C -4 0 -8.5 1.5 -9.5 5.5 C -10 8.4 -7.8 10.2 -4.8 9.2 C -2.4 8.4 -1 5.8 -0.6 3 Z" fill="${C.dark}"/>` +
  `<path d="M-9.1 5.7 C -8.7 8.1 -6.7 9.3 -4.7 8.7 C -3 8.1 -1.8 6.6 -1.2 4.5" stroke="${C.band}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
  `<circle cx="-7.2" cy="7.9" r=".55" fill="${C.dark2}"/><circle cx="-5" cy="8.3" r=".55" fill="${C.dark2}"/><circle cx="-2.9" cy="7.3" r=".55" fill="${C.dark2}"/>`);

const wingR = a => g(scl(fold(a), 1, 1, 0) + ' ' + rot(-a * 0.55, 1, -2),
  `<path d="M0.8 -4.6 C 4.6 -7.6 9.4 -12.1 13.8 -14.9 L16.3 -10.3 C 15.1 -6.3 11.5 -3.1 7.4 -1.8 C 4.4 -0.9 1.8 -1.8 0.8 -3.2 Z" fill="${C.dark}"/>` +
  `<path d="M0.9 -4.3 C 3.4 -6.2 6.4 -8.9 9.2 -11.6 C 8 -9.1 5.6 -6.1 2.6 -3.9 Z" fill="${C.dark2}" opacity=".7"/>` +
  `<path d="M4.4 -3.1 C 8.4 -4.5 12 -7.3 14.5 -11.2" stroke="${C.band}" stroke-width="3" fill="none" stroke-linecap="round"/>` +
  `<circle cx="12.4" cy="-13.4" r=".95" fill="${C.pale}"/><circle cx="10.5" cy="-12.3" r=".7" fill="${C.pale}"/><circle cx="13.9" cy="-12" r=".6" fill="${C.pale}"/><circle cx="9.1" cy="-11.1" r=".5" fill="${C.pale}"/>` +
  `<path d="M1 -1 C 4 0 8.5 1.5 9.5 5.5 C 10 8.4 7.8 10.2 4.8 9.2 C 2.4 8.4 1 5.8 0.6 3 Z" fill="${C.dark}"/>` +
  `<path d="M9.1 5.7 C 8.7 8.1 6.7 9.3 4.7 8.7 C 3 8.1 1.8 6.6 1.2 4.5" stroke="${C.band}" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
  `<circle cx="7.2" cy="7.9" r=".55" fill="${C.dark2}"/><circle cx="5" cy="8.3" r=".55" fill="${C.dark2}"/><circle cx="2.9" cy="7.3" r=".55" fill="${C.dark2}"/>`);

// P: wA (0 open → 62 closed-up), antA
const bfly = P =>
  wingL(P.wA || 0) + wingR(P.wA || 0) +
  `<path d="M0 -7.5 C 1.5 -7.5 2 -5.5 2 -3 C 2 0.5 1.4 5 0 7 C -1.4 5 -2 0.5 -2 -3 C -2 -5.5 -1.5 -7.5 0 -7.5 Z" fill="${C.body}"/>` +
  `<ellipse cx="0" cy="-5.6" rx=".5" ry="2.6" fill="${C.pale}" opacity=".22"/>` +
  `<circle cx="0" cy="-7.6" r="1.7" fill="${C.body}"/>` +
  `<circle cx="-0.5" cy="-8.1" r=".45" fill="${C.pale}" opacity=".6"/>` +
  g(rot(P.antA || 0, 0, -8.6),
    `<path d="M-0.8 -8.6 C -2.4 -11.5 -3.6 -13 -4.8 -13.8 M0.8 -8.6 C 2.4 -11.5 3.6 -13 4.8 -13.8" stroke="${C.body}" stroke-width=".9" fill="none" stroke-linecap="round"/>` +
    `<circle cx="-4.8" cy="-13.8" r="1" fill="${C.body}"/><circle cx="4.8" cy="-13.8" r="1" fill="${C.body}"/>`);

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.grounded) s += shadow(dx, GY + 0.8, 9, Math.max(0, -dy), 12);
  return s + g(trl(dx, dy) + ' ' + rot(P.roll || 0, 0, 0), bfly(P));
}

return {
  id: 'butterfly', view: [-30, -26, 62, 44], groundY: GY,
  thumb: { m: 'bask', t: 0.05 },
  motions: [
    { id: 'bask', label: 'Bask', short: 'Bask', dur: 3.4, env: { t: 'ground' }, speed: '0 km/h', beat: 'Open · hold · close',
      desc: 'Wings spread flat to the sun between slow, deliberate closures — a solar panel that occasionally remembers it is shy.',
      anim: 'Open fast, close slow, and hold each extreme far longer than feels comfortable. The antennae are the only constant motion.' },
    { id: 'flutter', label: 'Flutter', short: 'Flutter', dur: 0.55, env: { t: 'air' }, speed: '~9 km/h', beat: 'Burst flaps + bounce',
      desc: 'The signature careless flight: bursts of flicked wingbeats that toss the body on a bouncing, unrepeatable path.',
      anim: 'The body is luggage — let each wingbeat throw it up and sideways. Nothing may travel in a straight line, ever.' },
    { id: 'sail', label: 'Sail', short: 'Sail', dur: 2.8, env: { t: 'air' }, speed: '~12 km/h', beat: 'Set wings · drift',
      desc: 'Between bursts the red admiral sets its wings flat and simply rides, losing height by lazy degrees.',
      anim: 'Wings barely above horizontal with a whisper of flutter; sell the drift with a slow roll and a long sinking curve.' }
    ,{ id: 'roost', label: 'Roost', short: 'Roost', dur: 6, env: { t: 'reed', x: -2, y: -10 }, night: true, speed: '0 km/h', beat: 'Wings shut · slow sway',
      desc: 'Wings shut tight over the back for the night, the velvet underside turned out — a dead leaf on a stem no bird looks at twice.',
      anim: 'Hold the closed-wing sliver dead still; a breath-slow sway and a settling of the antennae are the only signs of life.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'roost') {
      return draw({ grounded: false, dy: 0, wA: 72 + 2 * Math.sin(TAU * t), antA: 2 * Math.sin(TAU * t * 0.5) });
    }
    if (mid === 'flutter') {
      const flap = osc(t, 2, 0);
      return draw({
        wA: 34 + 30 * flap,
        dy: -3 * osc(t, 1, .28) - 1.2 * osc(t, 2, .1), dx: 2.6 * osc(t, 1, .05),
        roll: 7 * osc(t, 1, .4), antA: 3 * osc(t, 2, .3),
        ticks: airTicks(t, { x1: -27, x2: 29, y: -16, h: 14, v: 34, n: 4, s: 1 })
      });
    }
    if (mid === 'sail') {
      return draw({
        wA: -6 + 3 * osc(t, 4, .1),
        dy: -3.5 * osc(t, 1, .3), dx: 4 * osc(t, 1, .02),
        roll: 5 * osc(t, 1, .5), antA: 2 * osc(t, 2, .2),
        ticks: airTicks(t, { x1: -27, x2: 29, y: -16, h: 14, v: 20, n: 4, s: 1 })
      });
    }
    // bask
    const K = keys(t, [
      [0.00, { wA: 0 }],
      [0.16, { wA: 0 }],
      [0.34, { wA: 62 }],
      [0.52, { wA: 62 }],
      [0.60, { wA: -5 }],
      [0.66, { wA: 0 }],
      [0.90, { wA: 0 }],
      [1.00, { wA: 0 }]
    ]);
    K.wA += 1.5 * osc(t, 5, .2) * (K.wA > 30 ? 1 : 0.4);
    K.grounded = true;
    K.antA = 4 * osc(t, 3, .1);
    return draw(K);
  }
};

})();
__REG["swallowtail"] = (function(){
// Swallowtail — fable style (front view: cream-yellow wings, dark tip bands + veins, blue lunules, red eyespots, tailed hindwings)
const C = { yellow: '#E8CF7E', dark: '#3A3440', blue: '#7BA0C9', red: '#D2503E', body: '#2A2530', pale: '#FBF7F2' };
const GY = 8.5;

const fold = a => Math.max(0.12, Math.cos(Math.min(88, Math.abs(a)) * Math.PI / 180));

const wingL = a => g(scl(fold(a), 1, -1, 0) + ' ' + rot(a * 0.55, -1, -2),
  `<path d="M-0.8 -4.6 C -4.6 -7.6 -9.4 -12.1 -13.8 -14.9 L-16.3 -10.3 C -15.1 -6.3 -11.5 -3.1 -7.4 -1.8 C -4.4 -0.9 -1.8 -1.8 -0.8 -3.2 Z" fill="${C.yellow}"/>` +
  `<path d="M-13.8 -14.9 L-16.3 -10.3 C -15.7 -8.4 -14.7 -6.7 -13.4 -5.3 C -14 -8 -14.2 -10.9 -12.6 -13.9 Z" fill="${C.dark}" opacity=".92"/>` +
  `<path d="M-2.2 -4.2 C -5.2 -6.2 -8.2 -8.8 -11.2 -11.6 M-3.4 -3.2 C -6.6 -4.7 -9.6 -6.7 -12.4 -9 M-5 -2.4 C -7.8 -3.4 -10.4 -4.9 -12.6 -6.7" stroke="${C.dark}" stroke-width=".55" fill="none" opacity=".7" stroke-linecap="round"/>` +
  `<path d="M-1 -1 C -4 0 -8.5 1.5 -9.5 5.5 C -10 8.4 -7.8 10.2 -4.8 9.2 C -2.4 8.4 -1 5.8 -0.6 3 Z" fill="${C.yellow}"/>` +
  `<path d="M-9.1 5.7 C -8.7 8.1 -6.7 9.3 -4.7 8.7 C -3 8.1 -1.8 6.6 -1.2 4.5" stroke="${C.dark}" stroke-width="2.3" fill="none" stroke-linecap="round"/>` +
  `<circle cx="-7.6" cy="7.3" r=".62" fill="${C.blue}"/><circle cx="-5.4" cy="8.1" r=".62" fill="${C.blue}"/><circle cx="-3.3" cy="7.4" r=".62" fill="${C.blue}"/>` +
  `<circle cx="-1.7" cy="5.2" r=".85" fill="${C.red}"/><circle cx="-1.7" cy="5.2" r=".32" fill="${C.dark}" opacity=".7"/>` +
  `<path d="M-5.9 8.3 C -6.1 9.5 -6.6 10.4 -7.4 11.2 C -7.7 10.2 -7.3 9.2 -6.5 8 Z" fill="${C.dark}"/>`);

const wingR = a => g(scl(fold(a), 1, 1, 0) + ' ' + rot(-a * 0.55, 1, -2),
  `<path d="M0.8 -4.6 C 4.6 -7.6 9.4 -12.1 13.8 -14.9 L16.3 -10.3 C 15.1 -6.3 11.5 -3.1 7.4 -1.8 C 4.4 -0.9 1.8 -1.8 0.8 -3.2 Z" fill="${C.yellow}"/>` +
  `<path d="M13.8 -14.9 L16.3 -10.3 C 15.7 -8.4 14.7 -6.7 13.4 -5.3 C 14 -8 14.2 -10.9 12.6 -13.9 Z" fill="${C.dark}" opacity=".92"/>` +
  `<path d="M2.2 -4.2 C 5.2 -6.2 8.2 -8.8 11.2 -11.6 M3.4 -3.2 C 6.6 -4.7 9.6 -6.7 12.4 -9 M5 -2.4 C 7.8 -3.4 10.4 -4.9 12.6 -6.7" stroke="${C.dark}" stroke-width=".55" fill="none" opacity=".7" stroke-linecap="round"/>` +
  `<path d="M1 -1 C 4 0 8.5 1.5 9.5 5.5 C 10 8.4 7.8 10.2 4.8 9.2 C 2.4 8.4 1 5.8 0.6 3 Z" fill="${C.yellow}"/>` +
  `<path d="M9.1 5.7 C 8.7 8.1 6.7 9.3 4.7 8.7 C 3 8.1 1.8 6.6 1.2 4.5" stroke="${C.dark}" stroke-width="2.3" fill="none" stroke-linecap="round"/>` +
  `<circle cx="7.6" cy="7.3" r=".62" fill="${C.blue}"/><circle cx="5.4" cy="8.1" r=".62" fill="${C.blue}"/><circle cx="3.3" cy="7.4" r=".62" fill="${C.blue}"/>` +
  `<circle cx="1.7" cy="5.2" r=".85" fill="${C.red}"/><circle cx="1.7" cy="5.2" r=".32" fill="${C.dark}" opacity=".7"/>` +
  `<path d="M5.9 8.3 C 6.1 9.5 6.6 10.4 7.4 11.2 C 7.7 10.2 7.3 9.2 6.5 8 Z" fill="${C.dark}"/>`);

// P: wA (0 open → 62 closed-up), antA
const bfly = P =>
  wingL(P.wA || 0) + wingR(P.wA || 0) +
  `<path d="M0 -7.5 C 1.5 -7.5 2 -5.5 2 -3 C 2 0.5 1.4 5 0 7 C -1.4 5 -2 0.5 -2 -3 C -2 -5.5 -1.5 -7.5 0 -7.5 Z" fill="${C.body}"/>` +
  `<ellipse cx="0" cy="-5.6" rx=".5" ry="2.6" fill="${C.yellow}" opacity=".4"/>` +
  `<circle cx="0" cy="-7.6" r="1.7" fill="${C.body}"/>` +
  `<circle cx="-0.5" cy="-8.1" r=".45" fill="${C.pale}" opacity=".6"/>` +
  g(rot(P.antA || 0, 0, -8.6),
    `<path d="M-0.8 -8.6 C -2.4 -11.5 -3.6 -13 -4.8 -13.8 M0.8 -8.6 C 2.4 -11.5 3.6 -13 4.8 -13.8" stroke="${C.body}" stroke-width=".9" fill="none" stroke-linecap="round"/>` +
    `<circle cx="-4.8" cy="-13.8" r="1" fill="${C.body}"/><circle cx="4.8" cy="-13.8" r="1" fill="${C.body}"/>`);

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.grounded) s += shadow(dx, GY + 0.8, 9, Math.max(0, -dy), 12);
  return s + g(trl(dx, dy) + ' ' + rot(P.roll || 0, 0, 0), bfly(P));
}

return {
  id: 'swallowtail', view: [-30, -26, 62, 44], groundY: GY,
  thumb: { m: 'bask', t: 0.3 },
  motions: [
    { id: 'bask', label: 'Bask', short: 'Bask', dur: 3.8, env: { t: 'ground' }, speed: '0 km/h', beat: 'Open · tremble · hold',
      desc: 'Wings spread wide to the sun, the twin tails just clearing the grass — held open far longer than the red admiral would dare.',
      anim: 'Live in the open pose: a fine tremble at the wingtips, antennae always moving. Close once, decisively, and reopen at leisure.' },
    { id: 'flit', label: 'Flit', short: 'Flit', dur: 0.62, env: { t: 'air' }, speed: '~14 km/h', beat: 'Deep strokes · lift',
      desc: 'Big, deep wingbeats for a big butterfly — each stroke hoists the body a full length before the long sail downhill.',
      anim: 'Fewer, deeper beats than any smaller butterfly. Let the body swing beneath the wings like cargo on a crane.' },
    { id: 'nectar', label: 'Feed on the wing', short: 'Nectar', dur: 1.15, env: { t: 'reed', x: 11, y: -6 }, speed: '0 km/h · hovering', beat: 'Beats while feeding',
      desc: 'Its signature habit: it never quite settles at the flower, but keeps the wings beating and merely touches down with its forefeet.',
      anim: 'Constant shallow wingbeats with a soft vertical bob. The hold is never still — drift the body on a slow figure the wings must correct.' }
    ,{ id: 'roost', label: 'Roost', short: 'Roost', dur: 6, env: { t: 'reed', x: -2, y: -10 }, night: true, speed: '0 km/h', beat: 'Wings shut · slow sway',
      desc: 'The grand wings folded to a narrow blade over the back, tails hanging, clamped to a stem out of the night wind.',
      anim: 'Keep the folded silhouette still and vertical; only the faintest sway betrays that the stem carries something alive.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'roost') {
      return draw({ grounded: false, dy: 0, wA: 72 + 2 * Math.sin(TAU * t), antA: 2 * Math.sin(TAU * t * 0.5) });
    }
    if (mid === 'flit') {
      const flap = osc(t, 2, 0);
      return draw({
        wA: 30 + 34 * flap,
        dy: -4.2 * osc(t, 1, .3) - 1.4 * osc(t, 2, .1), dx: 3 * osc(t, 1, .04),
        roll: 8 * osc(t, 1, .42), antA: 3 * osc(t, 2, .3),
        ticks: airTicks(t, { x1: -27, x2: 29, y: -16, h: 14, v: 30, n: 4, s: 1.05 })
      });
    }
    if (mid === 'nectar') {
      return draw({
        wA: 30 + 15 * osc(t, 7, 0),
        dy: -2 - 1.1 * osc(t, 2, .15) - 0.5 * osc(t, 7, .25),
        dx: 2 + 1.4 * osc(t, 1, .05),
        roll: 4 * osc(t, 1, .35) + 2 * osc(t, 2, .6),
        antA: 3 * osc(t, 3, .2)
      });
    }
    // bask
    const K = keys(t, [
      [0.00, { wA: 3 }],
      [0.44, { wA: 3 }],
      [0.52, { wA: 60 }],
      [0.62, { wA: 60 }],
      [0.70, { wA: -4 }],
      [0.76, { wA: 3 }],
      [1.00, { wA: 3 }]
    ]);
    K.wA += 2 * osc(t, 6, .15) * (K.wA > 30 ? 0.5 : 1);
    K.grounded = true;
    K.dy = -0.8;
    K.antA = 4 * osc(t, 3, .1);
    return draw(K);
  }
};

})();
__REG["commonblue"] = (function(){
// Common Blue — fable style (front view: male's lilac-blue wings, dark rim, white fringe, orange marginal lunules)
const C = { blue: '#6E86D8', blue2: '#5A70C4', edge: '#3A3440', fringe: '#FBF7F2', orange: '#D98A3E', spot: '#2A2530', body: '#2A2530', pale: '#FBF7F2' };
const GY = 8.5;

const fold = a => Math.max(0.12, Math.cos(Math.min(88, Math.abs(a)) * Math.PI / 180));

const wingL = a => g(scl(fold(a), 1, -1, 0) + ' ' + rot(a * 0.55, -1, -2),
  `<path d="M-0.8 -4.6 C -4.6 -7.6 -9.4 -12.1 -13.8 -14.9 L-16.3 -10.3 C -15.1 -6.3 -11.5 -3.1 -7.4 -1.8 C -4.4 -0.9 -1.8 -1.8 -0.8 -3.2 Z" fill="${C.blue}"/>` +
  `<path d="M-1.2 -3.6 C -4.8 -5.6 -8.8 -8.6 -12.4 -11.8" stroke="${C.blue2}" stroke-width="1.3" fill="none" opacity=".55" stroke-linecap="round"/>` +
  `<path d="M-13.8 -14.9 L-16.3 -10.3 C -15.1 -6.3 -11.5 -3.1 -7.4 -1.8" stroke="${C.edge}" stroke-width="1" fill="none" stroke-linecap="round"/>` +
  `<circle cx="-15.5" cy="-10.7" r=".4" fill="${C.fringe}"/><circle cx="-13.3" cy="-6.3" r=".4" fill="${C.fringe}"/><circle cx="-10.2" cy="-3.3" r=".4" fill="${C.fringe}"/>` +
  `<path d="M-1 -1 C -4 0 -8.5 1.5 -9.5 5.5 C -10 8.4 -7.8 10.2 -4.8 9.2 C -2.4 8.4 -1 5.8 -0.6 3 Z" fill="${C.blue}"/>` +
  `<path d="M-9.5 5.5 C -10 8.4 -7.8 10.2 -4.8 9.2 C -2.4 8.4 -1 5.8 -0.6 3" stroke="${C.edge}" stroke-width=".9" fill="none" stroke-linecap="round"/>` +
  `<circle cx="-7.3" cy="7.7" r=".55" fill="${C.orange}"/><circle cx="-5.2" cy="8.4" r=".55" fill="${C.orange}"/>` +
  `<circle cx="-7.3" cy="8.7" r=".34" fill="${C.spot}"/><circle cx="-5.2" cy="9.4" r=".34" fill="${C.spot}"/>` +
  `<circle cx="-8.7" cy="7" r=".36" fill="${C.fringe}"/><circle cx="-3.2" cy="8.9" r=".36" fill="${C.fringe}"/>`);

const wingR = a => g(scl(fold(a), 1, 1, 0) + ' ' + rot(-a * 0.55, 1, -2),
  `<path d="M0.8 -4.6 C 4.6 -7.6 9.4 -12.1 13.8 -14.9 L16.3 -10.3 C 15.1 -6.3 11.5 -3.1 7.4 -1.8 C 4.4 -0.9 1.8 -1.8 0.8 -3.2 Z" fill="${C.blue}"/>` +
  `<path d="M1.2 -3.6 C 4.8 -5.6 8.8 -8.6 12.4 -11.8" stroke="${C.blue2}" stroke-width="1.3" fill="none" opacity=".55" stroke-linecap="round"/>` +
  `<path d="M13.8 -14.9 L16.3 -10.3 C 15.1 -6.3 11.5 -3.1 7.4 -1.8" stroke="${C.edge}" stroke-width="1" fill="none" stroke-linecap="round"/>` +
  `<circle cx="15.5" cy="-10.7" r=".4" fill="${C.fringe}"/><circle cx="13.3" cy="-6.3" r=".4" fill="${C.fringe}"/><circle cx="10.2" cy="-3.3" r=".4" fill="${C.fringe}"/>` +
  `<path d="M1 -1 C 4 0 8.5 1.5 9.5 5.5 C 10 8.4 7.8 10.2 4.8 9.2 C 2.4 8.4 1 5.8 0.6 3 Z" fill="${C.blue}"/>` +
  `<path d="M9.5 5.5 C 10 8.4 7.8 10.2 4.8 9.2 C 2.4 8.4 1 5.8 0.6 3" stroke="${C.edge}" stroke-width=".9" fill="none" stroke-linecap="round"/>` +
  `<circle cx="7.3" cy="7.7" r=".55" fill="${C.orange}"/><circle cx="5.2" cy="8.4" r=".55" fill="${C.orange}"/>` +
  `<circle cx="7.3" cy="8.7" r=".34" fill="${C.spot}"/><circle cx="5.2" cy="9.4" r=".34" fill="${C.spot}"/>` +
  `<circle cx="8.7" cy="7" r=".36" fill="${C.fringe}"/><circle cx="3.2" cy="8.9" r=".36" fill="${C.fringe}"/>`);

// P: wA (0 open → 60 closed-up), antA
const bfly = P =>
  wingL(P.wA || 0) + wingR(P.wA || 0) +
  `<path d="M0 -6.6 C 1.3 -6.6 1.7 -4.9 1.7 -2.7 C 1.7 0.4 1.2 4.4 0 6.2 C -1.2 4.4 -1.7 0.4 -1.7 -2.7 C -1.7 -4.9 -1.3 -6.6 0 -6.6 Z" fill="${C.body}"/>` +
  `<ellipse cx="0" cy="-4.9" rx=".45" ry="2.3" fill="${C.blue}" opacity=".3"/>` +
  `<circle cx="0" cy="-6.7" r="1.5" fill="${C.body}"/>` +
  `<circle cx="-0.45" cy="-7.1" r=".4" fill="${C.pale}" opacity=".6"/>` +
  g(rot(P.antA || 0, 0, -7.6),
    `<path d="M-0.7 -7.6 C -2 -10.2 -3.1 -11.6 -4.2 -12.3 M0.7 -7.6 C 2 -10.2 3.1 -11.6 4.2 -12.3" stroke="${C.body}" stroke-width=".8" fill="none" stroke-linecap="round"/>` +
    `<circle cx="-4.2" cy="-12.3" r=".9" fill="${C.pale}"/><circle cx="4.2" cy="-12.3" r=".9" fill="${C.pale}"/>` +
    `<circle cx="-4.2" cy="-12.3" r=".9" fill="none" stroke="${C.body}" stroke-width=".4"/><circle cx="4.2" cy="-12.3" r=".9" fill="none" stroke="${C.body}" stroke-width=".4"/>`);

function draw(P) {
  const s0 = P.scale || 0.82;
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.grounded) s += shadow(dx, GY + 0.8, 7, Math.max(0, -dy), 12);
  return s + g(trl(dx, dy) + ' ' + scl(s0, s0, 0, 0) + ' ' + rot(P.roll || 0, 0, 0), bfly(P));
}

return {
  id: 'commonblue', view: [-26, -24, 52, 40], groundY: GY,
  thumb: { m: 'bask', t: 0.5 },
  motions: [
    { id: 'bask', label: 'Bask', short: 'Bask', dur: 3.0, env: { t: 'ground' }, speed: '0 km/h', beat: 'Half-open · tremble',
      desc: 'A thumbnail of sky held half-cocked to catch the low morning sun, wings quivering, rarely laid fully flat.',
      anim: 'Keep the wings around a third open and alive with a fine tremble — a small butterfly never quite goes still. Antennae always working.' },
    { id: 'flit', label: 'Flit', short: 'Flit', dur: 0.46, env: { t: 'air' }, speed: '~7 km/h', beat: 'Fast shallow flicks',
      desc: 'Quick, low and restless, threading a wandering line a hand\u2019s breadth above the grass heads and never for long.',
      anim: 'Fast, shallow beats — faster than any larger butterfly here. Keep it low, keep it wandering, and let the light body jitter.' },
    { id: 'settle', label: 'Settle to feed', short: 'Settle', dur: 1.1, env: { t: 'reed', x: 9, y: -4 }, speed: '0 km/h', beat: 'Land · fold · sip',
      desc: 'It drops onto a flower head, closes the wings up over its back, and feeds — the blue put away, only the freckled underside showing.',
      anim: 'Arrive with a last flick, then fold the wings up and hold near-closed with a slow breathing sway. A tiny settle-bob on landing.' }
    ,{ id: 'roost', label: 'Roost', short: 'Roost', dur: 5.5, env: { t: 'reed', x: 2, y: -8 }, night: true, speed: '0 km/h', beat: 'Wings shut · slow sway',
      desc: 'Perched high on a grass head with the wings shut over its back, the blue put away, only the freckled grey underside left to the dusk.',
      anim: 'A tiny closed wedge on a swaying stem; let it breathe with the grass and hold the wings near-shut all night.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'roost') {
      return draw({ grounded: false, dy: -0.6, wA: 66 + 2 * Math.sin(TAU * t), antA: 2 * Math.sin(TAU * t * 0.5) });
    }
    if (mid === 'flit') {
      const flap = osc(t, 2, 0);
      return draw({
        wA: 26 + 30 * flap,
        dy: -2.4 * osc(t, 1, .28) - 1 * osc(t, 2, .1), dx: 2.2 * osc(t, 1, .05),
        roll: 9 * osc(t, 1, .4), antA: 3 * osc(t, 2, .3),
        ticks: airTicks(t, { x1: -23, x2: 25, y: -14, h: 12, v: 34, n: 4, s: .9 })
      });
    }
    if (mid === 'settle') {
      const land = keys(t, [
        [0.00, { wA: 40 }],
        [0.16, { wA: 20 }],
        [0.30, { wA: 58 }],
        [1.00, { wA: 58 }]
      ]);
      land.wA += 3 * osc(t, 3, .1) * (t > 0.32 ? 1 : 0);
      land.dy = -1.4 - 0.6 * osc(t, 1.5, .2) - 1.2 * pulse(t, 0.16, 0.34);
      land.antA = 3 * osc(t, 3, .2);
      return draw(land);
    }
    // bask — held part-open, trembling
    const K = keys(t, [
      [0.00, { wA: 34 }],
      [0.40, { wA: 34 }],
      [0.50, { wA: 8 }],
      [0.58, { wA: 34 }],
      [1.00, { wA: 34 }]
    ]);
    K.wA += 2.6 * osc(t, 7, .15);
    K.grounded = true;
    K.dy = -0.6;
    K.antA = 4.5 * osc(t, 3.5, .1);
    return draw(K);
  }
};

})();
__REG["peacock"] = (function(){
// Peacock — fable style (front view: rust-red wings with the four blue-and-black eyespots)
const C = { red: '#A83A2A', red2: '#872E20', dark: '#2A2530', blue: '#5F7CB8', pale: '#FBF7F2', cream: '#EAD9B0', body: '#2A2530' };
const GY = 8.5;

const fold = a => Math.max(0.12, Math.cos(Math.min(88, Math.abs(a)) * Math.PI / 180));

const wingL = a => g(scl(fold(a), 1, -1, 0) + ' ' + rot(a * 0.55, -1, -2),
  `<path d="M-0.8 -4.6 C -4.6 -7.6 -9.4 -12.1 -13.8 -14.9 L-16.3 -10.3 C -15.1 -6.3 -11.5 -3.1 -7.4 -1.8 C -4.4 -0.9 -1.8 -1.8 -0.8 -3.2 Z" fill="${C.red}"/>` +
  `<path d="M-0.8 -4.6 C -4.6 -7.6 -9.4 -12.1 -13.8 -14.9 L-14.7 -13.1 C -10.2 -10.6 -5.4 -7.1 -1.7 -4.2 Z" fill="${C.red2}"/>` +
  `<path d="M-13.9 -14.6 C -11.4 -13.3 -9.9 -11.3 -9.9 -8.9 C -11.9 -9 -14 -10.3 -15.3 -12.3 Z" fill="${C.cream}"/>` +
  `<circle cx="-12.5" cy="-11.6" r="1.75" fill="${C.dark}"/>` +
  `<circle cx="-13.1" cy="-12.3" r=".78" fill="${C.blue}"/><circle cx="-11.7" cy="-10.7" r=".5" fill="${C.blue}"/>` +
  `<path d="M-1 -1 C -4 0 -8.5 1.5 -9.5 5.5 C -10 8.4 -7.8 10.2 -4.8 9.2 C -2.4 8.4 -1 5.8 -0.6 3 Z" fill="${C.red}"/>` +
  `<path d="M-1 -1 C -3.1 -0.2 -5.6 0.7 -7.1 2.5 C -5 3.1 -2.6 2.7 -0.8 2 Z" fill="${C.red2}" opacity=".8"/>` +
  `<circle cx="-6.3" cy="6.2" r="2.35" fill="${C.dark}"/>` +
  `<circle cx="-6.3" cy="6.2" r="1.4" fill="${C.blue}"/>` +
  `<circle cx="-6.8" cy="5.7" r=".5" fill="${C.pale}" opacity=".85"/>`);

const wingR = a => g(scl(fold(a), 1, 1, 0) + ' ' + rot(-a * 0.55, 1, -2),
  `<path d="M0.8 -4.6 C 4.6 -7.6 9.4 -12.1 13.8 -14.9 L16.3 -10.3 C 15.1 -6.3 11.5 -3.1 7.4 -1.8 C 4.4 -0.9 1.8 -1.8 0.8 -3.2 Z" fill="${C.red}"/>` +
  `<path d="M0.8 -4.6 C 4.6 -7.6 9.4 -12.1 13.8 -14.9 L14.7 -13.1 C 10.2 -10.6 5.4 -7.1 1.7 -4.2 Z" fill="${C.red2}"/>` +
  `<path d="M13.9 -14.6 C 11.4 -13.3 9.9 -11.3 9.9 -8.9 C 11.9 -9 14 -10.3 15.3 -12.3 Z" fill="${C.cream}"/>` +
  `<circle cx="12.5" cy="-11.6" r="1.75" fill="${C.dark}"/>` +
  `<circle cx="13.1" cy="-12.3" r=".78" fill="${C.blue}"/><circle cx="11.7" cy="-10.7" r=".5" fill="${C.blue}"/>` +
  `<path d="M1 -1 C 4 0 8.5 1.5 9.5 5.5 C 10 8.4 7.8 10.2 4.8 9.2 C 2.4 8.4 1 5.8 0.6 3 Z" fill="${C.red}"/>` +
  `<path d="M1 -1 C 3.1 -0.2 5.6 0.7 7.1 2.5 C 5 3.1 2.6 2.7 0.8 2 Z" fill="${C.red2}" opacity=".8"/>` +
  `<circle cx="6.3" cy="6.2" r="2.35" fill="${C.dark}"/>` +
  `<circle cx="6.3" cy="6.2" r="1.4" fill="${C.blue}"/>` +
  `<circle cx="5.8" cy="5.7" r=".5" fill="${C.pale}" opacity=".85"/>`);

// P: wA (0 open → 62 closed-up), antA
const bfly = P =>
  wingL(P.wA || 0) + wingR(P.wA || 0) +
  `<path d="M0 -7.5 C 1.5 -7.5 2 -5.5 2 -3 C 2 0.5 1.4 5 0 7 C -1.4 5 -2 0.5 -2 -3 C -2 -5.5 -1.5 -7.5 0 -7.5 Z" fill="${C.body}"/>` +
  `<ellipse cx="0" cy="-5.6" rx=".5" ry="2.6" fill="${C.pale}" opacity=".18"/>` +
  `<circle cx="0" cy="-7.6" r="1.7" fill="${C.body}"/>` +
  `<circle cx="-0.5" cy="-8.1" r=".45" fill="${C.pale}" opacity=".6"/>` +
  g(rot(P.antA || 0, 0, -8.6),
    `<path d="M-0.8 -8.6 C -2.4 -11.5 -3.6 -13 -4.8 -13.8 M0.8 -8.6 C 2.4 -11.5 3.6 -13 4.8 -13.8" stroke="${C.body}" stroke-width=".9" fill="none" stroke-linecap="round"/>` +
    `<circle cx="-4.8" cy="-13.8" r="1" fill="${C.body}"/><circle cx="4.8" cy="-13.8" r="1" fill="${C.body}"/>`);

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.grounded) s += shadow(dx, GY + 0.8, 9, Math.max(0, -dy), 12);
  return s + g(trl(dx, dy) + ' ' + rot(P.roll || 0, 0, 0), bfly(P));
}

return {
  id: 'peacock', view: [-30, -26, 62, 44], groundY: GY,
  thumb: { m: 'bask', t: 0.05 },
  motions: [
    { id: 'bask', label: 'Bask', short: 'Bask', dur: 3.6, env: { t: 'ground' }, speed: '0 km/h', beat: 'Open · hold · close',
      desc: 'Wings laid flat to the sun, the four eyes staring up. Between spells it folds them shut to a dead-leaf brown and all but disappears.',
      anim: 'Hold the open pose long and still — the eyespots are the whole point. Close slowly, hold shut even longer, reopen without warning.' },
    { id: 'flash', label: 'Startle flash', short: 'Flash', dur: 1.6, env: { t: 'ground' }, speed: '0 km/h', beat: 'Snap open · glare · snap shut',
      desc: 'Its famous bluff: wings clapped shut, then snapped wide in a single frame to throw four sudden eyes at whatever leaned too close.',
      anim: 'The snap is 2–3 frames, no more — sell it with a tiny recoil of the body. Then a dead-still glare, then a hard clap shut. Fear, not grace.' },
    { id: 'flutter', label: 'Flutter', short: 'Flutter', dur: 0.58, env: { t: 'air' }, speed: '~10 km/h', beat: 'Burst flaps + bounce',
      desc: 'A powerful, jinking flight in bursts of deep flaps, the heavy body tossed on an unrepeatable line.',
      anim: 'Deeper, slower beats than the smaller butterflies. Let the body swing and lurch — nothing travels straight.' },
    { id: 'sail', label: 'Sail', short: 'Sail', dur: 2.8, env: { t: 'air' }, speed: '~13 km/h', beat: 'Set wings · drift',
      desc: 'Between bursts it sets the wings flat and rides, losing height by lazy degrees before the next flurry.',
      anim: 'Wings just above horizontal with the faintest flutter; sell the drift with a slow roll and a long sinking curve.' }
    ,{ id: 'roost', label: 'Roost', short: 'Roost', dur: 6, env: { t: 'reed', x: -2, y: -10 }, night: true, speed: '0 km/h', beat: 'Wings shut · slow sway',
      desc: 'Wings snapped shut to their dead-leaf brown underside, the four eyes put away for the night, hung motionless beneath a stem.',
      anim: 'Absolute stillness in the closed pose — the drama is that the eyes are gone; just a scrap of dark bark, breathing.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'roost') {
      return draw({ grounded: false, dy: 0, wA: 72 + 2 * Math.sin(TAU * t), antA: 2 * Math.sin(TAU * t * 0.5) });
    }
    if (mid === 'flutter') {
      const flap = osc(t, 2, 0);
      return draw({
        wA: 32 + 32 * flap,
        dy: -3.4 * osc(t, 1, .28) - 1.3 * osc(t, 2, .1), dx: 2.8 * osc(t, 1, .05),
        roll: 8 * osc(t, 1, .4), antA: 3 * osc(t, 2, .3),
        ticks: airTicks(t, { x1: -27, x2: 29, y: -16, h: 14, v: 32, n: 4, s: 1.05 })
      });
    }
    if (mid === 'sail') {
      return draw({
        wA: -6 + 3 * osc(t, 4, .1),
        dy: -3.5 * osc(t, 1, .3), dx: 4 * osc(t, 1, .02),
        roll: 5 * osc(t, 1, .5), antA: 2 * osc(t, 2, .2),
        ticks: airTicks(t, { x1: -27, x2: 29, y: -16, h: 14, v: 22, n: 4, s: 1 })
      });
    }
    if (mid === 'flash') {
      const K = keys(t, [
        [0.00, { wA: 62 }],
        [0.20, { wA: 62 }],
        [0.26, { wA: -7 }],
        [0.32, { wA: 1 }],
        [0.58, { wA: 1 }],
        [0.64, { wA: 62 }],
        [0.90, { wA: 62 }],
        [1.00, { wA: 62 }]
      ]);
      K.grounded = true;
      K.dy = -1.6 * (pulse(t, 0.24, 0.34) + pulse(t, 0.62, 0.7));
      K.antA = 5 * osc(t, 4, .1);
      return draw(K);
    }
    // bask
    const K = keys(t, [
      [0.00, { wA: 1 }],
      [0.18, { wA: 1 }],
      [0.36, { wA: 62 }],
      [0.54, { wA: 62 }],
      [0.62, { wA: -5 }],
      [0.68, { wA: 1 }],
      [0.90, { wA: 1 }],
      [1.00, { wA: 1 }]
    ]);
    K.wA += 1.4 * osc(t, 5, .2) * (K.wA > 30 ? 1 : 0.4);
    K.grounded = true;
    K.antA = 4 * osc(t, 3, .1);
    return draw(K);
  }
};

})();
__REG["dragonfly"] = (function(){
// Emperor Dragonfly — fable style (side profile; art faces LEFT, flipped to face right)
// Anax imperator male: apple-green thorax, sky-blue abdomen w/ black dorsal line, green eyes.
const C = {
  eye:'#7CB68D', eyeLo:'#5A9EC6', eyeHi:'#D3EBDC',
  thorax:'#83B15C', thoraxHi:'#98C36E', thoraxDk:'#688F45',
  abd:'#5EA6D6', abdDk:'#4187BB', dorsal:'#2B3138', joint:'#CFE7F2',
  wing:'#E5F1F6', vein:'#A0B7BE', stigma:'#3B4046', leg:'#2E2A26'
};
const GY = 10;

// long narrow blade from (0,0) along +x, half-width W
function blade(L, W) {
  return `M0 0 C ${N(L*0.13)} ${N(-W)} ${N(L*0.5)} ${N(-W*1.12)} ${N(L*0.79)} ${N(-W*0.52)} `
    + `C ${N(L*0.92)} ${N(-W*0.18)} ${N(L)} ${N(-W*0.06)} ${N(L)} 0 `
    + `C ${N(L)} ${N(W*0.06)} ${N(L*0.92)} ${N(W*0.18)} ${N(L*0.79)} ${N(W*0.52)} `
    + `C ${N(L*0.5)} ${N(W*1.12)} ${N(L*0.13)} ${N(W)} 0 0 Z`;
}
function veins(L, W) {
  let v = `<path d="M${N(L*0.05)} ${N(-W*0.12)} C ${N(L*0.4)} ${N(-W*0.42)} ${N(L*0.72)} ${N(-W*0.32)} ${N(L*0.95)} ${N(-W*0.05)}" stroke="${C.vein}" stroke-width="0.22" fill="none" opacity=".5"/>`
    + `<path d="M${N(L*0.05)} ${N(W*0.08)} C ${N(L*0.4)} ${N(W*0.28)} ${N(L*0.72)} ${N(W*0.22)} ${N(L*0.95)} ${N(W*0.03)}" stroke="${C.vein}" stroke-width="0.2" fill="none" opacity=".4"/>`;
  for (let i = 0; i < 6; i++) {
    const x = L * (0.2 + i * 0.13), k = 1 - i * 0.1;
    v += `<line x1="${N(x)}" y1="${N(-W*0.6*k)}" x2="${N(x)}" y2="${N(W*0.55*k)}" stroke="${C.vein}" stroke-width="0.14" opacity=".36"/>`;
  }
  return v;
}
function wing(bx, by, deg, L, W, op) {
  return g(trl(bx, by) + ' ' + rot(deg, 0, 0),
    `<path d="${blade(L, W)}" fill="${C.wing}" opacity="${N(op)}"/>` +
    veins(L, W) +
    `<rect x="${N(L*0.79)}" y="${N(-W*0.5)}" width="${N(L*0.1)}" height="${N(W*0.26)}" rx="0.25" fill="${C.stigma}" opacity=".85"/>`);
}

function abdomen(flex) {
  const rings = [[0.5,1.62],[3.5,1.55],[6.5,1.46],[9.5,1.3],[12.5,1.1],[15,0.9],[17.5,0.68]];
  const cy = x => x < 13 ? 0.02 * x : 0.26 + 0.16 * (x - 13);
  let r = '';
  for (const [x, h] of rings) {
    const c = cy(x);
    r += `<line x1="${x}" y1="${N(c-h)}" x2="${x}" y2="${N(c+h)}" stroke="${C.dorsal}" stroke-width="0.4" opacity=".5"/>`
      + `<line x1="${N(x-0.55)}" y1="${N(c-h*0.85)}" x2="${N(x-0.55)}" y2="${N(c+h*0.65)}" stroke="${C.joint}" stroke-width="0.4" opacity=".55"/>`;
  }
  return g(rot(flex || 0, -2, 0),
    `<path d="M-2 -1.75 C 3 -2.0 9 -1.65 14 -0.95 C 17.5 -0.5 20 0.15 21.3 1.05 C 21.7 1.35 21.4 1.75 20.7 1.7 C 20 1.65 17.5 1.45 14 1.05 C 9 1.8 3 2.05 -2 1.8 C -3.1 1.7 -3.1 -1.65 -2 -1.75 Z" fill="${C.abd}"/>` +
    `<path d="M-2 0.25 C 4 0.8 10 1.05 15 1.02 C 10 1.85 3.5 2.05 -2 1.8 C -3.1 1.62 -2.7 0.6 -2 0.25 Z" fill="${C.abdDk}"/>` +
    r +
    `<path d="M-2 -1.4 C 3 -1.68 9 -1.35 14 -0.72 C 17.6 -0.32 20 0.35 21.2 1.05" stroke="${C.dorsal}" stroke-width="0.85" fill="none" stroke-linecap="round" opacity=".9"/>` +
    `<ellipse cx="4" cy="-0.9" rx="5" ry="0.45" fill="#fff" opacity=".24"/>`);
}

const thorax =
  `<path d="M-5.4 -2.6 C -3.2 -3.5 -0.6 -3.0 0.2 -1.6 C 0.8 -0.4 0.7 1.5 -0.1 2.5 C -1.1 3.6 -4.2 3.6 -5.6 2.6 C -6.6 1.9 -6.6 -2.0 -5.4 -2.6 Z" fill="${C.thorax}"/>` +
  `<path d="M-5.4 -2.6 C -3.2 -3.5 -0.6 -3.0 0.2 -1.6 C -1.5 -1.9 -3.6 -1.5 -5.2 -0.55 C -6.1 -1.6 -6.0 -2.2 -5.4 -2.6 Z" fill="${C.thoraxHi}" opacity=".8"/>` +
  `<path d="M-4.4 -1.7 C -3.5 0.5 -3.1 2.1 -3.3 3.3" stroke="${C.thoraxDk}" stroke-width="0.55" fill="none" opacity=".5"/>`;

const legs =
  `<g stroke="${C.leg}" stroke-width="0.62" fill="none" stroke-linecap="round">` +
  `<path d="M-4.6 2.2 C -6.4 3.6 -8.0 4.6 -9.2 6.2"/>` +
  `<path d="M-3.4 2.7 C -5.0 4.4 -6.2 5.8 -7.0 7.2"/>` +
  `<path d="M-1.8 2.9 C -2.8 4.7 -3.6 6.1 -4.0 7.5"/></g>` +
  `<g stroke="${C.leg}" stroke-width="0.34" stroke-linecap="round" opacity=".8">` +
  `<path d="M-7.3 4.5 l-0.9 0.5 M-8.3 5.4 l-0.9 0.4 M-5.7 5.2 l-0.8 0.5 M-6.5 6.1 l-0.8 0.4 M-3.1 5.1 l-0.7 0.5 M-3.6 6.2 l-0.7 0.4"/></g>`;

function head(tilt) {
  return g(rot(tilt || 0, -5.5, 0),
    `<path d="M-5.6 -1.6 C -6.4 -0.8 -6.4 1.4 -5.6 2.2 C -5.0 1.2 -5.0 -0.6 -5.6 -1.6 Z" fill="${C.thoraxDk}" opacity=".55"/>` +
    `<ellipse cx="-8.9" cy="0.1" rx="3.7" ry="3.15" fill="${C.eye}"/>` +
    `<path d="M-8.9 -3.0 A3.7 3.15 0 0 1 -8.9 3.2 C -6.9 3.1 -5.5 1.9 -5.5 0.1 C -5.5 -1.7 -6.9 -3.0 -8.9 -3.0 Z" fill="${C.eyeHi}" opacity=".22"/>` +
    `<path d="M-12.4 0.5 A3.7 3.15 0 0 0 -5.4 0.9 C -6.5 2.5 -7.8 3.25 -9.2 3.2 C -11.2 3.1 -12.5 1.9 -12.4 0.5 Z" fill="${C.eyeLo}" opacity=".8"/>` +
    `<path d="M-12.0 1.5 C -12.9 1.7 -13.1 2.6 -12.3 3.05 C -11.7 2.5 -11.7 1.9 -12.0 1.5 Z" fill="#C9B98C"/>` +
    `<ellipse cx="-10.4" cy="-1.4" rx="1.6" ry="1.1" fill="${C.eyeHi}" opacity=".5" transform="rotate(-18 -10.4 -1.4)"/>` +
    `<circle cx="-11.0" cy="-1.8" r=".5" fill="#fff" opacity=".85"/>`);
}

function sprite(P) {
  const fast = P.wingFast || 0;
  const op = 0.6 - 0.22 * fast;
  const ff = P.foreFlap || 0, hf = P.hindFlap || 0;
  let far = wing(-3.4, -2.3, 205 + ff, 15.2, 2.6, op * 0.72) + wing(-1.8, -2.3, -22 + hf, 14.4, 3.0, op * 0.72);
  let near = wing(-3.8, -2.5, 201 + ff, 15.2, 2.6, op) + wing(-1.4, -2.5, -18 + hf, 14.4, 3.0, op);
  if (fast) {
    const gh = op * 0.4;
    far = wing(-3.4, -2.3, 205 + ff + 7, 15.2, 2.6, gh) + wing(-1.8, -2.3, -22 + hf - 7, 14.4, 3.0, gh) + far;
    near += wing(-3.8, -2.5, 201 + ff - 7, 15.2, 2.6, gh) + wing(-1.4, -2.5, -18 + hf + 7, 14.4, 3.0, gh);
  }
  return far + legs + abdomen(P.abdA) + thorax + head(P.headA) + near;
}

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.streaks) s += P.streaks;
  if (P.grounded) s += shadow(dx + 2, GY, 9, Math.max(0, 4 - dy), 16);
  return s + g(trl(dx, dy) + ' ' + rot(P.pitch || 0, 0, 0), g('scale(-1 1)', sprite(P)));
}

return {
  id: 'dragonfly', view: [-30, -20, 62, 40], groundY: GY,
  thumb: { m: 'perch', t: 0.05 },
  motions: [
    { id: 'perch', label: 'Perch', short: 'Perch', dur: 3.6, env: { t: 'reed', x: 9, y: -3 }, speed: '0 km/h', beat: 'Still · wing flicks',
      desc: 'Hung on a reed between patrols: the four wings held glassy and flat, the long blue abdomen balancing on air.',
      anim: 'Total stillness sold by interruptions — one wing flick, one abdomen flex, seconds apart. Nothing eases; everything snaps.' },
    { id: 'hover', label: 'Hover', short: 'Hover', dur: 0.8, env: { t: 'air' }, speed: '0 km/h', beat: 'Wings 30/s · pinned',
      desc: 'Holding a point in the air on four independent wings — the body drifts a centimetre and corrects, drifts and corrects.',
      anim: 'Blur the wings and pin the body: tiny drift-and-correct wander, never a smooth orbit. The head stays dead level throughout.' },
    { id: 'dart', label: 'Dart', short: 'Dart', dur: 2.6, env: { t: 'air' }, speed: '~55 km/h burst', beat: 'Hold → whip → hold',
      desc: 'The strike: from a standing hover to thirty body-lengths away inside a second, then stopped dead as if braked on a wire.',
      anim: 'One or two frames of smear for the launch, a hard stop with a single overshoot wobble. The hold before the dart is the storytelling.' }
    ,{ id: 'roost', label: 'Roost', short: 'Roost', dur: 6, env: { t: 'reed', x: 9, y: -3 }, night: true, speed: '0 km/h', beat: 'Wings flat · still',
      desc: 'Hung up in the reeds for the night, the four glassy wings held flat and still, the long blue body cooling and motionless.',
      anim: 'Dead still, wings flat — no flicks, no darts. Only the faintest abdomen sway says it is asleep and not abandoned.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'roost') {
      return draw({ grounded: false, dy: 0, foreFlap: 0, hindFlap: 0, headA: 0, abdA: 1 + 0.6 * Math.sin(TAU * t) });
    }
    if (mid === 'hover') {
      return draw({
        wingFast: 1, foreFlap: 13 * osc(t, 6), hindFlap: 13 * osc(t, 6, .5),
        dx: 1.6 * osc(t, 1, .15) + 0.6 * osc(t, 3, .4), dy: -1.3 * osc(t, 2, .35),
        pitch: 2.2 * osc(t, 1, .6), abdA: 1.1 * osc(t, 1, .1),
        ticks: airTicks(t, { x1: -27, x2: 29, y: -14, h: 12, v: 16, n: 4, s: .9 })
      });
    }
    if (mid === 'dart') {
      const K = keys(t, [
        [0.00, { dx: -8, pitch: 0 }], [0.26, { dx: -8, pitch: 0 }],
        [0.30, { dx: 14, pitch: 4 }], [0.33, { dx: 12.5, pitch: -2 }],
        [0.36, { dx: 13, pitch: 0 }], [0.60, { dx: 13, pitch: 0 }],
        [0.78, { dx: -8, pitch: -3 }], [0.84, { dx: -8, pitch: 0 }], [1.00, { dx: -8, pitch: 0 }]
      ]);
      K.t = t; K.wingFast = 1;
      K.foreFlap = 13 * osc(t, 6); K.hindFlap = 13 * osc(t, 6, .5);
      K.dy = -1 * osc(t, 2, .3);
      const zip = pulse(t, .265, .33);
      if (zip > 0.25) K.streaks = `<g stroke="#9FB6A8" stroke-linecap="round" opacity="${N(zip * .8)}"><line x1="${N(K.dx - 18)}" y1="-2" x2="${N(K.dx - 7)}" y2="-2" stroke-width=".8"/><line x1="${N(K.dx - 15)}" y1="1.5" x2="${N(K.dx - 5)}" y2="1.5" stroke-width=".6"/></g>`;
      K.ticks = airTicks(t, { x1: -27, x2: 29, y: -14, h: 12, v: 16, n: 4, s: .9 });
      return draw(K);
    }
    // perch
    return draw({
      grounded: false,
      foreFlap: 6 * pulse(t, .30, .345) - 4.5 * pulse(t, .72, .765),
      hindFlap: -5 * pulse(t, .31, .35) + 3.5 * pulse(t, .73, .77),
      abdA: 2.4 * pulse(t, .48, .6) + 1 * osc(t, 1, .2),
      headA: 4 * pulse(t, .12, .2) - 3.5 * pulse(t, .86, .94),
      dy: 0
    });
  }
};

})();
__REG["darter"] = (function(){
// Common Darter — fable style (side profile; art faces LEFT, flipped to face right)
// Sympetrum striolatum male: ochre-brown thorax, orange-red abdomen, amber-based clear wings.
// The classic "sit-and-sally" dragonfly: perches on a tip, dashes out for prey, returns.
const C = {
  eye:'#9E5C3B', eyeLo:'#7C4A34', eyeHi:'#E8CBA8',
  thorax:'#B4793E', thoraxHi:'#C99457', thoraxDk:'#8C5B2C',
  abd:'#C6503A', abdDk:'#A23A2A', abdHi:'#DE7458', mark:'#5C2A20',
  wing:'#EEF3F3', amber:'#E7C67A', vein:'#B9AE92', stigma:'#7A3B2E', leg:'#2E2A26'
};
const GY = 10;

function blade(L, W) {
  return `M0 0 C ${N(L*0.14)} ${N(-W)} ${N(L*0.52)} ${N(-W*1.08)} ${N(L*0.8)} ${N(-W*0.5)} `
    + `C ${N(L*0.92)} ${N(-W*0.17)} ${N(L)} ${N(-W*0.06)} ${N(L)} 0 `
    + `C ${N(L)} ${N(W*0.06)} ${N(L*0.92)} ${N(W*0.17)} ${N(L*0.8)} ${N(W*0.5)} `
    + `C ${N(L*0.52)} ${N(W*1.08)} ${N(L*0.14)} ${N(W)} 0 0 Z`;
}
function veins(L, W) {
  let v = `<path d="M${N(L*0.05)} ${N(-W*0.1)} C ${N(L*0.4)} ${N(-W*0.4)} ${N(L*0.72)} ${N(-W*0.3)} ${N(L*0.95)} ${N(-W*0.05)}" stroke="${C.vein}" stroke-width="0.22" fill="none" opacity=".5"/>`
    + `<path d="M${N(L*0.05)} ${N(W*0.08)} C ${N(L*0.4)} ${N(W*0.26)} ${N(L*0.72)} ${N(W*0.2)} ${N(L*0.95)} ${N(W*0.03)}" stroke="${C.vein}" stroke-width="0.2" fill="none" opacity=".4"/>`;
  for (let i = 0; i < 6; i++) {
    const x = L * (0.2 + i * 0.13), k = 1 - i * 0.1;
    v += `<line x1="${N(x)}" y1="${N(-W*0.58*k)}" x2="${N(x)}" y2="${N(W*0.52*k)}" stroke="${C.vein}" stroke-width="0.13" opacity=".33"/>`;
  }
  return v;
}
function wing(bx, by, deg, L, W, op) {
  return g(trl(bx, by) + ' ' + rot(deg, 0, 0),
    `<path d="${blade(L, W)}" fill="${C.wing}" opacity="${N(op)}"/>` +
    `<ellipse cx="${N(L*0.14)}" cy="0" rx="${N(L*0.16)}" ry="${N(W*0.62)}" fill="${C.amber}" opacity="${N(op*0.55)}"/>` +
    veins(L, W) +
    `<rect x="${N(L*0.8)}" y="${N(-W*0.48)}" width="${N(L*0.1)}" height="${N(W*0.24)}" rx="0.22" fill="${C.stigma}" opacity=".85"/>`);
}

function abdomen(flex) {
  return g(rot(flex || 0, -2, 0),
    // slightly spindle-shaped, orange-red, shorter than the Emperor's
    `<path d="M-2 -1.85 C 2 -2.35 6 -2.3 9.5 -1.55 C 12.5 -0.95 14.5 -0.4 15.6 0.35 C 16.0 0.62 15.8 1.15 15.2 1.15 C 14.4 1.15 12.5 0.9 9.5 1.6 C 6 2.35 2 2.4 -2 1.9 C -3.1 1.78 -3.1 -1.73 -2 -1.85 Z" fill="${C.abd}"/>` +
    `<path d="M-2 -1.4 C 2 -1.85 6 -1.8 9.5 -1.1 C 12.5 -0.55 14.6 0.0 15.5 0.5 C 12 -0.2 6 -0.1 -2 -0.2 C -2.9 -0.9 -2.7 -1.28 -2 -1.4 Z" fill="${C.abdHi}" opacity=".7"/>` +
    `<path d="M-2 0.4 C 3 0.95 8 1.2 12 1.05 C 8 1.9 3 2.35 -2 1.9 C -3.1 1.7 -2.7 0.75 -2 0.4 Z" fill="${C.abdDk}"/>` +
    // black lateral segment marks
    `<g stroke="${C.mark}" stroke-width="0.5" opacity=".65" stroke-linecap="round">` +
    `<path d="M4 1.4 l0 0.6 M6.5 1.5 l0 0.55 M9 1.35 l0 0.55 M11 1.05 l0 0.5 M12.8 0.7 l0 0.45"/></g>` +
    `<ellipse cx="4" cy="-1.0" rx="4" ry="0.4" fill="#fff" opacity=".28"/>`);
}

const thorax =
  `<path d="M-5.2 -2.7 C -3.0 -3.6 -0.5 -3.1 0.3 -1.7 C 0.9 -0.5 0.8 1.6 -0.1 2.7 C -1.1 3.8 -4.2 3.7 -5.5 2.7 C -6.5 2.0 -6.5 -2.1 -5.2 -2.7 Z" fill="${C.thorax}"/>` +
  `<path d="M-5.2 -2.7 C -3.0 -3.6 -0.5 -3.1 0.3 -1.7 C -1.4 -2.0 -3.5 -1.6 -5.1 -0.6 C -6.0 -1.7 -5.9 -2.3 -5.2 -2.7 Z" fill="${C.thoraxHi}" opacity=".85"/>` +
  `<path d="M-4.3 -1.8 C -3.4 0.5 -3.0 2.2 -3.2 3.4" stroke="${C.thoraxDk}" stroke-width="0.55" fill="none" opacity=".5"/>`;

const legs =
  `<g stroke="${C.leg}" stroke-width="0.6" fill="none" stroke-linecap="round">` +
  `<path d="M-4.4 2.3 C -6.2 3.7 -7.8 4.7 -9.0 6.3"/>` +
  `<path d="M-3.2 2.8 C -4.8 4.5 -6.0 5.9 -6.8 7.3"/>` +
  `<path d="M-1.6 3.0 C -2.6 4.8 -3.4 6.2 -3.8 7.6"/></g>` +
  `<g stroke="${C.leg}" stroke-width="0.32" stroke-linecap="round" opacity=".8">` +
  `<path d="M-7.1 4.6 l-0.9 0.5 M-8.1 5.5 l-0.9 0.4 M-5.5 5.3 l-0.8 0.5 M-6.3 6.2 l-0.8 0.4 M-2.9 5.2 l-0.7 0.5 M-3.4 6.3 l-0.7 0.4"/></g>`;

function head(tilt) {
  return g(rot(tilt || 0, -5.4, 0),
    `<path d="M-5.5 -1.6 C -6.3 -0.8 -6.3 1.4 -5.5 2.2 C -4.9 1.2 -4.9 -0.6 -5.5 -1.6 Z" fill="${C.thoraxDk}" opacity=".5"/>` +
    `<ellipse cx="-8.6" cy="0.0" rx="3.5" ry="3.0" fill="${C.eye}"/>` +
    `<path d="M-12.0 0.4 A3.5 3.0 0 0 0 -5.2 0.8 C -6.3 2.3 -7.5 3.05 -8.9 3.0 C -10.8 2.9 -12.1 1.8 -12.0 0.4 Z" fill="${C.eyeLo}" opacity=".8"/>` +
    `<path d="M-11.6 1.4 C -12.5 1.6 -12.7 2.5 -11.9 2.95 C -11.3 2.4 -11.3 1.8 -11.6 1.4 Z" fill="#D8C29A"/>` +
    `<ellipse cx="-10.0" cy="-1.4" rx="1.5" ry="1.05" fill="${C.eyeHi}" opacity=".5" transform="rotate(-18 -10.0 -1.4)"/>` +
    `<circle cx="-10.6" cy="-1.8" r=".48" fill="#fff" opacity=".85"/>`);
}

function sprite(P) {
  const fast = P.wingFast || 0;
  const op = 0.62 - 0.22 * fast;
  const ff = P.foreFlap || 0, hf = P.hindFlap || 0;
  let far = wing(-3.2, -2.4, 208 + ff, 13.2, 2.5, op * 0.72) + wing(-1.6, -2.4, -26 + hf, 12.8, 2.8, op * 0.72);
  let near = wing(-3.6, -2.6, 204 + ff, 13.2, 2.5, op) + wing(-1.2, -2.6, -22 + hf, 12.8, 2.8, op);
  if (fast) {
    const gh = op * 0.4;
    far = wing(-3.2, -2.4, 208 + ff + 7, 13.2, 2.5, gh) + wing(-1.6, -2.4, -26 + hf - 7, 12.8, 2.8, gh) + far;
    near += wing(-3.6, -2.6, 204 + ff - 7, 13.2, 2.5, gh) + wing(-1.2, -2.6, -22 + hf + 7, 12.8, 2.8, gh);
  }
  return far + legs + abdomen(P.abdA) + thorax + head(P.headA) + near;
}

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.streaks) s += P.streaks;
  if (P.grounded) s += shadow(dx + 2, GY, 8, Math.max(0, 4 - dy), 16);
  return s + g(trl(dx, dy) + ' ' + rot(P.pitch || 0, 0, 0), g('scale(-1 1)', sprite(P)));
}

return {
  id: 'darter', view: [-28, -20, 58, 40], groundY: GY,
  thumb: { m: 'perch', t: 0.05 },
  motions: [
    { id: 'perch', label: 'Perch', short: 'Perch', dur: 3.8, env: { t: 'branch', y: 4 }, speed: '0 km/h', beat: 'Sentry · scan',
      desc: 'The sit-and-wait hunter, planted on a favourite twig-tip in full sun, wings pressed forward and down, all business.',
      anim: 'A sentry pose broken only by the head — quick saccades to left and right as it clocks passing insects, then a stillness that means it has chosen one.' },
    { id: 'sally', label: 'Sally', short: 'Sally', dur: 2.4, env: { t: 'air' }, speed: '~30 km/h dash', beat: 'Launch · snatch · return',
      desc: 'Its signature move: a lightning dash off the perch to snatch a fly from the air, a sharp turn, and a return to the very same twig.',
      anim: 'Out fast, one hard direction-change at the "catch", then home. The animator’s trick is the return — it must land exactly where it left.' },
    { id: 'hover', label: 'Hover', short: 'Hover', dur: 0.85, env: { t: 'air' }, speed: '0 km/h', beat: 'Wings 35/s · hang',
      desc: 'A brief hover to inspect before it commits — the red body hanging under a silver blur, tilting to read the wind.',
      anim: 'Shorter and twitchier than the Emperor’s hover: quicker corrections, a restless head, the sense of a decision about to be made.' }
    ,{ id: 'roost', label: 'Roost', short: 'Roost', dur: 6, env: { t: 'branch', y: 4 }, night: true, speed: '0 km/h', beat: 'Sentry off · still',
      desc: 'Settled low in the grass for the night on its favourite twig, wings pressed down and forward, the red body gone quiet.',
      anim: 'Hold the sentry silhouette but empty it of the daytime saccades; a single slow head-settle is all that moves.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'roost') {
      return draw({ grounded: false, dy: 0, foreFlap: 0, hindFlap: 0, headA: 2 * Math.sin(TAU * t * 0.5), abdA: 0.6 * Math.sin(TAU * t) });
    }
    if (mid === 'hover') {
      return draw({
        wingFast: 1, foreFlap: 12 * osc(t, 6), hindFlap: 12 * osc(t, 6, .5),
        dx: 1.4 * osc(t, 1, .2) + 0.7 * osc(t, 3, .5), dy: -1.2 * osc(t, 2, .35),
        pitch: 3 * osc(t, 1, .5), headA: 4 * osc(t, 2, .1), abdA: 1 * osc(t, 1, .1),
        ticks: airTicks(t, { x1: -25, x2: 27, y: -13, h: 12, v: 15, n: 4, s: .9 })
      });
    }
    if (mid === 'sally') {
      const K = keys(t, [
        [0.00, { dx: -9, dy: 5, pitch: 0 }], [0.20, { dx: -9, dy: 5, pitch: 0 }],
        [0.28, { dx: 4, dy: -3, pitch: 8 }], [0.40, { dx: 13, dy: -6, pitch: 4 }],
        [0.46, { dx: 12, dy: -7, pitch: -10 }], [0.52, { dx: 6, dy: -4, pitch: -6 }],
        [0.70, { dx: -9, dy: 5, pitch: 6 }], [0.80, { dx: -9, dy: 5, pitch: 0 }], [1.00, { dx: -9, dy: 5, pitch: 0 }]
      ]);
      K.t = t; K.wingFast = 1;
      K.foreFlap = 12 * osc(t, 6); K.hindFlap = 12 * osc(t, 6, .5);
      const snap = pulse(t, .43, .49);
      if (snap > 0.2) K.headA = 6 * snap;
      K.ticks = airTicks(t, { x1: -25, x2: 27, y: -13, h: 12, v: 15, n: 4, s: .9 });
      return draw(K);
    }
    // perch
    return draw({
      grounded: false, dy: 0,
      headA: 7 * pulse(t, .16, .30) - 6 * pulse(t, .52, .66) + 3 * pulse(t, .80, .88),
      foreFlap: 4 * pulse(t, .42, .46),
      hindFlap: -3 * pulse(t, .43, .47),
      abdA: 1.4 * pulse(t, .70, .82) + 0.6 * osc(t, 1, .15)
    });
  }
};

})();
__REG["demoiselle"] = (function(){
// Banded Demoiselle — fable style (side profile; art faces LEFT, flipped to face right)
// Calopteryx splendens male: metallic blue-green body, broad wings with a dark blue-black
// mid-band. A DAMSELFLY — folds its wings shut over the back at rest and flies with a
// weak, fluttery, butterfly-like beat low over slow water.
const C = {
  body:'#279A8B', hi:'#8FE6D6', shade:'#1C7669', tip:'#245F57', ring:'#BDF0E4',
  eye:'#2B8E88', eyeDk:'#1F6E69', eyeHi:'#CFEFE9',
  wing:'#E7EFED', band:'#2C3550', bandHi:'#425786', vein:'#9BB0AE', leg:'#242220'
};
const GY = 10;

function blade(L, W) {
  return `M0 0 C ${N(L*0.14)} ${N(-W)} ${N(L*0.5)} ${N(-W*1.15)} ${N(L*0.79)} ${N(-W*0.52)} `
    + `C ${N(L*0.92)} ${N(-W*0.18)} ${N(L)} ${N(-W*0.06)} ${N(L)} 0 `
    + `C ${N(L)} ${N(W*0.06)} ${N(L*0.92)} ${N(W*0.18)} ${N(L*0.79)} ${N(W*0.52)} `
    + `C ${N(L*0.5)} ${N(W*1.15)} ${N(L*0.14)} ${N(W)} 0 0 Z`;
}
function wing(bx, by, deg, L, W, op) {
  const band = `M${N(L*0.4)} ${N(-W*1.02)} C ${N(L*0.54)} ${N(-W*1.08)} ${N(L*0.68)} ${N(-W*0.86)} ${N(L*0.79)} ${N(-W*0.52)} `
    + `L ${N(L*0.79)} ${N(W*0.52)} C ${N(L*0.68)} ${N(W*0.86)} ${N(L*0.54)} ${N(W*1.08)} ${N(L*0.4)} ${N(W*1.02)} Z`;
  const v = `<path d="M${N(L*0.05)} ${N(-W*0.12)} C ${N(L*0.4)} ${N(-W*0.42)} ${N(L*0.72)} ${N(-W*0.32)} ${N(L*0.96)} ${N(-W*0.05)}" stroke="${C.vein}" stroke-width="0.2" fill="none" opacity=".4"/>`
    + `<path d="M${N(L*0.05)} ${N(W*0.08)} C ${N(L*0.4)} ${N(W*0.28)} ${N(L*0.72)} ${N(W*0.22)} ${N(L*0.96)} ${N(W*0.03)}" stroke="${C.vein}" stroke-width="0.18" fill="none" opacity=".35"/>`;
  return g(trl(bx, by) + ' ' + rot(deg, 0, 0),
    `<path d="${blade(L, W)}" fill="${C.wing}" opacity="${N(op*0.66)}"/>` +
    v +
    `<path d="${band}" fill="${C.band}" opacity="${N(op)}"/>` +
    `<path d="${band}" fill="${C.bandHi}" opacity="${N(op*0.28)}"/>`);
}

function abdomen(flex) {
  let rings = '<g stroke="' + C.ring + '" stroke-width="0.3" opacity=".6">';
  for (let i = 0; i < 8; i++) { const x = 1 + i * 2.4; rings += `<line x1="${N(x)}" y1="-0.55" x2="${N(x)}" y2="0.55"/>`; }
  rings += '</g>';
  return g(rot(flex || 0, -2, 0),
    `<path d="M-2 -0.9 C 3 -1.0 10 -0.85 16 -0.6 C 18.5 -0.5 20.2 -0.32 20.9 0.0 C 21.2 0.16 21.0 0.52 20.5 0.52 C 20.2 0.52 18.5 0.46 16 0.58 C 10 0.85 3 1.0 -2 0.9 C -2.95 0.82 -2.95 -0.82 -2 -0.9 Z" fill="${C.body}"/>` +
    `<path d="M-2 -0.62 C 4 -0.72 11 -0.56 17 -0.36 C 11 -0.16 4 -0.2 -2 -0.2 C -2.6 -0.46 -2.5 -0.52 -2 -0.62 Z" fill="${C.hi}" opacity=".5"/>` +
    `<path d="M13.5 -0.66 C 16 -0.54 19 -0.34 20.9 0.0 C 21.2 0.16 21.0 0.52 20.5 0.52 C 18.5 0.52 16 0.58 13.5 0.72 C 12.9 0.42 12.9 -0.34 13.5 -0.66 Z" fill="${C.tip}"/>` +
    rings +
    `<ellipse cx="6" cy="-0.5" rx="7" ry="0.2" fill="#fff" opacity=".32"/>`);
}

const thorax =
  `<path d="M-5 -2.4 C -3 -3.1 -0.8 -2.7 -0.1 -1.5 C 0.4 -0.5 0.4 1.4 -0.3 2.3 C -1.2 3.2 -3.9 3.2 -5.1 2.3 C -6.0 1.6 -6.0 -1.9 -5 -2.4 Z" fill="${C.body}"/>` +
  `<path d="M-5 -2.4 C -3 -3.1 -0.8 -2.7 -0.1 -1.5 C -1.6 -1.8 -3.4 -1.4 -4.9 -0.5 C -5.7 -1.6 -5.6 -2.1 -5 -2.4 Z" fill="${C.hi}" opacity=".6"/>` +
  `<path d="M-4.2 -1.6 C -3.4 0.4 -3.0 1.9 -3.2 3.0" stroke="${C.shade}" stroke-width="0.5" fill="none" opacity=".5"/>`;

const legs =
  `<g stroke="${C.leg}" stroke-width="0.5" fill="none" stroke-linecap="round">` +
  `<path d="M-4.2 2.0 C -6.0 3.4 -7.6 4.6 -8.8 6.4"/>` +
  `<path d="M-3.0 2.5 C -4.6 4.3 -5.8 5.8 -6.6 7.4"/>` +
  `<path d="M-1.4 2.6 C -2.4 4.5 -3.2 6.1 -3.6 7.6"/></g>` +
  `<g stroke="${C.leg}" stroke-width="0.28" stroke-linecap="round" opacity=".8">` +
  `<path d="M-6.9 4.6 l-0.9 0.5 M-7.9 5.6 l-0.9 0.4 M-5.3 5.4 l-0.8 0.5 M-6.1 6.3 l-0.8 0.4 M-2.7 5.2 l-0.7 0.5 M-3.2 6.4 l-0.7 0.4"/></g>`;

function head(tilt) {
  return g(rot(tilt || 0, -5.2, 0),
    `<ellipse cx="-6.6" cy="-0.5" rx="2.2" ry="1.8" fill="${C.eyeDk}" opacity=".8"/>` +
    `<ellipse cx="-8.0" cy="0.0" rx="2.9" ry="2.4" fill="${C.eye}"/>` +
    `<path d="M-10.9 0.2 A2.9 2.4 0 0 0 -5.4 0.6 C -6.3 1.8 -7.3 2.4 -8.5 2.4 C -10.1 2.35 -11.0 1.4 -10.9 0.2 Z" fill="${C.eyeDk}" opacity=".7"/>` +
    `<path d="M-10.6 1.1 C -11.4 1.3 -11.6 2.0 -10.9 2.4 C -10.4 2.0 -10.4 1.5 -10.6 1.1 Z" fill="#B7C9B0"/>` +
    `<ellipse cx="-9.1" cy="-1.1" rx="1.2" ry="0.85" fill="${C.eyeHi}" opacity=".55" transform="rotate(-18 -9.1 -1.1)"/>` +
    `<circle cx="-9.6" cy="-1.4" r=".42" fill="#fff" opacity=".85"/>`);
}

// P.wSweep = blade angle (deg); flying blurs opacity via P.fly
function sprite(P) {
  const sw = P.wSweep, fly = P.fly || 0;
  const opF = 0.6 - 0.18 * fly, opN = 0.7 - 0.2 * fly;
  const far = wing(-2.4, -2.1, sw - 4, 12.8, 3.3, opF);
  const near = wing(-2.4, -2.3, sw + 2, 13.4, 3.5, opN);
  return far + legs + abdomen(P.abdA) + thorax + head(P.headA) + near;
}

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.grounded) s += shadow(dx + 2, GY, 7, Math.max(0, 4 - dy), 16);
  return s + g(trl(dx, dy) + ' ' + rot(P.pitch || 0, 0, 0), g('scale(-1 1)', sprite(P)));
}

return {
  id: 'demoiselle', view: [-28, -22, 58, 42], groundY: GY,
  thumb: { m: 'perch', t: 0.05 },
  motions: [
    { id: 'perch', label: 'Perch', short: 'Perch', dur: 4.0, env: { t: 'reed', x: 10, y: -6 }, speed: '0 km/h', beat: 'Wings shut · flick',
      desc: 'At rest the demoiselle does what no true dragonfly can: it shuts all four wings together over its back, the dark bands stacked into one bold mark.',
      anim: 'The signature is the closed-wing silhouette. Sell life with a slow half-open flick of the wings and a metallic body that never quite holds still.' },
    { id: 'flutter', label: 'Flutter', short: 'Flutter', dur: 1.0, env: { t: 'water', y: 6 }, speed: '~5 km/h', beat: 'Weak clap · bob',
      desc: 'A famously feeble flier — it flutters low over the water on soft, butterfly-slow wingbeats, the body rising and falling with every clap.',
      anim: 'Nothing crisp here. Deep, lazy open-and-close beats, a heavy vertical bob, and a path that drifts and sags between beats.' },
    { id: 'display', label: 'Courtship flutter', short: 'Display', dur: 1.6, env: { t: 'water', y: 6 }, speed: '0 km/h · hovering', beat: 'Show the bands',
      desc: 'The male’s courtship: a hovering, quivering flutter before a watching female, the banded wings flashing open and shut to show their colour.',
      anim: 'Exaggerate the wing-clap and slow it down; hold the body almost in place with a fine quiver, and let the open pose linger to flash the bands.' }
    ,{ id: 'roost', label: 'Roost', short: 'Roost', dur: 6, env: { t: 'reed', x: 10, y: -6 }, night: true, speed: '0 km/h', beat: 'Wings stacked shut · still',
      desc: 'All four wings stacked shut over the back on a bankside reed, the dark bands aligned into one still mark against the night water.',
      anim: 'Fold the wings to their tightest and stop everything; the metallic body may glint but must not move.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'roost') {
      return draw({ grounded: false, dy: 0, wSweep: -86 + 2 * Math.sin(TAU * t), headA: 1.2 * Math.sin(TAU * t * 0.5), abdA: 0.6 * Math.sin(TAU * t) });
    }
    if (mid === 'flutter') {
      const clap = 0.5 - 0.5 * Math.cos(TAU * t * 3);
      return draw({
        fly: 1, wSweep: -74 + 60 * clap,
        dx: 4 * osc(t, 1, .02), dy: -3.2 * osc(t, 3, .1) - 1.2 * osc(t, 1, .3),
        pitch: 6 * osc(t, 1, .35), abdA: 3 * osc(t, 1, .2),
        ticks: rippleTicks(t, { y: 6, x1: -25, x2: 27, v: 12, n: 5, s: 1 })
      });
    }
    if (mid === 'display') {
      const clap = 0.5 - 0.5 * Math.cos(TAU * t * 2);
      return draw({
        fly: 1, wSweep: -78 + 66 * clap,
        dx: 1.2 * osc(t, 1, .1), dy: -1.4 - 1.0 * osc(t, 2, .1) + 0.4 * Math.sin(TAU * t * 14),
        pitch: 3 * osc(t, 2, .3), headA: 2 * osc(t, 3, .2), abdA: 1.6 * osc(t, 2, .15),
        ticks: rippleTicks(t, { y: 6, x1: -25, x2: 27, v: 4, n: 5, s: 1 })
      });
    }
    // perch — wings shut over the back
    const flick = pulse(t, .40, .52);
    return draw({
      grounded: false, dy: 0,
      wSweep: -54 + 20 * flick,
      headA: 6 * pulse(t, .14, .26) - 5 * pulse(t, .66, .78),
      abdA: 1.2 * pulse(t, .82, .94) + 0.5 * osc(t, 1, .1)
    });
  }
};

})();
__REG["bee"] = (function(){
// Honeybee — fable style (side profile, faces right)
const C = { gold: '#FFC93C', shade: '#F2A82E', stripe: '#33304A', fuzz: '#E8A63A', head: '#33304A', wing: '#EAF4FF', eye: '#211F30' };

// wings attach at thorax top (~1.5,-3); sweep back-up, flap by rotation at the root
const wingFar = a => g(rot(a, 0.8, -2.8),
  `<ellipse cx="-3.6" cy="-6" rx="5.4" ry="2.5" fill="${C.wing}" opacity=".55" transform="rotate(-30 -3.6 -6)"/>`);
const wingNear = a => g(rot(a, 1.6, -2.4),
  `<ellipse cx="-2.6" cy="-6.4" rx="6.4" ry="3" fill="${C.wing}" opacity=".85" transform="rotate(-27 -2.6 -6.4)"/>` +
  `<ellipse cx="-4.6" cy="-7.5" rx="2.1" ry="1.1" fill="#fff" opacity=".55" transform="rotate(-27 -4.6 -7.5)"/>` +
  `<path d="M-8.3 -8.6 C -4.4 -9.6 -0.2 -8 1.4 -5.2" stroke="#CFE6F5" stroke-width=".55" fill="none" opacity=".8"/>`);

// P: wA (near-wing flap deg), wB (far), antA, legS (leg swing)
const bee = P => {
  const legs = g(rot(P.legS || 0, 0, 3),
    `<path d="M-1.6 3.4 C -2.2 5.2 -3.4 6.1 -4.6 6.3 M1.2 3.8 C 0.9 5.6 -0.1 6.6 -1.3 6.9 M3.6 3.2 C 3.6 4.9 2.8 6 1.8 6.4" stroke="${C.stripe}" stroke-width=".9" fill="none" stroke-linecap="round"/>`);
  return wingFar(P.wB ?? P.wA ?? 0) + legs +
    // abdomen (rear, left) with rounded tip
    `<ellipse cx="-3.4" cy="0.3" rx="7.3" ry="4.6" fill="${C.gold}"/>` +
    `<path d="M-10.6 -0.4 C -10.4 1.9 -8.6 3.8 -6 4.5 C -8 4.9 -9.9 4 -10.5 2.2 C -10.7 1.3 -10.7 0.4 -10.6 -0.4 Z" fill="${C.shade}"/>` +
    `<path d="M-4.9 -4.4 C -5.8 -1.5 -5.8 1.9 -4.9 4.8" stroke="${C.stripe}" stroke-width="2.1" fill="none" stroke-linecap="round"/>` +
    `<path d="M-1.1 -4.5 C -1.9 -1.6 -1.9 1.8 -1.1 4.7" stroke="${C.stripe}" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
    `<path d="M-8.3 -3 C -8.9 -1.2 -8.9 1.5 -8.3 3.3" stroke="${C.stripe}" stroke-width="1.8" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="-4" cy="-2.2" rx="3.6" ry="1.5" fill="#fff" opacity=".25" transform="rotate(-8 -4 -2.2)"/>` +
    // fuzzy thorax
    `<circle cx="3.6" cy="-1" r="3.3" fill="${C.fuzz}"/>` +
    `<path d="M1.2 -3.6 C 2.6 -4.6 4.8 -4.6 6.1 -3.4 M0.6 -1.6 C 1 -2.2 1.6 -2.7 2.3 -3" stroke="${C.gold}" stroke-width=".9" fill="none" stroke-linecap="round" opacity=".8"/>` +
    // head
    `<circle cx="8.3" cy="-1.5" r="2.6" fill="${C.head}"/>` +
    `<ellipse cx="9.2" cy="-1.9" rx="1.25" ry="1.55" fill="#fff" opacity=".92" transform="rotate(10 9.2 -1.9)"/>` +
    `<circle cx="9.5" cy="-1.8" r=".62" fill="${C.eye}"/>` +
    `<circle cx="7.3" cy="-2.8" r=".7" fill="#fff" opacity=".35"/>` +
    g(rot(P.antA || 0, 8.8, -3.6),
      `<path d="M8.6 -3.8 C 9.2 -5.8 10.2 -6.9 11.5 -7.4 M9.6 -3.4 C 10.6 -4.9 11.8 -5.6 13 -5.7" stroke="${C.head}" stroke-width=".85" fill="none" stroke-linecap="round"/>` +
      `<circle cx="11.6" cy="-7.5" r=".8" fill="${C.head}"/><circle cx="13.1" cy="-5.7" r=".8" fill="${C.head}"/>`) +
    wingNear(P.wA || 0);
};

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.trail) s += P.trail;
  const flip = P.flip ? ' scale(-1 1)' : '';
  return s + g(trl(dx, dy) + flip + ' ' + rot(P.pitch || 0, 0, 0), bee(P));
}

return {
  id: 'bee', view: [-30, -25, 62, 44], groundY: 16,
  thumb: { m: 'hover', t: 0.05 },
  motions: [
    { id: 'hover', label: 'Hover', short: 'Hover', dur: 0.45, env: { t: 'air' }, speed: '0 km/h', beat: 'Wings 230/s · bob',
      desc: 'Holding station at the mouth of a flower: wings a silver blur, the striped body swinging gently beneath them.',
      anim: 'Blur the wings, then put all the character in the body — a soft pendulum sway and bob, hanging from the wing-root.' },
    { id: 'patrol', label: 'Patrol', short: 'Patrol', dur: 1.6, env: { t: 'air' }, speed: '~20 km/h', beat: 'Weaving line',
      desc: 'Flower to flower in a purposeful weave — never a straight line, always leaning into the next turn.',
      anim: 'Pitch the body into each climb and dive like a tiny aircraft; the path should wander even when the errand is direct.' },
    { id: 'waggle', label: 'Waggle dance', short: 'Waggle', dur: 2.6, env: { t: 'air' }, speed: '0 km/h', beat: 'Waggle run · circle back',
      desc: 'The famous figure-of-eight: a straight run danced at a waggle, then a loop back to start it again — a map drawn in motion.',
      anim: 'The waggle is a violent 13-per-second shimmy strictly on the straight run; the return loops are calm. Alternate loop sides.' }
    ,{ id: 'roost', label: 'Roost', short: 'Roost', dur: 5.5, env: { t: 'reed', x: -12, y: -10 }, night: true, speed: '0 km/h', beat: 'Gripped · hanging',
      desc: 'Gripped to a stem with its jaws in the cool of the night, legs loose, antennae drooping, wings laid flat along the back.',
      anim: 'Let the whole body hang heavy from the grip; the antennae sag and only a slow breath stirs the fuzz.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'roost') {
      return draw({ dx: -6, dy: -2, pitch: -22, wA: 0, wB: 0, legS: -6, antA: -14 + 2 * Math.sin(TAU * t * 0.5) });
    }
    if (mid === 'patrol') {
      const vx = Math.cos(TAU * t); // d/dt of the dx sweep
      return draw({
        wA: 15 * osc(t, 8), wB: 15 * osc(t, 8, .5),
        dx: 8 * osc(t, 1, 0), dy: -4 * osc(t, 2, .15),
        flip: vx < 0,
        pitch: -10 * osc(t, 2, .4),
        legS: 5 * osc(t, 2, .2),
        ticks: airTicks(t, { x1: -27, x2: 29, y: -14, h: 13, v: 30, n: 4, s: .9 })
      });
    }
    if (mid === 'waggle') {
      const PATH = [
        [0.00, { dx: -7, dy: 6 }], [0.30, { dx: 5, dy: 6 }],
        [0.38, { dx: 10, dy: -1 }], [0.46, { dx: -2, dy: -6 }], [0.50, { dx: -7, dy: 6 }],
        [0.80, { dx: 5, dy: 6 }], [0.88, { dx: 10, dy: 13 }], [0.96, { dx: -2, dy: 12 }], [1.00, { dx: -7, dy: 6 }]
      ];
      const K = keys(t, PATH, p => p);
      const K2 = keys(wrap(t + 0.02), PATH, p => p);
      const wig = pulse(t, 0, .3) + pulse(t, .5, .8);
      K.pitch = 13 * Math.sin(TAU * t * 13) * wig;
      K.flip = K2.dx < K.dx;
      K.wA = 15 * osc(t, 8); K.wB = 15 * osc(t, 8, .5);
      K.legS = 6 * Math.sin(TAU * t * 13) * wig;
      K.trail = `<path d="M-7 6 L5 6 C 10 4 10 -4 3 -5 C -2 -5.5 -6 0 -7 6 C -8 12 -4 17.5 1 17 C 8 16 10 8 5 6" stroke="#C9B88F" stroke-width=".7" fill="none" stroke-dasharray="1.6 2.2" opacity=".55"/>`;
      return draw(K);
    }
    // hover
    return draw({
      wA: 16 * osc(t, 6), wB: 16 * osc(t, 6, .5),
      dy: 1.2 * osc(t, 1, .1), dx: 0.6 * osc(t, 2, .4),
      pitch: 4 * osc(t, 1, .3),
      legS: 4 * osc(t, 1, .15),
      antA: 3 * osc(t, 2, .2),
      ticks: airTicks(t, { x1: -27, x2: 29, y: -14, h: 13, v: 10, n: 4, s: .9 })
    });
  }
};

})();
__REG["ladybug"] = (function(){
// Seven-spot Ladybird — fable style (side view)
const C = { red: '#CF473D', rim: '#B23A32', seam: '#7E2A24', black: '#2A2326', hind: '#B9C4CC', cream: '#FBF7F2' };
const GY = 10.5;

const LEG = 'stroke="#2A2326" stroke-width="1.25" fill="none" stroke-linecap="round" stroke-linejoin="round"';
const legsA = a => g(rot(a, 0, 3),
  `<path d="M7.4 3.4 L9 6.6 L11.8 9.4" ${LEG}/><path d="M1.4 4 L0.6 7.2 L-1.8 10" ${LEG}/><path d="M-5.4 3.6 L-7.4 6.6 L-10.4 9.2" ${LEG}/>`);
const legsB = a => g(rot(a, 1, 3),
  `<g opacity=".5"><path d="M8.8 3 L10.4 5.8 L13 8" ${LEG}/><path d="M3.2 3.6 L2.8 6.6 L0.8 9" ${LEG}/><path d="M-3.4 3.2 L-5 6 L-7.8 8.4" ${LEG}/></g>`);

const SHELL_NEAR =
  `<path d="M-12.4 3.6 C -13.8 -2.4 -9.6 -8.6 -2.4 -9.4 C 4.8 -10.2 9.6 -5.8 10 0.2 C 10.2 2 9.4 3.4 7.8 3.9 C 1.4 5.4 -6.4 5.3 -12.4 3.6 Z" fill="${C.red}" stroke="${C.rim}" stroke-width="1"/>` +
  `<ellipse cx="-4.5" cy="-6.1" rx="3.4" ry="1.6" fill="#fff" opacity=".2" transform="rotate(-14 -4.5 -6.1)"/>` +
  `<circle cx="-6.2" cy="-2.6" r="2.05" fill="${C.black}"/><circle cx="1.8" cy="-4.4" r="1.85" fill="${C.black}"/><circle cx="-1.8" cy="1.2" r="1.6" fill="${C.black}"/><circle cx="6.2" cy="-0.4" r="1.15" fill="${C.black}"/><circle cx="-10.1" cy="0.6" r="1.15" fill="${C.black}"/>`;
const SHELL_FAR =
  `<path d="M-11.6 3.1 C -12.8 -2.1 -9 -7.7 -2.2 -8.5 C 4.4 -9.2 8.8 -5.1 9.2 0.5 C 9.4 1.9 8.6 3.1 7.2 3.5 C 1.2 4.8 -6 4.7 -11.6 3.1 Z" fill="${C.rim}" stroke="${C.seam}" stroke-width=".8"/>` +
  `<circle cx="-5" cy="-2.4" r="1.7" fill="${C.black}" opacity=".8"/><circle cx="1.6" cy="-3.6" r="1.4" fill="${C.black}" opacity=".8"/>`;

// P: eA (elytra open deg), hw (hindwing flutter 0..1), antA, legsA/legsB (deg), legsTuck
function bug(P) {
  const eA = P.eA || 0, open = eA > 4;
  const flut = 9 * (P.hw || 0);
  const hindN = open ? g(rot(-16 + flut * osc(P.t || 0, 6), 6, -2),
    `<ellipse cx="-3.5" cy="-4.5" rx="8.6" ry="3.2" fill="${C.hind}" opacity=".65" transform="rotate(-16 -3.5 -4.5)"/>` +
    `<ellipse cx="-5.5" cy="-5.5" rx="3" ry="1.4" fill="#fff" opacity=".35" transform="rotate(-16 -5.5 -5.5)"/>`) : '';
  const hindF = open ? g(rot(-8 - flut * osc(P.t || 0, 6, .5), 6, -2),
    `<ellipse cx="-3" cy="-5" rx="7.8" ry="2.8" fill="${C.hind}" opacity=".45" transform="rotate(-22 -3 -5)"/>`) : '';
  return (P.legsTuck ? g(scl(.55, .55, 2, 4) + ' ' + rot(24, 2, 4), legsB(0) + legsA(0)) : legsB(P.legsB || 0) + legsA(P.legsA || 0)) +
    (open ? `<ellipse cx="-2" cy="0.8" rx="9.3" ry="4.6" fill="${C.black}"/>` +
      `<path d="M-8.5 -2.2 C -8.7 -0.2 -8.7 1.8 -8.5 3.8 M-4.5 -3.6 C -4.7 -1 -4.7 2 -4.5 4.6 M-0.5 -4 C -0.7 -1.2 -0.7 2 -0.5 4.8 M3.5 -3.6 C 3.3 -1 3.3 2 3.5 4.4" stroke="#3E3538" stroke-width=".8" fill="none" opacity=".9"/>` : '') +
    `<circle cx="13.2" cy="1" r="2.7" fill="${C.black}"/>` +
    `<circle cx="14.2" cy="0.1" r=".85" fill="#fff" opacity=".92"/>` +
    `<path d="M7 -4.4 C 10.6 -5.3 13.5 -3.3 14.1 -0.3 C 14.4 1.3 13.7 2.7 12.3 3.3 L8.4 3.7 C 6.7 1.2 6.3 -1.8 7 -4.4 Z" fill="${C.black}"/>` +
    `<ellipse cx="11.7" cy="-2.1" rx="1.35" ry=".9" fill="${C.cream}" opacity=".85" transform="rotate(-24 11.7 -2.1)"/>` +
    g(rot(P.antA || 0, 14, -1),
      `<path d="M13.9 -1.6 C 14.6 -4.2 15.6 -5.6 17 -6.5 M14.9 -0.5 C 16.4 -2.5 17.8 -3.2 19.3 -3.1" stroke="${C.black}" stroke-width="1" fill="none" stroke-linecap="round"/>` +
      `<circle cx="17" cy="-6.5" r=".95" fill="${C.black}"/><circle cx="19.3" cy="-3.1" r=".95" fill="${C.black}"/>`) +
    hindF +
    (open ? g(rot(eA * 0.8, 7.4, -2.4), SHELL_FAR) : '') +
    hindN +
    g(rot(eA, 7.4, -2.4), SHELL_NEAR);
}

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.grounded) s += shadow(dx, GY, 11, Math.max(0, -dy), 12);
  return s + g(trl(dx, dy) + ' ' + rot(P.tilt || 0, 0, 4), bug(P));
}

return {
  id: 'ladybug', view: [-31, -25, 64, 42], groundY: GY,
  thumb: { m: 'walk', t: 0.05 },
  motions: [
    { id: 'walk', label: 'Walk', short: 'Walk', dur: 0.8, env: { t: 'ground' }, speed: '~0.1 km/h', beat: 'Six legs · tripod',
      desc: 'A polished red dome on six busy pins, antennae reading the leaf ahead like a pair of walking sticks.',
      anim: 'The dome floats level while the legs scissor beneath — think of a car body over suspension. Antennae never rest.' },
    { id: 'check', label: 'Wing-check', short: 'Check', dur: 3.2, env: { t: 'ground' }, speed: '0 km/h', beat: 'Crack → flutter → fold',
      desc: 'Before any flight, the cases crack open for a moment — a glimpse of the folded gauze beneath, then shut again.',
      anim: 'Open the elytra with a snap, let the hindwings buzz softly while exposed, and fold everything away with fussy precision.' },
    { id: 'fly', label: 'Fly', short: 'Fly', dur: 0.9, env: { t: 'air' }, speed: '~8 km/h', beat: 'Cases high · gauze blur',
      desc: 'In the air the red cases stand up like little doors while the true wings do all the whirring work below.',
      anim: 'Keep the raised cases rock-steady — only the gauze wings blur. The heavy dome swings pendulum-fashion under the lift.' }
    ,{ id: 'rest', label: 'Rest', short: 'Rest', dur: 6, env: { t: 'ground' }, night: true, speed: '0 km/h', beat: 'Clamped · still',
      desc: 'Clamped down on a leaf for the night, legs and antennae drawn in, the red dome shut tight over the folded wings beneath.',
      anim: 'A still red button — legs tucked away, nothing moving. Let one antenna twitch once, then stop.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'rest') {
      return draw({ grounded: true, eA: 0, hw: 0, legsTuck: true, antA: -6 + 1.5 * pulse(t, .5, .56), tilt: 0, dy: 0 });
    }
    if (mid === 'check') {
      const K = keys(t, [
        [0.00, { eA: 0, hw: 0 }],
        [0.14, { eA: 0, hw: 0 }],
        [0.20, { eA: 38, hw: 1 }],
        [0.58, { eA: 36, hw: 1 }],
        [0.68, { eA: 2, hw: 0 }],
        [0.76, { eA: 8, hw: 0 }],
        [0.82, { eA: 0, hw: 0 }],
        [1.00, { eA: 0, hw: 0 }]
      ]);
      K.t = t; K.grounded = true;
      K.antA = 5 * osc(t, 2, .1);
      K.tilt = -2 * pulse(t, .16, .66);
      return draw(K);
    }
    if (mid === 'fly') {
      return draw({
        t, eA: 42, hw: 1,
        dy: -2.6 * osc(t, 1, .3), dx: 1.6 * osc(t, 1, .05),
        tilt: 6 * osc(t, 1, .45), antA: -4,
        legsTuck: true,
        ticks: airTicks(t, { x1: -28, x2: 30, y: -14, h: 13, v: 22, n: 4, s: .9 })
      });
    }
    // walk
    return draw({
      grounded: true,
      dy: laneDy(-0.3 * osc(t, 4, .1)), tilt: lanePitch(1.2 * osc(t, 2, .3)),
      legsA: 8 * osc(t, 2), legsB: 8 * osc(t, 2, .5),
      antA: 6 * osc(t, 1, .2),
      ticks: groundTicks(t, { y: GY, x1: -28, x2: 30, v: 7, n: 6, s: .8 })
    });
  }
};

})();
__REG["frog"] = (function(){
// Common Frog — fable style (front view)
const C = { deep: '#5A9447', mid: '#6FB05A', light: '#7FBF68', dark: '#4E8240', mouth: '#3F6E34', eye: '#2A2326', throat: '#D8E8B8' };
const GY = 9.5;

const legL = a => g(rot(a, -6, 3),
  `<ellipse cx="-8.5" cy="6.2" rx="4.6" ry="2.7" fill="${C.deep}"/>` +
  `<ellipse cx="-9.8" cy="6.4" rx="2" ry="1.3" fill="${C.dark}"/>` +
  `<path d="M-11 2 q-1.4 4 1.5 5.6 2.4 1.3 3.2-1.4 q.4-2.6-1.6-4.2z" fill="${C.deep}"/>`);
const legR = a => g(rot(-a, 6, 3),
  `<ellipse cx="8.5" cy="6.2" rx="4.6" ry="2.7" fill="${C.deep}"/>` +
  `<ellipse cx="9.8" cy="6.4" rx="2" ry="1.3" fill="${C.dark}"/>` +
  `<path d="M11 2 q1.4 4 -1.5 5.6 -2.4 1.3 -3.2-1.4 q-.4-2.6 1.6-4.2z" fill="${C.deep}"/>`);

// P: sx sy (about 0,9), blink, lookX, throat (0..1), puff
function body(P) {
  const lx = P.lookX || 0;
  const eyes = (P.blink || 0) > 0.5
    ? `<path d="M-6.6 -6.6 L-3.4 -6.6 M3.4 -6.6 L6.6 -6.6" stroke="${C.mouth}" stroke-width="1" fill="none" stroke-linecap="round"/>`
    : `<circle cx="${N(-5 + lx)}" cy="-6.6" r="2" fill="${C.eye}"/><circle cx="${N(5 + lx)}" cy="-6.6" r="2" fill="${C.eye}"/>` +
      `<circle cx="${N(-4.3 + lx)}" cy="-7.4" r=".7" fill="#fff"/><circle cx="${N(5.7 + lx)}" cy="-7.4" r=".7" fill="#fff"/>`;
  const throat = (P.throat || 0) > 0.02
    ? `<ellipse cx="0" cy="${N(4.6 + 1.6 * P.throat)}" rx="${N(4.4 * P.throat + 1)}" ry="${N(3.4 * P.throat + .6)}" fill="${C.throat}" opacity=".92"/>` +
      `<ellipse cx="-1.2" cy="${N(3.9 + 1.2 * P.throat)}" rx="${N(1.4 * P.throat + .3)}" ry="${N(1 * P.throat + .2)}" fill="#fff" opacity=".4"/>`
    : '';
  const p = 1 + 0.04 * (P.puff || 0);
  return g(scl((P.sx ?? 1) * p, (P.sy ?? 1) * p, 0, 9),
    `<ellipse cx="0" cy="3" rx="11" ry="8" fill="${C.deep}"/>` +
    `<ellipse cx="0" cy="1.6" rx="10.6" ry="7.6" fill="${C.mid}"/>` +
    `<path d="M-9.6 -1.4 q3.8-5 9.6-5 5.8 0 9.6 5 -4 3-9.6 3 -5.6 0-9.6-3z" fill="${C.light}"/>` +
    `<ellipse cx="0" cy="6.4" rx="5.8" ry="3" fill="${C.light}" opacity=".5"/>` +
    throat +
    `<circle cx="-5.2" cy="-7" r="4" fill="${C.light}"/>` +
    `<circle cx="5.2" cy="-7" r="4" fill="${C.light}"/>` +
    `<circle cx="-5.2" cy="-7" r="4" fill="${C.mid}" opacity=".35"/>` +
    `<circle cx="5.2" cy="-7" r="4" fill="${C.mid}" opacity=".35"/>` +
    `<path d="M-8.8 -8.6 q1-3.4 3.6-3.4 2.6 0 3.6 3.4 -1.8 1.2-3.6 1.2-1.8 0-3.6-1.2z" fill="#fff" opacity=".3"/>` +
    `<path d="M1.6 -8.6 q1-3.4 3.6-3.4 2.6 0 3.6 3.4 -1.8 1.2-3.6 1.2-1.8 0-3.6-1.2z" fill="#fff" opacity=".3"/>` +
    eyes +
    `<ellipse cx="-7.4" cy="1.4" rx="2.2" ry="1.5" fill="#fff" opacity=".18"/>` +
    `<ellipse cx="7.4" cy="1.4" rx="2.2" ry="1.5" fill="#fff" opacity=".18"/>` +
    `<path d="M-5.4 2.4 q5.4 4 10.8 0" stroke="${C.mouth}" stroke-width="1.5" fill="none" stroke-linecap="round"/>` +
    `<path d="M-5.4 2.4 q.6 1 1.4 1.2M5.4 2.4 q-.6 1 -1.4 1.2" stroke="${C.mouth}" stroke-width="1.2" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="-7" cy="3.6" rx="1.5" ry="1" fill="#E8943E" opacity=".22"/>` +
    `<ellipse cx="7" cy="3.6" rx="1.5" ry="1" fill="#E8943E" opacity=".22"/>`);
}

// P adds: dx dy legA ticks sounds grounded
function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.grounded) s += shadow(dx, GY + 0.6, 12, Math.max(0, -dy), 16);
  return s + g(trl(dx, dy), legL(P.legA || 0) + legR(P.legA || 0) + body(P)) + (P.sounds || '');
}

return {
  id: 'frog', view: [-32, -28, 66, 44], groundY: GY,
  thumb: { m: 'sit', t: 0.02 },
  motions: [
    { id: 'sit', label: 'Sit & breathe', short: 'Sit', dur: 3.6, env: { t: 'ground' }, speed: '0 km/h', beat: 'Idle · throat 4/s',
      desc: 'A squat spring at rest: nothing moves but the flutter of the throat and, once in a while, the slow wipe of a blink.',
      anim: 'The throat pulse is constant and metronomic; everything else is a held pose. One deliberate blink per look reads as thought.' },
    { id: 'hop', label: 'Hop', short: 'Hop', dur: 1.3, env: { t: 'ground' }, speed: 'burst', beat: 'Squash → fire → land',
      desc: 'The folded hind legs release all at once, trebling the body\u2019s length in the air and folding back before the landing.',
      anim: 'All anticipation: sink low and hold, then spend only two frames on the launch. Land softer than the take-off, in a deep squash.' },
    { id: 'croak', label: 'Croak', short: 'Croak', dur: 2.8, env: { t: 'ground' }, speed: '0 km/h', beat: 'Fill → ring · ×2',
      desc: 'The vocal sac balloons to the size of the head and rings twice — the whole body a soft instrument being squeezed.',
      anim: 'Inflate over four frames, hold, and let the body deflate INTO the call. The sac never quite empties between croaks.' },
    { id: 'swim', label: 'Swim', short: 'Swim', dur: 1.6, env: { t: 'water', y: 5 }, speed: '~2 km/h', beat: 'Kick · glide',
      desc: 'A frog swims like it jumps, underwater: one simultaneous kick of both hind legs, then a long folded glide.',
      anim: 'Kick in two frames, glide in twenty. The legs recover slowly and stay folded until the glide has fully died.' }
    ,{ id: 'rest', label: 'Rest', short: 'Rest', dur: 6, env: { t: 'ground' }, night: false, speed: '0 km/h', beat: 'Tucked · throat 2/s',
      desc: 'Tucked down into a squat parcel by day, limbs folded under, the eyes lidded to slits and only the throat softly working.',
      anim: 'Everything held; the slow throat-pulse and the closed lids carry it. A rare, heavy half-blink is the only event.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'rest') {
      return draw({ grounded: true, sy: 1 + 0.014 * osc(t, 2), sx: 1 - 0.008 * osc(t, 2), throat: 0.18 + 0.05 * Math.abs(osc(t, 4)), blink: 1, legA: 0, lookX: 0 });
    }
    if (mid === 'hop') {
      const K = keys(t, [
        [0.00, { dy: 0, sx: 1, sy: 1, legA: 0 }],
        [0.14, { dy: 1.6, sx: 1.1, sy: 0.82, legA: 4 }],
        [0.30, { dy: 1.6, sx: 1.1, sy: 0.82, legA: 4 }],
        [0.38, { dy: -12, sx: 0.9, sy: 1.14, legA: -38 }],
        [0.52, { dy: -15, sx: 0.97, sy: 1.02, legA: -20 }],
        [0.66, { dy: -6, sx: 1, sy: 1, legA: -6 }],
        [0.74, { dy: 0.8, sx: 1.14, sy: 0.8, legA: 6 }],
        [0.86, { dy: 0, sx: 0.98, sy: 1.02, legA: 0 }],
        [1.00, { dy: 0, sx: 1, sy: 1, legA: 0 }]
      ]);
      K.grounded = true;
      K.blink = pulse(t, .36, .44);
      K.throat = 0.15;
      K.ticks = groundTicks(t, { y: GY + 1, x1: -29, x2: 32, v: 20, n: 6, s: .95 });
      return draw(K);
    }
    if (mid === 'croak') {
      const K = keys(t, [
        [0.00, { throat: 0.1, puff: 0 }],
        [0.14, { throat: 1, puff: 1 }],
        [0.30, { throat: 0.55, puff: 0.4 }],
        [0.42, { throat: 1, puff: 1 }],
        [0.62, { throat: 0.9, puff: 0.8 }],
        [0.82, { throat: 0.15, puff: 0 }],
        [1.00, { throat: 0.1, puff: 0 }]
      ]);
      const ring = pulse(t, .13, .3) + pulse(t, .41, .6);
      K.sounds = ring > 0.05 ? `<g stroke="#8A8A50" fill="none" stroke-linecap="round" opacity="${N(ring * .75)}"><path d="M14 2 q2.5 2.6 0 5.2"/><path d="M17.5 0.6 q3.6 3.9 0 7.8"/><path d="M-14 2 q-2.5 2.6 0 5.2"/><path d="M-17.5 0.6 q-3.6 3.9 0 7.8"/></g>` : '';
      K.grounded = true;
      K.blink = K.throat > 0.8 ? 0.6 : 0;
      K.sy = 1 - 0.05 * K.puff; K.sx = 1 + 0.03 * K.puff;
      return draw(K);
    }
    if (mid === 'swim') {
      const K = keys(t, [
        [0.00, { legA: 6, dy: 0 }],
        [0.10, { legA: 14, dy: 0.6 }],
        [0.18, { legA: -52, dy: -2.6 }],
        [0.30, { legA: -46, dy: -1.8 }],
        [0.70, { legA: 4, dy: 0.4 }],
        [1.00, { legA: 6, dy: 0 }]
      ]);
      K.ticks = rippleTicks(t, { y: 5, x1: -29, x2: 32, v: 24, n: 5, s: 1.1, tone: '#85988B' });
      K.blink = 0;
      K.throat = 0.1;
      return draw(K);
    }
    // sit & breathe
    return draw({
      grounded: true,
      sy: 1 + 0.018 * osc(t, 2), sx: 1 - 0.01 * osc(t, 2),
      throat: 0.28 + 0.22 * Math.abs(osc(t, 14)),
      blink: pulse(t, .44, .52),
      lookX: 1 * (wins(t, .6, .66) - wins(t, .88, .94))
    });
  }
};

function wins(t, a, b) { const p = Math.min(1, Math.max(0, (t - a) / (b - a))); return p * p * (3 - 2 * p); }

})();
__REG["turtle"] = (function(){
// European Pond Turtle — fable style
const C = { shell: '#97A968', rim: '#7C8F53', skin: '#A4B86B', skinD: '#8FA35D', hi: '#C2CE8F', eye: '#2A2326' };
const GY = 12.3;

// P: headT (0 out → 1 hidden), headA, headX, blink, legFar, legNear, legTuck (0..1), tailA
function turtle(P) {
  const tuck = P.legTuck || 0;
  const eyes = (P.blink || 0) > 0.5
    ? `<path d="M15.5 -1.2 L17.9 -1.2" stroke="${C.eye}" stroke-width=".7" fill="none" stroke-linecap="round"/>`
    : `<circle cx="16.6" cy="-1.2" r="1.3" fill="${C.eye}"/><circle cx="17.1" cy="-1.7" r=".45" fill="#fff"/>`;
  const headIn = (P.headT || 0);
  const head = g(trl(-9.5 * headIn + (P.headX || 0), 4.5 * headIn) + ' ' + rot((P.headA || 0) - 16 * headIn, 9, 4),
    `<path d="M8.5 6.5 C 8.5 2 10.5 -1 14 -1.8 L16.5 2 C 13.5 3.5 11.5 5.5 10.5 7.5 Z" fill="${C.skin}"/>` +
    `<circle cx="15.2" cy="0" r="4.2" fill="${C.skin}"/>` +
    `<circle cx="14" cy="-1.8" r="1.6" fill="${C.hi}" opacity=".55"/>` +
    eyes +
    `<circle cx="18.9" cy="0.2" r=".4" fill="#6F7F4A"/>` +
    `<path d="M17.9 1.4 C 17.1 2.2 15.9 2.4 14.9 2" stroke="#6F7F4A" stroke-width=".8" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="17.5" cy="1" rx="1.2" ry=".8" fill="#E8943E" opacity=".22"/>`);
  const lf = (px, py, cx, cy, col, a) => g(rot(a, px, py) + ' ' + scl(1 - 0.75 * tuck, 1 - 0.75 * tuck, px, py - 1),
    `<ellipse cx="${cx}" cy="${cy}" rx="3" ry="1.9" fill="${col}"/>`);
  return g(rot(P.tailA || 0, -11.5, 5.5) + ' ' + scl(1 - 0.6 * tuck, 1, -11.5, 5.5),
      `<path d="M-11.5 4.5 C -14 4.4 -15.8 5.6 -16.4 7.4 C -14.6 7.5 -12.6 6.9 -11.4 5.9 Z" fill="${C.skin}"/>`) +
    lf(-7, 8, -7.6, 9, C.skinD, P.legFar || 0) +
    lf(5.5, 8, 6.1, 9, C.skinD, -(P.legFar || 0)) +
    head +
    lf(-5, 8.4, -5.4, 9.4, C.skin, P.legNear || 0) +
    lf(7.5, 8.4, 8.1, 9.4, C.skin, -(P.legNear || 0)) +
    `<path d="M-13.5 6 C -14.6 -2.5 -8 -10 0 -10 C 8 -10 14.2 -3 12.8 6 C 7 8.2 -7.5 8.2 -13.5 6 Z" fill="${C.shell}"/>` +
    `<path d="M-14 4.8 C -15 7.6 -11.2 9.4 -0.5 9.4 C 10.2 9.4 13.8 7.6 13 4.8 C 6.5 7.4 -7.5 7.4 -14 4.8 Z" fill="${C.rim}"/>` +
    `<path d="M-4.5 -1.5 L-2 -4.5 L2 -4.5 L4.5 -1.5 L2 1.5 L-2 1.5 Z" fill="${C.rim}" opacity=".5"/>` +
    `<ellipse cx="-8.5" cy="0.5" rx="2.4" ry="2" fill="${C.rim}" opacity=".45"/>` +
    `<ellipse cx="8" cy="-0.5" rx="2.2" ry="1.9" fill="${C.rim}" opacity=".45"/>` +
    `<path d="M-7.5 -5.5 C -3.5 -8.6 3.5 -8.8 7 -6.2" stroke="${C.hi}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".65"/>`;
}

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.grounded) s += shadow(dx, GY + 0.5, 14.5, 0, 14);
  return s + g(trl(dx, dy) + ' ' + rot(P.pitch || 0, 0, 2), turtle(P));
}

return {
  id: 'turtle', view: [-34, -25, 70, 44], groundY: GY,
  thumb: { m: 'walk', t: 0.15 },
  motions: [
    { id: 'walk', label: 'Walk', short: 'Walk', dur: 2.2, env: { t: 'ground' }, speed: '~0.4 km/h', beat: 'Diagonal · unhurried',
      desc: 'Deliberate progress ashore: diagonal legs swinging in slow pairs while the neck does the reaching ahead.',
      anim: 'Nothing about a turtle is springy — no bounce, no overshoot. The shell travels dead level; only legs and neck articulate.' },
    { id: 'swim', label: 'Swim', short: 'Swim', dur: 2, env: { t: 'water', y: 2 }, speed: '~3 km/h', beat: 'Slow rowing',
      desc: 'Under water the same turtle turns fluent: legs become oars, the shell a hull, the neck a stretched bowsprit.',
      anim: 'Row all four legs in long, easy strokes and let the body rise a little on each pull. Everything overlaps; nothing stops.' },
    { id: 'hide', label: 'Hide', short: 'Hide', dur: 3.6, env: { t: 'ground' }, speed: '0 km/h', beat: 'Snap in → wait → peek',
      desc: 'The oldest defence in the book: head, legs and tail vanish into the shell in a blink, and the shell simply waits.',
      anim: 'Retract in two frames — it must startle. The comedy is the long, motionless wait and the head\u2019s slow, suspicious return.' },
    { id: 'bask', label: 'Bask', short: 'Bask', dur: 4.6, env: { t: 'ground' }, speed: '0 km/h', beat: 'Neck out · sun-still',
      desc: 'Flat rock, full sun: neck stretched to its whole length, eyes closing by degrees — a stone that breathes.',
      anim: 'Stretch the neck a shade further than anatomy suggests and let the blinks get slower and heavier as the loop runs.' }
    ,{ id: 'rest', label: 'Rest', short: 'Rest', dur: 6.5, env: { t: 'ground' }, night: true, speed: '0 km/h', beat: 'Withdrawn · still',
      desc: 'Head, legs and tail drawn into the shell and settled for the night — a smooth stone that will move again by morning.',
      anim: 'The shell simply sits; a breath of drift and the faintest rock are all that separate sleep from stone.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'rest') {
      return draw({ grounded: true, headT: 0.92, legTuck: 0.92, headA: 0, tailA: 0, pitch: 0.4 * Math.sin(TAU * t), blink: 1 });
    }
    if (mid === 'swim') {
      return draw({
        pitch: -7 + 1.5 * osc(t, 1, .3), dy: -1.6 * osc(t, 1, .25),
        legFar: 30 * osc(t, 1, 0), legNear: 30 * osc(t, 1, .45),
        headA: -5 + 2 * osc(t, 1, .5), headX: 1,
        tailA: 6 * osc(t, 1, .2),
        ticks: rippleTicks(t, { y: 2, x1: -31, x2: 34, v: 18, n: 5, s: 1.1, tone: '#85988B' })
      });
    }
    if (mid === 'hide') {
      const K = keys(t, [
        [0.00, { headT: 0, legTuck: 0, headA: 0 }],
        [0.10, { headT: 0, legTuck: 0, headA: -7 }],
        [0.13, { headT: 1, legTuck: 1, headA: 0 }],
        [0.60, { headT: 1, legTuck: 1, headA: 0 }],
        [0.74, { headT: 0.5, legTuck: 0.4, headA: -4 }],
        [0.80, { headT: 0.45, legTuck: 0.3, headA: -4 }],
        [0.90, { headT: 0, legTuck: 0, headA: 0 }],
        [1.00, { headT: 0, legTuck: 0, headA: 0 }]
      ]);
      K.grounded = true;
      K.pitch = 1.2 * osc(t, 3, .1) * pulse(t, .16, .6);
      K.blink = pulse(t, .74, .8);
      return draw(K);
    }
    if (mid === 'bask') {
      return draw({
        grounded: true,
        headX: 2.2 + 0.4 * osc(t, 1, .2), headA: -6 + 1.5 * osc(t, 1, .4),
        blink: 0.4 + 0.6 * Math.max(0, osc(t, 2, .1)),
        tailA: 3 * pulse(t, .55, .62),
        legFar: 4, legNear: -3
      });
    }
    // walk
    return draw({
      grounded: true,
      dy: -0.4 * osc(t, 2, .2),
      legFar: 24 * osc(t, 1, 0), legNear: 24 * osc(t, 1, .5),
      headA: 3 * osc(t, 1, .12), headX: 1.4 + 1.2 * osc(t, 1, .05),
      tailA: 5 * osc(t, 1, .3),
      blink: pulse(t, .58, .63),
      ticks: groundTicks(t, { y: GY, x1: -31, x2: 34, v: 12, n: 7, s: 1 })
    });
  }
};

})();
__REG["fish"] = (function(){
// Roach (river fish) — fable style
const C = { body: '#5BA6BE', deep: '#4F91A8', dark: '#3E7E94', belly: '#CFE9F5', eye: '#2A2326' };
const WATER = -16;

// P: tailA, finA, mouthO, bubbles (0..1 phase)
function fish(P) {
  const mouth = (P.mouthO || 0) > 0.3
    ? `<circle cx="14" cy="0.4" r="${N(0.9 + 0.8 * P.mouthO)}" fill="${C.dark}"/>`
    : `<path d="M14.6 0.9 C 14 1.7 13 2 12.2 1.7" stroke="${C.dark}" stroke-width=".8" fill="none" stroke-linecap="round"/>`;
  return g(rot(P.tailA || 0, -8.5, 0),
      `<path d="M-8 0 C -11.5 -4.5 -16 -6.8 -19.8 -6.2 C -18 -2.6 -18 2.6 -19.8 6.2 C -16 6.8 -11.5 4.5 -8 0 Z" fill="${C.deep}"/>` +
      `<path d="M-18.6 -5.2 C -17.2 -2 -17.2 2 -18.6 5.2 C -15.8 4.6 -12.8 2.8 -10.6 0 C -12.8 -2.8 -15.8 -4.6 -18.6 -5.2 Z" fill="${C.body}" opacity=".5"/>`) +
    `<path d="M-3.5 -7.2 C -1.5 -11.2 3.5 -11.8 6.5 -8.8 C 3.5 -8.8 0 -8.2 -2.5 -6.8 Z" fill="${C.deep}"/>` +
    `<path d="M-9.5 0 C -6.5 -7 2 -9.6 8 -7 C 12.4 -5 14.6 -2 14.9 0 C 14.6 2 12.4 5 8 7 C 2 9.6 -6.5 7 -9.5 0 Z" fill="${C.body}"/>` +
    `<path d="M-8.5 2.5 C -4 6.8 4 8.2 10.5 5.2 C 6 8.6 -2.5 8.8 -7.5 5 C -8.1 4.2 -8.5 3.4 -8.5 2.5 Z" fill="${C.belly}" opacity=".85"/>` +
    `<path d="M-6 -5 C -2 -7.8 4 -8.2 8 -6.2" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round" opacity=".35"/>` +
    `<path d="M-2.5 -3.4 C -1 -1.8 -1 1.4 -2.5 3 M2.6 -3.8 C 4.1 -2.2 4.1 1.2 2.6 2.8 M7.4 -3.2 C 8.6 -1.9 8.6 0.7 7.4 2" stroke="${C.dark}" stroke-width=".9" fill="none" stroke-linecap="round" opacity=".4"/>` +
    `<path d="M9.6 -4.4 C 11.2 -2.4 11.2 1.6 9.6 3.6" stroke="${C.dark}" stroke-width="1" fill="none" opacity=".5"/>` +
    `<circle cx="11.6" cy="-2" r="1.5" fill="${C.eye}"/>` +
    `<circle cx="12.1" cy="-2.5" r=".5" fill="#fff"/>` +
    mouth +
    `<ellipse cx="11.8" cy="0.6" rx="1.3" ry=".9" fill="#EF9C7E" opacity=".3"/>` +
    g(rot(P.finA || 0, 3.5, 2), `<path d="M3.5 1.6 C 6.2 2.6 7.2 5.2 6.2 7.8 C 3.9 6.9 2.8 4.6 3.5 1.6 Z" fill="${C.deep}"/>`);
}

function bubbles(t, x, y) {
  const p = wrap(t);
  let s = '<g fill="#CFE9F5">';
  for (let i = 0; i < 2; i++) {
    const pp = wrap(p + i * 0.45), rise = 16 * pp;
    s += `<circle cx="${N(x + 1.5 * Math.sin(6 * pp + i * 2))}" cy="${N(y - rise)}" r="${N(0.7 + 0.4 * i)}" opacity="${N(0.7 * (1 - pp))}"/>`;
  }
  return s + '</g>';
}

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.bub) s += bubbles(P.bub, dx + 16, dy - 6);
  return s + g(trl(dx, dy) + ' ' + rot(P.pitch || 0, 0, 0), fish(P));
}

return {
  id: 'fish', view: [-33, -25, 68, 44], groundY: 18,
  thumb: { m: 'swim', t: 0.1 },
  motions: [
    { id: 'swim', label: 'Cruise', short: 'Cruise', dur: 1.3, env: { t: 'water', y: -16 }, speed: '~2 km/h', beat: 'Tail-sculled · easy',
      desc: 'Unhurried river travel: the tail sculls in long easy strokes and the body barely remembers to follow.',
      anim: 'The wave starts mid-body and amplifies to the tail-tip — never rock the head. Fins idle on their own slow beat.' },
    { id: 'dart', label: 'Dart', short: 'Dart', dur: 2.4, env: { t: 'water', y: -16 }, speed: 'burst', beat: 'Hold → flick → coast',
      desc: 'A shadow falls and the fish is elsewhere: one full-body flick, a silver blur, then a glide down to stillness.',
      anim: 'Spend one frame on the C-bend and two on the burst; the rest is coasting. The stillness before and after is the shot.' },
    { id: 'gulp', label: 'Rise & gulp', short: 'Gulp', dur: 3.2, env: { t: 'water', y: -16 }, speed: '~0 km/h', beat: 'Tilt · sip · sink',
      desc: 'Something small lands on the ceiling of the world; the fish tilts up, sips it from the surface, and sinks away.',
      anim: 'Approach the surface slowly, kiss it with an O of a mouth and one ring of ripple, then fall away with a single tail-stroke.' }
    ,{ id: 'rest', label: 'Rest', short: 'Rest', dur: 6, env: { t: 'water', y: -16 }, night: true, speed: '0 km/h', beat: 'Hovering · fins idle',
      desc: 'Hanging near the river bed in the dark, fins barely sculling, the silver body held almost still — its eyes, as ever, open.',
      anim: 'Near-total stillness: a whisper of tail and fin to hold station, the body hovering level in the slow current.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'rest') {
      return draw({ tailA: 2 * osc(t, 1, 0), finA: 3 * osc(t, 1, .2), dy: -0.6 * osc(t, 1, .1), pitch: 1 * osc(t, 1, .3), ticks: rippleTicks(t, { y: WATER, x1: -30, x2: 33, v: 3, n: 5, s: 1, tone: '#8FA9B4' }) });
    }
    if (mid === 'dart') {
      const K = keys(t, [
        [0.00, { dx: -6, tailA: 0, pitch: 0 }],
        [0.30, { dx: -6, tailA: 0, pitch: 0 }],
        [0.34, { dx: -8, tailA: 34, pitch: -3 }],
        [0.40, { dx: 14, tailA: -22, pitch: 2 }],
        [0.46, { dx: 16, tailA: 8, pitch: 0 }],
        [0.72, { dx: 15, tailA: 0, pitch: 0 }],
        [0.92, { dx: -6, tailA: 6, pitch: -1 }],
        [1.00, { dx: -6, tailA: 0, pitch: 0 }]
      ]);
      const zip = pulse(t, .34, .42);
      if (zip > 0.3) K.ticks = `<g stroke="#9FC4D4" stroke-linecap="round" opacity="${N(zip * .7)}"><line x1="${N(K.dx - 15)}" y1="-2" x2="${N(K.dx - 6)}" y2="-2" stroke-width=".9"/><line x1="${N(K.dx - 12)}" y1="2.5" x2="${N(K.dx - 4)}" y2="2.5" stroke-width=".7"/></g>`;
      K.tailA += 3 * osc(t, 2, .2) * (1 - zip);
      K.finA = 8 * osc(t, 2, .3);
      K.bub = t * 0.5 + .3;
      return draw(K);
    }
    if (mid === 'gulp') {
      const K = keys(t, [
        [0.00, { dy: 4, pitch: 0, mouthO: 0 }],
        [0.22, { dy: -5, pitch: -16, mouthO: 0.2 }],
        [0.32, { dy: -7.5, pitch: -20, mouthO: 1 }],
        [0.42, { dy: -7, pitch: -16, mouthO: 0.6 }],
        [0.60, { dy: 0, pitch: 6, mouthO: 0 }],
        [0.82, { dy: 4, pitch: 1, mouthO: 0 }],
        [1.00, { dy: 4, pitch: 0, mouthO: 0 }]
      ]);
      K.tailA = 9 * osc(t, 2, .1) * (0.4 + 0.6 * pulse(t, .1, .6));
      K.finA = 9 * osc(t, 2, .4);
      const sip = pulse(t, .28, .44);
      if (sip > 0.1) K.ticks = `<g stroke="#8FA093" fill="none" opacity="${N(sip * .8)}"><path d="M10 ${WATER} q 3 1.6 6 0" stroke-width=".8"/><path d="M7 ${WATER} q 6 3 12 0" stroke-width=".6"/></g>`;
      K.bub = t + .1;
      return draw(K);
    }
    // cruise
    return draw({
      tailA: 13 * osc(t, 1, 0), pitch: 1.6 * osc(t, 1, .3),
      dy: -1.5 * osc(t, 1, .2), dx: 1.2 * osc(t, 1, .45),
      finA: 10 * osc(t, 2, .15),
      bub: t,
      ticks: rippleTicks(t, { y: WATER, x1: -30, x2: 33, v: 16, n: 5, s: 1, tone: '#8FA9B4' })
    });
  }
};

})();
__REG["snail"] = (function(){
// Garden Snail — fable style
const C = { skin: '#D8C6AE', skinD: '#CDBBA0', line: '#B7A488', shell: '#C99A5A', rim: '#B0844A', spiral: '#A87B3E', eye: '#2A2326' };
const GY = 9.4;

const SPIRAL = 'M5.5 -1.0 L5.2 1.0 L4.4 2.8 L3.2 4.3 L1.7 5.5 L0.0 6.3 L-1.8 6.7 L-3.6 6.7 L-5.4 6.3 L-6.9 5.4 L-8.2 4.2 L-9.2 2.8 L-9.8 1.2 L-10.1 -0.4 L-9.9 -2.1 L-9.3 -3.6 L-8.5 -5.0 L-7.3 -6.1 L-6.0 -6.8 L-4.5 -7.3 L-3.0 -7.3 L-1.5 -7.0 L-0.2 -6.4 L0.9 -5.6 L1.8 -4.5 L2.3 -3.2 L2.6 -1.9 L2.5 -0.6 L2.2 0.7 L1.6 1.8 L0.7 2.7 L-0.3 3.4 L-1.5 3.8 L-2.6 3.9 L-3.8 3.7 L-4.8 3.3 L-5.7 2.7 L-6.4 1.9 L-6.9 1.0 L-7.1 -0.0 L-7.1 -1.0 L-6.9 -1.9 L-6.5 -2.8 L-5.9 -3.5 L-5.2 -4.0 L-4.4 -4.3 L-3.5 -4.4 L-2.7 -4.4 L-2.0 -4.1 L-1.3 -3.7 L-0.8 -3.2 L-0.5 -2.5 L-0.3 -1.9 L-0.3 -1.2 L-0.4 -0.6 L-0.7 -0.0 L-1.1 0.4 L-1.5 0.7 L-2.0 0.9 L-2.5 1.0 L-3.0 1.0 L-3.4 0.8 L-3.8 0.6 L-4.1 0.2 L-4.2 -0.1';

// P: neckA, neckX, stalkA, stalkB (0..1 extended), shellA, bodyS (0..1 retracted)
function snail(P) {
  const bs = 1 - 0.78 * (P.bodyS || 0);
  const stalk = (ext, px, d, cx, cy) => g(scl(ext, ext, px, -3.2),
    `<path d="${d}" stroke="${C.skin}" stroke-width="1.6" fill="none" stroke-linecap="round"/>` +
    `<circle cx="${cx}" cy="${cy}" r="1.5" fill="${C.skin}"/><circle cx="${cx + .3}" cy="${cy - .2}" r=".7" fill="${C.eye}"/>`);
  const neck = g(rot(P.neckA || 0, 10, 5) + ' ' + trl(P.neckX || 0, 0) + ' ' + scl(bs, bs, 8, 7),
    `<path d="M10 5 C 10 -1 13 -5 17 -4 C 20 -3 20 2 18 5 C 16 7 12 7 10 5 Z" fill="${C.skin}"/>` +
    stalk(Math.max(0.06, P.stalkA ?? 1), 13, 'M13 -3 C 12.5 -8 13 -11 13.5 -12', 13.6, -12.5) +
    stalk(Math.max(0.06, P.stalkB ?? 1), 15, 'M16 -3 C 16.5 -7 17 -9 17.5 -10', 17.6, -10.5));
  const body = g(scl(0.3 + 0.7 * bs, 1, -3, 9),
    `<path d="M-16 8 C -18 4 -12 3 -6 3 C 4 3 12 3 17 4 C 20 5 19 8 15 8.5 C 6 9.2 -8 9.2 -16 8 Z" fill="${C.skinD}"/>` +
    `<path d="M-15 8 C -6 9 10 9 17 7.5" stroke="${C.line}" stroke-width="1" fill="none" opacity=".6"/>`);
  const shell = g(rot(P.shellA || 0, -3, 7) + ' ' + trl(0, (P.bodyS || 0) * 1.2),
    `<circle cx="-3" cy="-1" r="10" fill="${C.shell}"/>` +
    `<circle cx="-3" cy="-1" r="10" fill="none" stroke="${C.rim}" stroke-width="1"/>` +
    `<path d="${SPIRAL}" stroke="${C.spiral}" stroke-width="1.6" fill="none" stroke-linecap="round"/>` +
    `<circle cx="-6" cy="-4" r="2.4" fill="#fff" opacity=".2"/>`);
  return body + neck + shell;
}

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.slime) s += `<line x1="-30" y1="${N(GY + 0.4)}" x2="${N(dx - 12)}" y2="${N(GY + 0.4)}" stroke="#C9D4C0" stroke-width="1.1" stroke-linecap="round" opacity=".5"/>`;
  s += shadow(dx - 1, GY + 0.4, 16, 0, 10);
  return s + g(trl(dx, dy), snail(P));
}

return {
  id: 'snail', view: [-33, -23, 68, 38], groundY: GY,
  thumb: { m: 'glide', t: 0.2 },
  motions: [
    { id: 'glide', label: 'Glide', short: 'Glide', dur: 3.2, env: { t: 'ground' }, speed: '~0.003 km/h', beat: 'One muscle · one wave',
      desc: 'The whole animal is a single slow wave travelling nose to tail, laid down on a silver road of its own making.',
      anim: 'Nothing may hurry — stretch the neck by degrees and let the shell rock a beat behind. The slime trail is the motion line.' },
    { id: 'peek', label: 'Eye-stalks', short: 'Peek', dur: 3.4, env: { t: 'ground' }, speed: '0 km/h', beat: 'Snap in · bloom out',
      desc: 'A touch of a grass-blade and the eye-stalks vanish inward like sleeves; then, cautiously, they bloom back out.',
      anim: 'Retract in two frames, re-extend over twenty with an overshoot, one stalk always trailing the other. Comedy of caution.' },
    { id: 'hide', label: 'Hide', short: 'Hide', dur: 4.6, env: { t: 'ground' }, speed: '0 km/h', beat: 'Pour in → wait → pour out',
      desc: 'Real trouble, and the snail pours itself backwards into the spiral until only the front door of foot remains.',
      anim: 'The body funnels in like water down a drain, shell settling as the weight arrives. Re-emergence is twice as slow, stalks last.' }
    ,{ id: 'rest', label: 'Rest', short: 'Rest', dur: 6.5, env: { t: 'ground' }, night: false, speed: '0 km/h', beat: 'Sealed in · still',
      desc: 'Withdrawn deep into the spiral by day and sealed behind the foot — the whole animal put away as a stone with a door.',
      anim: 'No motion at all — the pose IS the sleep. Only the shell’s sheen tells it apart from a pebble.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'rest') {
      return draw({ bodyS: 1, stalkA: 0.06, stalkB: 0.06, shellA: 0, neckA: 0 });
    }
    if (mid === 'peek') {
      const K = keys(t, [
        [0.00, { stalkA: 1, stalkB: 1 }],
        [0.13, { stalkA: 1, stalkB: 1 }],
        [0.17, { stalkA: 0.08, stalkB: 0.08 }],
        [0.42, { stalkA: 0.08, stalkB: 0.08 }],
        [0.56, { stalkA: 1.12, stalkB: 0.08 }],
        [0.62, { stalkA: 1, stalkB: 0.3 }],
        [0.72, { stalkA: 1, stalkB: 1.1 }],
        [0.78, { stalkA: 1, stalkB: 1 }],
        [1.00, { stalkA: 1, stalkB: 1 }]
      ]);
      K.neckA = -2 * pulse(t, .15, .5);
      K.shellA = 1.2 * pulse(t, .15, .3);
      K.slime = true;
      return draw(K);
    }
    if (mid === 'hide') {
      const K = keys(t, [
        [0.00, { bodyS: 0, stalkA: 1, stalkB: 1, shellA: 0 }],
        [0.08, { bodyS: 0, stalkA: 0.08, stalkB: 0.08, shellA: -1 }],
        [0.18, { bodyS: 1, stalkA: 0.06, stalkB: 0.06, shellA: -5 }],
        [0.24, { bodyS: 1, stalkA: 0.06, stalkB: 0.06, shellA: -2.5 }],
        [0.58, { bodyS: 1, stalkA: 0.06, stalkB: 0.06, shellA: -2.5 }],
        [0.78, { bodyS: 0, stalkA: 0.08, stalkB: 0.08, shellA: 0 }],
        [0.88, { bodyS: 0, stalkA: 1, stalkB: 0.5, shellA: 0 }],
        [0.94, { bodyS: 0, stalkA: 1, stalkB: 1, shellA: 0 }],
        [1.00, { bodyS: 0, stalkA: 1, stalkB: 1, shellA: 0 }]
      ]);
      K.slime = true;
      return draw(K);
    }
    // glide
    return draw({
      neckA: -2.5 * osc(t, 1, .1), neckX: 0.8 * osc(t, 1, .35),
      stalkA: 1 + 0.05 * osc(t, 1, .2), stalkB: 1 + 0.05 * osc(t, 1, .5),
      shellA: 1.5 * osc(t, 1, .55),
      slime: true,
      ticks: groundTicks(t, { y: GY, x1: -30, x2: 33, v: 3, n: 6, s: .85 })
    });
  }
};

})();
__REG["ant"] = (function(){
// Black Garden Ant — fable style (side view, faces right)
const C = { body: '#5A4038', dark: '#3E2C26', shine: '#96786A', seed: '#C9B88F', seedD: '#A98B62', eye: '#211F30' };
const GY = 9;
const LEG = 'stroke="#3E2C26" stroke-width=".85" fill="none" stroke-linecap="round" stroke-linejoin="round"';

const legsA = a => g(rot(a, 0.5, 1),
  `<path d="M3.4 0.8 L5.6 4.6 L7.6 8.6" ${LEG}/><path d="M0.6 1.4 L0 5.2 L-1.6 8.8" ${LEG}/><path d="M-2 1 L-4.6 4.4 L-7.4 8.2" ${LEG}/>`);
const legsB = a => g(rot(a, 1, 1),
  `<g opacity=".45"><path d="M4.2 0.6 L6.4 4.2 L8.6 8" ${LEG}/><path d="M1.4 1.2 L1 5 L-0.6 8.6" ${LEG}/><path d="M-1.2 0.8 L-3.8 4.2 L-6.6 8" ${LEG}/></g>`);

// P: lA lB gA hA antA antB seed seedA
const ant = P =>
  legsB(P.lB || 0) + legsA(P.lA || 0) +
  g(rot(P.gA || 0, -3.6, 0.4),
    `<ellipse cx="-7.2" cy="-0.2" rx="4.7" ry="3.5" fill="${C.body}"/>` +
    `<ellipse cx="-8.4" cy="-1.6" rx="2" ry="1" fill="${C.shine}" opacity=".5" transform="rotate(-18 -8.4 -1.6)"/>`) +
  `<ellipse cx="-2.5" cy="0.6" rx="1.3" ry="1" fill="${C.dark}"/>` +
  `<ellipse cx="0.8" cy="-0.2" rx="2.9" ry="2.1" fill="${C.body}"/>` +
  g(rot(P.hA || 0, 4.2, -0.6),
    `<circle cx="5.6" cy="-1" r="2.5" fill="${C.body}"/>` +
    `<circle cx="6.4" cy="-1.6" r=".55" fill="${C.eye}"/>` +
    `<path d="M7.8 -0.3 L 9.3 0.4 M7.9 0.5 L 9.2 1.3" stroke="${C.dark}" stroke-width=".6" fill="none" stroke-linecap="round"/>` +
    g(rot(P.antA || 0, 6.4, -2.8), `<path d="M6.2 -3 L 7.6 -5.7 L 9.9 -6.7" ${LEG}/>`) +
    g(rot(P.antB || 0, 6.4, -2.8), `<path d="M6.8 -2.6 L 8.7 -4.7 L 11 -5.1" ${LEG}/>`) +
    (P.seed ? g(rot(P.seedA || 0, 8.6, -2),
      `<ellipse cx="9.4" cy="-4" rx="3.2" ry="2.2" fill="${C.seed}" stroke="${C.seedD}" stroke-width=".6" transform="rotate(-34 9.4 -4)"/>` +
      `<path d="M7.6 -2.3 C 8.4 -3.8 9.8 -5 11.4 -5.6" stroke="${C.seedD}" stroke-width=".45" fill="none" opacity=".7"/>`) : ''));

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  s += shadow(dx - 1, GY, 8.5, Math.max(0, -dy), 10);
  return s + g(trl(dx, dy) + ' ' + rot(P.pitch || 0, 0, 4), ant(P));
}

return {
  id: 'ant', view: [-26, -22, 54, 36], groundY: GY,
  thumb: { m: 'carry', t: 0.05 },
  motions: [
    { id: 'march', label: 'March', short: 'March', dur: 0.55, env: { t: 'ground' }, speed: '~0.3 km/h', beat: 'Tripod · 3+3 legs',
      desc: 'The forager’s brisk business-walk: always three feet on the ground — two one side, one the other — swapping in strict alternation, antennae reading the trail.',
      anim: 'Legs scissor in two sets of three, never four down at once. Keep the body dead level and let the antennae tap-tap on their own offbeat.' },
    { id: 'carry', label: 'Carry the seed', short: 'Carry', dur: 0.8, env: { t: 'ground' }, speed: '~0.2 km/h', beat: 'Tripod · under load',
      desc: 'Homeward with a seed several times her own weight held high in the jaws — the load sways, the six legs simply refuse to notice.',
      anim: 'Same tripod beat, slower and wider. All the struggle shows in the cargo: let the seed wobble a half-beat behind each step, never the legs.' },
    { id: 'rest', label: 'Night rest', short: 'Rest', dur: 6, env: { t: 'ground' }, night: true, speed: '0 km/h', beat: 'Folded · brief stirs',
      desc: 'Ants do not truly sleep — the worker parks herself, folds the antennae back along the head, and goes still in short instalments through the night.',
      anim: 'Tuck legs and antennae into the body outline and hold. One antenna unfolds, tastes the air, and folds away again — that is the whole show.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'rest') {
      const stir = pulse(t, .52, .62);
      return draw({
        dy: 0.6,
        lA: -8, lB: -8,
        gA: 1.4 * osc(t, 1, .1),
        antA: -44 + 30 * stir, antB: -38 + 4 * stir,
        hA: 2 * stir
      });
    }
    if (mid === 'carry') {
      return draw({
        pitch: -3,
        dy: -0.2 * Math.abs(osc(t, 3)),
        lA: 9 * osc(t, 3), lB: 9 * osc(t, 3, .5),
        gA: 2.5 * osc(t, 3, .25), hA: -2,
        antA: -18 + 4 * osc(t, 3, .1), antB: -14 + 4 * osc(t, 3, .6),
        seed: true, seedA: 4 * osc(t, 3, .3),
        ticks: groundTicks(t, { y: GY, x1: -23, x2: 25, v: 11, n: 6, s: .65 })
      });
    }
    // march
    return draw({
      dy: -0.25 * Math.abs(osc(t, 2)),
      lA: 12 * osc(t, 2), lB: 12 * osc(t, 2, .5),
      gA: 3 * osc(t, 2, .2), hA: 2 * osc(t, 4, .1),
      antA: 9 * osc(t, 2, .1), antB: 9 * osc(t, 2, .6),
      ticks: groundTicks(t, { y: GY, x1: -23, x2: 25, v: 17, n: 6, s: .65 })
    });
  }
};

})();
__REG["bumblebee"] = (function(){
// Buff-tailed Bumblebee — fable style (side profile, faces right)
const C = { blk: '#3A3550', gold: '#E8A63A', buff: '#F2E9D8', wing: '#EAF4FF', eye: '#211F30', pink: '#C77E96', pinkD: '#A85E78', stem: '#6B7A4A', leaf: '#7E8A56', petal: '#D8CBAA', petalD: '#B9A87E' };
const GY = 16;

const wingFar = a => g(rot(a, 0.6, -3.6),
  `<ellipse cx="-2.6" cy="-6.2" rx="4.6" ry="2.2" fill="${C.wing}" opacity=".5" transform="rotate(-28 -2.6 -6.2)"/>`);
const wingNear = a => g(rot(a, 1.4, -3.2),
  `<ellipse cx="-1.8" cy="-6.4" rx="5.4" ry="2.6" fill="${C.wing}" opacity=".85" transform="rotate(-26 -1.8 -6.4)"/>` +
  `<ellipse cx="-3.4" cy="-7.3" rx="1.8" ry=".95" fill="#fff" opacity=".5" transform="rotate(-26 -3.4 -7.3)"/>` +
  `<path d="M-6.8 -8.2 C -3.4 -9.2 0.2 -7.8 1.4 -5.4" stroke="#CFE6F5" stroke-width=".5" fill="none" opacity=".8"/>`);

// P: wA wB antA legS
const bumble = P =>
  wingFar(P.wB ?? P.wA ?? 0) +
  g(rot(P.legS || 0, 0, 3.5),
    `<path d="M-2.2 4.2 C -3 6.2 -4.4 7.2 -5.8 7.4 M0.8 4.6 C 0.4 6.6 -0.7 7.7 -2 8 M3.4 4 C 3.4 5.9 2.5 7.1 1.4 7.5" stroke="${C.blk}" stroke-width="1" fill="none" stroke-linecap="round"/>`) +
  `<ellipse cx="-3" cy="0.4" rx="8.2" ry="5.6" fill="${C.blk}"/>` +
  `<path d="M-8.2 -4.6 C -10.6 -3.4 -11.6 -1 -11 1.7 C -10.5 3.6 -9.2 5 -7.6 5.6 C -9.4 2.2 -9.6 -1.8 -8.2 -4.6 Z" fill="${C.buff}"/>` +
  `<path d="M-1.4 -5.4 C -2.5 -1.7 -2.5 2.3 -1.4 5.9" stroke="${C.gold}" stroke-width="3" fill="none" stroke-linecap="round"/>` +
  `<path d="M-6.4 -5 L -7 -6.3 M-3 -5.7 L -3.3 -7.1 M1 -5.3 L 1.4 -6.6 M4 -4 L 4.8 -5.2" stroke="${C.blk}" stroke-width=".55" stroke-linecap="round" opacity=".55"/>` +
  `<ellipse cx="-4" cy="-2.6" rx="3.4" ry="1.4" fill="#fff" opacity=".14" transform="rotate(-10 -4 -2.6)"/>` +
  `<circle cx="4.6" cy="-1.2" r="4.1" fill="${C.blk}"/>` +
  `<path d="M1.3 -3.6 C 2.9 -5.2 5.6 -5.5 7.5 -4.2" stroke="${C.gold}" stroke-width="2.5" fill="none" stroke-linecap="round"/>` +
  `<circle cx="9.8" cy="-1.7" r="2.3" fill="${C.blk}"/>` +
  `<ellipse cx="10.6" cy="-2" rx="1.1" ry="1.4" fill="#fff" opacity=".92" transform="rotate(10 10.6 -2)"/>` +
  `<circle cx="10.9" cy="-1.9" r=".58" fill="${C.eye}"/>` +
  g(rot(P.antA || 0, 10.2, -3.6),
    `<path d="M10 -3.8 C 10.6 -5.6 11.6 -6.7 12.9 -7.2 M10.9 -3.4 C 11.9 -4.8 13 -5.5 14.2 -5.6" stroke="${C.blk}" stroke-width=".8" fill="none" stroke-linecap="round"/>` +
    `<circle cx="13" cy="-7.3" r=".75" fill="${C.blk}"/><circle cx="14.3" cy="-5.6" r=".75" fill="${C.blk}"/>`) +
  wingNear(P.wA || 0);

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  const flip = P.flip ? ' scale(-1 1)' : '';
  return s + g(trl(dx, dy) + flip + ' ' + rot(P.pitch || 0, 0, 0), bumble(P));
}

const CLOVER =
  `<path d="M0.4 ${GY} C -0.6 12 0.8 9 0.2 6.8" stroke="${C.stem}" stroke-width="1.2" fill="none" stroke-linecap="round"/>` +
  `<path d="M0 11.4 C -2.4 10.8 -4 11.4 -5 12.8 C -3 13.6 -1 13 0 11.4 Z" fill="${C.leaf}"/>` +
  `<path d="M0.4 9.8 C 2.6 9.2 4.2 9.8 5.2 11.2 C 3.2 12 1.4 11.4 0.4 9.8 Z" fill="${C.leaf}"/>` +
  `<circle cx="0" cy="2.2" r="5.2" fill="${C.pink}"/>` +
  `<path d="M-3.6 -0.6 C -2.6 -2.2 -0.8 -3 1 -2.7 M-4.6 2.2 C -4 0.8 -2.8 -0.2 -1.2 -0.5 M1.8 -2.4 C 3.2 -1.8 4.2 -0.6 4.5 0.9" stroke="${C.pinkD}" stroke-width=".7" fill="none" stroke-linecap="round" opacity=".85"/>` +
  `<path d="M-2.8 4.6 C -1.6 5.4 0.2 5.6 1.8 5.2 M-0.6 1.4 C 0.6 2 2 2 3.2 1.6" stroke="#E3B9C6" stroke-width=".8" fill="none" stroke-linecap="round" opacity=".9"/>`;

const NIGHTCUP =
  `<path d="M0.2 ${GY} C -0.8 13 0.6 11 0.2 9.4" stroke="${C.stem}" stroke-width="1.2" fill="none" stroke-linecap="round"/>` +
  `<path d="M-1.8 12.6 C -3.8 12 -5.4 12.6 -6.4 14 C -4.4 14.8 -2.6 14.2 -1.8 12.6 Z" fill="${C.leaf}"/>`;
const CUPFRONT =
  `<path d="M-7.2 1.6 C -7.6 6 -5 9.6 0 9.6 C 5 9.6 7.6 6 7.2 1.6 C 5 4.2 2.6 5.4 0 5.4 C -2.6 5.4 -5 4.2 -7.2 1.6 Z" fill="${C.petal}"/>` +
  `<path d="M-7.2 1.6 C -6 4.6 -3.4 6.4 0 6.4 C 3.4 6.4 6 4.6 7.2 1.6" stroke="${C.petalD}" stroke-width=".7" fill="none" opacity=".8"/>` +
  `<path d="M-4.6 3.9 C -4.2 6.2 -3 8.2 -1.2 9.3 M4.6 3.9 C 4.2 6.2 3 8.2 1.2 9.3" stroke="${C.petalD}" stroke-width=".55" fill="none" opacity=".6"/>`;
const CUPBACK =
  `<path d="M-7 2 C -5 -0.4 -2.6 -1.6 0 -1.6 C 2.6 -1.6 5 -0.4 7 2 C 4.6 3.8 2.4 4.6 0 4.6 C -2.4 4.6 -4.6 3.8 -7 2 Z" fill="${C.petalD}"/>`;

return {
  id: 'bumblebee', view: [-30, -25, 62, 44], groundY: GY,
  thumb: { m: 'hover', t: 0.05 },
  motions: [
    { id: 'hover', label: 'Heavy hover', short: 'Hover', dur: 0.55, env: { t: 'air' }, speed: '0 km/h', beat: 'Wings 130/s · pendulum',
      desc: 'A fur coat hanging from wings that look two sizes too small — the body swings beneath the blur like a basket under a balloon.',
      anim: 'Give her twice the honeybee’s sway and bob: the mass is the character. The wings blur; the body lags every correction by several frames.' },
    { id: 'nectar', label: 'Clover clamber', short: 'Clamber', dur: 4.2, env: { t: 'ground' }, speed: '0 km/h', beat: 'Grip · shove · buzz',
      desc: 'Working a clover head like a climbing frame: wings parked, all six feet gripping, the whole flower nodding under her weight.',
      anim: 'Walk her over the dome in shoves with pauses between, and once per visit give a short buzz-shiver — the trick that shakes pollen loose.' },
    { id: 'flowerbed', label: 'Sleep in a flower', short: 'Sleep', dur: 6.5, env: { t: 'ground' }, night: true, speed: '0 km/h', beat: 'Deep rest · slow breath',
      desc: 'Caught out by dusk far from the nest, a bumblebee simply checks into the nearest bloom — furled in the cup with only her back showing.',
      anim: 'Sink her low in the cup, antennae drooped along the face. One slow breath-swell and a single antenna stir are all the life required.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'flowerbed') {
      const br = 1 + 0.025 * Math.sin(TAU * t);
      const stir = pulse(t, .55, .63);
      return NIGHTCUP + CUPBACK +
        g(trl(0, 1.2) + ' ' + scl(1, br, 0, 6),
          draw({ pitch: -16, dy: 0, wA: -3, wB: -3, legS: -8, antA: -26 + 10 * stir })) +
        CUPFRONT +
        zzz(t, { x: 6, y: -6, rise: 10, drift: 4, s: .62 });
    }
    if (mid === 'nectar') {
      const K = keys(t, [
        [0.00, { a: -44 }], [0.16, { a: -44 }], [0.30, { a: -12 }], [0.46, { a: -12 }],
        [0.60, { a: 22 }], [0.78, { a: 22 }], [0.92, { a: -38 }], [1.00, { a: -44 }]
      ]);
      const sh = pulse(t, .48, .55) + pulse(t, .80, .86);
      const rad = K.a * Math.PI / 180, R = 7.6;
      const px = R * Math.sin(rad) + 0.3 * Math.sin(TAU * t * 34) * sh;
      const py = 2.2 - R * Math.cos(rad);
      const bob = 1.5 * Math.sin(Math.PI * Math.min(1, Math.abs(K.a + 12) / 30));
      return shadow(0, GY, 8, 12) +
        g(trl(0, bob * 0.4), CLOVER) +
        g(trl(px, py + bob * 0.4) + ' ' + rot(K.a, 0, 3.5),
          bumble({ wA: -4 + 3 * sh * Math.sin(TAU * t * 30), wB: -4, legS: 4 * osc(t, 6, .1), antA: 5 * osc(t, 2, .3) }));
    }
    // hover
    return draw({
      wA: 18 * osc(t, 7), wB: 18 * osc(t, 7, .5),
      dy: 1.9 * osc(t, 1, .1), dx: 0.9 * osc(t, 2, .38),
      pitch: 7 * osc(t, 1, .32),
      legS: 6 * osc(t, 1, .2),
      antA: 4 * osc(t, 2, .2),
      ticks: airTicks(t, { x1: -27, x2: 29, y: -14, h: 13, v: 8, n: 4, s: .9 })
    });
  }
};

})();
__REG["firefly"] = (function(){
// Firefly — fable style (side view, faces right)
const C = { body: '#4E3E32', dark: '#372A22', shield: '#C9B88F', shieldD: '#A98B62', glow: '#F2D06B', hot: '#FBE7A6', dim: '#C4A24E', gauze: '#B9C4CC', eye: '#211F30' };
const GY = 10;
const LEG = 'stroke="#372A22" stroke-width=".8" fill="none" stroke-linecap="round" stroke-linejoin="round"';

// lantern halo, local coords around the abdomen tip (-7.4, 0.9)
const lantern = k => k <= 0.03 ? '' :
  `<g opacity="${N(Math.min(1, k))}">` +
  `<circle cx="-7.4" cy="0.9" r="8" fill="${C.glow}" opacity=".09"/>` +
  `<circle cx="-7.4" cy="0.9" r="4.8" fill="${C.glow}" opacity=".2"/>` +
  `<circle cx="-7.4" cy="0.9" r="2.5" fill="${C.glow}" opacity=".55"/>` +
  `<circle cx="-7.4" cy="0.9" r="1.35" fill="${C.hot}"/></g>`;

// P: fly (elytra raised + gauze), wA, legS, antA, glowK, t
const bug = P => {
  const legs = g(rot(P.legS || 0, 0, 2),
    `<path d="M3.6 1.6 L4.8 4.2 L6.6 6.4" ${LEG}/><path d="M0.6 2 L0 4.6 L-1.6 6.8" ${LEG}/><path d="M-2.6 1.8 L-4.4 4.2 L-6.6 6" ${LEG}/>`);
  const gauze = P.fly
    ? g(rot(14 * osc(P.t || 0, 9), 1, -1.5),
        `<ellipse cx="-3.4" cy="-3.6" rx="6.8" ry="2.4" fill="${C.gauze}" opacity=".55" transform="rotate(-18 -3.4 -3.6)"/>`) +
      g(rot(-12 * osc(P.t || 0, 9, .5), 1, -1.5),
        `<ellipse cx="-3" cy="-4.4" rx="6" ry="2" fill="${C.gauze}" opacity=".35" transform="rotate(-26 -3 -4.4)"/>`)
    : '';
  const elyA = P.fly ? -30 : 0;
  const elytra = g(rot(elyA, 2.6, -1.8),
    `<path d="M-8.8 0.4 C -9.4 -1.8 -7.6 -3.4 -3.8 -3.7 L 2.6 -3.5 C 4.2 -3 4.4 -1 3 0.2 C -0.8 2.2 -5.8 2.2 -8.8 0.4 Z" fill="${C.body}"/>` +
    `<path d="M-8.2 -1.4 L 2.4 -2.2" stroke="${C.dark}" stroke-width=".5" opacity=".8"/>` +
    `<path d="M-7.4 -2.6 C -4.6 -3.3 -1.4 -3.5 1.4 -3.2" stroke="#5E4C3E" stroke-width=".6" fill="none" opacity=".7"/>`);
  const elytraFar = P.fly
    ? g(rot(-18, 2.6, -2),
        `<path d="M-8 -0.4 C -8.4 -2.2 -6.8 -3.6 -3.4 -3.8 L 2 -3.6 C 3.4 -3.1 3.6 -1.4 2.4 -0.4 C -1 1.4 -5.4 1.4 -8 -0.4 Z" fill="${C.dark}" opacity=".8"/>`)
    : '';
  return lantern(P.glowK || 0) + legs + elytraFar + gauze +
    `<ellipse cx="-3.4" cy="0.7" rx="5.2" ry="2.5" fill="${C.dark}"/>` +
    `<path d="M-8.4 -0.2 C -8.8 0.6 -8.7 1.5 -8.2 2.2 C -7.2 2.6 -6.2 2.6 -5.4 2.3 C -6 1.4 -6 0.2 -5.6 -0.8 C -6.6 -1.1 -7.6 -0.9 -8.4 -0.2 Z" fill="${(P.glowK || 0) > 0.25 ? C.hot : C.dim}"/>` +
    elytra +
    `<ellipse cx="5.2" cy="-1.1" rx="2.9" ry="2.3" fill="${C.shield}" stroke="${C.shieldD}" stroke-width=".55"/>` +
    `<ellipse cx="5.9" cy="-1.6" rx=".85" ry=".65" fill="#EFE6CF" opacity=".9"/>` +
    `<path d="M6.7 0.6 C 7.3 0.9 7.8 0.9 8.3 0.6" stroke="${C.dark}" stroke-width=".7" fill="none" stroke-linecap="round"/>` +
    g(rot(P.antA || 0, 7.6, -0.4),
      `<path d="M7.6 -0.6 L 9.4 -2.2 L 11.4 -2.8 M7.8 0.1 L 9.8 -0.9 L 11.9 -1.1" stroke="${C.dark}" stroke-width=".7" fill="none" stroke-linecap="round"/>`);
};

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.grounded) s += shadow(dx, GY, 8, Math.max(0, -dy), 10);
  const flip = P.flip ? ' scale(-1 1)' : '';
  return s + g(trl(dx, dy) + flip + ' ' + rot(P.pitch || 0, 0, 0), bug(P));
}

return {
  id: 'firefly', view: [-30, -25, 62, 42], groundY: GY,
  thumb: { m: 'lantern', t: 0.16 },
  motions: [
    { id: 'lantern', label: 'Lantern flight', short: 'Lantern', dur: 3.4, env: { t: 'air' }, night: true, speed: '~3 km/h', beat: 'Drift · flash ≈ 1/s',
      desc: 'A slow wandering lamp over the June meadow: the beetle drifts and dips while the cold light beneath the tail writes its slow bright code.',
      anim: 'Fly him lazily — the glow does the acting. Swell each flash over several frames and let it die slower than it lit; never blink it on and off.' },
    { id: 'beacon', label: 'Beacon', short: 'Beacon', dur: 3.6, env: { t: 'reed', x: 5, y: -9 }, night: true, speed: '0 km/h', beat: 'Perched · slow pulse',
      desc: 'Clamped head-up to a grass-head with the lantern hung out below, pulsing patiently — a lighthouse the size of a grain of oats, signalling across the dark grass.',
      anim: 'The pose is a held curl; breathe the light instead of the body. Ease the glow up, hold the peak a beat, ease it down to almost-dark.' },
    { id: 'crawl', label: 'Day crawl', short: 'Crawl', dur: 0.9, env: { t: 'ground' }, speed: '~0.05 km/h', beat: 'Six legs · lamp off',
      desc: 'By daylight the miracle is switched off and he is a plain, soft-shelled brown beetle picking his way along a stem, saving it all for the dark.',
      anim: 'An unhurried six-legged trundle, antennae sweeping. Keep the lantern segment visibly pale — the promise of the night shift.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'beacon') {
      const k = 0.12 + 0.88 * Math.pow(0.5 + 0.5 * Math.sin(TAU * t * 2 - Math.PI / 2), 2.6);
      return g(trl(6.2, -10.2) + ' ' + rot(-38, 0, 0) + ' ' + scl(1, 1 + 0.02 * osc(t, 1), 0, 2),
        bug({ glowK: k, antA: -8 + 3 * osc(t, 1, .3), legS: -4 }));
    }
    if (mid === 'crawl') {
      return draw({
        grounded: true, glowK: 0,
        dy: -0.25 * Math.abs(osc(t, 3)),
        legS: 9 * osc(t, 3), antA: 7 * osc(t, 1.5, .2),
        pitch: 1.2 * osc(t, 1.5, .3),
        ticks: groundTicks(t, { y: GY, x1: -27, x2: 29, v: 6, n: 6, s: .75 })
      });
    }
    // lantern flight
    const vx = Math.cos(TAU * t);
    const k = 0.1 + 0.9 * Math.pow(0.5 + 0.5 * Math.sin(TAU * t * 3 - Math.PI / 2), 2.4);
    return draw({
      fly: true, t, glowK: k,
      dx: 9 * osc(t, 1, 0), dy: -4 - 3.2 * osc(t, 2, .12),
      flip: vx < 0,
      pitch: 8 - 6 * osc(t, 2, .38),
      legS: -6, antA: -4 + 4 * osc(t, 2, .2),
      ticks: airTicks(t, { x1: -27, x2: 29, y: -16, h: 12, v: 9, n: 4, s: .85 })
    });
  }
};

})();
__REG["grasshopper"] = (function(){
// Field Grasshopper — fable style (side view, faces right)
const C = { grn: '#8FA84A', dark: '#6E8438', deep: '#5C7030', wing: '#C9BE8A', wingD: '#B0A472', belly: '#DDE0AC', eye: '#2A2326' };
const GY = 11;

// hind leg: femur pivots at hip (-2.8,0.6); tibia nested at knee (-11,-2.9).
// fem negative = extend (kick down-back), positive = fold tighter.
const hind = (fA, tA, far) => g((far ? trl(1.6, -0.8) + ' ' : '') + rot(fA, -2.8, 0.6),
  g(rot(tA, -11, -2.9),
    `<path d="M-11 -2.9 L -13.6 9.6 L -12.8 9.9 L -10.1 -2.5 Z" fill="${far ? C.deep : C.dark}"/>` +
    `<path d="M-13.4 9.7 L -11.2 10.5" stroke="${far ? C.deep : C.dark}" stroke-width=".9" stroke-linecap="round"/>`) +
  `<path d="M-2.6 -0.4 C -5.4 -3.4 -8.8 -4.8 -11.2 -4.3 C -12.5 -4 -12.7 -2.6 -11.6 -1.6 C -9 0.7 -5.4 1.9 -2.6 2.2 Z" fill="${far ? C.deep : C.grn}"/>` +
  (far ? '' : `<path d="M-4.6 -1.6 C -7 -2.9 -9.4 -3.5 -11 -3.3" stroke="${C.dark}" stroke-width=".6" fill="none" stroke-linecap="round" opacity=".7"/>`));

// P: dx dy pitch sx sy fem tib femB tibB legF wingA ant arcs
function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  s += shadow(dx - 2, GY, 12, Math.max(0, -dy), 18);
  const inner =
    hind(P.femB ?? P.fem ?? 0, P.tibB ?? P.tib ?? 0, true) +
    g(rot(P.legF || 0, 4, 1),
      `<path d="M5.8 0.8 L 4.6 4.8 L 2.9 10.3 M4.9 4.9 L 3.2 5.5" stroke="${C.dark}" stroke-width=".85" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="M2 1.4 L 0.4 5.1 L -1.5 10.3 M0.7 5.3 L -0.9 5.7" stroke="${C.dark}" stroke-width=".85" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`) +
    `<path d="M-13.4 0.6 C -13 -2.2 -9 -3.9 -4 -4.1 L 5 -3.9 L 5.2 1.6 C -1 3.6 -8.6 3.4 -13.4 0.6 Z" fill="${C.grn}"/>` +
    `<path d="M-11.8 0.9 C -11.6 -0.7 -11.2 -2 -10.6 -3 M-9 1.5 C -8.8 -0.3 -8.4 -1.9 -7.8 -3.2 M-6.2 1.9 C -6 0 -5.6 -1.7 -5 -3.4" stroke="${C.dark}" stroke-width=".55" fill="none" opacity=".55"/>` +
    `<path d="M-8 2.9 C -4 3.7 1 3.6 5 2.4 L 5 1.2 C 1 2.4 -4 2.5 -8 1.7 Z" fill="${C.belly}" opacity=".85"/>` +
    g(rot(P.wingA || 0, 3.4, -3.8),
      `<path d="M-14.6 -0.4 L 2.8 -4.9 C 4.8 -5.3 5.2 -4.1 3.6 -3.4 L -13 1.7 Z" fill="${C.wing}" opacity=".92"/>` +
      `<path d="M-11.8 0 L 1.6 -4.1" stroke="${C.wingD}" stroke-width=".5" opacity=".8"/>`) +
    `<path d="M2.8 -5 C 5.6 -6.3 8.4 -6 9.4 -4.1 C 10 -2.7 9.4 -1.1 7.8 -0.5 L 3.2 0.3 Z" fill="${C.dark}"/>` +
    `<circle cx="10.4" cy="-2.6" r="3" fill="${C.grn}"/>` +
    `<circle cx="11.3" cy="-3.4" r="1.05" fill="${C.eye}"/><circle cx="11.7" cy="-3.8" r=".35" fill="#FBF7F2"/>` +
    `<path d="M9.4 -0.4 C 10.4 0.2 11.6 0.2 12.6 -0.3" stroke="${C.dark}" stroke-width=".6" fill="none" stroke-linecap="round"/>` +
    g(rot(P.ant || 0, 10.8, -4.8),
      `<path d="M10.6 -5 C 11.6 -7.2 13.2 -8.8 15 -9.6 M11.4 -4.6 C 12.8 -6.2 14.6 -7.2 16.2 -7.4" stroke="${C.dark}" stroke-width=".7" fill="none" stroke-linecap="round"/>`) +
    hind(P.fem || 0, P.tib || 0, false) +
    (P.arcs || '');
  return s + g(trl(dx, dy) + ' ' + scl(P.sx ?? 1, P.sy ?? 1, 0, GY) + ' ' + rot(P.pitch || 0, -2, 2), inner);
}

const JUMP = [
  [0.00, { dx: -8, dy: 0, pitch: 0, fem: 0, tib: 0, femB: 0, tibB: 0, ant: 0, sy: 1, legF: 0 }],
  [0.10, { dx: -8, dy: 0.7, pitch: 4, fem: 8, tib: -12, femB: 8, tibB: -12, ant: -14, sy: 0.94, legF: -6 }],
  [0.28, { dx: -8, dy: 1.1, pitch: 6, fem: 12, tib: -16, femB: 12, tibB: -16, ant: -20, sy: 0.9, legF: -8 }],
  [0.34, { dx: -4.5, dy: -8, pitch: -24, fem: -52, tib: 48, femB: -46, tibB: 42, ant: -26, sy: 1.03, legF: 10 }],
  [0.42, { dx: 2, dy: -14.5, pitch: -8, fem: -42, tib: 38, femB: -38, tibB: 34, ant: -20, sy: 1, legF: 14 }],
  [0.52, { dx: 8, dy: -4, pitch: 13, fem: -10, tib: 8, femB: -8, tibB: 6, ant: -8, sy: 1, legF: -10 }],
  [0.58, { dx: 9.5, dy: 0.8, pitch: 4, fem: 9, tib: -12, femB: 9, tibB: -12, ant: 4, sy: 0.93, legF: -4 }],
  [0.66, { dx: 9.5, dy: 0, pitch: 0, fem: 0, tib: 0, femB: 0, tibB: 0, ant: 0, sy: 1, legF: 0 }],
  [1.00, { dx: -8, dy: 0, pitch: 0, fem: 0, tib: 0, femB: 0, tibB: 0, ant: 0, sy: 1, legF: 0 }]
];

return {
  id: 'grasshopper', view: [-32, -27, 66, 44], groundY: GY,
  thumb: { m: 'chirp', t: 0.02 },
  motions: [
    { id: 'chirp', label: 'Stridulate', short: 'Chirp', dur: 3.4, env: { t: 'ground' }, speed: '0 km/h', beat: 'Femur bow · 3 bursts',
      desc: 'The dry song of high summer, played rather than sung: a hind femur drawn across the wing-edge like a bow over a string, in short buzzing phrases.',
      anim: 'Keep the body a held pose and put the whole performance in one femur — fast shallow strokes in bursts of a second, with dead silence between.' },
    { id: 'jump', label: 'Leap', short: 'Jump', dur: 3, env: { t: 'ground' }, speed: '≈ 20× body length', beat: 'Load → release · 30 ms',
      desc: 'The signature escape: folded hind legs loaded like crossbows, then both released in under a frame — the body is airborne before the eye has caught the motion.',
      anim: 'Spend frames on the crouch, none on the launch. One frame of full leg extension, a floating arc with trailing legs, and a nose-heavy landing squash.' },
    { id: 'roost', label: 'Night cling', short: 'Roost', dur: 6, env: { t: 'reed', x: -3, y: -14 }, night: true, speed: '0 km/h', beat: 'Gripped · head-up',
      desc: 'When the sun goes the song stops. The grasshopper climbs a stem and clamps there head-up in the cool, antennae laid back, waiting for tomorrow’s heat.',
      anim: 'A held vertical pose — sell the stillness with one slow antenna sag and the faintest breathing of the abdomen. Nothing else may move.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'roost') {
      const br = 1 + 0.02 * Math.sin(TAU * t);
      return g(scl(1, br, -1, 4), draw({
        dx: -2.5, dy: -8, pitch: -64,
        fem: 6, tib: -8, femB: 6, tibB: -8, legF: -4,
        ant: -16 - 3 * (0.5 + 0.5 * Math.sin(TAU * t * 0.7))
      }));
    }
    if (mid === 'jump') {
      const K = keys(t, JUMP);
      K.wingA = -5 * pulse(t, .34, .52);
      K.ticks = '';
      return draw(K);
    }
    // chirp
    const b = pulse(t, .08, .30) + pulse(t, .42, .62) + pulse(t, .76, .90);
    const saw = 7 * Math.sin(TAU * t * 16) * b;
    const arcs = b > 0.05
      ? `<g stroke="#A8802B" fill="none" stroke-linecap="round" opacity="${N(0.7 * Math.min(1, b))}">` +
        `<path d="M-2 -7.6 q 2.4 -2.4 5.6 -3"/><path d="M-3.4 -9.8 q 3.4 -3.4 8 -4.2" opacity=".65"/></g>`
      : '';
    return draw({
      fem: saw, tib: -saw * 0.6, femB: 0, tibB: 0,
      dy: -0.2 * Math.max(0, osc(t, 2, .05)),
      ant: 4 * osc(t, 1, .3),
      arcs
    });
  }
};

})();
__REG["grasssnake"] = (function(){
// Grass Snake — fable style (side view, head to the right)
const C = { oliv: '#7E8A56', mid: '#74804E', deep: '#4E5A34', spine: '#98A468', collar: '#E8C23C', black: '#2E2A1C', eye: '#211F30', tongue: '#C96A7E' };
const GY = 12;

// half-width along the body (u: 0 tail → 1 neck)
const W = u => (0.15 + 1.9 * Math.pow(Math.sin(Math.PI * (0.12 + 0.76 * u)), 0.75)) * Math.min(1, u * 6 + 0.1);

function wavePts(t, o) {
  const P = [];
  for (let i = 0; i <= o.n; i++) {
    const u = i / o.n;
    const x = o.x0 + (o.x1 - o.x0) * u;
    const y = o.base(u) + o.amp(u) * Math.sin(TAU * (o.k * u + t));
    P.push([x, y]);
  }
  return P;
}

function ribbon(P) {
  const n = P.length - 1;
  let top = '', bot = '';
  for (let i = 0; i <= n; i++) {
    const hw = W(i / n);
    top += (i ? ' L' : 'M') + N(P[i][0]) + ' ' + N(P[i][1] - hw);
    bot = 'L' + N(P[i][0]) + ' ' + N(P[i][1] + hw) + ' ' + bot;
  }
  let d = `<path d="${top} ${bot}Z" fill="${C.oliv}"/>`;
  let sp = 'M' + N(P[2][0]) + ' ' + N(P[2][1]);
  for (let i = 3; i <= n; i++) sp += ' L' + N(P[i][0]) + ' ' + N(P[i][1]);
  d += `<path d="${sp}" stroke="${C.spine}" stroke-width=".9" fill="none" opacity=".55"/>`;
  for (let i = 4; i < n - 1; i += 3) {
    const hw = W(i / n);
    d += `<circle cx="${N(P[i][0])}" cy="${N(P[i][1] - hw * 0.4)}" r=".32" fill="${C.deep}" opacity=".8"/>`;
  }
  return d;
}

// head at the leading point. sleep → closed eye; tg 0..1 tongue flick
function head(P, extraA, tg, sleep) {
  const n = P.length - 1;
  const ang = Math.atan2(P[n][1] - P[n - 1][1], P[n][0] - P[n - 1][0]) * 180 / Math.PI;
  const eye = sleep
    ? `<path d="M1.5 -0.9 C 2.1 -0.5 2.9 -0.5 3.4 -0.9" stroke="${C.eye}" stroke-width=".55" fill="none" stroke-linecap="round"/>`
    : `<circle cx="2.3" cy="-0.6" r=".82" fill="#F5EFDC"/><circle cx="2.45" cy="-0.55" r=".5" fill="${C.eye}"/>`;
  const tongue = tg > 0.04
    ? `<path d="M4.7 0.1 L ${N(4.7 + 3.4 * tg)} ${N(-0.5 * tg)} M${N(4.7 + 3.4 * tg)} ${N(-0.5 * tg)} L ${N(4.7 + 4.5 * tg)} ${N(-1.3 * tg)} M${N(4.7 + 3.4 * tg)} ${N(-0.5 * tg)} L ${N(4.7 + 4.4 * tg)} ${N(0.4 * tg)}" stroke="${C.tongue}" stroke-width=".5" fill="none" stroke-linecap="round"/>`
    : '';
  return g(trl(P[n][0], P[n][1]) + ' ' + rot(ang + (extraA || 0), 0, 0),
    `<path d="M-3.4 -1.7 C -2.8 -0.9 -2.8 0.9 -3.4 1.7 L -2 1.95 C -1.5 1 -1.5 -1 -2 -1.95 Z" fill="${C.black}" opacity=".85"/>` +
    `<path d="M-2 -2 C -1.3 -1 -1.3 1 -2 2 L -0.5 2.1 C 0.1 1.1 0.1 -1.1 -0.5 -2.1 Z" fill="${C.collar}"/>` +
    `<path d="M-0.6 -2.1 C 1.4 -2.5 3.4 -1.9 4.5 -0.7 C 5 -0.2 5 0.4 4.5 0.9 C 3.4 2.1 1.4 2.7 -0.6 2.3 Z" fill="${C.oliv}"/>` +
    `<path d="M0.4 -2.2 C 2 -2.2 3.4 -1.7 4.3 -0.9" stroke="${C.deep}" stroke-width=".5" fill="none" opacity=".6"/>` +
    eye + tongue);
}

return {
  id: 'grasssnake', view: [-42, -30, 86, 46], groundY: GY,
  thumb: { m: 'slither', t: 0.15 },
  motions: [
    { id: 'slither', label: 'Slither', short: 'Slither', dur: 1.5, env: { t: 'ground' }, speed: '~5 km/h', beat: 'Standing wave · no legs',
      desc: 'Serpentine travel in its pure form: the body throws itself into waves and presses each curve against the grass, pouring forward while nothing appears to push.',
      anim: 'One wave, born at the neck, must travel unbroken to the tail-tip — never let the curves slide out of sequence. The head glides level like a held camera.' },
    { id: 'swim', label: 'Swim', short: 'Swim', dur: 1.3, env: { t: 'water', y: 6 }, speed: '~4 km/h', beat: 'S-wave · head periscoped',
      desc: 'The same wave laid on water: head and yellow collar periscope-high, the body writing long silver esses behind — a snake quite at home crossing the pond.',
      anim: 'Slow the wave and widen it; water resists more than grass. Keep the head absolutely steady above the surface while everything behind it works.' },
    { id: 'coil', label: 'Night coil', short: 'Coil', dur: 6.5, env: { t: 'ground' }, night: true, speed: '0 km/h', beat: 'Coiled · slow breath',
      desc: 'The day’s heat spent, the snake ladles itself into a neat stack of coils under the grass, chin resting on the topmost loop, and cools into stillness.',
      anim: 'The pose is the drawing; the animation is one slow breath through the whole stack and a single tongue-taste of the night air, nothing more.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'coil') {
      const br = 1 + 0.018 * osc(t, 1, 0);
      const tg = pulse(t, .48, .58);
      return `<ellipse cx="0" cy="${GY + 0.6}" rx="13.5" ry="1.4" fill="rgba(80,58,30,.13)"/>` +
        g(scl(1, br, 0, GY),
          `<rect x="-12.5" y="8" width="25" height="4.2" rx="2.1" fill="${C.oliv}"/>` +
          `<path d="M-10 8.8 L 10 8.8" stroke="${C.spine}" stroke-width=".7" opacity=".55"/>` +
          `<rect x="-11" y="4.9" width="21.5" height="4" rx="2" fill="${C.mid}"/>` +
          `<path d="M-8.6 5.7 L 9 5.7" stroke="${C.spine}" stroke-width=".7" opacity=".45"/>` +
          `<rect x="-8.6" y="2" width="16.6" height="3.7" rx="1.85" fill="${C.oliv}"/>` +
          `<path d="M-6.6 2.8 L 6.4 2.8" stroke="${C.spine}" stroke-width=".65" opacity=".55"/>` +
          `<path d="M-11.4 3.4 C -13.2 4.4 -13.6 6.2 -12.4 7.6" stroke="${C.oliv}" stroke-width="2.6" fill="none" stroke-linecap="round"/>` +
          `<path d="M6.8 3.4 C 9.6 3.2 11.4 4.4 11.7 6.6" stroke="${C.oliv}" stroke-width="2.9" fill="none" stroke-linecap="round"/>` +
          head([[10.2, 6.2], [12.4, 7.3]], 8, tg * 0.8, true));
    }
    if (mid === 'swim') {
      const wy = 6;
      const P = wavePts(t, {
        n: 26, x0: -33, x1: 13, k: 1.35,
        amp: u => 2.1 * (0.35 + 0.65 * Math.sin(Math.PI * Math.min(1, 0.1 + 0.85 * u))),
        base: u => wy + 1.6 - wins(u, 0.76, 1) * 5.8
      });
      const tg = pulse(wrap(t * 2), .55, .72);
      const hx = P[26][0];
      return rippleTicks(t, { y: wy, x1: -39, x2: 41, v: 24, n: 5, s: 1 }) +
        ribbon(P) + head(P, -12, tg, false) +
        `<path d="M${N(hx - 4)} ${wy + 0.3} C ${N(hx - 11)} ${wy + 1.2} ${N(hx - 18)} ${wy + 2} ${N(hx - 25)} ${wy + 2.2}" stroke="#85988B" stroke-width=".6" fill="none" opacity=".5"/>` +
        `<rect x="-42" y="${wy}" width="86" height="10" fill="rgba(126,147,133,.2)"/>`;
    }
    // slither
    const P = wavePts(t, {
      n: 26, x0: -31, x1: 15, k: 1.6,
      amp: u => 2.3 * (0.3 + 0.7 * Math.sin(Math.PI * Math.min(1, 0.12 + 0.8 * u))),
      base: u => GY - W(u) - 2.3 * (0.3 + 0.7 * Math.sin(Math.PI * Math.min(1, 0.12 + 0.8 * u))) - wins(u, 0.82, 1) * 1.6
    });
    const tg = pulse(wrap(t * 2), .6, .78);
    return groundTicks(t, { y: GY, x1: -39, x2: 41, v: 30, n: 7, s: 1 }) +
      `<ellipse cx="-7" cy="${GY + 0.6}" rx="21" ry="1.5" fill="rgba(80,58,30,.12)"/>` +
      ribbon(P) + head(P, -6, tg, false);
  }
};

})();
__REG["hare"] = (function(){
// Brown Hare — fable style
const C = { fur: '#C89A5B', deep: '#B3854A', shade: '#A87C42', cream: '#F2E8D4', earIn: '#E3C9A8', tip: '#3A2E24', dark: '#4A3A2C', eye: '#2A2326' };
const GY = 15;

const LEGS = {
  fh: [-7.5, 5, 'M-9 2.5 L-6 2.5 L-6.6 13.4 L-8.6 13.4 Z', -7.6, 13.6, C.shade],
  ff: [6.5, 5, 'M5.3 2.5 L7.9 2.5 L7.5 13.4 L5.7 13.4 Z', 6.6, 13.6, C.shade],
  nh: [-5, 5, 'M-6.5 2.5 L-3.5 2.5 L-4.1 13.8 L-6.1 13.8 Z', -5.1, 14, C.fur],
  nf: [8.5, 5, 'M7.3 2.5 L9.9 2.5 L9.5 13.8 L7.7 13.8 Z', 8.7, 14, C.fur]
};
const leg = (k, a) => {
  const [px, py, d, fx, fy, col] = LEGS[k];
  return g(rot(a, px, py), `<path d="${d}" fill="${col}"/><ellipse cx="${fx}" cy="${fy}" rx="1.8" ry="1.1" fill="${C.dark}"/>`);
};

// ears rotate at their bases; negative = laid back (toward the tail)
const ears = (eR, eL) =>
  g(rot(eL, 13.4, -9),
    `<path d="M12.6 -9 C 11.4 -15.5 12 -22.5 14 -26 C 16 -22.8 16.4 -15.8 15.4 -9 Z" fill="${C.deep}"/>` +
    `<path d="M12.4 -22.4 C 12.9 -24.2 13.4 -25.4 14 -26 C 14.7 -25 15.1 -23.5 15.3 -21.8 C 14.4 -22.7 13.4 -22.9 12.4 -22.4 Z" fill="${C.tip}"/>`) +
  g(rot(eR, 11, -9.5),
    `<path d="M10 -9.5 C 8.6 -16.5 9.1 -23.5 11.2 -27 C 13.3 -23.8 13.8 -16.5 12.7 -9.5 Z" fill="${C.fur}"/>` +
    `<path d="M10.6 -10.5 C 9.7 -16 10 -21.5 11.3 -24.6 C 12.4 -21.8 12.7 -16 11.9 -10.5 Z" fill="${C.earIn}" opacity=".85"/>` +
    `<path d="M9.9 -23 C 10.3 -25 10.7 -26.3 11.2 -27 C 12 -26 12.5 -24.4 12.8 -22.6 C 11.8 -23.5 10.8 -23.6 9.9 -23 Z" fill="${C.tip}"/>`);

// P: headA earR earL blink nx
function head(P) {
  const eyes = (P.blink || 0) > 0.5
    ? `<path d="M11 -5.6 L13.8 -5.6" stroke="${C.eye}" stroke-width=".8" fill="none" stroke-linecap="round"/>`
    : `<circle cx="12.4" cy="-5.6" r="1.75" fill="${C.eye}"/><circle cx="13" cy="-6.2" r=".55" fill="#FBF7F2"/>`;
  const nx = P.nx || 0;
  return g(rot(P.headA || 0, 8, -3),
    ears(P.earR || 0, P.earL || 0) +
    `<path d="M6.5 -3.2 C 6.5 -8.2 9 -10.8 12.5 -10.8 C 16.2 -10.8 18.6 -8.2 18.6 -4.6 C 18.6 -1.4 16 0.6 12.4 0.6 C 9.2 0.6 6.5 -0.6 6.5 -3.2 Z" fill="${C.fur}"/>` +
    `<ellipse cx="14.6" cy="-2" rx="3.2" ry="2.3" fill="${C.cream}" opacity=".7"/>` +
    eyes +
    `<path d="M${N(17.2 + nx)} -5.6 L ${N(18.8 + nx)} -5 L ${N(17.4 + nx)} -4.3 Z" fill="${C.dark}"/>` +
    `<path d="M17.8 -4.2 C 17.6 -3.4 16.9 -3 16.1 -3.2" stroke="${C.dark}" stroke-width=".6" fill="none" stroke-linecap="round"/>` +
    `<path d="M16.4 -3.8 C 18.4 -3.6 20 -3.1 21.2 -2.4 M16.2 -2.8 C 18 -2.3 19.4 -1.7 20.4 -0.9" stroke="${C.dark}" stroke-width=".5" fill="none" stroke-linecap="round" opacity=".6"/>`);
}

// P: dx dy pitch sx sy legs headA earR earL blink nx ticks
function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  s += shadow(dx - 1, GY, 17, Math.max(0, -dy));
  const L = P.legs || { ff: 0, fh: 0, nf: 0, nh: 0 };
  const inner =
    `<circle cx="-11.2" cy="1.6" r="2.1" fill="${C.cream}"/>` +
    `<path d="M-12.8 0.2 C -11.6 -0.8 -10 -0.8 -9.4 0.2 C -10.4 -0.2 -11.8 -0.2 -12.8 0.2 Z" fill="${C.tip}"/>` +
    leg('fh', L.fh) + leg('ff', L.ff) + leg('nh', L.nh) + leg('nf', L.nf) +
    `<path d="M-11 4.5 C -12 -3.5 -6 -8 0 -8 C 7 -8 11.5 -4 11.5 1 C 11.5 6 7.5 9.5 1 9.5 C -5 9.5 -10.5 8.5 -11 4.5 Z" fill="${C.fur}"/>` +
    `<circle cx="-5" cy="2" r="6" fill="${C.deep}" opacity=".45"/>` +
    `<ellipse cx="1" cy="7.6" rx="7" ry="2.5" fill="${C.cream}"/>` +
    head(P);
  return s + g(trl(dx, dy) + ' ' + scl(P.sx ?? 1, P.sy ?? 1, 0, GY) + ' ' + rot(P.pitch || 0, 0, 3), inner);
}

const gaitLegs = (t, offs, amp) => ({
  ff: amp * osc(t - offs.ff), fh: amp * osc(t - offs.fh),
  nf: amp * osc(t - offs.nf), nh: amp * osc(t - offs.nh)
});

return {
  id: 'hare', view: [-46, -42, 94, 64], groundY: GY,
  thumb: { m: 'alert', t: 0.05 },
  motions: [
    { id: 'alert', label: 'Sit tall & listen', short: 'Alert', dur: 4.4, env: { t: 'ground' }, speed: '0 km/h', beat: 'Still · ears on watch',
      desc: 'Upright on the haunches, forepaws hung loose, the great black-tipped ears swivelling one at a time — the whole meadow audited before the next mouthful.',
      anim: 'The body is a monument; the ears are the animation. Swivel them independently, never together, and keep the nose stitching away at its own fast beat.' },
    { id: 'lope', label: 'Lope', short: 'Lope', dur: 0.68, env: { t: 'ground' }, speed: '~15 km/h', beat: 'Easy bound · hind past fore',
      desc: 'The unhurried travelling bound: back arching and opening, hind feet swinging round and past the forepaws, ears loose and riding the rhythm.',
      anim: 'Let the spine do the work — coil on the gather, open in the air. The ears trail a beat behind the body like two soft pennants.' },
    { id: 'sprint', label: 'Flat sprint', short: 'Sprint', dur: 0.42, env: { t: 'ground' }, speed: 'to 70 km/h', beat: '4-beat rotary · ears pinned',
      desc: 'The fastest land animal of the meadow at full stretch: ears pinned flat, body opening and closing like a drawn bow, a beat of pure flight in every stride.',
      anim: 'Exaggerate stretch and fold past the anatomy — this gait is the hare’s whole argument. Pin the ears and let them flutter only at the tips.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'alert') {
      const br = 1 + 0.014 * osc(t, 1.5, .1);
      const ntw = pulse(t, .05, .38) + pulse(t, .6, .9);
      const inner =
        `<ellipse cx="-2" cy="13.9" rx="6.8" ry="1.3" fill="${C.deep}"/>` +
        `<ellipse cx="-3.5" cy="6.5" rx="8.4" ry="7" fill="${C.fur}"/>` +
        `<circle cx="-4.5" cy="6.5" r="5" fill="${C.deep}" opacity=".35"/>` +
        `<path d="M-7 8 C -8 0 -5 -7.5 0 -10.5 C 3.2 -12.3 6.2 -10.6 6.6 -7 C 7.1 -2 5.6 4 3.4 9 L -6 10 Z" fill="${C.fur}"/>` +
        `<path d="M3.8 -9.2 C 5.2 -5.4 5.5 -0.2 4.3 5 C 3.4 8.2 2 10.2 0.6 10.6 C 2.4 5.8 3 -1.4 2 -7.8 Z" fill="${C.cream}" opacity=".85"/>` +
        `<path d="M3 -0.5 C 4.4 0.7 4.8 2.6 4.2 4.2 L 3 4 C 2.7 2.4 2.7 0.8 3 -0.5 Z" fill="${C.deep}"/>` +
        `<path d="M4.6 -0.9 C 6 0.3 6.4 2.2 5.8 3.8 L 4.6 3.6 C 4.3 2 4.3 0.4 4.6 -0.9 Z" fill="${C.fur}"/>` +
        g(trl(-7.5, -8.5), head({
          headA: 4 * pulse(t, .48, .64) - 3 * pulse(t, .76, .9),
          earR: 16 * pulse(t, .16, .3) - 12 * pulse(t, .52, .68),
          earL: -14 * pulse(t, .34, .5) + 10 * pulse(t, .78, .92),
          blink: pulse(t, .42, .455),
          nx: 0.35 * Math.sin(TAU * t * 12) * ntw
        }));
      return shadow(-1, GY, 14, 0) + g(scl(1, br, 0, GY), inner);
    }
    if (mid === 'sprint') {
      return draw({
        dy: -3 * osc(t, 1, .08), pitch: 8 * osc(t, 1, .35),
        sx: 1 + .06 * osc(t, 1, .55), sy: 1 - .045 * osc(t, 1, .55),
        legs: gaitLegs(t, { nf: 0, ff: .1, nh: .52, fh: .62 }, 34),
        headA: -3 + 2 * osc(t, 1, .5),
        earR: -46 + 4 * osc(t, 1, .6), earL: -42 + 4 * osc(t, 1, .7),
        ticks: groundTicks(t, { y: GY, x1: -43, x2: 45, v: 105, n: 7, s: 1.15 })
      });
    }
    // lope
    return draw({
      dy: -2.2 * osc(t, 1, .1), pitch: 5.5 * osc(t, 1, .38),
      legs: gaitLegs(t, { nf: .05, ff: .16, nh: .58, fh: .64 }, 26),
      headA: 2.5 * osc(t, 1, .5),
      earR: -8 + 9 * osc(t, 1, .58), earL: -4 + 9 * osc(t, 1, .68),
      blink: pulse(t, .7, .74),
      ticks: groundTicks(t, { y: GY, x1: -43, x2: 45, v: 58, n: 7, s: 1.15 })
    });
  }
};

})();
__REG["mole"] = (function(){
// European Mole — fable style
const C = { fur: '#57505E', dark: '#454050', pink: '#E2A9A4', nose: '#D9908C', soil: '#8A6A44', soilD: '#6B4A2C', claw: '#EFE6CF', eye: '#211F30' };
const GY = 15;

const MOUND =
  `<path d="M-15 15 C -11 6.6 -5 4 0 4 C 5 4 11 6.6 15 15 Z" fill="${C.soil}"/>` +
  `<path d="M-9 11.6 C -6.6 9.6 -3.4 8.4 0 8.4 M2 6.4 C 4.6 6.8 7.2 8 9.2 10" stroke="${C.soilD}" stroke-width=".8" fill="none" stroke-linecap="round" opacity=".55"/>` +
  `<circle cx="-6.4" cy="12.6" r="1" fill="${C.soilD}" opacity=".7"/><circle cx="4.8" cy="11.4" r=".85" fill="${C.soilD}" opacity=".6"/><circle cx="10.6" cy="13.4" r="1.1" fill="${C.soilD}" opacity=".65"/>`;

// crumbs popping off the hill. bursts = [{t0,x,vx}]
function pops(t, bursts) {
  let s = '';
  bursts.forEach(b => {
    const p = win(t, b.t0, b.t0 + 0.26);
    if (p > 0.01 && p < 0.99) {
      const x = b.x + b.vx * p, y = 3.4 - 15 * p + 22 * p * p;
      s += `<circle cx="${N(x)}" cy="${N(y)}" r="${N(0.8 - 0.25 * p)}" fill="${C.soilD}" opacity="${N(0.9 * (1 - p))}"/>`;
    }
  });
  return s;
}

// emerging mole, head-up (local: dome-top ≈ y 4 hides it at mdy 16)
function upMole(sniff, t) {
  const nw = 13 * Math.sin(TAU * t * 7) * sniff;
  return `<ellipse cx="0" cy="4" rx="6.6" ry="8" fill="${C.fur}"/>` +
    `<path d="M-4.6 -1.6 C -4.9 1.8 -4.6 5.4 -3.6 8.6" stroke="${C.dark}" stroke-width="1" fill="none" stroke-linecap="round" opacity=".5"/>` +
    g(rot(nw, 1.2, -3),
      `<path d="M-1 -3.4 C -0.6 -6 1 -8.2 3.4 -9.4 C 4.4 -9.8 5.2 -9.2 5 -8.2 C 4.4 -5.8 3 -3.8 1.2 -2.6 Z" fill="${C.fur}"/>` +
      `<circle cx="4.3" cy="-8.9" r="1.5" fill="${C.nose}"/>` +
      `<path d="M5.6 -9.6 L 8 -10.6 M5.9 -8.7 L 8.6 -8.9 M5.5 -7.9 L 7.9 -7.3" stroke="${C.dark}" stroke-width=".45" stroke-linecap="round" opacity=".7"/>` +
      `<path d="M2.6 -10.2 L 1.4 -11.9 M3.9 -10.4 L 3.6 -12.3" stroke="${C.dark}" stroke-width=".45" stroke-linecap="round" opacity=".7"/>`) +
    `<circle cx="-1" cy="-2.8" r=".5" fill="${C.eye}"/><circle cx="2.6" cy="-1.4" r=".5" fill="${C.eye}"/>` +
    `<path d="M-5.2 3.4 C -7.8 2.6 -10.2 3.2 -11.4 4.8 C -12 5.8 -11.4 6.8 -10 6.9 C -7.8 7.1 -5.8 6.3 -4.6 5 Z" fill="${C.pink}"/>` +
    `<path d="M-10.9 4.6 L -12.3 4 M-11.3 5.5 L -12.9 5.3 M-11.1 6.3 L -12.5 6.7" stroke="${C.claw}" stroke-width=".6" stroke-linecap="round"/>` +
    `<path d="M5.2 3.4 C 7.8 2.6 10.2 3.2 11.4 4.8 C 12 5.8 11.4 6.8 10 6.9 C 7.8 7.1 5.8 6.3 4.6 5 Z" fill="${C.pink}"/>` +
    `<path d="M10.9 4.6 L 12.3 4 M11.3 5.5 L 12.9 5.3 M11.1 6.3 L 12.5 6.7" stroke="${C.claw}" stroke-width=".6" stroke-linecap="round"/>`;
}

// profile mole (faces right). P: paw, pawB, nw (nose), tailA
function sideMole(P) {
  return g(rot(P.pawB || 0, 5.2, 8),
      `<g opacity=".55"><path d="M5.6 6.6 C 8.2 5.8 10.6 6.4 11.8 8 C 12.4 9 11.9 10 10.6 10.2 C 8.4 10.5 6.4 9.8 5.2 8.5 Z" fill="${C.pink}"/></g>`) +
    g(rot(P.tailA || 0, -9.6, 6.4),
      `<path d="M-9.6 6.4 C -11.6 5.2 -12.4 3.4 -12 1.6" stroke="${C.fur}" stroke-width="1.1" fill="none" stroke-linecap="round"/>`) +
    `<ellipse cx="-1" cy="8" rx="9.5" ry="5" fill="${C.fur}"/>` +
    `<path d="M-8.6 5.2 C -4 2.6 3 2.6 7.4 5.4 C 3 4 -3.6 4 -8.6 6.4 Z" fill="${C.dark}" opacity=".5"/>` +
    g(rot(P.nw || 0, 7, 7.4),
      `<path d="M6.6 4.6 C 9.4 4.4 11.8 5.4 13 7.2 C 12 8.8 9.8 9.8 7 9.8 Z" fill="${C.fur}"/>` +
      `<circle cx="13" cy="7.2" r="1.4" fill="${C.nose}"/>` +
      `<path d="M14.2 6.4 L 16.4 5.6 M14.4 7.3 L 16.8 7.3 M14.1 8.1 L 16.3 8.8" stroke="${C.dark}" stroke-width=".45" stroke-linecap="round" opacity=".7"/>` +
      `<path d="M8.2 6 L 9.4 6.3" stroke="${C.eye}" stroke-width=".6" fill="none" stroke-linecap="round"/>`) +
    g(rot(P.paw || 0, 6, 8.2),
      `<path d="M6 7 C 8.8 6.2 11.4 6.8 12.6 8.5 C 13.2 9.5 12.7 10.5 11.3 10.7 C 9 11 6.8 10.3 5.6 8.9 Z" fill="${C.pink}"/>` +
      `<path d="M12 8.2 L 13.5 7.7 M12.3 9.1 L 13.9 9.1 M12 9.9 L 13.5 10.4" stroke="${C.claw}" stroke-width=".55" stroke-linecap="round"/>`);
}

const MDY = [
  [0.00, { y: 16, sw: 0 }], [0.10, { y: 16, sw: 0 }],
  [0.15, { y: 10.8, sw: 0 }], [0.20, { y: 11.2, sw: 0 }], [0.24, { y: 10.8, sw: 0 }],
  [0.30, { y: 3.5, sw: 1 }], [0.62, { y: 3.5, sw: 1 }],
  [0.68, { y: 4.8, sw: 0 }], [0.76, { y: 16, sw: 0 }], [1.00, { y: 16, sw: 0 }]
];

return {
  id: 'mole', view: [-40, -32, 82, 52], groundY: GY,
  thumb: { m: 'surface', t: 0.45 },
  motions: [
    { id: 'surface', label: 'Breaching the hill', short: 'Surface', dur: 5.2, env: { t: 'ground' }, speed: '0 km/h', beat: 'Quiver → pop → periscope',
      desc: 'The meadow’s most famous entrance: the hill trembles, crumbs fly, and up through the fresh earth comes a pink nose, then a velvet head, periscoping round the field.',
      anim: 'Tease with two mound-quivers before anything shows. The nose arrives first and does all the seeing — swing the whole head in slow arcs while the nose never stops.' },
    { id: 'dig', label: 'Dig', short: 'Dig', dur: 0.85, env: { t: 'ground' }, speed: '~4 m/min', beat: 'Breaststroke · soil aft',
      desc: 'Swimming through the ground: the great spade hands sweep back in alternate strokes and the spoil flies behind — a furrow of meadow rising over the wake.',
      anim: 'Animate it as swimming, not scraping — full shoulder strokes with a body-roll on each. The flying crumbs carry the power; the face stays serene.' },
    { id: 'snuffle', label: 'Snuffle', short: 'Snuffle', dur: 1.15, env: { t: 'ground' }, speed: '~1 km/h', beat: 'Waddle · nose radar',
      desc: 'Caught above ground and not enjoying it: a hurried low waddle on turned-out paws, the nose sweeping the air for the nearest way back into the dark.',
      anim: 'Keep the body a low sliding loaf and let the nose lead every direction change. The paws paddle rather than step — hurried, slightly comic, never lifted far.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'surface') {
      const K = keys(t, MDY);
      const sniff = (pulse(t, .17, .28) + pulse(t, .33, .6)) * Math.min(1, K.sw + 0.4);
      const sway = 7 * Math.sin(TAU * t * 1.8) * pulse(t, .32, .62);
      const mq = 1 + 0.03 * Math.sin(TAU * t * 13) * (pulse(t, .02, .13) + 0.4 * pulse(t, .25, .31));
      return pops(t, [
        { t0: .12, x: -4, vx: -8 }, { t0: .16, x: 3, vx: 7 }, { t0: .21, x: -1, vx: -4 },
        { t0: .27, x: 5, vx: 5 }, { t0: .29, x: -5, vx: -6 }, { t0: .70, x: 2, vx: 5 }
      ]) +
        g(trl(0, K.y) + ' ' + rot(sway, 0, 10), upMole(sniff, t)) +
        g(scl(1, mq, 0, GY), MOUND);
    }
    if (mid === 'dig') {
      let spray = '';
      for (let i = 0; i < 4; i++) {
        const p = wrap(t * 2 + i / 4);
        const x = 5 - 21 * p, y = 6.5 - 13 * p + 15 * p * p;
        spray += `<circle cx="${N(x)}" cy="${N(y)}" r="${N(0.65 + 0.2 * (i % 2))}" fill="${C.soilD}" opacity="${N(0.85 * (1 - p))}"/>`;
      }
      return groundTicks(t, { y: GY, x1: -37, x2: 39, v: 20, n: 7, s: 1 }) + spray +
        g(rot(2.5 * osc(t, 2, .3), 0, 10) + ' ' + trl(0, 0.4 * osc(t, 2, .1)),
          sideMole({ paw: 38 * osc(t, 2), pawB: 38 * osc(t, 2, .5), nw: 4 * Math.sin(TAU * t * 8), tailA: 6 * osc(t, 2, .3) })) +
        `<path d="M-17 15 C -12 11.8 -6 11 0 11.6 C 6 12.2 11 13 16 15 Z" fill="${C.soil}"/>` +
        `<path d="M8 15 C 10 11.4 13 10.2 16.5 10.6 L 16.5 15 Z" fill="${C.soilD}" opacity=".85"/>` +
        `<path d="M-12 12.6 C -8 11.6 -4 11.4 0 11.8" stroke="${C.soilD}" stroke-width=".7" fill="none" opacity=".5"/>`;
    }
    // snuffle
    const feet = [-6.5, -2.5, 2, 6].map((x, i) =>
      g(trl(0, -1.4 * Math.max(0, osc(t, 2, i * 0.25))),
        `<ellipse cx="${x}" cy="13.6" rx="1.7" ry="1.1" fill="${C.pink}"/>`)).join('');
    return draw_snuffle(t, feet);
  }
};

function draw_snuffle(t, feet) {
  return groundTicks(t, { y: GY, x1: -37, x2: 39, v: 13, n: 7, s: 1 }) +
    shadow(-1, GY, 12, 0) +
    g(trl(0, -0.5 * Math.abs(osc(t, 4, .05))) + ' ' + rot(1.5 * osc(t, 2, .3), 0, 10),
      feet +
      sideMole({ nw: 8 * osc(t, 2, .25) + 5 * Math.sin(TAU * t * 9), tailA: 9 * osc(t, 3, .2), paw: 0, pawB: 0 }));
}

})();
__REG["skylark"] = (function(){
// Skylark — fable style (side view, faces right)
const C = { brown: '#B08D56', deep: '#8F7040', streak: '#6E552F', cream: '#EFE6CF', beak: '#8A7248', eye: '#2A2326', song: '#A8802B' };
const GY = 13;

const wingFar = a => g(rot(a, 1.5, -2),
  `<path d="M1.5 -2 C -2 -6 -7 -7.4 -11.2 -6 C -8.8 -3.2 -4.6 -1.4 1.5 -0.6 Z" fill="${C.deep}" opacity=".55"/>`);
const wingNear = a => g(rot(a, 1.5, -2),
  `<path d="M1.5 -2.2 C -1.6 -7 -7.2 -8.6 -12 -6.8 C -9.4 -3.4 -4.6 -1.2 1.5 -0.4 Z" fill="${C.brown}"/>` +
  `<path d="M-3.2 -5.6 C -5.6 -6.3 -8.2 -6.6 -10.4 -6.3 M-2.4 -4 C -5 -4.6 -7.6 -4.7 -9.8 -4.3" stroke="${C.streak}" stroke-width=".5" fill="none" opacity=".7"/>`);

const tailF = f => g(scl(f, 1, -5.5, 0),
  `<path d="M-5.5 -1.2 L -12.6 -3.8 L -12.6 1.8 L -5.5 2.2 Z" fill="${C.deep}"/>` +
  `<path d="M-12.6 1.5 L -5.5 2" stroke="${C.cream}" stroke-width=".7" opacity=".9"/>`);

// P: wA wB tf headA crest legsSvg sing
function bird(P) {
  const headG = g(rot(P.headA || 0, 5, -1.5),
    g(rot(-(P.crest || 0), 5.8, -5.4),
      `<path d="M4.8 -5.4 C 5.2 -7.1 6.2 -7.9 7.4 -7.8 C 6.8 -6.7 6.3 -5.8 6.1 -5 Z" fill="${C.deep}"/>`) +
    `<circle cx="6.8" cy="-3.2" r="2.9" fill="${C.brown}"/>` +
    `<path d="M5.4 -1.2 C 6.4 -0.4 7.8 -0.3 8.9 -0.9" stroke="${C.cream}" stroke-width=".8" fill="none" opacity=".8"/>` +
    `<circle cx="7.7" cy="-3.8" r=".82" fill="${C.eye}"/><circle cx="7.95" cy="-4.05" r=".28" fill="#FBF7F2"/>` +
    `<path d="M9.5 -3.6 L 11.9 -2.8 L 9.4 -1.9 Z" fill="${C.beak}"/>` +
    (P.sing ? `<g stroke="${C.song}" fill="none" stroke-linecap="round" opacity="${N(P.sing)}">` +
      `<path d="M12.6 -5 q 2.2 -2 5.2 -2.2"/><path d="M13.4 -2.7 q 3.2 -.8 5.6 .2" opacity=".7"/></g>` : ''));
  return wingFar(P.wB ?? P.wA ?? 0) + tailF(P.tf ?? 1) + (P.legsSvg || '') +
    `<ellipse cx="0" cy="0" rx="6.6" ry="4" fill="${C.brown}"/>` +
    `<path d="M5.8 -1 C 6.2 1.4 5 3.4 2.2 4 C -1 4.6 -4 3.8 -5.8 2 C -2 3.4 2.6 2.6 5.8 -1 Z" fill="${C.cream}"/>` +
    `<path d="M-2 -3.2 L -1.6 -1.9 M0.6 -3.4 L 1 -2.1 M-4.4 -2.5 L -4 -1.3 M3 -3 L 3.4 -1.9" stroke="${C.streak}" stroke-width=".55" stroke-linecap="round" opacity=".75"/>` +
    headG + wingNear(P.wA || 0);
}

function draw(P) {
  const dx = P.dx || 0, dy = P.dy || 0;
  let s = P.ticks || '';
  if (P.grounded) s += shadow(dx, GY, 8, Math.max(0, -dy), 26);
  return s + g(trl(dx, dy) + ' ' + rot(P.pitch || 0, 0, 0), bird(P));
}

const runLeg = (a, o) => g(rot(a, 0.2 + o, 2.6),
  `<path d="M${N(0.2 + o)} 2.6 L ${N(0.9 + o)} 6.2 L ${N(0.5 + o)} 9.4 M${N(0.5 + o)} 9.4 L ${N(1.9 + o)} 9.8 M${N(0.5 + o)} 9.4 L ${N(-0.7 + o)} 9.8" stroke="${C.beak}" stroke-width=".85" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);

return {
  id: 'skylark', view: [-34, -30, 70, 48], groundY: GY,
  thumb: { m: 'song', t: 0.1 },
  motions: [
    { id: 'song', label: 'Song-flight', short: 'Song', dur: 1.6, env: { t: 'air' }, speed: 'climb ~2 m/s', beat: 'Flutter · unbroken song',
      desc: 'The meadow’s ceiling: a bird hanging on fast shallow wingbeats, tail fanned, climbing its own unspooling song until it is a singing dot against the sky.',
      anim: 'Blur the wings into a flutter and hold the body almost still — the song should feel like the engine. Add a slow drift upward, never a bounce.' },
    { id: 'run', label: 'Grass run', short: 'Run', dur: 0.7, env: { t: 'ground' }, speed: '~6 km/h', beat: 'Quick steps · head level',
      desc: 'Down among the stems it does not hop like a sparrow but runs like a tiny plover — fast even steps, body level, crest rising whenever it pauses to look.',
      anim: 'Legs twinkle beneath a stable hull; the head stays on rails. A raised crest and one glance sideways sell the alertness between bursts.' },
    { id: 'roost', label: 'Roost', short: 'Roost', dur: 6, env: { t: 'ground' }, night: true, speed: '0 km/h', beat: 'Tucked · slow breath',
      desc: 'No branch for a skylark — it sleeps on the ground in a grass tussock, puffed to a ball, head turned and beak buried in the feathers of its back.',
      anim: 'A breathing sphere. One slow swell per bar, and once in the cycle the eye opens a slit and closes again — the meadow is checked, then dismissed.' }
  ],
  render(mid, t) {
    t = wrap(t);
    if (mid === 'roost') {
      const br = 1 + 0.022 * Math.sin(TAU * t);
      const peek = pulse(t, .5, .58);
      const eye = peek > 0.5
        ? `<circle cx="-2.4" cy="1.7" r=".7" fill="${C.eye}"/>`
        : `<path d="M-3.3 1.7 C -2.7 2.2 -1.9 2.2 -1.3 1.7" stroke="${C.eye}" stroke-width=".7" fill="none" stroke-linecap="round"/>`;
      const tuft = `<path d="M-10.4 ${GY} l1 -3.4 M-9.7 ${GY} l2 -2.2 M9.8 ${GY} l-.8 -3 M10.4 ${GY} l1.4 -2.6" stroke="#A9A06B" stroke-width=".7" fill="none" stroke-linecap="round"/>`;
      return tuft + shadow(0, GY, 9, 0) +
        g(scl(1, br, 0, GY),
          `<ellipse cx="0" cy="7" rx="7.6" ry="5.8" fill="${C.brown}"/>` +
          `<path d="M-5.8 9.6 C -2 11.8 3 11.6 6 9.2 C 3 12.6 -3 12.8 -5.8 9.6 Z" fill="${C.cream}" opacity=".85"/>` +
          `<path d="M-5.6 5.4 C -2 3.9 2.4 4.1 5.2 6 M-4.6 7.6 C -1.4 6.4 2.6 6.6 5 8.2" stroke="${C.deep}" stroke-width=".6" fill="none" opacity=".65"/>` +
          `<path d="M5.4 4.6 L 12 2.2 L 12.3 4.2 L 6 6.4 Z" fill="${C.deep}"/>` +
          `<path d="M12 3.9 L 6.2 6" stroke="${C.cream}" stroke-width=".5" opacity=".85"/>` +
          `<circle cx="-2.2" cy="2.4" r="3" fill="${C.brown}"/>` +
          `<path d="M-4.6 4.4 C -3 5.4 -0.8 5.4 0.8 4.4" stroke="${C.deep}" stroke-width=".6" fill="none" opacity=".6"/>` +
          eye);
    }
    if (mid === 'run') {
      return draw({
        grounded: true,
        dy: 3.2 - 0.45 * Math.abs(osc(t, 4, .05)),
        pitch: 1.2 * osc(t, 2, .3),
        wA: 2 * osc(t, 4, .1), wB: 0, tf: 1,
        crest: 0.6 + 0.4 * osc(t, 1, .3),
        headA: 3 * osc(t, 2, .55),
        legsSvg: runLeg(26 * osc(t, 4), 0) + runLeg(26 * osc(t, 4, .5), -1.6),
        ticks: groundTicks(t, { y: GY, x1: -31, x2: 33, v: 42, n: 7, s: .9 })
      });
    }
    // song-flight
    return draw({
      dy: -8 - 2.6 * osc(t, 1, .28), dx: 1.2 * osc(t, 1, .6),
      pitch: -34 + 3 * osc(t, 1, .15),
      wA: 24 * osc(t, 8), wB: 24 * osc(t, 8, .45),
      tf: 1.55, crest: 1,
      sing: 0.55 + 0.45 * osc(t, 3, .2),
      legsSvg: `<path d="M-1.6 2.6 L -3.4 3.6 M0 3 L -1.8 4.2" stroke="${C.beak}" stroke-width=".8" stroke-linecap="round"/>`,
      ticks: airTicks(t, { x1: -31, x2: 33, y: -16, h: 12, v: 7, n: 4, s: .85 })
    });
  }
};

})();

window.__FABLE_ANIMALS = __REG;
})();
