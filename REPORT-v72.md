# Raport v72 — HUD · bliż-głębia · Look Back (2026-07-09)

**Podgląd live:** https://fedorczakmichal-stack.github.io/meadowlark-garden/garden/
**Commit:** `83638b7` (kod v72; raport w commicie następującym)
**Pliki zmienione:** `garden/index.html` (CSS+markup+JS), `garden/sw.js` (CACHE→`meadowlark-garden-v72`), `HANDOFF.md`, `shots/v72/*` (zrzuty przed/po), `REPORT-v72.md`.

## Jak odświeżyć cache na telefonie
1. Otwórz apkę (PWA lub Safari) i **odśwież raz** — service worker zobaczy nowy `sw.js` (`v72`), pobierze świeże pliki w tle.
2. Przy **kolejnym otwarciu** (lub drugim odświeżeniu) nowa wersja przejmuje kontrolę — apka sama się przeładuje (`controllerchange`).
3. Jeśli uparcie widać stare: Ustawienia → Safari → Zaawansowane → Dane witryn → usuń `fedorczakmichal-stack.github.io`, albo otwórz z dopiskiem `?fresh=1`.

## 1. Meadow: rozplątany HUD
- `#habDots` = **smukły wskaźnik miejsca na samym dole** (bez szklanej pigułki): kropki 7 px z ciemnym halo i obrysem
  (czytelne na trawie i na niebie), aktywne siedlisko = belka akcentu; **touch-targety 40 px** zachowane; safe-area iOS.
