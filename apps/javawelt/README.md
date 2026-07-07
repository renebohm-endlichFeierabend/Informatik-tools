# JavaWelt — visuelle Lernumgebung für Java (Oberstufe, iPad-tauglich)

Eine web-native Lernumgebung für den Informatik-Unterricht: Schülerinnen und
Schüler schreiben **eigene Java-Klassen**, platzieren **Objekte** davon per
Fingertipp auf einer Welt, rufen deren **Methoden** interaktiv auf — und
lassen ihr **Spiel** in einer eigenen Weltklasse laufen. Das Gute aus BlueJ
(interaktive Objektbank) und Greenfoot (Spielwelt), aber **im Browser**
(iPad!) und mit **minimalem Code-Gerüst**.

## Schnellstart

```bash
npm install
npm run dev      # http://localhost:5173
```

Es läuft **immer echtes Java** (Compiler + JVM im Browser, CheerpJ) —
ohne Modus-Schalter. Nur wenn CheerpJ nicht geladen werden kann (offline,
Filter im Schulnetz), springt automatisch ein klar gekennzeichneter
**Notbetrieb** ein (eingeschränkter Interpreter, siehe unten).

## Das Unterrichts-Modell

- **Eigene Klassen erben von `Figur`** — mehr Gerüst gibt es nicht.
  Kein Paket, kein Konstruktor, kein `super(...)`:

  ```java
  public class Roboter extends Figur {

      public void laufeQuadrat(int seite) {
          for (int i = 0; i < 4; i++) {
              geheVor(seite);
              dreheDich(90);
          }
      }
  }
  ```

- **Das Spiel läuft in der Weltklasse.** `▶ Start` ruft `bereiteVor()`
  (einmal) und dann `spiele()` auf — dort steht die Spielschleife:

  ```java
  public class MeineWelt extends Welt {

      Roboter rob;

      public void bereiteVor() {
          rob = new Roboter();
          rob.setzePosition(200, 240);
      }

      public void spiele() {
          while (laeuft()) {      // bis ■ Stopp gedrückt wird
              rob.geheVor(25);
              rob.dreheDich(15);
              warte(100);
          }
      }
  }
  ```

- **Objektbank wie in BlueJ:** Bei einer Klasse auf `neu` tippen, auf der
  Welt platzieren; Objekt antippen → seine öffentlichen Methoden erscheinen
  mit Eingabefeldern (eigene zuerst, geerbte von `Figur` darunter).
  Rückgabewerte (z. B. `gibX()`) landen in der Konsole.

- **Kein löschbarer Boilerplate:** Die Framework-Klassen `Figur` und `Welt`
  sind sichtbar (Tab mit 🔒), aber schreibgeschützt — nachlesen ja,
  kaputtmachen nein. Die eine unsichtbare Import-Zeile wird beim Übersetzen
  ergänzt; Fehler-Zeilennummern werden entsprechend korrigiert.

- **Figuren-API (deutsch, sprechend):** `geheVor(int)`, `dreheDich(int)`,
  `sage(String)`, `nenne(String)`, `setzePosition(int,int)`, `gibX()`,
  `gibY()`, `gibWinkel()`, `entferne()`. Weltklasse: `laeuft()`,
  `warte(int)`, `zufallszahl(int,int)`, Konstanten `BREITE`/`HOEHE`.
  (`nenne` statt Namens-Konstruktor in Unterklassen — Konstruktoren werden
  in Java nicht vererbt, und `super(...)`-Gerüst soll vermieden werden.)

- **NRW-Klassenbibliothek (📚):** Alle Datenstruktur-Klassen der
  Abiturvorgaben NRW lassen sich per Knopf als **editierbare Kopie** ins
  Projekt holen — verwenden im GK, lesen und verändern im LK:
  `Stack`, `Queue`, `List`, `BinaryTree`, `BinarySearchTree` (+ Interface
  `ComparableContent`), `Graph`/`Vertex`/`Edge`. Abhängigkeiten werden
  automatisch mitinstalliert (Graph → List/Vertex/Edge, BST →
  ComparableContent). Die Semantik aller Klassen ist mit einer echten JVM
  getestet (inkl. aller `remove`-Fälle im Suchbaum). Die
  Netzwerkklassen der Vorgaben sind bewusst außen vor (kein
  Socket-Zugriff im Browser).

