# Meadowlark „calm garden" — HANDOFF

**Stan:** v60 (2026-07-08) · **repo podstawowe / źródło prawdy:** `meadowlark-garden`
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

Sidecary: `sw.js`, `manifest.json`, `fable-animals.js` (silnik sprite'ów zwierząt), `craft-index.json`, ikony (`icons/`), fonty (`fonts/`), splash iOS (`splash/`).
Dane: 1 klucz localStorage `meadowlark.garden` (+ osobne klucze: `meadowlark.pressed`, `meadowlark.compass`,
`meadowlark.craft.<soc>`). `coerce()` migruje stare zapisy; `persist()` łapie quota → tryb „memory only" + toast.

- **Scena (`renderMeadow`)**: panorama `PANO_W×PANO_H` w `#sceneWrap` (scroll + zoom). **Od v60 = DWIE warstwy w `.scene-plane`**
  (obie wypełniają ten sam box PANO, więc zwierzęta/tapy leżą DOKŁADNIE nad rastrem): (1) **`<canvas class="scene-canvas">` = statyczny bitmapowy dekor**
  (niebo→góry `drawForest` y≈312→mgła→wzgórza→`drawMidground`→env per siedlisko `env-<id>`→przejścia→drzewa `tw-<id>` [poświata accent + cień + drzewo]→
  gwiazdy→sezonowy scatter) — generowany JAK DAWNIEJ jako string SVG, potem **rasteryzowany przez `Image`+`drawImage`** (`rasterScene()`,
  re-rastr tylko gdy `sceneSig()` się zmieni albo na zoomie; backing @DPR≤3 z limitem 16M px pod iOS; `_lastStaticInner`=string,
  `hiddenDefs()` inline'uje `#glDof`/`#daisy`/… bo raster to samodzielny dokument). (2) **overlay `<svg class="scene-svg">` = warstwa ŻYWA+INTERAKTYWNA**
  (larki/skybirdy, `glw-<id>` iskry poświaty, **zwierzęta `g.fable`**, `drawSeasonOverlay` [wash+scatter+spadające], golden-wash `#glow`, veil nocny, **kolumny-tapy**).
  **`fableCollect`/`fableTickNow` bez zmian** — dalej pytają `#sceneWrap svg`/`g.fable`; overlay = jedyny svg w `#sceneWrap`, `_sceneScale` z jego wysokości.
  Cache: `sceneSig()` (rebuild tylko gdy sig się zmieni). **Tend: `growHabitat(id)`** = `renderMeadow(true,{staticOnly:true,crossfade:true})`
  (re-rastr TYLKO canvasu z płynnym cross-fade przez tymczasowy `canvas.scene-fade` → drzewo+flora rosną bez flasha; animacje nietknięte) + `patchGlow`.
  **Node-count: statyczny dekor w żywym DOM spadł ~3682→56 (full care) / ~1967→56 (low)**; zniknął też per-frame koszt filtra blur `glDof`. `patchTree`/`patchEnv` USUNIĘTE.
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

**v55** (2026-07-07): **AUDYT HARTOWANIA — prywatność + iOS + a11y + linie kryzysowe EU/PL.**
- **WS1 Prywatność „nic nie opuszcza urządzenia" = teraz PRAWDA.** (a) **Fonty self-hosted**: usunięte 3 `<link>` do
  fonts.googleapis/gstatic (head), pobrane 20 `.woff2` (Figtree 400/500/600/700, Hanken Grotesk 400/500/600/700,
  Space Grotesk 500/600 — subsety **latin + latin-ext**, więc polskie znaki działają) do `garden/fonts/`, lokalne
  `@font-face` w `<style>` w head. **Zero requestów cross-origin przy starcie** (zweryfikowane `performance.getEntriesByType('resource')`→[]),
  działa offline. (b) **Supabase (`fetchStageTasks`) ZOSTAJE** — bundlowanie kroków dla 860+ SOC lokalnie jest niepraktyczne
  (dziesiątki tys. wierszy); fetch jest publiczny, read-only, tylko dla JEDNEGO wybranego craftu z katalogu, cache offline
  po 1. użyciu. Zamiast tego **copy jest UCZCIWE**: promise-line „…The only thing that ever leaves is a one-time lookup of a
  craft's public steps, and only when you open one." (7 ręcznych zawodów NIE fetchuje).
- **WS2 iOS instalowalność**: zrasteryzowane `icon.svg`/`icon-maskable.svg` → PNG w `garden/icons/`
  (`apple-touch-icon-180.png` z maskable=pełne tło, iOS-safe; `icon-192.png`/`icon-512.png` „any"; `icon-maskable-512.png`).
  `<link rel="apple-touch-icon" sizes="180x180" href="icons/…png">`; manifest.json dostał wpisy PNG (192/512/512-maskable)
  przed SVG. **Splash (apple-touch-startup-image) POMINIĘTY** (wymaga zestawu PNG per-urządzenie z media-query; nie „łatwe").
- **WS3 A11y**: (a) **wspólny menedżer modali** `openModal/closeModal/modalTrap` (zastąpił bespoke `trapTab`+ręczne
  `aria-hidden` tend-sheeta) — teraz `#sheet` ORAZ `#craftPick` ORAZ `#craftSheet` mają: `#app aria-hidden` na czas otwarcia,
  fokus wchodzi do arkusza, Tab uwięziony (owija w obie strony), fokus wraca do opener przy zamknięciu (zweryfikowane).
  (b) `aria-live="polite"` na `#cairnCap`. (c) `aria-pressed` na `.cr-item` i `.stage-chip` (render + toggle). (d) touch-targety:
  `.seg button` i `.stage-chip` ≥44px na mobile (`@media(hover:none),(max-width:560px)`).
- **WS4 Linie kryzysowe EU/PL**: dodane **112** (EU) + **116 123** (dorośli), **116 111** (młodzież), **800 70 2222**
  (Centrum Wsparcia) dla Polski; US 988 / UK 116 123 / findahelpline zostają. `orderSafeLines()` (init) sortuje linie
  wg `navigator.language`+timezone (PL→Polska+Europa na górze), findahelpline ZAWSZE ostatni. tel:/sms: klikalne.
- Assety w `sw.js` ASSETS (24 ścieżki: 4 ikony + 20 fontów), CACHE `v55`. Zweryfikowane headless DSF2:
  `verify_ws.mjs` (0 błędów konsoli, 0 external req, focus-trap Tab-wrap, Escape+restore, aria-*), `verify_ws2.mjs`
  (PL-first order, focus wraca do `craftOccBtn`, tel-linki), `motion_probe.mjs` bez regresji fableCollect.

**v56** (2026-07-07): **PRODUKT = USA-first; CRAFT = SERCE (nie 1 z 7 równych).** WS1A craft-as-core: **baner
„Your craft" przeniesiony NAD scenę** (pierwsza interaktywna powierzchnia po powitaniu; `#craftSlot` teraz między
`welcomeSlot` a `scene-stage`), eyebrow „THE HEART OF YOUR GARDEN" (`.ci-eyebrow`), copy banera wprost = protagonista
(„The heart of your garden…"), a nagłówek kart przeramowany: hint = „the ground your craft grows from" gdy craft
ustawiony (tylko copy — care nadal RÓWNE per kontrakt; ustawiane w `renderCards()` przez `#cardsHeadHint`). **BEZ zmian
IA/nawigacji** (rozważony osobny tab craftu → ODRZUCONY: ryzyko „career-tracker", psuje spokój; konstelacja dalej
1-tap z banera+karty). WS1B linie kryzysowe → **US-first hardcoded**: 988 (call+text 988), Crisis Text Line (text HOME
to 741741), findahelpline = „Outside the US". USUNIĘTE: EU 112, PL 116123/116111/800702222, cały `orderSafeLines()`
+ reorder wg `navigator.language`. WS1C perf: `reduceMotion()` cache'uje MediaQueryList (było `matchMedia()` co ramkę)
i ruszony ZA throttle 33ms; ref SVG sceny cache'owany (`_fableSvg`, self-heal na rebuild przez `.isConnected`) zamiast
`getElementById`+`querySelector` co ramkę; `phaseBlendKey` kwant `*8`→`*3` (9→4 rebuildy/okno świt-zmierzch).
Zweryf. DSF2 `shoot_meadow2.mjs`/`shoot_v56.mjs`, `motion_probe.mjs` bez regresji.

**v57** (2026-07-07): **RETENCJA on-ethos (3 funkcje, wszystkie w Look back; każda = zaproszenie, 0 presji/liczników,
nic nie opuszcza urządzenia).** (1) **Printable keepsake** — ciepła, oprawialna strona (winieta ogrodu +
kilka własnych „returns" + „the heart of it — {craft}") przez `window.print()` + arkusz `@media print`; kontener
`#printKeepsake` budowany na żądanie (`buildKeepsake`/`printKeepsake`), gradienty winiety remap `lbtn-`→`pktn-` (brak
kolizji z winietą Look back), `print-color-adjust:exact`. (2) **Letter to your future self** — prywatny list
zapieczętowany w `localStorage` `meadowlark.letters`, otwiera się w wybrany dzień (In a season / Next spring / A year
from now; `nextSpringYMD`/`addDaysYMD`), wypływa łagodnie w Look back gdy nadejdzie jego dzień (zaproszenie, BEZ
nagów/badge/notyfikacji); `renderLetters`/`showLetterCompose`/`openLetter`. (3) **„The garden noticed…"** — 1 ciepła
obserwacja tygodniowa (rotacja `isoWeek`) TYLKO z istniejących danych — stadia = SŁOWA, ZERO liczb care, zero oceny;
`renderNoticed`. Sloty `#lbNoticed`/`#lbLetters`/`#lbKeepsake` w view-path, podpięte w `renderPath()`. Zweryf. DSF2
`shoot_v57.mjs` (look-back, open list, compose+seal, keepsake w print-media), 0 błędów konsoli (`console_check.mjs`),
`motion_probe.mjs` bez regresji. CACHE `sw.js` `v57` (ASSETS bez zmian — wszystko inline w index.html).

**v58** (2026-07-08): **WAVE 1 redesignu (1 z 3; Look Back-niebo i canvas-perf = osobne fale).**
- **TASK 1 — MEADOW FIRST.** Baner „Your craft" (`#craftSlot`) PRZENIESIONY z powrotem POD scenę (v54-pozycja: między
  `.scene-hint` a `.cards-head`; był NAD sceną w v56 → dominował). Powitanie skompaktowane (`.greeting` padding
  `16px→11px`, `.hello` `clamp(20,5.4vw,25)→clamp(19,5vw,23)`, `.season` `14→13px`) → żywa scena jest pierwszym
  emocjonalnym uderzeniem w 1. widoku. Zweryf. 390px: returning-user sceneTop=152, scena=48% pierwszego vieportu,
  craftBelowScene=true; first-run scena też dominuje (welcome-card = jednorazowy). `wave1_meadow_returning.png`.
- **TASK 2 — craft otwiera się na POCZĄTKU (nie na końcu).** Bug: `openModal(cs, craftPathClose)` fokusował dolny
  przycisk „Back to the garden" → przeglądarka scrollowała `#craftSheet` (`overflow-y:auto`) na dół (repro: scrollTop
  skakał do 985). Fix w `openModal` (~3781): `el.scrollTop=0` przed/po fokusie + `focus({preventScroll:true})`;
  `openCraftPath` fokusuje teraz KONTENER (`openModal(cs,cs)`), a `#sheet`/`#craftSheet`/`#craftPick` dostały
  `tabindex="-1"`. Focus-trap+Escape zachowane. Zweryf. 390px: road scrollTop=0, konstelacja+nagłówek w widoku;
  picker scrollTop=0, nagłówek w widoku. `wave1_craftroad_open.png`.
- **TASK 3 — nici craftu na spokojnym cyklu 3-tygodniowym, JEDNAKOWYM dla wszystkich.** `craftThread()` (~1454):
  nowe `craftCycleIdx()`=`((isoWeek()%3)+3)%3` (0/1/2, powtarza się co 3 tyg) + `craftCycleSlice(pool,size)` (3
  okna po puli, 1/tydzień). Tier 1 (7 ręcznych, po 3 nici/etap) = już `isoWeek%3`. Tier 2 (katalog `soc:`) i Tier 3
  (`general`) znormalizowane do tego SAMEGO cyklu (było: dryf przez całą pulę). Powrót po przerwie = po prostu nić
  bieżącego tygodnia, nigdy „ominąłeś". ZERO copy presji. Zweryf. isoWeek N/N+1/N+2/N+3: zmiana co tydzień + N+3==N
  dla wszystkich 3 tierów; skan słów-presji = 0.
- **TASK 4 — splash iOS (v55 dodał ikony, pominął splash).** Head miał już `apple-mobile-web-app-capable=yes`,
  `status-bar-style=default` (pasuje do jasnego papieru), `theme-color=#FBF7F2`, `apple-touch-icon`. Dodane 12 PNG
  `garden/splash/` (marka `icon.svg` wyśrodkowana na papierze `#FBF7F2`, portrait, per-urządzenie: SE/8+/X…16 Pro
  Max + 3 iPady), zrasteryzowane headless Chrome (CDP device-metrics, dokładne px), 12 tagów
  `<link rel="apple-touch-startup-image" media=…>` w head. Pełna weryfikacja on-device iOS niemożliwa headless —
  potwierdzone: PNG renderują (Read), wymiary dokładne, media-query poprawne. Generator `gen_splash.mjs`.
- **TASK 5 — sidecary wersjonowane w cache (koniec honor-system stale).** `sw.js` przepisany: (a) `install` pobiera
  ASSETS z `{cache:'reload'}` (świeży CACHE = świeże pliki z sieci, nie z HTTP-cache); (b) same-origin sidecary =
  **stale-while-revalidate** (cache natychmiast + rewalidacja w tle → nowy deploy łapany przy następnym ładowaniu,
  offline dalej z cache); (c) cross-origin (Supabase) = pass-through→cache; HTML dalej network-first; `activate`
  kasuje tylko stare cache. CACHE `v58`, ASSETS=43 (dodane 12 splash). Zweryf. LIVE (lokalny http+SW):
  aktywny tylko `meadowlark-garden-v58`/43 assety, SWR podaje stary natychmiast → cache aktualizuje się do nowego
  sidecara w tle, offline serwuje sidecary+index.html z cache. Harness `sw_verify.mjs`+`verify_wave1.mjs`.

**v59** (2026-07-08): **WAVE 2 redesignu (2 z 3) — NIEBO Look Back jako immersyjny, emocjonalny BOHATER ekranu.**
(Wave 1=meadow-first=v58; Wave 3=SVG→canvas perf=osobno.) Problem właściciela: niebo było „stopką" pod długim
scrollem kart + statyczne. Zmiany (wszystko w `renderPath` + CSS `.lb-sky*` + gating motion):
- **A. HIERARCHIA — niebo NA GÓRZE, prawie full-bleed.** `view-path` przebudowany: `.lb-sky` (hero
  `height:clamp(480px,76vh,780px)`) = PIERWSZA rzecz pod nagłówkiem; `#pathWrap` `position:absolute;inset:0` wypełnia
  hero; **viewBox liczony z realnego aspektu kontenera** (`H=clamp(W*chP/cwP,620,1600)`) → na telefonie WYSOKIE
  pionowe niebo („wyjście na dwór, spojrzenie w górę"), na szerокim ekranie szersza kopuła, bez letterboxa/dystorsji.
  Nagłówek (eyebrow „Look back, gently" + h1 „The sky was always full" + ciepła linia „Every night you came back is
  still up there. Come look up a while.") + `#cairnCap` = NAKŁADKI nad niebem (scrim gradienty, `pointer-events:none`).
  Karty refleksyjne (then-now/memory/compass/pressed/chapters/keepsake/letters/„garden noticed") przeniesione POD niebo
  do `.pad` (dalej działają). Zweryf. 390px: `skyTop=55, skyH=575, vp=757 → 76% pierwszego vieportu`.
- **B. NIEBO ODDYCHA i ŻYJE (immersyjne, motion-gated, deterministyczne).** GŁĘBIA: warstwa gwiazd DALEKA (160 słabych)
  + BLISKA (42 jaśniejszych, `.sky-near` dryf) → paralaksa; nebula/milky-way wash (`#skyNeb`, `.sky-neb` obrót+dryf).
  WOLNE ŻYCIE: `.twinkle` (mniejszość), RZADKA spokojna spadająca gwiazda (`.sky-shoot` cykl 46s, streak ~3s, NIE nagroda),
  aurora-wstęga nisko nad horyzontem (`.sky-aurora` dryf), księżyc z ŻYWYM halo (`.sky-halo` oddech). ODDECH: `.sky-breath`
  (nakładka radialna, opacity .34↔.62, `opacity=.42` baza dla stanu still). CZAS: niebo czyta `dayPhase()` — świt=ciepła
  poświata horyzontu (rosa `SKY.dawn[0]`), noc=najgłębsza chłodna, zmierzch/golden=złota ciepłota, dzień=chłodny błękit
  (paleta z `SKY[phase]`, `warm`/`glowO` per faza; ZERO równoległego zegara). POWRÓT: `.rt-reveal` (gwiazdy delikatnie
  „osiadają" przy każdym otwarciu, re-trigger `offsetWidth`), najnowsza = „tonight's light" (`.sky-tonight` puls).
- **KONTRAKT DUSZY nienaruszony:** 1 powrót=1 gwiazda w akcencie obszaru; ZERO liczb care/osi/startu/mety/gamifikacji;
  tap gwiazdy (klawiatura Enter/Space) → własne słowa wpisu w podpisie (`fuzzyGroup`); „niebo pełniejsze im więcej
  powrotów" = gęstość, NIE licznik. Motion-gated: `.sky-breath/-halo/-neb/-near/-aurora/-shoot/-tonight/.rt-reveal`
  dodane do `body.motion-calm` ORAZ `@media(prefers-reduced-motion)` (`animation:none!important`) → w spokoju niebo
  renderuje się w PEŁNI jako nieruchomy obraz (zweryf. `neb anim=none`, spadająca gwiazda ukryta). Nowy resize-handler
  `refitSky()` (debounce 220ms) przelicza aspekt gdy okno zmienia kształt przy otwartym Look Back.
- Zweryf. headless DSF2 (`shoot_lb.mjs`/`shoot_lb2.mjs`/`zero_check.mjs`): mobile 390px (hero=76% vieportu), gęstość
  8/20/40 powrotów (rośnie, spokojna, twarz księżyca czysta), fazy dawn/dusk/day/night (wyraźnie różne), tap→słowa,
  calm+reduced-motion (pełny render, ruch stop), 0 powrotów (ciepła pustka bez błędu), szeroki 560px, karty pod niebem
  renderują, `motion_probe.mjs` bez regresji fableCollect, 0 błędów konsoli. CACHE `sw.js` `v59` (ASSETS bez zmian).

**v60** (2026-07-08): **WAVE 3 redesignu (3 z 3, ostatnia) — PERF: statyczny dekor sceny SVG→`<canvas>`, bez zmiany wyglądu.**
Problem właściciela: ~15k węzłów SVG (drzewa growth-atlas + flora env + las/midground) laytowanych/kompozytowanych na KAŻDĄ klatkę
animacji i scroll (+ drogi filtr blur `glDof` na żywo) = zacinanie na telefonie. Rozwiązanie: `renderMeadow` rozbity na DWIE skoordynowane
warstwy w `.scene-plane` (ten sam box PANO, ten sam zoom/scroll — szczegóły w §3):
- **`<canvas>` = statyczny bitmapowy dekor** (niebo/słońce-księżyc/gwiazdy, wzgórza, `drawForest`, mgła, `drawMidground`, flora env
  `env-<id>`, przejścia, drzewa `tw-<id>`, sezonowy scatter). Generowany DALEJ jako string SVG (reużyte CAŁE stare rysowanie), potem
  **rasteryzowany przez `Image`→`ctx.drawImage`** (`rasterScene()`). Backing @DPR (≤3) z limitem 16M px (pod iOS ~4096²), CSS-skalowany zoomem;
  re-rastr TYLKO na zmianę `sceneSig()` albo zoom. `hiddenDefs()` inline'uje globalne defy (`#glDof`/`#daisy`/`#flower6`/`#bell`/gradienty `gl*`)
  bo raster = samodzielny dokument. **Blur `glDof` + gradienty rasteryzują się 1:1** (zweryfikowane).
- **overlay `<svg>` = warstwa ŻYWA** (larki/skybirdy, iskry poświaty `glw-<id>`, **zwierzęta `g.fable`**, pyłki/świetliki, sezonowe spadające
  cząstki, golden-wash + veil nocny [tintują też zwierzęta — dlatego w overlayu NAD nimi], **kolumny-tapy** [klik + a11y]). **Silnik walkera
  (`fableCollect`/`fableTickNow`) NIETKNIĘTY** — dalej pyta `#sceneWrap svg`/`g.fable`; overlay = jedyny svg w wrap.
- **Tend = płynny (bez flasha):** `growHabitat(id)` re-rasteruje TYLKO canvas z cross-fade przez tymczasowy `canvas.scene-fade`
  (opacity 0→1, potem blit do main) — tylko pielęgnowany narożnik widocznie się zmienia; zwierzęta idą dalej. `patchTree`/`patchEnv` USUNIĘTE.
- **KONTRAKT WIZUALNY zachowany:** przed/po (dzień+zmierzch, low+full care, zima/jesień, calm) NIEODRÓŻNIALNE. **Kompromis (motion-only,
  klatka statyczna identyczna):** kołysanie drzew/kwiatów przejść (`.sway`) i migotanie gwiazd (`.twinkle`) ZAMROŻONE na canvasie; żywy klimat
  niosą dalej zwierzęta/ptaki/larki/pyłki/świetliki/spadający śnieg. **Node-count: statyczny dekor w żywym DOM 3682→56 (full) / 1967→56 (low)**
  (→ 1 canvas + 56 lekkich węzłów overlay; flipbooki zwierząt ~3828 bez zmian, MUSZĄ zostać żywe). `renderMeadow(true)` sync 12.8ms→4.5ms.
- Zweryf. headless DSF2: parity dzień/zmierzch/low/full (`wave3.mjs`), tap→tend + cross-fade + poświata + zoom-align (dx=0) + canvas nie-tainted +
  reduced-motion (`verify_wave3.mjs`), `motion_probe.mjs` (wszystkie zwierzęta go=Y, pozycje zachowane 1:1 przez rebuild — fix v52 trzyma),
  zima/jesień/calm (`season_check.mjs`), 0 błędów konsoli w pełnej turze. CACHE `sw.js` `v60` (ASSETS bez zmian — wszystko inline w index.html).
