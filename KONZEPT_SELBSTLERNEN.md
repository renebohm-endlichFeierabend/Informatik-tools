# KI-gestütztes Selbstlernprogramm Java — Didaktisches Konzept

Ein geführtes Selbstlernangebot für **Java in der gymnasialen Oberstufe
(Kernlehrplan NRW)**, aufbauend auf den vorhandenen Werkzeugen dieses
Repositorys und auf dem Schulserver mit Backend.

> **Status:** Konzeptentwurf, noch nicht umgesetzt. Die didaktischen
> Festlegungen sind Vorschläge zur Abstimmung. Recherchestand:
> 04.08.2026.

**Die anderen Dokumente:**

| Datei | Inhalt |
|---|---|
| [`KONZEPT_SELBSTLERNEN_TECHNIK.md`](KONZEPT_SELBSTLERNEN_TECHNIK.md) | Infrastruktur: Server, Schnittstelle, Datenmodell, KI-Gateway — als Auftrag formuliert (siehe 2) |
| [`apps/javawelt/KONZEPT_AUFGABEN.md`](apps/javawelt/KONZEPT_AUFGABEN.md) | Aufgaben *innerhalb* der Entwicklungsumgebung: Teilszenarien, Checks, visuelles Feedback, Hilfestufen, Gamification. **Bereits entschieden**, wird hier eingebettet, nicht neu verhandelt |
| [`apps/javawelt/ENTWICKLUNG.md`](apps/javawelt/ENTWICKLUNG.md) | technischer Stand der Lernumgebung |

---

## 1 Ausgangslage

### Was schon da ist

| Baustein | Zustand | Rolle im Selbstlernprogramm |
|---|---|---|
| **JavaWelt** (`apps/javawelt/`) | in Betrieb, echtes Java per CheerpJ, 7 Szenarien, NRW-Klassenbibliothek, SQL | **Der Arbeitsplatz** für Programmieraufgaben |
| **Java-Analyse-Tool** (`java_analyse_tool.html`) | in Betrieb, OpenRouter, kennt die NRW-Klassen-APIs | Vorlage für die KI-Anbindung; wird durch das Server-Gateway ersetzt |
| **Aufgabenkonzept** (`KONZEPT_AUFGABEN.md`) | entschieden, Umsetzung in Phasen | Teilszenarien, Checks, Hilfestufen 0–4 |
| **Schulserver mit Backend** | im Aufbau | Lernstand, Gateway, Lehrkraft-Sicht |

### Was der Server ändert

Drei Kompromisse des bisherigen Konzepts fallen weg:

1. **Der API-Schlüssel muss nicht mehr ins Frontend.** Aktuell setzt
   `.github/workflows/deploy.yml` das Secret `OPENROUTER_KEY` per `sed`
   in `java_analyse_tool.html` ein — der Schlüssel steht damit im
   Klartext im öffentlich abrufbaren HTML. Für Einzelnutzung ein
   Kostenrisiko, für Klassensätze untragbar.
2. **Der Lernstand bleibt bestehen**, geräteunabhängig. Ein geführter
   Einstieg („was war letztes Mal?") braucht ein Gedächtnis.
3. **Die Lehrkraft-Sicht ist nicht mehr zurückgestellt.**

Was der Server **nicht** ändert: Java läuft weiter im Browser
(CheerpJ). Ein serverseitiger Java-Runner bleibt draußen.

### Vorbedingung, die noch offen ist

`ENTWICKLUNG.md`, offener Punkt 1: **Läuft CheerpJ im Schulnetz auf dem
iPad?** Solange das ungeprüft ist, ist unklar, ob die Lernumgebung im
Vollbetrieb oder im Notbetrieb landet. Der Test steht vor allem anderen.

---

## 2 Arbeitsteilung

Das Projekt hat zwei Stränge, die getrennt voneinander vorankommen:

| Strang | Wer | Ergebnis |
|---|---|---|
| **Didaktik und Inhalte** | Lehrkraft, gemeinsam erarbeitet | dieses Papier, Bausteine, Aufgabenformate, Hilfen, Prüffälle |
| **Infrastruktur** | ein Schüler als Projektarbeit | Server, Schnittstelle, Datenhaltung, Gateway nach [`KONZEPT_SELBSTLERNEN_TECHNIK.md`](KONZEPT_SELBSTLERNEN_TECHNIK.md) |

Das hat Folgen für die Form beider Papiere: Das Technikpapier ist als
**abgeschlossener Auftrag** geschrieben — Anforderungen, Schnittstelle,
Abnahmekriterien, ausdrückliche Nicht-Ziele —, damit daran ohne
Rückfragen zu jedem Detail gearbeitet werden kann. Dieses Papier
beschreibt, *was* das System didaktisch leisten soll, und legt die
Datenfelder fest, die dafür gebraucht werden.

**Die Schnittstelle ist der Vertrag.** Solange sich beide Seiten an die
in Abschnitt 5 des Technikpapiers festgelegten Endpunkte halten, können
Inhalte und Infrastruktur unabhängig entstehen — und die Inhalte lassen
sich vom ersten Tag an gegen einen Attrappen-Server entwickeln.

**Zwei Punkte, die aus der Konstellation folgen** und im Technikpapier,
Abschnitt 9, ausgeführt sind: Ein Schüler, der die Infrastruktur baut,
arbeitet **ausschließlich mit Testdaten** und bekommt **keinen Zugriff
auf Produktivdaten** von Mitschülern. Und die Verantwortung für den
Betrieb liegt nicht bei ihm, sondern bei der Schule. Beides ist keine
Misstrauensfrage, sondern folgt daraus, dass hier Daten Minderjähriger
verarbeitet werden.

---

## 3 Leitbild: die Lernsitzung als geführter Zyklus

Der Ablauf soll sich wie Unterricht anfühlen: erst sprechen und
anknüpfen, dann arbeiten, dann sichern. Das ist die klassische
Artikulation einer Stunde, für eine Person.

| # | Phase | Ort | ca. | Wer führt |
|---|---|---|---|---|
| 1 | **Anknüpfen** — Rückblick, 2–3 Wiederholungsfragen | Chat (groß) | 3–6 min | Tutor fragt |
| 2 | **Zielklärung** — was heute dran ist und warum | Chat (groß) | 1–2 min | Tutor schlägt vor, Lernende:r wählt |
| 3 | **Arbeitsphase** — Format und Ort je nach Diagnose (siehe 5) | Umgebung, Werkbank oder analog | 15–40 min | Lernende:r arbeitet |
| 4 | **Begleitung** — Hilfestufen 0–4 auf Anforderung | Seitenleiste | laufend | Lernende:r fordert an |
| 5 | **Sicherung** — Erkenntnis selbst formulieren, Abgabe | Chat (groß) | 5–8 min | Tutor fragt, Lernende:r formuliert |
| 6 | **Abschluss** — was sitzt, was kommt | Chat (groß) | 1–2 min | Tutor |

Fünf Festlegungen:

**1. Ein Fenster, kein Werkzeugwechsel.** Chat, Werkbank und
Entwicklungsumgebung sind dieselbe Seite. In den Phasen 1, 2, 5 und 6
nimmt der Chat den Hauptteil ein; in Phase 3 schrumpft er zur
Seitenleiste, ohne den Verlauf zu verlieren. Auf dem iPad im Hochformat
(Viewport 810 × 1080 pt) wird er zur einklappbaren Lasche.

**2. Die Wiederholung ist echt, nicht dekorativ.** Die Fragen in Phase 1
kommen aus dem Lernstand: bevorzugt aus den **Fehlermustern der letzten
Sitzungen** und aus Bausteinen, deren letzte Bearbeitung länger
zurückliegt (verteiltes Üben).

**3. Phase 3 ist nicht automatisch die Entwicklungsumgebung.** Was
gearbeitet wird, hängt von der Diagnose ab — eine Programmieraufgabe,
eine Mikroübung an der Werkbank, eine Zustandsverfolgung, eine
Erläuterungsaufgabe. Das ist der Kern von Abschnitt 5.

**4. Sicherung heißt: die Lernenden formulieren.** Der Tutor fragt, die
Lernenden schreiben 1–3 Sätze, *erst danach* schärft der Tutor.

**5. Sitzungen dürfen unfertig enden.** Nach einer eingestellten
Zeitspanne (Standard 45 min) leitet der Tutor zur Sicherung über, auch
wenn nichts fertig ist. Der Stand wird gespeichert und in der nächsten
Phase 1 aufgegriffen.

---

## 4 Die zentrale Architekturentscheidung

> **Adaptivität deterministisch, Formulierung generativ.**

Die Auswahl der nächsten Aufgabe, die Bewertung „bestanden / offen" und
die Fortschreibung des Lernstands entstehen aus **Regeln über
überprüfbaren Fakten** — Parser-Ergebnisse, Weltzustand nach dem Lauf,
Prüffälle, Tabellenvergleiche, SQL-Ergebnisvergleiche. Das Sprachmodell
formuliert, fragt, erklärt und diagnostiziert *Vorschläge*. Es
entscheidet nichts, was den Lernstand verändert.

| Aufgabe | Wer erledigt sie |
|---|---|
| Nächsten Baustein und Format bestimmen | Regelwerk über dem Kompetenzgraph |
| Baustein als belegt markieren | ausschließlich Checks |
| Wiederholungsfragen auswählen | Regelwerk (Fehlermuster + Abstand) |
| Wiederholungsfragen *formulieren* | Modell (oder statischer Pool) |
| Fehlermeldung eindeutschen und verorten | Umgebung (Stufe 0, deterministisch) |
| Hilfestufen 1–3 zum konkreten Code | Modell, im Rahmen der Guardrails |
| Hilfestufe 4 (Letzthilfe) | statisch im Baustein hinterlegt |
| Freitextantworten (erläutern, begründen) einordnen | Modell schlägt vor, **Lehrkraft entscheidet** (siehe 5.7) |
| Note | niemand im System (siehe 11) |

Warum das nicht verhandelbar ist: Nachvollziehbarkeit gegenüber der
Lehrkraft; kein Bestehen durch selbstsicheres Auftreten;
Reproduzierbarkeit; Weiterbetrieb bei Ausfall des Gateways; und jede
Entscheidung, die eine Regel trifft, ist ein Modellaufruf und eine
Datenübermittlung weniger.

---

## 5 Aufgabenformate

Der Teil, der über ein „KI-Chat neben der IDE" hinausgeht — und der über
den Wert des Programms entscheidet.

### 5.1 Warum Vielfalt keine Kür ist

Das Zentralabitur Informatik NRW prüft nicht „Programmieren". Es prüft
eine Reihe von Tätigkeiten, die durch **Operatoren** benannt und drei
**Anforderungsbereichen** zugeordnet sind (I Reproduktion,
II Reorganisation und Transfer, III Reflexion und Problemlösung). Wer
nur Methoden schreibt, übt einen Teilbereich — typischerweise den, der
in der Klausur die wenigsten Punkte trägt.

Die vollständige Operatorenübersicht (`abitur.nrw`, Stand der
vorliegenden Fassung) nennt 26 Operatoren. Die für dieses Programm
tragenden, im Wortlaut:

| Operator | Definition | AFB |
|---|---|---|
| angeben | ohne nähere Erläuterungen und Begründungen aufzählen, nennen | I |
| beschreiben | Sachverhalte oder Zusammenhänge unter Verwendung der Fachsprache in eigenen Worten verständlich wiedergeben | I |
| dokumentieren | Arbeitsergebnisse oder Arbeitsverfahren in strukturierter Form wiedergeben | I–II |
| erläutern | einen Sachverhalt auf der Grundlage von Vorkenntnissen so darlegen, dass er verständlich wird | I–II |
| darstellen | Zusammenhänge oder Sachverhalte in strukturierter Form graphisch oder sprachlich wiedergeben | II–I |
| überführen | eine Darstellung in eine andere Darstellungsform bringen | I–II |
| analysieren | eine konkrete Materialgrundlage untersuchen, einzelne Elemente identifizieren und Beziehungen zwischen den Elementen erfassen | II–III |
| anwenden | ein bekanntes Verfahren in einer neuen Situation verwenden | II |
| ermitteln / bestimmen | mittels charakteristischer Merkmale einen Sachverhalt genau feststellen und beschreiben | II |
| erweitern | eine gegebene Struktur gemäß konkreter Vorgaben ergänzen | II |
| vervollständigen | eine gegebene Struktur gemäß konkreter Vorgaben erweitern oder verändern | II |
| modifizieren | eine gegebene Struktur gemäß konkreter Vorgaben verändern | II |
| vergleichen | nach vorgegebenen oder selbst gewählten Kriterien Gemeinsamkeiten, Ähnlichkeiten und Unterschiede ermitteln und darstellen | II |
| entscheiden | sich begründet bei vorgegebenen Alternativen auf eine Möglichkeit festlegen | II |
| zeigen | eine Aussage, einen Sachverhalt nach Berechnungen, Herleitungen oder logischen Begründungen bestätigen | II |
| entwerfen / entwickeln | herstellen und gestalten eines Systems von Elementen unter vorgegebener Zielsetzung | II–III |
| implementieren | umsetzen eines informatischen Modells oder Algorithmus' in eine Programmiersprache | II–III |
| interpretieren | Sinnzusammenhänge aus Materialien erschließen | II–III |
| modellieren | zu einem Ausschnitt der Realität ein informatisches Modell anfertigen | II–III |
| begründen | einen Sachverhalt oder eine Entwurfsentscheidung durch Angabe von Gründen erklären | III–II |
| beurteilen | zu einem Sachverhalt ein selbstständiges Urteil unter Verwendung von Fachwissen und Fachmethoden formulieren und begründen | III |
| Stellung nehmen | unter Heranziehung relevanter Sachverhalte die eigene Meinung zu einem Problem argumentativ entwickeln und darlegen | III |

Drei Beobachtungen daraus, die die Aufgabenformulierung prägen:

- **„analysieren" steht nie allein.** Die Übersicht sagt es
  ausdrücklich: Der Operator wird immer mit einem zweiten kombiniert,
  der angibt, wie das Analyseergebnis darzustellen ist. Aufgabentexte
  im Programm müssen das nachbilden — „analysieren Sie … indem Sie …"
  bzw. „analysieren und erläutern Sie".
- **„erläutern" ist AFB I–II, nicht III.** Erklären ist die
  Grundtätigkeit, nicht die Kür. Wer nur programmiert, verpasst also
  nicht nur den Anspruchsbereich III, sondern den Normalfall.
- **Zwischen „erweitern", „vervollständigen" und „modifizieren"** liegen
  Nuancen, die in Klausuren tragen. Das Programm sollte diese Wörter
  benutzen, nicht paraphrasieren.

### Was die Klausur wirklich verlangt

Auswertung der Abiturklausur **Informatik LK 2023, HT 1 (GG)** — ein
Turnierverwaltungs-Kontext mit Implementationsdiagramm,
Klassendokumentation im Anhang und Beispieldaten in der Anlage. Die
Punkteverteilung ist das stärkste Argument dieses ganzen Konzepts:

| Teil | Tätigkeit | Punkte |
|---|---|---|
| a) | Implementationsdiagramm **analysieren**, Assoziationen im Sachkontext **erläutern**; anhand von Diagramm und Dokumentation erläutern, wie ein Spiel hinzugefügt und der Sieger eingetragen wird | 4 + 4 |
| b) | Algorithmus zum Filtern **entwickeln** (umgangssprachlich) · Methode **implementieren** | 4 + **6** |
| c) | undokumentierte Methode `wasErmittleIch` auf Beispieldaten **anwenden** und Rückgabe **angeben** · Strategie **erläutern** · Bedeutung im Sachkontext **erläutern** · Stelle einer möglichen NullPointerException **analysieren und erläutern** | 4 + 3 + 2 + 4 |
| d) | Modell um zwei Anforderungen **erweitern** · **erläutern**, wie das Modell sie umsetzt | 6 + 5 |
| e) | zwei Verfahren auf Beispieldaten **ermitteln** (durchspielen) · **beurteilen**, welcher Ansatz besser ist | 4 + 4 |
| | **Summe** | **50** |

