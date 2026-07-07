# JavaWelt — Entwicklungs-Briefing

> **Zweck dieser Datei:** Einstieg für die nächste Arbeits-Session (Mensch
> oder KI-Agent), ohne die Historie neu erarbeiten zu müssen. Bitte bei
> größeren Änderungen mitpflegen — insbesondere „Stand“, „Offene Punkte“
> und „Roadmap“.

**Stand: Juli 2026 · alle bisherigen PRs (#9, #10, Doku-PR) gemerged**

## Was ist JavaWelt?

Eine browserbasierte Java-Lernumgebung für den Informatik-Unterricht der
Oberstufe (Kernlehrplan NRW), gebaut für **iPad-Klassen**: BlueJ-artige
Objektbank + Greenfoot-artige Spielwelt, aber ohne Installation und mit
minimalem Code-Gerüst. Statisch gehostet (GitHub Pages), kein Server.

Lehrkraft/Owner: René Böhm (bohm@lfsm.de). Unterrichtskontext Q1:
Wiederholung Vererbung/Arrays, dann Queue/Stack/List, außerdem
Datenbanken (ER, Normalformen, SQL, NRW-Klassen).

## Kernkonzepte (bitte nicht brechen)

1. **Minimales Gerüst für Schülercode.** Figuren-Klassen:
   `public class Roboter extends Figur { … }` — kein Paket, kein
   Konstruktor, kein `super(...)`. Die eine unsichtbare Zeile
   `import de.schule.jle.*;` wird beim Kompilieren vorangestellt
   (Fehler-Zeilennummern werden um 1 korrigiert).
2. **Objekte benennen über `nenne(String)`,** nicht über Konstruktoren —
   Konstruktoren werden in Java nicht vererbt, und Schüler sollen keine
   `super`-Aufrufe schreiben müssen. Der Übungsmodus lehnt
   `new Hund("Rex")` genauso ab wie javac.
3. **Immer echtes Java.** Die App startet immer mit CheerpJ (ECJ-Compiler
   + JVM als WASM im Browser, vom CDN `cjrtnc.leaningtech.com`). Es gibt
   **keinen Modus-Schalter**. Nur wenn CheerpJ nicht lädt, springt der
   Übungsmodus (eigener Mini-Interpreter) als klar markierter
   **Notbetrieb** ein („⚠ Notbetrieb“ + „erneut versuchen“-Knopf).
4. **Die Weltklasse ist das Programm.** `MeineWelt extends Welt` mit
   `bereiteVor()` (einmal) und `spiele()` (Spielschleife
   `while (laeuft()) { … warte(100); }`). ▶ Start setzt Welt + Objekte
   zurück und ruft `starte()`.
5. **Framework-Klassen sind sichtbar, aber schreibgeschützt** (🔒-Tabs);
   NRW-Klassen aus der Bibliothek sind dagegen **editierbare Kopien**
   im Schülerprojekt (LK-Anforderung).
6. **Reproduzierbarkeit:** ✓ Übernehmen (Kompilieren) leert die Welt und
   setzt die SQL-Datenbank auf ihren Seed zurück.

## Was funktioniert (Stand heute)

- Eigene Klassen anlegen/löschen, Objekte per Tipp platzieren, geparste
  öffentliche Methoden mit Eingabefeldern aufrufen (Rückgabewerte in der
  Konsole), Vererbungskette inkl. geerbter Figur-Methoden.
- Spielschleife mit Start/Stopp; Engine animiert Aktionen sequenziell
  über eine Warteschlange (ein `laufeQuadrat()` ist sichtbar, obwohl
  Java sofort fertig ist).
- **NRW-Bibliothek (📚, alle editierbar):** Stack, Queue, List,
  BinaryTree, BinarySearchTree + ComparableContent (Interface),
  Graph/Vertex/Edge, DatabaseConnector + QueryResult. Abhängigkeiten
  werden automatisch mitinstalliert. Netzwerkklassen bewusst außen vor
  (keine Sockets im Browser).
- **SQL:** echte SQLite per sql.js (WASM), **selbst gehostet** unter
  `public/sql-wasm.{js,wasm}`. Seed „Zoo“: `gehege` ↔ `tier` (1:n).
  Protokoll Java↔JS über `de.schule.jle.DatenbankBruecke`
  (U+001E/U+001F-getrennte Strings, async CheerpJ-Native).
- **7 Lernszenarien** („Szenarien“-Knopf, ersetzen das Projekt nach
  Rückfrage): Erste Schritte (EF) · Vererbung & Polymorphie (Q1, läuft
  auch im Notbetrieb) · Arrays (Q1) · Stack/Queue/List (Q1) ·
  Datenbank „Zoo“ (Q1) — mit AUFGABE-Kommentaren im Code.
- Bilder pro Figuren-Klasse (🖼: Emoji-Raster oder Upload, verkleinert,
  rotiert mit Blickrichtung).
- **Persistenz:** localStorage (automatisch, gerätegebunden) + Projekt
  als JSON-Datei speichern/öffnen (⬇/⬆ im Header; Klassen + Bilder) —
  für Gerätewechsel und Abgaben über die Dateien-App.
- Übungsmodus-Interpreter versteht: Methodenaufrufe, `new`, Felder,
  lokale Variablen, `for`-Zählschleifen, `while (laeuft())`, `return`,
  Polymorphie/dynamische Bindung. Alles andere → verständliche Meldung.

## Architektur (Dateikarte)

```
apps/javawelt/
  index.html                  Oberfläche (Boxen, Dialoge, Hilfetext)
  src/main.ts                 Verkabelung: Laufzeit-Start/Notbetrieb,
                              Übernehmen/Start/Stopp, Platzieren,
                              Szenarien-/Bibliothek-/Bild-Dialoge,
                              Projekt speichern/öffnen
  src/engine/                 Canvas-Welt: welt.ts (API + Rendering),
                              figur.ts (Aktions-Warteschlange!),
                              eingabe.ts (Pointer/Touch)
  src/ui/klassenVerwaltung.ts Quelltexte, localStorage, Vererbungsketten,
                              Methodensignaturen für die Objektbank
  src/ui/objektbank.ts        Klassen-Panel (gruppiert), Objekte, Methoden
  src/ui/szenarien.ts         alle Szenario-Klassensätze (Java als Strings)
  src/ui/bilder.ts            Klassen-Bilder (Emoji/Upload) + Dialog
  src/java/javaParser.ts      kleiner Java-Parser (Klassenkopf-Scanner,
                              Generics, interface, Anweisungs-AST)
  src/java/laufzeit.ts        Interface beider Laufzeiten
  src/java/cheerpjLaufzeit.ts CheerpJ: ECJ-BatchCompiler (lesbare Fehler,
                              Zeilenkorrektur), Reflexion via Steuerung,
                              alle nativ*-Bridges
  src/java/mockLaufzeit.ts    Übungsmodus-Interpreter (Notbetrieb)
  src/java/nrwBibliothek.ts   alle NRW-Klassen als Java-Quelltexte
  src/java/datenbank.ts       sql.js-Wrapper + ZOO_SEED + Kodierung
  java-framework/de/schule/jle/
      Figur.java Welt.java    Schüler-API (deutsch)
      Steuerung.java          Reflexions-Brücke UI→Java (intern)
      DatenbankBruecke.java   SQL-Brücke Java→JS (intern)
  public/ecj.jar              Eclipse-Compiler (wird mit ausgeliefert)
  public/framework.jar        kompiliertes Framework  ⚠ nach Änderungen
                              an java-framework/ neu bauen:
                              npm run build:framework (braucht JDK ≥ 11)
  public/sql-wasm.{js,wasm}   SQLite (sql.js), selbst gehostet
  tests/                      alle Testsuiten, siehe unten
```

Wichtige Mechanik-Details:

- **CheerpJ-Natives** heißen `Java_de_schule_jle_<Klasse>_nativ<Name>`
  und liegen in `cheerpjLaufzeit.ts`. Natives dürfen async sein.
- Pro Kompilierlauf entsteht ein neues Ausgabeverzeichnis + neues
  `cheerpjRunLibrary` (frische Klassen, `Steuerung.vergissAlle()`).
- **Steuerzeichen niemals als rohe Zeichen in Quelltexte schreiben** —
  immer Escapes der Form Backslash-u001E/-u001F (rohe Zeichen sind schon zweimal
  unbemerkt in Dateien gelandet; die Bash-Sandbox blockiert sie zudem).
- Bezeichner/UI/Meldungen sind bewusst **deutsch** (Zielgruppe Schüler).

## Tests (bitte vor jedem Push laufen lassen)

```bash
cd apps/javawelt
npm test          # Parser, Interpreter, SQL (echte SQLite),
                  # javac-Kompilierung aller Szenarien + Bibliothek
npm run build     # Typecheck + Vite-Build

# UI-Tests (brauchen Playwright + Chromium):
npm run preview -- --port 4173 &
npm run test:ui   # ggf. PLAYWRIGHT_MODUL=<pfad zu playwright/index.mjs>
                  # und CHROMIUM_PFAD=<chrome-binärdatei> setzen
```

In der Cloud-Sandbox ist das CheerpJ-CDN blockiert → die UI-Tests prüfen
dadurch automatisch den Notbetriebs-Pfad. Der echte CheerpJ-Pfad ist
deshalb **nur kompiliert-verifiziert** (javac + JVM-Semantiktests für
Bibliothek und Protokolle), nicht end-to-end im Browser gelaufen.

## Offene Punkte

1. **CheerpJ im Schulnetz validieren** (wichtigster Punkt vor dem
   Einsatz): Seite auf einem Schul-iPad öffnen → erscheint „CheerpJ
   bereit“ oder „⚠ Notbetrieb“? Bei Blockade: CheerpJ self-hosten
   (Lizenzbedingungen für Schulen prüfen, Datenschutz klären).
2. ECJ-Ausgabe/Loader-Versionen ggf. abstimmen (README-Abschnitt
   „CheerpJ-Pfad validieren“).
3. Safari kann localStorage lange unbenutzter Seiten löschen →
   Projektdatei ist der verlässliche Speicher; ggf. Erinnerung in der UI.

## Roadmap (nächster Schwerpunkt: Didaktik-Verzahnung mit OneNote)

Der Unterrichts-Workflow ist heute: Aufgabe in OneNote → Editor öffnen,
Szenario laden, programmieren → Screenshot zurück nach OneNote. Zwei
Medienbrüche. Besprochene und priorisierte Ideen:

1. **Aufgaben-Links (Deep-Links)** — *als Nächstes, klein:*
   URL-Parameter auswerten: `?szenario=<id>` lädt ein Szenario direkt,
   `?projekt=<URL>` lädt eine vorbereitete Projektdatei (z. B. aus dem
   Repo/GitHub Pages), optional `#projekt=<komprimiert>` für Aufgaben
   komplett im Link. OneNote enthält dann nur noch einen Link.
2. **„Abgabe erstellen“-Knopf** — *als Nächstes, klein:*
   Ein Klick erzeugt Welt-Screenshot (canvas.toDataURL) + Quelltext +
   Konsole als ein Bild/HTML und bietet es auf dem iPad über das
   **Share-Sheet** an (Web Share API mit Dateien funktioniert in
   Safari) → direkt nach OneNote/Teams. Optional Projektdatei anhängen.
3. **Aufgaben-Panel mit Auto-Checks** — *größeres Paket, hoher Wert:*
   Szenarien bekommen strukturierte Aufgaben (statt nur Kommentaren) in
   einer Seitenleiste; einfache Checks gegen Parser + Weltzustand
   („Klasse Kuh erbt von Tier ✓”, „nach Start stehen nur Pinguine ✓”)
   haken sich selbst ab. Pilot mit dem Vererbungs-Szenario.
   **Didaktisches Konzept dazu (Teilszenarien, visuelles Feedback,
   gestufte Hilfen, Gamification-Regeln, Lehrkraft-Sicht):**
   `KONZEPT_AUFGABEN.md` — vor der Umsetzung lesen.
4. **Brücke zum Java-Analyse-Tool** (liegt im selben Repo,
   `java_analyse_tool.html`, nutzt OpenRouter): Knopf „Analysieren“
   übergibt aktuelle Klasse + Aufgabe ans vorhandene Tool.
5. Weitere Szenarien: Suchen/Sortieren (Säulen-Figuren), Baum
   (insert im BST sichtbar), Graph-Wegsuche (Q2/LK), Automaten (Q2),
   Datenbank-Ausbau (eigene Seeds, Highscore-Tabelle per INSERT).
6. Ausdrücklich **zurückgestellt**: echte OneNote-/Teams-API-Integration
   (Backend, Admin-Consent, Datenschutz — Aufwand lohnt erst, wenn
   Links + Share-Sheet nicht reichen).

## Arbeitskonventionen

- Branch: `claude/java-ipad-learning-platform-ztoc3r`; nach jedem Merge
  den Branch von `origin/main` neu aufsetzen (gemergte PRs nicht
  weiterverwenden). PRs klein halten, Beschreibung auf Deutsch.
- Nach Änderungen an `java-framework/`: `npm run build:framework`,
  das neue `public/framework.jar` mit committen.
- Neue Java-Quelltexte (Szenarien/Bibliothek) immer per `npm test`
  gegen javac laufen lassen — der echte Compiler findet Fehler, die der
  Übungsmodus-Parser toleriert (Beispiel aus der Historie: vererbte
  Konstruktoren existieren nicht → deshalb `nenne()`).
- README.md ist die Nutzer-/Lehrkraft-Doku, diese Datei das
  Entwicklungs-Gedächtnis.
