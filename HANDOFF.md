# Meadowlark „calm garden" — HANDOFF

**Stan:** v54 (2026-07-07) · **repo podstawowe / źródło prawdy:** `meadowlark-garden`
**Live strona (comeback):** https://fedorczakmichal-stack.github.io/meadowlark-garden/
**Live apka (calm garden PWA):** https://fedorczakmichal-stack.github.io/meadowlark-garden/garden/

---

## 1. Co to jest

Dwa produkty w jednym repo, oba statyczne, serwowane przez GitHub Pages:

- **`/` (root)** — landing „gentle comeback app" (uniwersalny, interaktywny: wybierasz zawód,
  klikasz latarnię na drodze → trasa/płace/nić przeliczają się na żywo). Generowany z
  `Meadowlark-v3/comeback/index.html` → `Meadowlark-v3/root-index.html` (ścieżki pod root, canonical→root, bez SW).
- **`/garden/`** — **APKA**: łagodny self-care „calm garden". Twoje życie = panoramiczny ogród
  **7 siedlisk** (body, home, connection, meaning, craft, future, calm), każde z drzewem rosnącym
  przy „pielęgnacji". Pętla: otwórz → łagodne powitanie → dotknij siedliska/karty → „tend one small
  thing" (szybka akcja / własne słowa / „Not now") → care rośnie → ogród kwitnie. Widoki (dolna nawigacja):
  **Meadow** (scena), **Returns** (dziennik powrotów), **Look back** (krajobraz przebytej drogi +
  kompas tygodnia + zasuszone kwiaty), **More** (ustawienia + „Your craft" + panel „If today is heavy").
  Jest system **craft/kariera** (karta „road, mapped" + tygodniowa „nić"; 7 ręcznych zawodów + katalog 860+ z Supabase).

**KONTRAKT DUSZY (nienaruszalny):** care tylko ROŚNIE; ŻADNA liczba pochodna od care nie trafia do
widocznego DOM (stadia = SŁOWA przez `STAGE_WORD`); ZERO streaków, winy, liczników-braków, czerwonych
ostrzeżeń, powiadomień, porównań, „jesteś w tyle". (Zliczenia dziennika/„returns" SĄ dozwolone.)
Cel: spokojne, wolne od wstydu miejsce na trudne sezony. „Świetna funkcja", która dodaje presję/miarę — jest ZŁA.

## 2. Repo, gałęzie, DEPLOY

- Repo: `fedorczakmichal-stack/meadowlark-garden` (public). Klon roboczy:
  `~/Documents/Claude/Projects/meadowlark-garden/` (apka w `garden/`).
- **Deploy stabilny = `git push` na `main`** → GitHub Pages sam publikuje (serwuje z main root).
  Za KAŻDYM razem bumpnij `garden/sw.js` `CACHE` (`meadowlark-garden-vNN`), inaczej PWA poda stary cache.
- **Kanał podglądu:** push na `preview` albo `cursor/*` → workflow „Sync preview" rsyncuje `garden/`
  tej gałęzi do `main:preview/` → https://…/meadowlark-garden/preview/ (z plakietką „Podgląd deweloperski").
- **Ja pracuję na gałęzi `walker-director`**, potem: `push origin walker-director`,
  `push --force origin walker-director:preview` (podgląd), a na koniec merge do `main`.
- ⚠ **KOLIZJA Z CURSOREM:** Cursor pracuje równolegle w tym repo; jego push na `preview`/`cursor/*`
  PODMIENIA `/preview/` (ostatni push wygrywa) i jego sync-bot dopisuje commity do `main` (folder `preview/`).
  Dlatego: (a) `/garden/` (stabilne, z main) jest odporne na preview-syncy — kieruj tam Michała, nie na `/preview/`;
  (b) push na `main` bywa odrzucany → pętla `git fetch + merge origin/main + merge walker-director + push`;
  (c) ZAWSZE `git fetch` przed pracą.
- ⚠ **GitHub Pages potrafi wisieć w „building"** → `gh api -X POST repos/fedorczakmichal-stack/meadowlark-garden/pages/builds`.
- Stary `/meadowlark/` (repo `meadowlark`) PRZEKIEROWUJE tu; nie ruszać jego root sw.js (Vesa, network-first).