**Code schreiben sind 6 von 50 Punkten — 12 Prozent.** Code *lesen*
(Teil c) sind 13. Diagramme und Modellierung (a und d) sind 19. Auf
Beispieldaten durchspielen und beurteilen (c, e) sind 12.

Damit ist die Frage, ob Aufgabenvielfalt „auch noch" nötig ist,
beantwortet: Eine Selbstlernstrecke, die nur Methoden schreiben lässt,
übt gezielt das Achtel der Klausur, das am wenigsten Punkte bringt. Die
Werkbank ist deshalb kein Zusatz, sondern der Hauptteil.

Zwei weitere Muster, die das Baustein-Format übernehmen muss:

- **Die Klausur gibt Material, nicht Aufgabenstellungen allein:**
  Sachkontext (hier: Turnier mit Punktevergabe und Paarungsregeln),
  Implementationsdiagramm, **Dokumentation der verwendeten Klassen**
  (Signatur plus Wirkungsbeschreibung, inklusive Sonderfällen wie
  „wird `null` übergeben, so wird -1 zurückgegeben") und
  **Beispieldaten** zum Durchspielen.
- **Array und Liste im Wechsel:** `Team[] teams` und `List<Team>` in
  derselben Aufgabe, mit `toFirst()`, `next()`, `hasAccess()`,
  `getContent()`, `append()` — genau die NRW-Klassen, die JavaWelt in
  der 📚-Bibliothek mitbringt. Das ist die inhaltliche Brücke zwischen
  „Arrays wiederholen" und „Listen benutzen".

Konsequenz für das Programm: **Jedes Format wird an einen Operator
gebunden.** Damit ist am Baustein ablesbar, welche Tätigkeit geübt wird,
und im Lernstand, welche noch fehlt.

### 5.2 Drei Arbeitsorte

| Ort | Was dort läuft | Warum getrennt |
|---|---|---|
| **Entwicklungsumgebung** (JavaWelt) | Klassen entwerfen, Verhalten programmieren, Datenstrukturen benutzen, SQL ausführen | braucht Projekt, Welt, Objektbank — voller Aufwand |
| **Werkbank** (neu, ohne IDE) | einzelne Methoden lesen, verfolgen, ergänzen, schreiben; Zustandstabellen; Modellierungsskizzen; Zuordnungen | eine Aufgabe, ein Bildschirm, kein Projektaufbau |
| **Analog / Plenum** | Papierskizzen, Struktogramme, Partnerarbeit, Präsentation, Klassengespräch | gehört nicht auf den Bildschirm (siehe 8) |

**Die Werkbank ist der wichtigste Zusatz.** Wer beim Schreiben einer
Methode scheitert, braucht keine neue Spielwelt, sondern zehn Minuten
an genau dieser Schwierigkeit. Ein Szenario zu laden, Klassen anzulegen
und Objekte zu platzieren ist dafür Ballast — und lenkt von der Sache
ab. Umgekehrt gilt: Wer eine Methode isoliert schreiben kann, hat
deshalb noch kein Programm gebaut. Die Werkbank ersetzt die Umgebung
nicht, sie entlastet sie.

**Technisch** nutzt die Werkbank dieselbe CheerpJ-Laufzeit, aber ohne
Welt, Objektbank und Projektverwaltung: Ein verstecktes Testgerüst
kompiliert die eingegebene Methode und ruft sie mit den Prüffällen des
Bausteins auf. Damit gibt es echte Compilermeldungen (Stufe 0 greift
wie gewohnt) bei einem Bruchteil der Oberfläche. Fällt CheerpJ aus,
bleiben die nicht-kompilierenden Formate der Werkbank vollständig
nutzbar — Verfolgen, Vorhersagen, Zuordnen, Lückentext.

### 5.3 Formatkatalog

Zwölf Formate, jeweils mit Operator, Prüfung und Ort. Die Prüfspalte ist
die entscheidende: Wo „exakt" steht, entscheidet eine Regel; wo
„Freitext" steht, sammelt das System und die Lehrkraft sichtet
(siehe 5.7).

| # | Format | Operator (Vorschlag) | Prüfung | Ort |
|---|---|---|---|---|
| F1 | **Methode lesen** — was tut sie, wie heißt sie sinnvoll? | analysieren, interpretieren | Auswahl / Zuordnung, exakt | Werkbank |
| F2 | **Ausgabe vorhersagen** — was gibt der Aufruf zurück? | analysieren | exakter Wertvergleich | Werkbank |
| F3 | **Zustand verfolgen** — Belegung von Array/Liste/Stack nach einer Ereignisfolge | analysieren, darstellen | Tabellenvergleich, exakt | Werkbank |
| F4 | **Fehler finden** — gegebene Methode ist falsch, wo und warum? | analysieren, begründen | Zeilenangabe exakt + Freitext | Werkbank |
| F5 | **Methode ergänzen** — Rumpf mit Lücken | vervollständigen | Prüffälle, exakt | Werkbank |
| F6 | **Methode schreiben** — Signatur und Beschreibung gegeben | implementieren | Prüffälle + Compiler, exakt | Werkbank |
| F7 | **Methode ändern** — Verhalten nach Vorgabe anpassen | modifizieren | Prüffälle, exakt | Werkbank |
| F8 | **Darstellung überführen** — Quelltext ↔ Struktogramm ↔ Beschreibung | überführen | Zuordnung / Sequenzvergleich | Werkbank |
| F9 | **Verhalten programmieren** — im Szenario, sichtbare Konsequenz | implementieren | Weltzustand nach Lauf | Umgebung |
| F10 | **Modellieren** — Klassen, Vererbung, ER-Modell, Automat; auch **Modell erweitern** nach Vorgabe | modellieren, erweitern | Parser-Fakten bzw. Strukturvergleich; ER/Automat teils Freitext | Umgebung / Werkbank |
| F11 | **Datenbank** — Abfrage formulieren, Normalform prüfen | implementieren, begründen | Ergebnistabelle exakt; Begründung Freitext | Umgebung |
| F12 | **Beurteilen** — Verfahren vergleichen, Alternative abwägen, Stellung nehmen | vergleichen, beurteilen, Stellung nehmen | Freitext | Werkbank / Plenum |
| F13 | **Diagramm lesen** — Implementationsdiagramm analysieren, Assoziationen und Multiplizitäten im Sachkontext erläutern, Ablauf aus Diagramm + Dokumentation nachvollziehen | analysieren, erläutern | Zuordnung exakt (welche Assoziation trägt was) + Freitext | Werkbank |
| F14 | **Algorithmus entwerfen** — Lösungsweg umgangssprachlich oder grafisch, **ohne Code** | entwickeln, darstellen | Schrittfolge-Vergleich (Reihenfolge, Sonderfälle) + Freitext | Werkbank |
| F15 | **Prüffälle entwickeln** — zu einer Methode Testfälle angeben, die einen Fehler aufdecken (LK-Schwerpunkt, siehe 12) | entwickeln, zeigen | **automatisch**: der eingegebene Prüffall wird gegen eine absichtlich fehlerhafte Fassung ausgeführt — deckt er den Fehler auf? | Werkbank |

Die Formate F9 bis F11 sind die, die `KONZEPT_AUFGABEN.md` schon
beschreibt („Verhalten programmieren", „Klasse/Vererbung modellieren",
„Datenstruktur nutzen", „SQL/Datenbank", „Modellierung/ER") — inklusive
der dort festgelegten Prüfformen und Letzthilfen. Alles andere ergänzt
Tätigkeiten, die in der Umgebung nicht vorkommen.

**F13 und F14 sind aus der Klausuranalyse nachgetragen** und waren im
ersten Entwurf die zwei echten Lücken:

- **F13 (Diagramm lesen)** trägt in der ausgewerteten Klausur 8 von 50
  Punkten. Modellieren war bisher nur als *Erstellen* vorgesehen (F10);
  geprüft wird aber vor allem das *Lesen* eines gegebenen Diagramms —
  inklusive der Frage, welche Assoziation welchen Sachverhalt
  modelliert und wie ein Ablauf über mehrere Klassen zustande kommt.
- **F14 (Algorithmus entwerfen)** ist in der Klausur ein **eigener
  Arbeitsschritt vor dem Implementieren**, mit eigener Punktzahl
  (4 Punkte, gegenüber 6 für die Umsetzung). Der Kernlehrplan verlangt
  das ausdrücklich: *„entwerfen einfache Algorithmen und stellen sie
  umgangssprachlich und grafisch dar"* (EF) bzw. *„entwickeln iterative
  und rekursive Algorithmen …"* und *„stellen iterative und rekursive
  Algorithmen umgangssprachlich und grafisch dar"* (Q1). Wer sofort
  Code schreibt, überspringt einen prüfungsrelevanten Schritt.

Bei F13 und F14 ist der prüfbare Anteil bewusst schmal (Zuordnungen,
Schrittfolgen, Sonderfälle) und der Freitextanteil groß — es gilt
Abschnitt 5.7.

**F15 ist der Sonderfall mit der elegantesten Prüfung.** Die Aufgabe
lautet nicht „schreibe eine Methode", sondern „gib Prüffälle an, mit
denen du merkst, ob diese Methode falsch ist". Geprüft wird, indem der
eingegebene Prüffall gegen eine **absichtlich fehlerhafte** Fassung
läuft: Deckt er den Fehler auf, ist die Aufgabe gelöst — deckt er ihn
nicht auf, war der Testfall zu schwach. Das ist vollständig
deterministisch, braucht keine Musterlösung und übt genau die
Kompetenzerwartung, die den Leistungskurs vom Grundkurs unterscheidet
(siehe 12): *„testen Programme systematisch anhand von Beispielen und
mithilfe von Testanwendungen"*.

### 5.4 Mikroübungen: Methoden lesen und schreiben

Die Formate F1, F2, F5, F6 sind kurz (3–10 min), einzeln prüfbar und
werden **nicht als Baustein geplant, sondern eingestreut**, wenn die
Diagnose sie nahelegt. Sie haben eine eigene Eigenschaft, die man
ausnutzen sollte: Sie sind **besser automatisch prüfbar als
Programmieraufgaben**. Eine Methode gegen fünf Prüffälle laufen zu
lassen ist eindeutig; „das Szenario sieht richtig aus" ist es nie ganz.

Ein Übungssatz gehört zu einem Baustein, nicht auf einen globalen
Haufen: Zu `q1.arrays.durchlaufen` gehören Lese-, Vorhersage- und
Schreibübungen an Array-Methoden, nicht an Stacks. Damit bleibt die
Diagnose scharf — „Arrays durchlaufen sitzt, aber das Schreiben fällt
schwer" ist eine Aussage, mit der man arbeiten kann.

**Auslöser für eine Mikroübung** (Regeln, nicht Modellurteil):

| Beobachtung | eingestreute Übung |
|---|---|
| zweimal dieselbe Signatur falsch geschrieben | F1 + F6 zum Methodenkopf |
| Aufgabe gelöst, aber erst nach Hilfestufe 3 | F5, F6 zum selben Inhalt in der Folgesitzung |
| Off-by-one oder falsche Schleifengrenze | F2, F3 an derselben Struktur |
| Code läuft, Erklärung in Phase 5 bleibt vage | F1 + F4 zum eigenen Code |
| Baustein liegt länger zurück | F2, F3 als Wiederholung in Phase 1 |

### 5.5 Kontext- und Zustandsaufgaben

Das gewünschte Format F3 verdient eine eigene Beschreibung, weil es die
Klausurnähe herstellt: **Ein Szenario wird erzählt, ein Ausschnitt
Quelltext gegeben, und gefragt ist, welchen Zustand eine Datenstruktur
nach einer Folge von Ereignissen hat — und warum.**

Aufbau, dem Klausurmuster nachempfunden:

1. **Kontext** (3–5 Sätze): Warteschlange an der Ausleihtheke,
   Rückgabestapel, Warenkorb, Vertretungsplan. Fachlich derselbe Stack,
   didaktisch ein Gegenstand, über den man reden kann.
2. **Material**: Klassendiagramm-Ausschnitt oder Methodenrumpf, so knapp
   wie möglich.
3. **Ereignisfolge**: „Zuerst gibt Frau A zwei Bücher zurück, dann holt
   Herr B eines ab, dann ..."
4. **Aufgabe a) — verfolgen** (F3, AFB I–II): Tabelle ausfüllen, Zeile
   pro Ereignis, Spalten je Position der Struktur. Exakt prüfbar.
5. **Aufgabe b) — erläutern** (Freitext, AFB II): „Erläutere, warum das
   letzte zurückgegebene Buch zuerst wieder im Regal steht." Hier fällt
   die Entscheidung Stack gegen Queue — genau die Stelle, an der in
   Klausuren Punkte verloren gehen.