- **Datenbanken & SQL (Q1):** Eine **echte SQLite-Datenbank** läuft per
  WebAssembly im Browser (sql.js, selbst gehostet unter
  `public/sql-wasm.{js,wasm}` — kein CDN, kein Server). Die NRW-Klassen
  `DatabaseConnector` und `QueryResult` sind in der Bibliothek
  (editierbar) und sprechen sie über die interne `DatenbankBruecke` an.
  Beispiel-Schema: `gehege(id, name, klima)` und
  `tier(id, name, art, geburtsjahr, gehege_id)` — eine 1:n-Beziehung für
  ER-Diagramm, Schema-Diskussion, Normalformen und JOINs. Beim
  ✓ Übernehmen wird die Datenbank (wie die Welt) auf den Seed
  zurückgesetzt, damit alle reproduzierbar mit denselben Daten starten.
  SQL-Verhalten und String-Protokoll sind mit echter SQLite und echter
  JVM getestet.

- **Projekt speichern/öffnen (⬇/⬆):** Der Arbeitsstand (alle Klassen +
  Bilder) lässt sich als JSON-Datei sichern und wieder öffnen — auf dem
  iPad über die Dateien-App. Damit funktionieren Gerätewechsel, Sicherung
  und Abgaben (Moodle/Teams/AirDrop). Unabhängig davon sichert die App
  jede Eingabe zusätzlich im localStorage des Geräts.

- **Abgabe erstellen (📤):** Ein Klick erzeugt ein einheitliches
  Abgabe-Dokument (Welt-Screenshot + alle Quelltexte + Konsolenausgabe
  als eine HTML-Datei) samt Projektdatei und bietet beides auf dem iPad
  direkt über das **Share-Sheet** an — Teilen → OneNote/Teams, fertig.
  Wo das Share-Sheet nicht verfügbar ist, werden die Dateien
  heruntergeladen.

- **Aufgaben-Links (🔗 / Deep-Links):** Die Aufgabe öffnet die Umgebung
  im richtigen Zustand — in OneNote steht nur noch ein Link:
  - `?szenario=<id>` lädt ein Lernszenario direkt
    (ids: `erste-schritte`, `vererbung`, `arrays`, `stack`, `queue`,
    `liste`, `datenbank`),
  - `?projekt=<URL>` lädt eine bereitgestellte Projektdatei (z. B. aus
    dem Repo über GitHub Pages),
  - `#projekt=<komprimiert>` trägt das komplette Projekt im Link selbst —
    der 🔗-Knopf erzeugt so einen Link aus dem aktuellen Projekt
    (Klassen + Bilder), ganz ohne Hosting.
  Vor dem Ersetzen der aktuellen Klassen wird immer nachgefragt.

- **Bilder für Klassen (🖼):** Jede Figuren-Klasse bekommt per Knopf ein
  Emoji oder ein eigenes (automatisch verkleinertes) Bild; die Engine
  zeichnet es rotierend mit der Blickrichtung.

- **Lernszenarien (Kernlehrplan NRW):** Der „Szenarien“-Knopf lädt fertige
  Klassensätze mit Aufgaben-Kommentaren:
  | Szenario | Stufe / KLP-Bezug | läuft auch im Notbetrieb? |
  |---|---|---|
  | Erste Schritte: Objekte & Klassen | EF · Einstieg OOP | ja |
  | Vererbung & Polymorphie (Tier/Hund/Katze) | Q1 · Wiederholung | ja |
  | Arrays & Zählschleifen (Roboter-Gruppe) | Q1 · Wiederholung | nein |
  | Stack: der Kistenstapel (LIFO) | Q1 · lineare Strukturen | nein |
  | Queue: die Warteschlange (FIFO) | Q1 · lineare Strukturen | nein |
  | List: der Zug (Listendurchlauf) | Q1 · lineare Strukturen | nein |
  | Datenbank: der Zoo (SQL, JOIN, ER/Normalformen) | Q1 · Datenbanken | nein |

- **Sichtbare Abläufe:** Bewegungen wandern in eine Aktions-Warteschlange
  und werden nacheinander animiert — ein `laufeQuadrat(100)` ist als
  Quadrat *sichtbar*, obwohl Java es in Mikrosekunden berechnet.

- Der Quelltext wird im **localStorage** des Geräts gesichert — ein
  neu geladener Tab auf dem iPad verliert nichts. („Hilfe“ → Zurücksetzen
  stellt die Vorlagen wieder her.)

## Zwei Laufzeiten, eine Oberfläche

```
┌───────────────────────────────────────────────────────────┐
│  Oberfläche (TypeScript)                                    │
│  · Welt-Engine (Canvas, Aktions-Queue, Touch)  src/engine/  │
│  · Objektbank / Klassenverwaltung              src/ui/      │
│  · Java-Parser (Signaturen + Übungsmodus)      src/java/    │
└───────────────┬─────────────────────────────────────────────┘
                │ Interface JavaLaufzeit (src/java/laufzeit.ts)
        ┌───────┴────────┐
        ▼                ▼
  Übungsmodus       CheerpJ-Laufzeit ──► CheerpJ (WASM-JVM)
  (Interpreter        · kompiliert mit ECJ im Browser
   für Unterrichts-   · echtes Java + Reflexion, clientseitig
   Java, offline)     · Natives steuern die Welt-Engine
```

