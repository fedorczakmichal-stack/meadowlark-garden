# Meadowlark

A gentle comeback app — rebuild a life and a craft one small return at a time.
No streaks, no shame, no productivity theater.

- **`/`** — the landing page. Universal and interactive: pick a craft, walk its
  road, tap a lantern to stand at any stage.
- **`/garden/`** — the app itself: a calm, single-file, offline PWA. Your whole
  life as a garden you tend one small thing at a time (localStorage, no account).

Both are static and self-contained; GitHub Pages serves them as-is.

## Live URLs

### Produkcja (stabilna, starsze repo)

- https://fedorczakmichal-stack.github.io/meadowlark/garden/

### meadowlark-garden — podgląd naszej pracy

| Kanał | Branch | URL |
|-------|--------|-----|
| **Podgląd dev** (najnowszy kod) | `preview` | https://fedorczakmichal-stack.github.io/meadowlark-garden/preview/garden/ |
| Hub podglądu | — | https://fedorczakmichal-stack.github.io/meadowlark-garden/preview/ |
| Stabilny podgląd po merge | `main` | https://fedorczakmichal-stack.github.io/meadowlark-garden/garden/ |
| Landing | `main` | https://fedorczakmichal-stack.github.io/meadowlark-garden/ |

**Jak to działa:** push na `preview` → odświeża `/preview/…` w ~1 min. Merge do `main` → trafia pod `/garden/` (bez prefiksu preview).
