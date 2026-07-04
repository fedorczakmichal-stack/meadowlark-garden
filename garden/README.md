# Meadowlark — a calm garden for hard seasons

A fully-working, single-file, offline app built from the concept on `../hard-seasons.html`.
Tend **one small part** of your life and it grows back at its own pace. No streaks, no guilt,
no counting missed days, no catching up.

## Run it
- **Just open it:** double-click `index.html` (works fully from `file://` — localStorage, all six areas, journal, path, settings).
- **As an installable PWA:** serve the folder over http(s) and "Add to Home Screen". The service worker + manifest only engage when served (they're skipped on `file://` so there's no console noise).
  - e.g. `cd app && python3 -m http.server 8000` → open `http://localhost:8000`

## Files
| file | purpose |
|---|---|
| `index.html` | the whole app — HTML + inline CSS + inline JS + inline SVG (no build, no external scripts) |
| `manifest.json` | PWA manifest (injected by JS only when served) |
| `sw.js` | offline cache (network-first for the shell, cache-first for assets; no push/notifications, ever) |
| `icon.svg`, `icon-maskable.svg` | app icons (the lark mark on a sunrise) |
| `_design-spec.json` | the synthesized build spec from the design pass (reference, not shipped) |

## What it does
- **Meadow** — a living SVG scene that reflects the real time of day (dawn → day → golden → dusk → night, with moon/stars/fireflies) and the calendar season (winter = rest). Six trees, one per area, grow through 5 stages.
- **Six areas of care** — Body, Home, Connection, Meaning, Future, Calm. Connection & Future are gentle *invitations*, never obligations.
- **Tend** — pick an area, choose a tiny act (or write your own ≤120 chars). One tend = the tree grows a little. Each becomes a kept memory.
- **Returns** — a quiet journal of every small return, grouped by fuzzy dates (Today / Yesterday / Earlier this week / A while ago).
- **Look back** — a winding path with one stone cairn per day you came back (evenly spaced, so a long gap is never visible).
- **More** — the promise (what you'll never find / what stays), crisis support lines, and gentle settings (motion, text size, hemisphere, scene), plus Save a copy / Bring in a copy / Start over.

## The soul (a structural contract — see the comment block at the top of the `<script>`)
Care **only ever adds up** (no decay, nothing lost). No streaks, no daily caps, no counting,
no goals/ETAs, no comparison, no red/alarms, **no notifications ever**. No raw number derived
from care reaches the DOM — growth is shown as a gentle word ("sprouting", "in full leaf").
The freshly-tended glow is *additive only* over a permanently-healthy baseline — a tree never
wilts, shrinks, greys, or regresses with time. Returning after a long gap is met with a warm,
number-free welcome.

## Data
One `localStorage` key, `meadowlark.garden` (schema 1): `meta`, six `areas` (`care` + `lastTendAt`),
an append-only `journal`, and `settings`. Everything stays on the device; nothing leaves it.
Growth thresholds: `THRESH = [0,1,3,6,10]` → 5 stages. Robust load (try/catch, in-memory
fallback, `.bak` on parse failure; never wipes a corrupt save).

## Built & verified
Designed via a multi-agent design pass, then reviewed by an adversarial multi-dimension pass
(correctness · calm-promise · accessibility · visual · offline) with every finding verified
against the source. Verified in headless Chrome: no JS errors, clean console on `file://`,
contrast (WCAG AA on body copy), keyboard focus + sheet focus-trap, and no care-number ever
reaching the DOM. *Note: judge the scene at device-scale-factor 2 — at 1× the green-on-green
SVG looks washed out, but real retina phones render it crisp.*