6. **Aufgabe c) — beurteilen** (F12, AFB III, optional): „Die
   Bibliothek überlegt, auf eine Warteschlange umzustellen. Nimm
   Stellung."

Der didaktische Punkt: Teilaufgabe a) ist der **Beleg** (exakt prüfbar,
schreibt den Lernstand fort), b) und c) sind der **Ertrag** — sie
erzeugen genau die Formulierungen, die in Phase 5 gesichert und im
Plenum aufgegriffen werden. Beides in einer Aufgabe, wie in der Klausur.

Zwei Vorteile für die Umsetzung: Zustandstabellen brauchen **keinen
Compiler** (auch im CheerpJ-Ausfall verfügbar), und sie sind
**KI-generierbar mit anschließender Redaktion** — die Ereignisfolge und
die erwartete Tabelle lassen sich maschinell erzeugen und, was
entscheidend ist, maschinell gegenprüfen, indem der Referenzcode
ausgeführt wird.

### 5.6 Formatwahl aus der Diagnose

Das Regelwerk wählt in Phase 2 nicht nur *welchen Baustein*, sondern
auch *welches Format*. Die Rangfolge:

1. Ein Baustein mit offenem **Beleg im Format F9/F10** (Umgebung) ist
   der Normalfall — dort entsteht das eigentliche Können.
