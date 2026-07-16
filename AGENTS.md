# Meadowlark

A gentle "comeback" wellness app — a static, offline-first PWA. See `README.md` for the product overview.

- `/index.html` — the landing page (universal, interactive).
- `/garden/` — the app itself: a calm, single-file, offline PWA. All state lives in `localStorage` under the key `meadowlark.garden`; there is no account or backend.
- `/preview/` — a CI-maintained mirror of `/garden/` (deploy convenience only; do not edit by hand).

## Cursor Cloud specific instructions

- This is a pure static site: no package manager, no build step, no backend, no database, no dependencies to install. There is nothing to compile or bundle.
- There is no lint/test/build tooling in the repo. "Running" the app means serving the static files and opening them in a browser.
- Run it with a static file server rooted at the repo root (so both `/` and `/garden/` resolve):
  `python3 -m http.server 8000` → landing at `http://localhost:8000/`, app at `http://localhost:8000/garden/`.
- Serve over http(s), not `file://`, when testing PWA behavior: the service worker (`garden/sw.js`) and manifest only activate over http(s), and the garden app same-origin `fetch`es `garden/craft-index.json` and `garden/fable-animals.js`.
- The service worker uses a versioned cache (e.g. `meadowlark-garden-v43`). After editing files in `garden/`, do a hard reload / clear site data (or bump the cache version) so the SW serves fresh content rather than the cached shell.
- The `.github/workflows/deploy-pages.yml` workflow only mirrors `garden/` → `preview/` for GitHub Pages; it is not needed for local development.
