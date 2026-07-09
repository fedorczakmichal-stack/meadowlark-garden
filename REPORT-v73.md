# Raport v73 — paczki assetów Claude Design + noc ogrodu (2026-07-09)

**Podgląd live:** https://fedorczakmichal-stack.github.io/meadowlark-garden/garden/
**Commit:** `8958bb9` (kod v73; finalizacja raportu w commicie następującym)
**Pliki zmienione:** `garden/fable-animals.js` (przebudowany z modułów ESM paczki, 4062 l.), `garden/index.html` (port GA: korony hull, 20 krzewów, kamienie, 3 warstwy traw; nowa obsada dzień/zmierzch/noc), `garden/sw.js` (CACHE→`v73`), `HANDOFF.md`, `shots/v73/*`, `REPORT-v73.md`.
**Odświeżenie cache:** otwórz apkę i odśwież raz — SW `v73` pobierze świeże pliki w tle; przy następnym otwarciu apka sama się przeładuje. Awaryjnie: `?fresh=1`.

## Użyte assety z paczek

**Zwierzęta** (`Grafiki zwierząt do animacji-handoff.zip`, moduły `animals-fable/*.js` — źródło prawdy; bundle w paczce jest starszy):
- Silnik przebudowany: **30 gatunków**, każdy z kompletem ruchów paczki, w tym **nocne pozy** `sleep`/`roost`/`rest` (flaga `night`).
- **Poprawione ważki (wymóg)**: nowy **dragonfly** (Anax imperator — zielony tułów, błękitny odwłok, użyłkowane skrzydła) zastąpił starą płaską wersję (stary art nie jest już nigdzie renderowany — moduł nadpisany w silniku); do sceny doszły **darter** (Sympetrum — perch/sally przy wschodnich trzcinach) i **demoiselle** (świtezianka — trzepocze nisko nad wodą).
- Nowe w rejestrze, jeszcze nieużyte w scenie: heron, swallow, kestrel (+cat/dog/horse/boar) — dostępne na przyszłość.
- Zachowane patche ogrodu: tłumienie bobu gaitu pod reżyserem (`__FABLE_ROAM`/`laneDy`), guardy `__FABLE_NO_TICKS`, doportowany `stand` bociana (moduł ESM go nie ma, a tabela zachowań wymaga).

**Rośliny** (`Rosliny-handoff.zip`, `The Growth Atlas.dc.html`):
- **Korony drzew**: nowa baza `hull()` — pełne, „bez dziur" korony z ciemną pod-koroną (zachowany jesienny fix v68).
- **Krzewy (20 gatunków w atlasie), użyte selektywnie**: Home = bukszpan·hortensja·bukszpan·lilak·bukszpan (zamiast starych elips); Connection = **głóg + bez czarny** (prawdziwa „white-blossom thicket": białe kwiecie wiosną/latem, owoce jesienią); Meaning = 2 kępy **wrzosu** na wzgórku; Craft = **budleja** („motyli krzew") za ulami; solo: **dereń** na zachodnim brzegu strumienia (**czerwone nagie pędy zimą, tuż przy wodzie**). Każda instancja ma inną sylwetkę (seedowana wariacja). Dalszy plan celowo pozostał uproszczony (model głębi).
- **Kamienie**: do rozsypu weszły wyłącznie **zwykłe kamienie łąkowe** — krzemień, granit, łupek, piaskowiec + nowe: kreda, wapień, zlepieniec, gnejs (z żyłkami), żelaziak; **kryształ i ametyst usunięte z rozsypu**. Celowe pojedyncze: przy stopie ścieżki (×2), na brzegu strumienia, na rancie stawu, na stokach wzgórka. Menhiry/dolmeny/mur/bazalt/obsydian/agat z paczki **świadomie nieportowane** (spokój > ozdoba). Czapy śniegu/szron zimą — automatycznie z logiki sezonów.
- **Trawy — 3 warstwy**: drobna rzadka warstwa w tle (mniejsza, cichsza), zagęszczony dywan środkowy, i **nieliczne bogate kępy atlasowe z kłosami** (meadow/fescue/fountain) w pierwszym planie — głębia zamiast ściany zieleni.