2. Sind zu einem Baustein **Fehlermuster** offen, die eine Mikroübung
   adressiert, kommt diese **davor** (5.4).
3. Sitzt ein Baustein programmatisch, fehlt aber der **Erläuterungs-
   oder Beurteilungsanteil**, wird F3/F12 nachgeschoben — mit
   Klausurbezug ausdrücklich benannt („so kommt das im Abitur").
4. Liegt ein Baustein lange zurück, wird er als kurze Wiederholung im
   Format F2/F3 aufgegriffen, nicht neu bearbeitet.
5. Vor Klausuren: Formate nach AFB mischen, mit Schwerpunkt auf den im
   Lernstand schwächsten Operatoren.

### 5.7 Freitext ohne automatische Prüfung

Formate mit Freitextanteil (F4b, F11-Begründung, F12, Erläuterungen)
lassen sich nicht maschinell entscheiden. Regel:

- **Der Status eines Bausteins hängt nur am prüfbaren Anteil.** Ein
  Baustein ohne prüfbaren Anteil erreicht den Status „belegt" nicht
  automatisch — er wird als **„zur Sichtung"** markiert.
- Das Modell darf eine **Einordnung vorschlagen** („trifft den Punkt" /
  „greift zu kurz" / „geht am Kern vorbei" mit einem Satz Begründung).
  Der Vorschlag ist für die Lehrkraft sichtbar und ändert nichts.
- Der Tutor gibt den Lernenden dazu **Rückmeldung**, keine Bewertung:
  eine Rückfrage, ein Gegenbeispiel, ein fehlender Begriff.
- Die Lehrkraft sichtet gesammelt (Liste der offenen Freitexte) und
  setzt den Status. Das ist der eine Punkt, an dem das Programm
  Lehrkraftzeit *braucht* statt spart — und der Punkt, an dem es die
  Klausurvorbereitung wirklich trägt.

---

## 6 Lernstandsmodell

### Zwei Achsen statt einer Liste

Der Lernstand ist eine Matrix aus **Inhalt** (Baustein) und
**Tätigkeit** (Operator/Format). „Vererbung kann ich" ist keine
brauchbare Aussage; „Vererbung implementieren sitzt, Vererbung erläutern
noch nicht" ist eine.

```
                    │ analysieren │ implementieren │ modellieren │ erläutern/
                    │  (F1-F3)    │   (F5-F7,F9)   │   (F10)     │ beurteilen
────────────────────┼─────────────┼────────────────┼─────────────┼────────────
Vererbung           │   belegt    │     belegt     │   belegt    │  Sichtung
Polymorphie         │   belegt    │   in Arbeit    │      -      │    offen
Arrays 1D           │  Fehlermus. │     belegt     │      -      │    offen
Stack               │    offen    │      offen     │      -      │    offen
```

Die Zeilen sind die Bausteine des Kompetenzgraphen, die Spalten die
Operatorgruppen. Die Wegwahl liest beides: horizontal, was noch fehlt;
vertikal, welche Tätigkeit systematisch schwach ist.

### Der Kompetenzgraph

Bausteine mit Voraussetzungen, nicht als lineare Kapitelfolge:

```
  [Klasse & Objekt] ──► [Attribute] ──► [Methoden mit Parametern]
                                              │
                    ┌─────────────────────────┴──────────┐
                    ▼                                    ▼
             [Vererbung]                            [Arrays 1D]
                    │                                    │
                    ▼                                    ▼
        [Polymorphie / dyn. Bindung]              [Arrays 2D]
                    │
                    ▼
        [Referenzen & ContentType] ──► [Stack] ──► [Queue] ──► [List]
```

Damit sind mehrere Wege gleichzeitig offen, Lücken lassen sich mitten im
Kurs nachholen, und der Einstieg an beliebiger Stelle ist möglich —
etwa zur Klausurvorbereitung.

### Was gespeichert wird

Pro Lernende:r, Baustein **und Operatorgruppe**:

| Feld | Beispiel | Zweck |
|---|---|---|
| Status | `offen` / `in Arbeit` / `belegt` / `zur Sichtung` | Wegwahl |
| Belege | „F3-Tabelle exakt, 04.08."; „Weltzustand-Check bestanden" | Nachvollziehbarkeit |
| Fehlermuster | `konstruktor_statt_nenne`, `off_by_one` | Übungsauswahl, Diagnose |
| höchste genutzte Hilfestufe | 2 | Einschätzung der Selbstständigkeit |
| Freitexte | Reflexion, Erläuterungen | Sicherung, Sichtung |
| letzte Bearbeitung | Zeitstempel | verteiltes Üben |

**Fehlermuster sind ein gepflegter Katalog**, keine Freitext-Diagnosen
des Modells. Startbestand aus der Erfahrung in `ENTWICKLUNG.md`:
`super`-Aufruf erwartet, `new Hund("Rex")` ohne deklarierten
Konstruktor, Groß-/Kleinschreibung, fehlendes Semikolon, Endlosschleife
ohne `warte()`, Objektvergleich mit `==`, Signatur abweichend. Neue
Muster ergänzt die Lehrkraft; das Modell darf vorschlagen, nichts
erfinden.

**Nicht erhoben** wird, was nach Leistungsmessung aussieht, ohne
diagnostisch nötig zu sein: keine Bearbeitungsdauer pro Aufgabe, keine
Tastenprotokolle, keine Zahl der Compilerläufe, kein Vergleich zwischen
Lernenden. Dieselbe Argumentation wie in
`apps/geheimschreiber/DIDAKTIK.md`, Abschnitt 9. **Fehlversuche** sind
der Grenzfall: diagnostisch nützlich, als Zahl neben einem Namen
problematisch — Vorschlag: nur über die Lerngruppe aggregiert (offene
Entscheidung, 16).

---

## 7 Baustein-Format

Bausteine und Übungen sind Datendateien, kein Code — damit
Fachkolleginnen sie ohne Programmierkenntnisse anpassen können und alles
versionierbar bleibt.

### Baustein (Umgebung, F9)

```jsonc
{
  "id": "q1.vererbung.polymorphie",
  "titel": "Dieselbe Methode, verschiedenes Verhalten",
  "stufe": "Q1",
  "niveau": ["LK"],                      // spaeter auch "GK"
  "inhaltsfeld": "Daten und ihre Strukturierung",
  "voraussetzungen": ["q1.vererbung.grundidee"],
  "dauer_min": 30,

  "anknuepfen": [
    { "frage": "Was erbt eine Unterklasse - und was nicht?",
      "erwartet": ["Attribute", "Methoden", "nicht: Konstruktoren"] }
  ],

  "teile": [
    { "format": "F9", "operator": "implementieren",
      "ort": "umgebung",
      "teilszenario": "vererbung_tiere_stimmen",
      "auftrag": "Gib Hund und Katze je eine eigene Fassung von gibLaut().",
      "checks": [
        { "art": "parser", "regel": "klasse Hund ueberschreibt gibLaut" },
        { "art": "parser", "regel": "klasse Katze ueberschreibt gibLaut" },
        { "art": "weltzustand", "regel": "konsole enthaelt 'Wau' und 'Miau'",
          "sichtbar": "Beide Tiere zeigen ihre Sprechblase" }
      ],
      "hilfen": {
        "1": "Schau dir an, welche Methode du in Tier vorfindest.",
        "2": "Was muesste in Hund stehen, damit Hund etwas anderes tut?",
        "3": "Eine Unterklasse kann eine geerbte Methode neu schreiben - mit genau derselben Signatur.",
        "4": "geruest:public void gibLaut() {\n  // hier die Ausgabe fuer den Hund\n}"
      }
    },
    { "format": "F12", "operator": "beurteilen",
      "ort": "werkbank", "pruefung": "freitext",
      "auftrag": "In der Tierpension sollen spaeter Voegel dazukommen. Begruende, warum gibLaut() in Tier ueberhaupt existiert, obwohl jede Art es neu schreibt."
    }
  ],

  "reflexion": "Woher weiss Java bei tier.gibLaut(), welche Fassung gilt?",
  "fehlermuster_erwartet": ["signatur_abweichend", "super_aufruf_erwartet"],

  "gk_variante": {                       // spaeter, ohne zweiten Bausteinsatz
    "teile_weglassen": ["F12"],          // Beurteilungsteil entfaellt
    "material_kuerzen": true,            // ein Diagramm statt zwei
    "hilfen_frueher": true               // Stufe 3 ohne Reflexionsschranke
  }
}
```

Ein Baustein hat also **mehrere Teile mit unterschiedlichen Formaten** —
das ist der Unterschied zum ersten Entwurf und die Voraussetzung dafür,
dass Klausurnähe entsteht: implementieren *und* erläutern *und*
beurteilen am selben Gegenstand.

### Übung (Werkbank, F3)

```jsonc
{
  "id": "ue.stack.rueckgabestapel",
  "gehoert_zu": "q1.stack.grundidee",
  "format": "F3",
  "operator": "analysieren",
  "dauer_min": 8,

  "kontext": "An der Ausleihtheke der Stadtbibliothek liegen zurueckgegebene Buecher auf einem Stapel. Frau Ahmed stellt sie spaeter zurueck ins Regal - immer das oberste zuerst.",
  "material": "stack.push(b); stack.pop();",

  "ereignisse": [
    "Rueckgabe: Momo",
    "Rueckgabe: Krabat",
    "Frau Ahmed raeumt ein Buch ein",
    "Rueckgabe: Emil"
  ],

  "erwartet": {
    "spalten": ["unten", "mitte", "oben"],
    "zeilen": [
      ["Momo", "", ""],
      ["Momo", "Krabat", ""],
      ["Momo", "", ""],
      ["Momo", "Emil", ""]
    ]
  },

  "anschlussfrage": "Erlaeutere, welches Buch am laengsten auf dem Stapel liegt - und ob das ein Problem ist.",
  "fehlermuster_bei_fehler": ["stack_queue_verwechselt"]
}
```

### Pflichtbestandteile aus dem Klausurmuster

Aus der Anatomie der ausgewerteten Abiturklausur (5.1) folgt, dass ein
klausurnaher Baustein mehr braucht als Auftrag und Checks. Diese Felder
sind für die Formate F3, F13, F14 und für Gesamtaufgaben **verbindlich**:

| Feld | Inhalt | Vorbild in der Klausur |
|---|---|---|
| `kontext` | Sachkontext in 3–6 Sätzen, mit den Regeln der Domäne | Turnier: Punktevergabe, Paarungsprinzip, Maximalzahl gleicher Begegnungen |
| `diagramm` | Implementationsdiagramm als Bild plus maschinenlesbare Struktur (Klassen, Assoziationen, Multiplizitäten) für die Checks | Abbildung 1 „Teilmodellierung" |
| `klassendoku` | pro Klasse: Signatur **und** Wirkungsbeschreibung, **inklusive Sonderfällen** | „Wird `null` für den Parameter übergeben, so wird -1 zurückgegeben" |
| `beispieldaten` | konkreter Datensatz zum Durchspielen, plus Zwischenergebnisse | Teams, Spiele, Punktestand, Ergebnis von `filtere(...)` |

Die Sonderfälle in der Klassendokumentation sind kein Beiwerk: In der
ausgewerteten Klausur hängen an ihnen sowohl die Implementierung
(Teil b: leere Liste bei ungültigen Parametern) als auch die
Fehleranalyse (Teil c: NullPointerException, wenn die gefilterte Liste
leer ist). Wer Bausteine ohne dokumentierte Sonderfälle schreibt, kann
diese Aufgabentypen nicht stellen.

**Erstellt werden Bausteine und Übungen KI-gestützt, aber nicht
KI-verantwortet:** Das Modell generiert Entwürfe für Kontexte,
Ereignisfolgen, Prüffälle, Hilfen und Varianten; die erwarteten
Ergebnisse werden **durch Ausführung des Referenzcodes** gegengeprüft,
nicht durch das Modell bestätigt; die Lehrkraft redigiert und gibt frei.
Das ist die Rolle, die `KONZEPT_AUFGABEN.md` der KI zuweist —
systematisch zur Autorenwerkstatt ausgebaut.

---

## 8 Sozialformen: Partnerarbeit, Präsentation, Plenum

Hier ist Ehrlichkeit wichtiger als Funktionsumfang. Ein
Selbstlernprogramm kann Kooperation **vorbereiten, verteilen und
dokumentieren** — es kann sie nicht ersetzen. Was am Bildschirm bleibt,
verliert genau das, was Partnerarbeit und Präsentation didaktisch
wertvoll macht.

### 8.1 Partnerarbeit über definierte Schnittstellen

`KONZEPT_AUFGABEN.md` hat das schon angelegt: unterschiedliche Rollen,
Informationen oder Teilaufträge, die zusammengeführt werden — Leitidee
Modularität und Schnittstellen. Mit Server wird daraus:

- Die Lehrkraft (oder das Regelwerk) bildet **Paare** und weist einen
  **Paarauftrag** zu: ein Gesamtszenario, zwei Teilaufträge mit einer
  **vereinbarten Schnittstelle** (Klassenname, Methodensignaturen).
- Jede Seite arbeitet an ihrem Teil, mit eigenem Lernstand. Der
  Tutor kennt die Schnittstelle und darf **nicht** den Teil des Partners
  verraten — das ist der didaktische Kern: Man muss sich abstimmen.
- **Zusammenführung** als eigener Schritt: Beide Teile werden
  zusammengelegt, kompiliert, und die Checks laufen gegen das
  Gesamtszenario. Kompiliert es nicht, ist die Schnittstelle die
  Fehlerquelle — genau die Erfahrung, die gemeint ist.
- **Abstimmung passiert im Raum**, nicht im Programm. Die Paare sitzen
  nebeneinander. Es gibt bewusst **keinen Chat zwischen Lernenden**.

**Strukturiertes Peer-Feedback** statt freier Kommunikation: Nach der
Zusammenführung beantwortet jede Seite zwei feste Fragen zum Teil des
Partners („Was war an der Schnittstelle klar, was nicht?", „Was hättest
du anders gelöst?"). Formularfelder, keine Chatverläufe, für die
Lehrkraft einsehbar — und das wird den Lernenden gesagt.

### 8.2 Präsentationen: das Programm liefert Material, nicht die Note

Die Präsentation findet im Unterricht statt. Das Programm kann drei
Dinge dafür tun, und alle drei sind echter Gewinn:

1. **Materialpaket erzeugen:** eigener Quelltext, Screenshot des
   Szenarios, die eigene Reflexion, die Zustandstabelle aus F3 — als
   druckbares oder in OneNote einfügbares Paket. Der vorhandene
   Abgabe-Export (📤) ist die Grundlage.
2. **Probelauf mit Rückfragen:** Der Tutor stellt drei Rückfragen zur
   eigenen Lösung, so wie eine Mitschülerin sie stellen würde („Warum
   ein Stack und keine Liste?", „Was passiert bei leerem Stapel?").
   Das ist eine der stärksten Nutzungen eines Sprachmodells überhaupt —
   und harmlos, weil es keine Lösung verrät, sondern nach ihr fragt.
3. **Roter Faden statt Folien:** Der Tutor hilft, drei Kernaussagen zu
   ordnen, und weist auf Lücken hin. Ausdrücklich **keine
   Foliengenerierung** — sonst präsentieren die Lernenden fremde
   Gedanken.

Was das Programm nicht tut: bewerten, Vortragszeit messen, Folien
erzeugen, Präsentationen speichern.

### 8.3 Anschluss ans Plenum

Das Programm ist für Erarbeitungs- und Übungsphasen gedacht, nicht als
Ersatz des Unterrichts — dieselbe Festlegung wie in
`apps/geheimschreiber/DIDAKTIK.md`, Abschnitt 8. Zwei konkrete Brücken:

- **Die Freitexte sind Unterrichtsmaterial.** Die Lehrkraft sieht bei
  der Sichtung (5.7), welche Formulierungen typisch sind — und kann mit
  drei anonymisierten Schülersätzen ins Klassengespräch einsteigen. Das
  ist besser als jede vorbereitete Folie.
- **Fehlermuster über die Gruppe aggregiert** zeigen, was im Plenum
  wiederholt werden muss. Wenn 14 von 26 `stack_queue_verwechselt`
  auslösen, ist das keine Einzelförderung mehr.

---

## 9 Rolle und Grenzen des Sprachmodells

### Kontextvertrag

Bei jedem Aufruf **genau das** und nichts weiter:

- Rolle und Regeln (Systemprompt, versioniert)
- der aktuelle Baustein bzw. die Übung: Ziel, Auftrag, Operator,
  erwartete Fehlermuster, die hinterlegten Hilfen (damit er sie
  *benutzt* statt eigene zu erfinden)
- Auszug aus dem Lernstand: Status der Nachbarbausteine, offene
  Fehlermuster — **pseudonymisiert**
- der aktuelle Schülercode bzw. die Tabelleneingabe
- die letzte Compiler- oder Laufzeitmeldung im Original
- die Check-Ergebnisse des letzten Laufs
- die angeforderte Hilfestufe
- der Gesprächsverlauf der laufenden Sitzung

**Nie:** Klarnamen, Noten, Daten anderer Lernender (Ausnahme:
Schnittstellenvereinbarung bei Paararbeit, siehe 8.1), frühere
Freitexte im Wortlaut.

### Guardrails

Angelehnt an CodeHelp, CodeAid und Iris — alle drei geben keinen
vollständigen Lösungscode heraus, sondern Hinweise und Gegenfragen:

1. **Kein lauffähiger Lösungscode.** Auch nicht auf Nachfrage. Zulässig
   sind Gerüste mit Lücken und analoge Beispiele an *anderem*
   Gegenstand — die Stufe-4-Formen aus `KONZEPT_AUFGABEN.md`.
2. **Reflexionsschranke vor Stufe 2:** eine einzige Frage („Was hast du
   erwartet, was passiert stattdessen?"). Kein Punktabzug, keine
   Wartezeit. Begründung: Studien zu KI-Hinweisen finden einen
   *Reflection-Satisfaction-Tradeoff* — Reflexion vor dem Hinweis wirkt
   lernförderlich, senkt aber die Zufriedenheit; deshalb eine Frage
   statt eines Formulars. *Unsicherheit:* Befunde aus dem
   Hochschulkontext; im Feld zu prüfen.
3. **Hilfen kosten nie etwas.** Unverändert aus `KONZEPT_AUFGABEN.md`.
   Die höchste genutzte Hilfestufe ist Diagnose, kein Leistungsmerkmal.
4. **Bei Freitext keine Bewertung**, sondern Rückmeldung (5.7).
5. **Bei Paararbeit keine Auskunft über den Teil des Partners** (8.1).
6. **Auf dem Boden bleiben:** tatsächlicher Code, tatsächliche Meldung,
   tatsächliches Szenario. Keine Java-Konstrukte, die die Umgebung nicht
   kann (Threads, Sockets, Dateizugriff, Pakete).
7. **Fachlich auf NRW-Kurs:** Datenstrukturen nur mit den
   NRW-Klassen-Signaturen; kein `java.util.Stack`, keine
   `ArrayList`-Vorschläge. Die API-Beschreibungen aus
   `java_analyse_tool.html` werden übernommen.
8. **Operatoren richtig benutzen.** Wenn die Aufgabe „erläutern" sagt,
   fragt der Tutor nach Zusammenhängen, nicht nach Code — er ist auch
   ein Vorbild für Aufgabensprache.
9. **Kein Rollenspiel, keine Umwidmung.** Off-Topic kurz zurückführen;
   Versuche, die Regeln zu überschreiben, ignorieren.
10. **Sprache:** Deutsch, Oberstufenniveau, kurze Sätze, Fachbegriffe
    benutzen und beim ersten Mal erklären. Duzen.
11. **Zuständigkeitsgrenze:** Bei Frust, Überforderung oder
    Persönlichem freundlich, aber nicht beratend antworten und auf die
    Lehrkraft verweisen. Nicht protokollieren.

### Was gegen Missbrauch schützt

Man kann den Tutor nicht überreden, einen Baustein als belegt zu
markieren, und die Aufgabe nicht durch Reden ersetzen. Wer die Lösung
anderswo besorgt, bekommt den Haken — wie bei Papieraufgaben — fällt aber
in Phase 5 auf: Wer nicht erklären kann, was er abgibt, und wessen
Erläuterungstexte nicht zur Lösung passen, wird sichtbar. Das ist
Diagnose, keine Überwachung, und wird auch so behandelt.

---

## 10 Datenschutz

Das Programm verarbeitet Daten Minderjähriger über Schülerkonten und
schickt Schülertexte an einen KI-Dienst. Zu klären **vor** dem ersten
Einsatz. Grundlinien wie in `apps/geheimschreiber/DIDAKTIK.md`,
Abschnitt 10:

- **Pseudonyme statt Klarnamen**, keine Selbstregistrierung, Konten
  ausschließlich durch die Lehrkraft, Passwörter nur als Hash, HTTPS.
- **Datensparsamkeit als Voreinstellung** — erhoben wird, was
  Abschnitt 6 auflistet.
- **Was an das Modell geht**, ist in Abschnitt 9 abschließend
  aufgezählt. Kein Name, keine Klasse, keine Noten.
- **Aufbewahrung** (Vorschlag): Chatverläufe 14 Tage, Lernstand und
  Freitexte bis Schuljahresende, Konten danach gelöscht. Frist
  festlegen, nicht offenlassen.
- **Transparenz** zu Beginn der Einheit: was gespeichert wird, was die
  Lehrkraft sieht, dass der Chat an einen Dienstleister geht, dass
  Peer-Feedback für die Lehrkraft sichtbar ist, und dass nichts davon in
  die Note eingeht.
- **Auftragsverarbeitung:** AV-Vertrag mit dem Modellanbieter, EU-
  Verarbeitung. Die bislang genutzte OpenRouter-Kette ist dafür **nicht
  ohne Prüfung geeignet** (Vermittler zwischen Schule und Anbieter).
- **Der Schüler, der die Infrastruktur baut**, arbeitet nur mit
  Testdaten, hat keinen Produktivzugriff, und der Betrieb liegt bei der
  Schule (Technikpapier, Abschnitt 9).

**KI-Verordnung (EU AI Act).** Anhang III listet Bildungssysteme als
Hochrisiko-Bereich, unter anderem für Systeme, die Lernergebnisse
bewerten oder über Zugang entscheiden. Nach meiner Lesart ist das ein
weiteres starkes Argument für die Trennung aus Abschnitt 4: Das System
**bewertet nicht**, es diagnostiziert formativ; die Bewertung bleibt
vollständig bei der Lehrkraft. Ob das die Einordnung sicher vermeidet,
kann ich nicht beurteilen — juristische Frage für Schulleitung und
Datenschutzbeauftragte, zu stellen **vor** dem Klasseneinsatz. Ich kann
das Konzept datensparsam und bewertungsfrei auslegen; die rechtliche
Bewertung kann ich nicht ersetzen.

---

## 11 Leistungsbewertung

**Das Selbstlernprogramm bewertet nicht.** Keine Noten, keine
Punktzahlen, keine Rangfolge, kein Vergleich zwischen Lernenden. Der
Lernstand ist Diagnose — und das wird den Lernenden zu Beginn gesagt.

Das ist Voraussetzung dafür, dass das System funktioniert: Sobald der
Fortschritt zählt, wird Hilfeverzicht rational und Täuschung attraktiv.
Beides zerstört die Daten, aus denen die Adaptivität lebt.

Was in die „Sonstigen Leistungen" eingeht, entsteht **außerhalb**: im
Unterrichtsgespräch, in der Präsentation, in der Klausur. Die Abgaben
(Projektdatei, Freitexte, Materialpaket) sind Material, das die
Lehrkraft heranziehen kann — Dokumentation der Arbeit, nicht ihre
Messung.

**Rahmen in NRW:** Handlungsleitfaden des Ministeriums zu
textgenerierenden KI-Systemen (seit 2023) und die unter NRW-Federführung
erarbeitete KMK-Handlungsempfehlung. Praktisch: Selbstlernphasen mit KI
ja, Bewertungssituationen davon getrennt. Die konkreten Vorgaben sind am
Original zu prüfen — ich habe sie nur über Sekundärquellen gesehen.

---

## 12 Curriculare Verankerung

Jeder Baustein trägt Inhaltsfeld und Operator (Abschnitt 7). Grober
Rahmen, passend zum Unterrichtskontext aus `ENTWICKLUNG.md`:

| Abschnitt | Schwerpunkt | vorhandene JavaWelt-Szenarien |
|---|---|---|
| EF | Objekte und Klassen, Attribute, Methoden, Kontrollstrukturen | „Erste Schritte" |
| Q1 | Vererbung und Polymorphie, Arrays, lineare Strukturen (Stack, Queue, List), Datenbanken (ER, Normalformen, SQL) | „Vererbung & Polymorphie", „Arrays", „Stack/Queue/List", „Datenbank Zoo" |
| Q2 | Bäume, Graphen, Suchen und Sortieren, formale Sprachen und Automaten | geplant (Roadmap-Punkt 5) |

### Kompetenzerwartungen für die Q1-Wiederholung im Wortlaut

Grundlage ist der **Kernlehrplan Informatik SII (in Kraft ab
1.8.2014, aufsteigend)**, den die Lehrkraft bereitgestellt hat. Die
Kompetenzbereiche sind **Argumentieren (A)**, **Modellieren (M)**,
**Implementieren (I)**, **Darstellen und Interpretieren (D)** sowie
**Kommunizieren und Kooperieren (K)**; das Kürzel in Klammern hinter
jeder konkretisierten Erwartung nennt den stärksten Bezug.

**Gebaut wird für den Leistungskurs**, eine vereinfachte Fassung für den
Grundkurs folgt später (siehe unten).

Für den Pilotbereich (OOP, Implementationsdiagramme, Vererbung, Arrays)
tragend, Inhaltsfeld **Daten und ihre Strukturierung**, inhaltlicher
Schwerpunkt *Objekte und Klassen* — Q1, im Wortlaut **wie im
Leistungskurs**:

| Kompetenzerwartung (Wortlaut KLP) | Bereich | Format |
|---|---|---|
| ermitteln bei der Analyse von Problemstellungen Objekte, ihre Eigenschaften, ihre Operationen und ihre Beziehungen | M | F10, F13 |
| modellieren Klassen mit ihren Attributen, Methoden und ihren Assoziationsbeziehungen unter Angabe von Multiplizitäten | M | F10 |
| modellieren abstrakte und nicht abstrakte Klassen unter Verwendung von Vererbung durch Spezialisieren und Generalisieren | M | F10 |
| ordnen Attributen, Parametern und Rückgaben von Methoden einfache Datentypen, Objekttypen sowie lineare und nichtlineare Datensammlungen zu | M | F1, F6 |
| verwenden bei der Modellierung geeigneter Problemstellungen Möglichkeiten der Polymorphie | M | F9, F10 |
| ordnen Klassen, Attributen und Methoden ihre Sichtbarkeitsbereiche zu | M | F1, F13 |
| stellen die Kommunikation zwischen Objekten grafisch dar | D | F8, F13 |
| stellen Klassen und ihre Beziehungen in Diagrammen grafisch dar | D | F8, F10 |
| dokumentieren Klassen | D | F1 (umgekehrt: Doku zu Signatur) |
| analysieren und erläutern objektorientierte Modellierungen | A | **F13** |
| implementieren Klassen in einer Programmiersprache auch unter Nutzung dokumentierter Klassenbibliotheken | I | F6, F9 |

Inhaltsfeld **Algorithmen**, Schwerpunkt *Analyse, Entwurf und
Implementierung von Algorithmen* — **Leistungskurs** Q1:

| Kompetenzerwartung (Wortlaut KLP, LK) | Bereich | Format |
|---|---|---|
| analysieren und erläutern Algorithmen und Programme | A | **F1, F2, F4** |
| modifizieren Algorithmen und Programme | I | F7 |
| stellen iterative und rekursive Algorithmen umgangssprachlich und grafisch dar | D | **F14** |
| entwickeln iterative und rekursive Algorithmen unter Nutzung der Strategien „Modularisierung", „Teilen und Herrschen" **und „Backtracking"** | M | F14 (Backtracking erst in Q2) |
| implementieren iterative und rekursive Algorithmen auch unter Verwendung von dynamischen Datenstrukturen | I | F6, F9 |
| testen Programme systematisch anhand von Beispielen **und mithilfe von Testanwendungen** | I | F2, F3, **F15** |

### Was den Leistungskurs vom Grundkurs unterscheidet

Bei *Objekte und Klassen* sind die konkretisierten Kompetenzerwartungen
für GK und LK **praktisch wortgleich** — die Pilotinhalte (OOP,
Diagramme, Vererbung, Polymorphie, Arrays) gelten also für beide Kurse
gleichermaßen. Die Unterschiede liegen bei den Algorithmen und ergeben
sich sonst aus dem Anspruch, den der Kernlehrplan so beschreibt:

> „Unterschiede bestehen hinsichtlich der Komplexität der
> Problemstellungen und -lösungen sowie des Grades der Vernetzung der
> Kompetenzen und damit in den Anforderungen an das Abstraktionsvermögen
> und das analytische Denken der Schülerinnen und Schüler."

Für das Programm heißt das: **Die GK-Fassung ist keine Kürzung der
Themen, sondern eine Reduktion von Komplexität und Vernetzung** —
weniger Klassen im Material, kürzere Ereignisfolgen, ein Diagramm statt
zwei, mehr Gerüst, Teilaufgaben getrennt statt verschachtelt.

Konkret LK-spezifisch in den Algorithmen (jeweils gegenüber dem GK):

| LK zusätzlich | Folge |
|---|---|
| „mithilfe von **Testanwendungen**" testen | rechtfertigt **F15** (Prüffälle entwickeln) als LK-Format |
| Strategie **Backtracking** | erst in Q2 relevant, hier nur vormerken |
| Operationen dynamischer Datenstrukturen **implementieren** (GK: nur erläutern) | ab dem Stack-/Queue-Block relevant, nicht im Piloten |
| Such- und Sortierverfahren **unterschiedlicher Komplexitätsklassen** | späterer Block |
| Nebenläufigkeit, Client-Server-Kommunikation | außerhalb dieses Programms (keine Sockets im Browser) |

**Umsetzung ohne Fork:** Jeder Baustein trägt ein Feld `niveau` und
optional eine `gk_variante`, die Material und Teilaufgaben reduziert
(Abschnitt 7). Damit ist die GK-Fassung später eine Variante derselben
Datei — kein zweiter Bausteinsatz, der auseinanderläuft. Das jetzt
mitzudenken kostet fast nichts; nachträglich wäre es eine
Doppelpflege aller Inhalte.

Aus Inhaltsfeld **Formale Sprachen und Automaten**, Schwerpunkt *Syntax
und Semantik einer Programmiersprache*, gehört zusätzlich hierher:
*„interpretieren Fehlermeldungen und korrigieren den Quellcode" (I)* —
das ist genau die Hilfestufe 0 der Umgebung, und es ist eine
**Kompetenzerwartung des Kernlehrplans**, nicht bloß eine
Bedienerfreundlichkeit. Der Ausbau der eingedeutschten ECJ-Meldungen ist
damit curricular begründet.

Ebenfalls ausdrücklich im KLP, und in Abschnitt 8 dieses Papiers
aufgegriffen: *„kommunizieren und kooperieren in Gruppen und in
Partnerarbeit"* und *„präsentieren Arbeitsabläufe und -ergebnisse"* (K).
Kooperation und Präsentation sind keine Zugabe, sondern
Kompetenzerwartung — was die Entscheidung stützt, sie analog zu halten
und vom Programm nur vorbereiten zu lassen.

**Zwei Hinweise:**

1. **„Implementationsdiagramm"** ist ein Begriff aus den
   Abiturvorgaben und der Prüfungspraxis, nicht aus dem
   Kernlehrplantext — dort steht „Klassen und ihre Beziehungen in
   Diagrammen". Für die Aufgabensprache im Programm gilt der
   Klausurbegriff, damit die Lernenden ihn kennen.
2. Der **schulinterne Lehrplan der LFSM für die SII** liegt mir nicht
   vor. Mit ihm sollte die Tabelle nach dem Muster von
   `apps/geheimschreiber/DIDAKTIK.md`, Abschnitt 2, um die schulischen
   Festlegungen (Reihenfolge, Zeitbudget, Klausurformate) ergänzt
   werden.

---

## 13 Beispielsitzung

Q1, Wiederholung Vererbung, zweite Sitzung. „T" ist der Tutor, „S" die
Schülerin.

> **T** Moin! Letztes Mal hast du Tier, Hund und Katze gebaut und Hund
> hat schon „Wau" gesagt. Eine Sache hing noch: Du hattest
> `new Hund("Rex")` versucht, und der Compiler hat gemeckert. Weißt du
> noch, warum?
>
> **S** weil hund keinen konstruktor mit string hat?
>
> **T** Genau. Und woran liegt das — Tier hatte doch einen?
>
> **S** ach ja, konstruktoren werden nicht vererbt. man nimmt nenne().
>
> **T** Richtig. Bevor wir weitermachen, eine kurze Sache: Beim
> Methodenkopf hattest du zweimal `gibLaut(String)` geschrieben, wo
> `gibLaut()` hingehört. Ich hab dir drei kleine Aufgaben dazu — zwei
> Minuten, ohne Projekt.

*Die Werkbank öffnet sich: drei Methodenköpfe, dazu Beschreibungen, die
zugeordnet werden sollen (F1); dann eine Signatur, die zu einer
Beschreibung geschrieben werden soll (F6). Beides exakt geprüft.*

> **T** Sitzt. Dann heute: Katze soll etwas anderes sagen als Hund, und
> danach schauen wir, was passiert, wenn beide als `Tier` in einem
> Array liegen. Das ist Polymorphie — Klausurthema. Passt das, oder
> willst du erst Arrays üben?
>
> **S** passt.
>
> **T** Gut. Ich lade dein Projekt von letztem Mal, Katze ist angelegt.
> Auftrag steht rechts. Ich bin in der Seitenleiste.

*Nach acht Minuten kommt eine Compilermeldung, die Umgebung übersetzt
sie selbst (Stufe 0). Nach zwei weiteren Versuchen tippt S auf „Ich
brauche einen Hinweis".*

> **T** Kurz vorher: Was hast du erwartet, und was passiert
> stattdessen?
>
> **S** ich dachte katze sagt miau aber es kommt immer der text aus tier
>
> **T** Dann vergleich mal die Zeile mit `gibLaut` in Tier und die in
> Katze — Zeichen für Zeichen. (Stufe 1)
>
> **S** ...ah, ich hab gibLaut(String) geschrieben.
>
> **T** Und was heißt das für Java?

*Nach der Korrektur laufen beide Checks durch, in der Welt erscheinen
zwei Sprechblasen. Danach schaltet der Tutor den Erläuterungsteil frei.*

> **T** Läuft. Jetzt der Teil, der in der Klausur die Punkte bringt:
> In der Tierpension sollen später Vögel dazukommen. Begründe, warum
> `gibLaut()` überhaupt in `Tier` steht, obwohl jede Art es neu
> schreibt. Zwei, drei Sätze.
>
> **S** damit man alle tiere gleich behandeln kann, auch wenn man nicht
> weiß welche art es ist
>
> **T** Das ist der Kern. Ein Begriff fehlt noch, den du in der Klausur
> brauchst: *dynamische Bindung* — Java entscheidet erst beim Laufen,
> welche Fassung gilt. Deine Formulierung habe ich gespeichert, Herr
> Böhm sieht sie sich an. Nächstes Mal: dieselben Tiere in einem Array
> und eine Schleife darüber. Bis dann!

Was daran technisch bemerkenswert ist: Jeder Schritt, der den Lernstand
ändert, hängt an einem Check — die Konstruktor-Frage an einem
Fehlermuster der letzten Sitzung, die Mikroübung an exaktem Vergleich,
der Haken am Weltzustand. Der Erläuterungstext ändert **nichts** am
Status, sondern landet zur Sichtung. Das Gespräch ist die Oberfläche,
nicht die Buchführung.

**Wenn das Gateway ausfällt**, läuft dieselbe Sitzung ohne Gespräch:
Phase 1 zeigt Wiederholungsfragen als Karten mit Auflösung, Phase 2 den
Vorschlag als Text mit Auswahl, Phase 4 die statischen Hilfen 1–4,
Phase 5 das Reflexionsfeld. Die Formate F1–F8 funktionieren
vollständig, weil ihre Prüfung deterministisch ist. Spürbar nüchterner
— aber tragfähig. Diese Betriebsart ist zugleich Etappe 1 (siehe 14)
und damit von Anfang an getestet.

---

## 14 Umsetzung in Etappen

Beide Stränge laufen parallel; die Didaktik ist nicht auf den Server
angewiesen, bis Etappe D3.

**Inhalte und Didaktik:**

| # | Etappe | Inhalt | Abbruchfrage davor |
|---|---|---|---|
| D0 | ~~**Grundlagen klären**~~ | ✓ **erledigt**: Operatorenliste vollständig (5.1), KLP 2014 als geltende Fassung bestätigt, Klausuranalyse eingearbeitet (5.1), Kompetenzerwartungen im Wortlaut (12) | — |
| D1 | **Formate definieren** | F1–F12 als Datenschema, Prüflogik je Format, Fehlermusterkatalog; Pilotbaustein Vererbung mit drei Teilen | Deckt der Formatkatalog die Klausurpraxis? |
| D2 | **Werkbank** | Oberfläche für F1–F8 mit CheerpJ-Testgerüst; Übungssätze zu 3 Bausteinen | Sind Mikroübungen im Unterricht wirklich der schnellere Weg? |
| D3 | **Sitzungsablauf** | Phasen 1–6 deterministisch, Regelwerk für Baustein- und Formatwahl, Freitextsichtung für die Lehrkraft | Trägt Selbstlernen, bevor KI dazukommt? |
| D4 | **Autorenwerkstatt** | KI-Entwürfe für Kontexte, Ereignisfolgen, Prüffälle, Hilfen — Gegenprüfung durch Referenzausführung, Freigabe von Hand | Spart das echte Vorbereitungszeit? |
| D5 | **Tutor im Gespräch** | Phasen 1, 2, 5, 6 als Chat; Hilfestufen 1–3 dynamisch mit Reflexionsschranke; Rückfragen-Probelauf für Präsentationen | Kosten gemessen? Guardrails im Pilot gehalten? |
| D6 | **Sozialformen** | Paaraufträge mit Schnittstelle und Zusammenführung, strukturiertes Peer-Feedback, Materialpaket für Präsentationen | Funktioniert Partnerarbeit im Raum besser als allein? |
| D7 | **Adaptiv** | verteiltes Üben über Fehlermuster, Klausurvorbereitung nach AFB-Mischung, Differenzierung nach oben | Nutzen die Lernenden es freiwillig? |

**Infrastruktur:** siehe Technikpapier, Abschnitt 10. Die dortigen
Etappen S1–S4 (Server-Grundlage, Lernstand, Gateway, Lehrkraft-Sicht)
sind so geschnitten, dass jede einzeln abnehmbar ist.

**Die Reihenfolge ist Absicht.** D1 bis D3 sind der ehrliche Test: Wenn
Selbstlernen mit guten Aufgabenformaten, echten Checks und statischen
Hilfen nicht trägt, wird ein Chat es nicht retten — er würde das Problem
verdecken. Und D1–D3 sind gleichzeitig die Ausfallbetriebsart, die man
ohnehin braucht.

**Vor allem steht der CheerpJ-Test auf dem Schul-iPad** (Abschnitt 1).

---

## 15 Evaluation

**Fachlich.** Anteil der Belege ohne Hilfestufe 3/4; Verhältnis der
Operatorgruppen im Lernstand (fällt „erläutern" systematisch ab?);
Bestehen von Bausteinen, deren Voraussetzungen länger zurückliegen;
Qualität der Freitexte im Verlauf, von der Lehrkraft eingeschätzt. Ein
Vergleich zweier Kurse oder Halbjahre ist möglich, aber keine Studie —
Kohorteneffekte sind nicht kontrolliert.

**Der Gegenbefund, auf den zu achten ist.** Die Forschung beschreibt
*metacognitive laziness*: Lernende lagern Zielsetzung,
Fehlerüberwachung und Reflexion an die KI aus. Beobachtbare
Warnzeichen:

- Sprünge direkt auf die höchste Hilfestufe ohne eigenen Versuch
- Freitexte, die wie die Tutor-Formulierung klingen statt wie eigene
  Worte (die Sichtung nach 5.7 macht das sichtbar)
- Bausteine belegt, deren Voraussetzung kurz darauf nicht mehr sitzt
- viele Chatbeiträge bei wenigen Compilerläufen oder Werkbank-Versuchen

Reagiert wird über den Ablauf, nicht über Strafen: mehr
Reflexionsschranken, kürzere Hilfen, mehr Mikroübungen mit
produktivem Anteil. Was **nicht** passiert: Hilfen verteuern oder
Hilfenutzung sanktionieren.

**Praktisch.** Verfügbarkeit im Schulnetz, Kosten je Sitzung, Anteil
der Sitzungen im Ausfallbetrieb, Vorbereitungszeit der Lehrkraft (D4
muss sie senken, nicht erhöhen) — und die einfachste Frage: Nutzen die
Lernenden es, wenn sie nicht müssen?

---

## 16 Getroffene Entscheidungen

Stand 04.08.2026, abgestimmt mit der Fachlehrkraft:

| Frage | Entscheidung |
|---|---|
| **Pilot** | Q1-Wiederholung: OOP allgemein, **Implementationsdiagramme**, Vererbung, Arrays — **9 Unterrichtsstunden zu Schuljahresbeginn**. Eigener Plan: [`PILOT_Q1_WIEDERHOLUNG.md`](PILOT_Q1_WIEDERHOLUNG.md) |
| **Einsatzform** | Selbstlernzeit **in der Schule**. Das Werkzeug ist von zuhause voraussichtlich nicht erreichbar — keine Hausaufgabennutzung einplanen |
| **Sitzungslänge** | 45 min, danach Überleitung zur Sicherung |
| **Werkbank-Formate im Piloten** | F1 (Methode lesen), F3 (Zustand verfolgen), F6 (Methode schreiben) — dazu **F13 (Diagramm lesen)** und **F14 (Algorithmus entwerfen)** aus der Klausuranalyse |
| **Gamification** | **Nein.** Keine Coins, Abzeichen oder Pins; Fortschrittsanzeige und Klausurbezug tragen die Motivation. Die entsprechenden Absätze in `KONZEPT_AUFGABEN.md` gelten für die Oberstufe nicht |
| **Sicherung** | bleibt in OneNote; das Programm liefert den Export |
| **Anrede** | Duzen, Oberstufenniveau |
| **Fehlversuche** | **pro Person erheben** (nicht nur aggregiert). Konsequenz: gehört in die Transparenzansage an die Lernenden und in das Löschkonzept |
| **Peer-Feedback** | zulässig als Freitext in festen Formularfeldern, für die Lehrkraft einsehbar; kein Chat |
| **Präsentationen** | bleiben analog. Das Programm liefert nur Materialpaket und Rückfragen-Probelauf |
| **Aufbewahrung** | Lernstand und Freitexte bis Schuljahresende |
| **KLP-Stand** | Es gilt der KLP von 2014 (siehe 12); die befürchtete Novellierung betrifft Informatik SII nach vorliegender Fassung nicht |
| **Kursgröße** | zunächst höchstens 12 Lernende |
| **Kurs** | gebaut wird für den **Leistungskurs**; die GK-Fassung folgt später als Variante derselben Bausteine (`niveau`, `gk_variante`), nicht als zweiter Inhaltssatz |
| **Stundenlänge** | 67,5 min: rund 45 min Arbeitsphase plus Plenumsrahmen |
| **Sachkontext des Piloten** | Heldengruppe/Questsuche, anknüpfend an das EF-Spielszenario — das konkrete EF-Szenario ist noch zu benennen |
| **KI-Anbindung** | vorläufig über OpenRouter mit einem kostengünstigen Modell, **serverseitig** über das Gateway. Einordnung und Vorbehalt siehe unten |
| **Arbeitsteilung** | Didaktik gemeinsam, Infrastruktur baut ein Schüler eigenständig nach dem Technikpapier |

### Vorbehalt zur KI-Anbindung

Die Entscheidung für OpenRouter ist getroffen und wird umgesetzt. Zwei
Punkte gehören trotzdem festgehalten, weil sie später auf den Tisch
kommen:

1. **Pseudonymisierte Daten bleiben personenbezogen.** Solange die
   Schule die Zuordnung Pseudonym → Person kennt, sind Schülercode und
   Freitexte nach DSGVO personenbezogene Daten — auch ohne Namen im
   Prompt. Die Aussage „es werden keine personenbezogenen Daten
   verschickt" trägt nur für Inhalte, bei denen ein Rückschluss
   praktisch ausgeschlossen ist; ein Reflexionstext in eigenen Worten
   gehört nicht dazu.
2. **Drittlandübermittlung.** Für ein Modell mit Verarbeitung außerhalb
   der EU ohne Angemessenheitsbeschluss ist die Rechtsgrundlage eigens
   zu prüfen. Ich kann das nicht beurteilen — Frage für die
   Datenschutzbeauftragte, ebenso wie die Einordnung nach
   KI-Verordnung (Abschnitt 10).

**Praktisch entschärft das der Pilotzuschnitt:** In den 9
Wiederholungsstunden läuft **kein Sprachmodell zur Laufzeit**. KI wird
dort nur in der Autorenwerkstatt eingesetzt — also mit Aufgabentexten
der Lehrkraft, nicht mit Schülerdaten. Die Klärung nach 1. und 2. muss
damit erst vor Etappe D5 vorliegen, nicht in drei Wochen.

## 16a Noch offen

| Frage | Wer entscheidet | Wofür nötig |
|---|---|---|
| **Rechtsgrundlage für die KI-Nutzung** mit Schülerdaten (Punkte 1 und 2 oben) sowie Einordnung nach KI-Verordnung | Schulleitung + DSB | vor Etappe D5 |
| **Aufbewahrungsfrist für Chatverläufe** (Lernstand und Freitexte sind entschieden) | Schule / DSB | vor Etappe D5 |
| **Serverumgebung** — bewusst offengehalten, wahrscheinlich später Träger | Schule | vor Etappe S2 |
| **Verteilung der 9 Stunden** über die Wochen | du | Feinschnitt des Pilotplans |
| **Schulinterner Lehrplan SII (LK)** — muss ohnehin noch geschrieben werden | du | Ergänzung der Tabelle in 12. Umgekehrt kann die Bausteinfolge samt Kompetenzzuordnung als Entwurfsgrundlage dafür dienen |
| **EF-Heldenszenario**: welches kennt die Lerngruppe? | du | Figuren und Bezeichner des Pilotkontexts |
| **Serverseitiges Java** (Docker mit JDK): steht das zur Verfügung? | du | Wenn ja, ist das Nicht-Ziel „kein serverseitiger Runner" im Technikpapier neu zu bewerten |

---

## 17 Recherchestand

Marktsichtung vom 04.08.2026. Was es gibt und woran wir uns anlehnen:

| System | Was wir übernehmen |
|---|---|
| **Artemis** (TUM, Open Source) mit KI-Tutor **Iris** | Trennung Autograding / Tutor; Hinweise und Gegenfragen statt Lösungen |
| **CodeHelp**, **CodeAid** (CHI/SIGCSE, im Semesterbetrieb evaluiert) | Guardrail-Katalog; Befund, dass KI-Hilfe vor allem bei Fehlersuche genutzt wird |
| **CodeOcean / CodeHarbor** (HPI, openHPI) | Aufgaben als austauschbare Datenobjekte, Autograding per Prüffällen |
| **inf-schule.de** | Referenz für deutschsprachiges, lehrplankonformes Selbstlernen — statisch, ohne Prüfung, ohne KI |
| **ChatGPT Study Mode / Gemini Guided Learning / Khanmigo** | Sokratischer Gesprächsstil; ohne Fachkontext und Lernstand für Java nicht ausreichend |

**Die Lücke, die dieses Konzept füllt:** Keines der recherchierten
Systeme verbindet deutschsprachige Oberstufendidaktik nach NRW-Lehrplan,
die NRW-Klassenbibliothek, iPad-Betrieb ohne Installation, **Feedback
aus dem Weltzustand statt aus einem Chat** — und, seit dieser Fassung,
**die Abitur-Aufgabenformate jenseits des Programmierens**. Autograder
prüfen Code. Eine Zustandstabelle zu einem erzählten Kontext, gefolgt
von „erläutere, warum", prüft niemand von ihnen. Genau das ist aber der
Teil der Klausur, an dem es hängt.