- `#drawerHandle` („Tend one small thing") **przeniesiony do górnego HUD** obok furtki: ≥480 px pełna etykieta,
  <480 px „Tend", <360 px sama ikona (aria-label zawsze pełny). Jedna akcja, zero duplikatów.
- Zoom w prawym dolnym rogu, podniesiony znad krawędzi. **Żadna pionowa wieża kontrolek nie zasłania łąki** —
  środek dolnej krawędzi zajmuje wyłącznie rządek kropek (~40 px wysokości).
- Widoki wewnętrzne: cream-scrim pod pływającymi pigułkami („Back to the meadow"/„If today is heavy") —
  przewijany tekst już nie koliduje.

## 2. Scena: model bliż-głębi
- **Sort malarski**: cała obsada rysowana od najdalszych (najmniejsze y) do najbliższych — bliższe zwierzę zawsze
  przechodzi PRZED dalszym (naprawiona m.in. ryba rysowana na żabie).
- **Pasy głębi**: FAR — jelenie/niedźwiedź na stoku (dalszy jeleń **mniejszy**: sc .58 vs .74 — koniec odwróconej skali);
  MID — motyle/pszczoły/ważka przy koronach; NEAR — walkery w otwartym przednim planie (y≈500-580).
- **Rewiry bez kolizji**: każdy walker ma pas ziemi wolny od pni, wody, ścieżki, rabat i innych zwierząt
  (fox/hedgehog/mouse/rabbit/turtle/stork/frog/snail — szczegóły w HANDOFF). Bocian celowo **brodzi** w strumieniu;
  ślimak przechodzi **przed** stawem, nie po tafli; mysz patroluje stopę ścieżki.
- **Kamienie**: dalekie nie wpadają już w strumień/staw/ścieżkę i nie zbijają się w grupki; bliskie omijają
  dodatkowo rewiry zwierząt (stała `FABLE_RUNS` — utrzymywać w sync z CAST).
- **Cienie kontaktowe** dodane krzakom Home i ulom Craft; **sowa dostała gałąź** (nie lewituje na koronie lasu).
- **Okludery**: 10 kęp traw w warstwie żywej PONAD zwierzętami — walker widocznie przechodzi za roślinnością
  (prawdziwa głębia bez wracania do żywego SVG); tapy siedlisk pozostają na wierzchu.

## 3. Look Back: jedno żywe spotkanie naraz
- **Tap gwiazdy** → gwiazda rozświetla się, a w niebie pojawia się mała ciemna karta ze wspomnieniem
  (cytat + obszar · przybliżona data) i akcjami: **Press this** (zasusz jako kwiat) · **Another light** (kolejne
  wspomnienie) · ✕. Escape zamyka; klawiatura działa (gwiazdy tabbable, Enter/Spacja).
- Gwiazdy-powroty są teraz **wyraźnie cieplejsze i większe** od gwiazd tła i nie toną w mgiełce horyzontu.
- Pod niebem: **jedna ciepła linia** (cotygodniowa obserwacja ogrodu albo zdanie „Since …") + **jeden rytuał naraz**
  (przybyły list ▸ pytanie tygodnia ▸ nic) + **zwijane sekcje** (How it's grown · Chapters · Pressed flowers ·
  Letter · Keepsake). Ściana kart zlikwidowana; puste sekcje się nie pokazują.
- **Pusty stan** = jedno zdanie + przycisk „Tend one small thing →" (wraca na łąkę). Zdublowane zapewnienia
  („not a race", potrójne „nothing lost") usunięte — zostało po jednym.
- Bez streaków, liczników i presji — kompas nadal raz w tygodniu i w pełni odrzucalny.

## 4. Wyniki testów (file://, headless system Chrome + CDP)
- **Ruch zwierząt** (120 s symulacji, hook `__fableTest`): 15 walkerów — **0 NaN · 0 wyjść z rewiru · 0 moonwalku ·
  0 obrotów w ruchu**.
- **Konsola**: 0 błędów/ostrzeżeń we wszystkich sesjach (meadow, Look Back ×3 stany, macierz sezonów, wąski ekran).
- **HUD 390×844@3 i 320×693@2**: brak nakładek i poziomego scrolla; kropki na dole (y≈798-838), uchwyt Tend w górnym
  rzędzie, zoom nad krawędzią; tap w siedlisko działa też przy zoomie (elementFromPoint→`treeTap`).
- **Look Back**: pusty (zaproszenie+przycisk, foldy ukryte, brak podpowiedzi „tap a light"), 2 wpisy (2 gwiazdy,
  bez rytuału), 14 wpisów (gwiazdy+rytuał+foldy; meet-karta: press/another/close/Escape/Enter — wszystko ✓).
- **Macierz scen**: 5 kombinacji sezon×pora×rozwój × 3 kamery — zrzuty ocenione przez panel 3 niezależnych recenzji;
  wszystkie zgłoszone problemy naprawione (zoom przy krawędzi, kontrast kropek, zbyt słabe gwiazdy-powroty,
  scrim nagłówka, żaba↔kaczka).
- Zrzuty przed/po: `shots/v72/` (`before-*` = v71).

## 5. Ryzyka do okresowego przypominania
1. **`FABLE_RUNS` musi być ręcznie synchronizowane z CAST** — przesunięcie rewiru zwierzęcia bez aktualizacji stałej
   pozwoli bliskim kamieniom wyrosnąć pod nowym rewirem.
2. **Okludery i rewiry są ustawione pod obecne współrzędne env** — zmiana pozycji rabat/wody/ścieżki wymaga
   powtórzenia passu (lista stref w HANDOFF §v72).
3. **Ekrany <360 px**: uchwyt Tend = sama ikona; jeśli dojdzie kolejna kontrolka do górnego HUD, trzeba przeliczyć
   breakpointy (wolna przestrzeń między furtką a „heavy" ~170 px na 390 px).
4. **Staw świeci nocą** (celowo teal, nie zamarza) — decyzja produktowa z v66 wciąż otwarta; nocą kontrastuje mocno.
5. **Weryfikacja wąskich viewportów**: `--window-size` poniżej 500 px NIE działa w headless Chrome —
   zawsze `Emulation.setDeviceMetricsOverride` (zapisane w HANDOFF §4).
6. **Pages potrafi wisieć w „building"** — po pushu sprawdzić `sw.js` na live; nudge: `gh api -X POST …/pages/builds`.
7. **Kolizja z Cursorem**: przed każdą pracą `git fetch` + merge; push na `main` bywa odrzucony przez jego sync-bota.