## 3. Architektura apki (`garden/index.html`, single-file: inline CSS+JS+SVG)

Sidecary: `sw.js`, `manifest.json`, `fable-animals.js` (silnik sprite'ów zwierząt), `craft-index.json`, ikony.
Dane: 1 klucz localStorage `meadowlark.garden` (+ osobne klucze: `meadowlark.pressed`, `meadowlark.compass`,
`meadowlark.craft.<soc>`). `coerce()` migruje stare zapisy; `persist()` łapie quota → tryb „memory only" + toast.

- **Scena (`renderMeadow`)**: panorama `PANO_W×PANO_H` (`.scene-wrap` scroll + zoom). Warstwy:
  niebo→góry (`drawForest` y≈312)→mgła→wzgórza→`drawMidground` (krzewy, omija `inStream`/`inTrail`/`inBearClearing`)→
  env per siedlisko (`env-<id>`)→przejścia→drzewa (host `tw-<id>`: **poświata siedliska (accent) + cień kontaktowy + drzewo + `glw-<id>`**)→
  zwierzęta→pyłki/gwiazdy→**`drawSeasonOverlay`**→veil nocny→kolumny-tapy. Cache: `sceneSig()` (rebuild tylko
  gdy sig się zmieni); `patchTree`/`patchEnv` = cross-fade jednego drzewa/env bez rebuildu.
- **Pory dnia**: `dayPhase()` (theme/godzina) → 'dawn/day/golden/dusk/night'. **`phaseBlend()`** =
  ciągły cross-fade nieba+wzgórz w ~45min przed każdą granicą (sampleGrad+mix); `phaseBlendKey()` w
  `sceneSig` + `tick()` (60s) → scena re-renderuje kilka razy w oknie przejścia. dayPhase i phaseBlend
  MUSZĄ czytać ten sam czas/theme (czytają) — inaczej niebo≠logika.
- **Sezony (`drawSeasonOverlay`)**: additive (nie walczy z atlasem drzew o stałych kolorach) — zima:
  chłodny wash+śnieg osiadły+padający; jesień: złoto+liście; wiosna: płatki. Cząstki `.fall`/`.spin` motion-gated.
- **GROWTH ATLAS** (`GA` w pliku, port verbatim „The Growth Atlas"): drzewa/kwiaty o STAŁYCH kolorach koron
  (dlatego sezony robimy overlayem, nie przez korony). `tree()`/`wildflower()` — stare sygnatury, w środku GA.
- **MOTION ATLAS + walker** (`FABLE_BEHAV` + `fableTickNow`/`fableLoop`): każde zwierzę = mała maszyna
  stanów (idzie po rewirze `f.lo/f.hi` clamped do panoramy → przystaje → gra zachowanie z paczki). **Zwrot =
  znak prędkości; flip TYLKO na postoju** (nigdy interpolowany). Klatki chodu = flipbook (frame-set cache,
  `set.lastK`); przełączane przez `style.display` (NIE visibility — WebBKit/iPhone nie przerysowywał visibility
  pod zmieniającym się transformem = duch klatek). **Wszystkie zwierzęta z paczki patrzą natywnie W PRAWO** —
  weryfikować center-line RAW renderem, `fl` nieużywane (0). Perf: `_sceneScale` cache (nie `getBoundingClientRect`
  co klatkę); invalidacja na resize/orientation.
- **Craft**: `renderTrail()` (WSPÓLNY kod z landingiem — droga: wstęga do słońca, latarnie, etykiety liczą
  edgeX z szerokości tekstu = nie ucinają, `lblScale`); `craftRoadSVG(p,userIdx)` = wrapper. Płace w karcie
  drogi za `<details>` domyślnie ZAMKNIĘTYM (etos: pensja = porównanie); wyszukiwarka BEZ płac.
- **Look Back**: `renderPath` → `renderThenNow` + `renderMemoryCard` + **`renderCompass`** (kompas tygodnia,
  rotacja `isoWeek`, write-back przez `tend('meaning',...)`) + **`renderPressed`** (zasuszone kwiaty z dziennika) + `renderChapters`.
- **Heavy panel** (w „More"): linie kryzysowe tappable (tel:/sms:) + **`wireBreathe`** (box-breath 4-4-4-4, opt-in).

## 4. Weryfikacja (reguła: bez live-servera, `file://`)

- Headless system Chrome + CDP przez WebSocket (node 22): `--headless=new --remote-debugging-port
  --force-device-scale-factor=2`; skrypty w scratchpadzie sesji.
- **Harness inwariantów ruchu** (`verify_motion.mjs`): `window.__FABLE_TEST=1` + `__fableTest.tick(ms)`/`.state()`
  → 120 symulowanych sekund; asercje: 0 moonwalku, flip tylko na postoju, nie wychodzi z rewiru, brak NaN.
- Seed sceny: mutuj `store` + `applySettings(); lastSceneSig=''; renderMeadow(true)`. Do wymuszenia pory dnia
  ustaw `store.settings.theme='day'/'evening'` (obie funkcje to honorują) — NIE patchuj samego `dayPhase`
  (phaseBlend go nie widzi → niebo≠logika).
- Zrzuty zawsze DSF 2; miękkie SVG w 1× spłaszcza kolory.
- ⚠ `captureBeyondViewport` NIE dociąga `loading="lazy"` — weryfikować scroll-testem.

## 5. Otwarte / odłożone (z audytu 10-soczewkowego, task `w3bs16jdj`)

- Habitat distinction: zrobione „lekko" (accent-glow + istniejące env-y); można pogłębić sygnatury per-env.
- Golden-hour: działa; ewentualnie dostroić okno/krzywą.
- A11y: dalej można dodać role=radiogroup na segach, focus-trap w arkuszach.
- NF nie zrobione: (brak — breathing/compass/pressed ZROBIONE w v51). Ewentualne przyszłe: zimowy wariant
  koron drzew, wiewiórka w stylu fable (usunięta), stary silnik kwiatów v2 (martwy kod do wycięcia).
- Pełna pamięć projektu: `~/.claude/.../memory/project_meadowlark_calm_garden_app.md` (historia rund) +
  `project_meadowlark_healthcare_landing.md` (strona/repo).

## 6. Historia wersji (skrót)

v42 droga OD ZERA (`renderTrail`, latarnie) · v43–v49 walker (JS maszyna stanów; fix moonwalk/tyłem = flaga
`fl` bear+bee; kot+wiewiórka usunięci; niedźwiedź pod las w polanie; kaczka upend clip; bocian bez clatter) ·
**v50 audyt**: soul-fix płac, guardy crashy, linie kryzysowe tappable, kontrast AA, first-run welcome, motes w calm,
**sezony wizualne**, noc gęstsze gwiazdy, cienie drzew, perf scale-cache · **v51**: gwiazdy losowe+stałe,
golden-hour blending, poświata siedlisk, keyboard/ARIA, **breathing** + **weekly compass** + **pressed flowers** ·
**v52** (2026-07-07): **FIX ruchu zwierząt wodnych** — `fableCollect()` teraz ZACHOWUJE pozycję/stan każdego
walkera przez rebuild sceny (v51 wrzucił `phaseBlendKey()` do `sceneSig` → renderMeadow rebuilduje się parę razy
w oknie świtu/zmierzchu, a stary fableCollect resetował zwierzęta do pozy startowej = teleport przez cały staw u
kaczki/bociana/ryby/żaby/żółwia; snapshot ox/oy/dir/mode/until/mid → wznawia; zweryfikowane headless). **REDESIGN
2 scen dróg**: `renderTrail` (droga „mapped") z perspektywy-zbiegu → **łagodny serpentyn ku słońcu**, latarnie na
przemian L/P (każdy etap+etykieta oddycha, koniec zbitej kolumny), większe latarnie, bieżący świeci; działa 3/5/6
etapów. `renderPath` (Look Back) — **kamień = bohater** (większy, cieplejszy, poświata odcina od łąki, najnowszy
świeci), droga z zygzaka → spokojny wiew, przerzedzone drzewa, USUNIĘTE przydrożne kwiaty/drifty (kamień niesie
własny kwiat dnia). Harness zrzutów: scratchpad `shoot.mjs`/`shoot_scene.mjs`/`motion_probe.mjs`.

**v53** (2026-07-07): **KIERUNEK „Niebo" — obie „drogi" przemyślane od nowa na poziomie METAFORY (droga→gwiazdy).**
`renderTrail` = **Nocna Figura (konstelacja)** na spokojnym granatowym niebie: każdy etap = GWIAZDA (rozmiar/ciepło
rośnie z etapem, bieżący = najcieplejszy/najjaśniejszy z halo + iskrą), luźny nieliniowy scatter (phyllotaxis +
relaksacja anty-kolizyjna + wątek nearest-neighbour = czytelna figura bez krzyżujących nici), etykiety-nazwy jak na
mapie nieba (leader + de-kolizja per strona), tło z gwiazdek + poświata horyzontu; **ZERO startu/mety/osi**;
deterministyczny hash (nie Math.random); self-contained (własny `mixC`, gate ruchu przez matchMedia+store — bezpieczny
też na landingu). `renderPath` scena = **Nocne Niebo Powrotów**: pełnoekranowa ciemna kopuła, **1 gwiazda = 1 wpis**
(więcej powrotów = gęstsze niebo, NIE licznik), tinty accentem obszaru, najnowsza „tonight" delikatnie migocze;
ciemna sylweta ogrodu + księżyc (twarz czysta — moon-avoidance) + glow horyzontu; **tap gwiazdy → swell + własne słowa
wpisu** w podpisie (`fuzzyGroup` + label, klawiatura Enter/Space, `.cairnTap`→`#cairnCap`). **KONTRAKT: zabity ostatni
scoreboard** — 3 złote karty-liczby (`.lb-stats`/`.lb-n`) usunięte, została sama ciepła proza `.lb-line` (bez liczb);
nagłówek Look Back → „The sky was always full", copy karty craftu odcięte od „road/stone" (konstelacja, nie drabina).
Obie sceny dzielą JEDEN język nieba (paleta dusk/night + słownik gwiazd). Motion-gated (twinkle: `body.motion-calm`
+ reduced-motion; swell `.rt-scale`/`.rt-halo` też). Zweryfikowane headless 3/5/6 etapów i ~3–24 powrotów, brak
błędów konsoli, motion-probe bez regresji fableCollect. Harness: `shoot_trail.mjs`/`shoot_firmament.mjs`/`check_reduced.mjs`.

**v54** (2026-07-07): **ODKRYWALNOŚĆ CRAFTU (główny hook produktu) + batch „hardening".** WS1: craft = teraz
NAJBARDZIEJ wyeksponowany z 7 obszarów. (a) **Baner-bohater „Your craft"** (`#craftSlot`/`renderCraftInvite()`,
CSS `.craft-invite`) nad kartami na Meadow — ustawiony craft → wprost otwiera KONSTELACJĘ (`openCraftPath`, bez
arkusza tend), `general`/brak → picker (`openCraftPick`). (b) Karta craftu w siatce ma delikatny prymat
(`.card.craft-lead` = pierścień accentu) + pigułkę „See the whole road →" (`.c-road`, tylko gdy craft ustawiony;
klik omija tend-sheet). (c) **`general` nigdy nie jest ślepą uliczką**: `openCraftPath` bez danych drogi → spada do
`openCraftPick`; gate cpOpenBtn w tend-sheet pokazuje się dla craftu ZAWSZE (kopia zależna od `craftIsSet()`).
`renderCraftInvite()` woła się w `init`/`go('meadow')`/craftPickSave. WS2 (audyt): import z historią pyta
`window.confirm` (nie kasuje po cichu); `.seg` przy ≤360px zawija się do własnej linii (`@media(max-width:360px)`);
`go()` guarduje zły view-id (no-op zamiast blank) + ustawia `aria-current="page"`; `esc()` escapuje też `'`→`&#39;`;
usunięty martwy `foregroundFlora()`. Zweryfikowane DSF2: `shoot_ws1.mjs` (baner set/general, picker, droga set,
`general`→picker), `shoot_ws2.mjs` (320px bez overflow, aria-current, go-guard, esc), motion-probe bez regresji.