**Es gibt keinen Modus-Schalter:** Die App startet immer mit der echten
Java-Laufzeit (**CheerpJ**: ECJ-Compiler + JVM, komplett clientseitig,
auch auf dem iPad). Nur wenn CheerpJ nicht geladen werden kann, springt
der **Übungsmodus als Notbetrieb** ein — deutlich markiert
(„⚠ Notbetrieb“ + „erneut versuchen“-Knopf). Er interpretiert die
typische Unterrichts-Teilmenge (Methodenaufrufe, `new`,
`for`-Zählschleifen, `while (laeuft())`, `return`) und erklärt
freundlich, was erst mit echtem Java geht. Beide Laufzeiten bedienen
dieselben Abläufe (übernehmen → platzieren → Methoden aufrufen → Spiel
starten).

## CheerpJ-Pfad validieren (einziger offener Punkt)

Der CheerpJ-Pfad ist vollständig implementiert, konnte in der Build-Umgebung
aber nicht ausgeführt werden (CDN blockiert). Bitte im Browser prüfen:

1. Beim Laden sollte „CheerpJ bereit“ erscheinen. Zeigt der Status
   stattdessen „⚠ Notbetrieb“, blockiert das (Schul-)Netz
   `cjrtnc.leaningtech.com` → CheerpJ selbst hosten (Lizenz für Schulen
   prüfen, Datenschutz!).
2. **✓ Übernehmen** übersetzt die Klassen mit ECJ (liegt als
   `public/ecj.jar` bei); Compilerfehler erscheinen mit korrigierten
   Zeilennummern in der Konsole.
3. Objekt platzieren, Methode aufrufen, **▶ Start** — läuft alles über
   `de.schule.jle.Steuerung` (Reflexion) bzw. die `nativ*`-Bridge.

## Projektstruktur

```
index.html                     Oberfläche (Welt, Objektbank, Editor, Konsole)
src/engine/                    Welt, Figur (Aktions-Queue), Eingabe (Touch)
src/ui/klassenVerwaltung.ts    Quelltexte, Vorlagen, localStorage, Vererbung
src/ui/objektbank.ts           Klassen → neu/Quelltext · Objekte · Methoden
src/java/javaParser.ts         kleiner Java-Parser (Signaturen + Übungsmodus)
src/java/laufzeit.ts           Interface CheerpJ ⇄ Notbetrieb
src/java/mockLaufzeit.ts       Übungsmodus-Interpreter (Notbetrieb, offline)
src/java/cheerpjLaufzeit.ts    echtes Java im Browser (ECJ + Reflexion)
java-framework/                Java-API (Figur, Welt, Steuerung)
                               build.sh → public/framework.jar
```

Nach Änderungen an den Java-Framework-Klassen: `npm run build:framework`
(braucht ein lokales JDK ≥ 11), damit `public/framework.jar` zu den
Quelltexten passt.

## Nächste Schritte (Vorschlag)

1. CheerpJ im Schulnetz validieren; ggf. Self-Hosting klären.
2. Weitere Szenarien entlang des KLP NRW:
   - **Suchen & Sortieren auf linearen Strukturen** (Q1): Säulen-Figuren
     nach Größe sortieren (Bubble-/Selectionsort sichtbar animiert).
   - **Baum-Szenario** (Q1/Q2): Knoten-Figuren, die sich beim `insert`
     in den BinarySearchTree als Baum anordnen; Traversierungen.
   - **Graph-Szenario** (Q2, LK): Wegsuche (Tiefen-/Breitensuche mit
     Markierung) auf den vorhandenen Graph-Klassen.
   - **Automaten** (Q2): Zustands-Figuren, ein Eingabewort läuft als
     Figur durch den Automaten.
   - **Datenbank-Ausbau**: eigene Seeds pro Lerngruppe (z. B. Schulmensa,
     Fußballliga), Highscore-Tabelle, in die das Spiel per INSERT
     schreibt; ER-Diagramm-Ansicht in der Oberfläche.
3. Monaco-Editor mit Java-Syntaxfarben statt `textarea`.
4. Tastatur-/Touch-Eingabe für Spiele (`istTasteGedrueckt(...)`),
   Kollisionen (`beruehrt(...)`).
5. ~~Projekte teilen (Export/Import als Datei oder Link) für Abgaben.~~
   ✓ umgesetzt: 📤 Abgabe (Share-Sheet) und 🔗 Aufgaben-Links, siehe oben;
   Konzept für die nächste Stufe (Aufgaben direkt in der Umgebung) in
   `KONZEPT_AUFGABEN.md`.