## Noc ogrodu (nie przyciemniony dzień)
- **Obsada nocna jest osobna i rzadsza**: czuwają nokturnalne — lis, jeż, mysz, ślimak, **żaba w pozie `croak`** i sowa na gałęzi; **śpią w pozach paczki**: kaczka z głową na grzbiecie dryfuje po stawie, bocian na jednej nodze w płyciźnie, ptaszek śpi na koronie lilaka, na której o zmierzchu śpiewał, ryba osiada głębiej (przygaszona), ważki **roostują** na trzcinach i lawendzie.
- Znikają do świtu: jelenie, niedźwiedź, królik, żółw, biedronka, wszystkie motyle i pszczoły.
- Zero nowego mechanizmu animacji — te same floats/flipbooki; `prefers-reduced-motion` i tryb Calm zatrzymują wszystko jak dotąd.
- O zmierzchu bonus: ptak śpiewa z korony lilaka (`sing`), zanim tam zaśnie.

## Wyniki testów (file://, headless Chrome + CDP, 390×844@3)
- **Macierz**: 5 kombinacji sezon×pora (lato-dzień, zima-dzień, jesień-wieczór, wiosna-rano, noc) × 7 kamer siedlisk + pełny/pusty rozwój = 38 zrzutów; 0 błędów konsoli we wszystkich fazach.
- **Harness ruchu**: DZIEŃ — 14 walkerów × 120 s: **0 NaN, 0 wyjść z rewiru, 0 moonwalku, 0 obrotów w ruchu**; NOC — sowa/lis/jeż/mysz/ślimak × 60 s: czysto. Zwierzęta nie teleportują się (snapshot `id|x|off` przeżywa rebuildy) i nie wchodzą w drzewa/wodę/rewiry (strefy z v72 zachowane; nowe kamienie i kępy respektują `FABLE_RUNS`).
- **Panel sędziów** (2 niezależne przeglądy wizualne, 22 ustalenia) → naprawione: „gołe pręty” trzcin zastąpione atlasową trawą `reed` (nocą przygasa jak reszta), darter siedzi na trzcinie (dzień `perch` / noc `roost`), hawker nad samym korytem, śpiący ptaszek na koronie lilaka (o zmierzchu tam śpiewa; w lasku ginął w ciemnej sylwecie poza kadrem), sowa w kadrze Meaning (od v49 wisiała między kadrami kamer!), dereń na zachodnim brzegu strumienia (pełny kadr Future; samotna kalina usunięta — martwa strefa między kadrami klipuje wszystko), nocna ryba głębiej/ciemniej. Odrzucone jako decyzje produktowe: owady i zwierzęta całoroczne zimą, niezamarzający staw, kwiaty zimą (kontrakt „zima = odpoczynek, nie strata”, v66).
- Zrzuty przed/po: `shots/v73/` (`before-*` = stan v72).

## Ryzyka / do pilnowania
1. **Paczka zwierząt: bundle ≠ moduły** — przy kolejnych paczkach zawsze porównać `animals-fable-bundle.js` z `animals-fable/*.js`; składać z MODUŁÓW (skrypt-przepis w HANDOFF v73).
2. **Patche ogrodu w silniku** (laneDy/NO_TICKS/stork-stand) — przy każdej wymianie silnika trzeba je re-aplikować; lista w HANDOFF.
3. `FABLE_RUNS` nadal wymaga ręcznej synchronizacji z CAST (teraz także z warstwą przednich traw).
4. Krzewy liściaste zimą są nagie (spójne z drzewami v66); jeśli Michał woli „wiecznie zielony" ogród, dobrać zimozielone zamienniki (holly/kamelia/mahonia czekają w atlasie).
5. Nocna obsada jest zaszyta w `renderMeadow` — nowe zwierzę wymaga decyzji „dzień/zmierzch/noc".
6. **Zima celowo nie wyłącza owadów/bociana/żaby ani nie zamraża stawu** (kontrakt v66: „zima = odpoczynek, nie strata”) — świeże oko czyta to jako błąd sezonowości; ewentualna „prawdziwa zima” to osobna decyzja produktowa.
7. Pages bywa wisi w „building" — nudge `gh api -X POST …/pages/builds`.
