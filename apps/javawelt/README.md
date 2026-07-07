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

Läuft sofort im **Übungsmodus** (kein Download, kein Server, offline).
Für vollständiges Java den Schalter **„Echtes Java“** aktivieren (CheerpJ,
siehe unten).

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
  `sage(String)`, `setzePosition(int,int)`, `gibX()`, `gibY()`,
  `gibWinkel()`, `entferne()`. Weltklasse: `laeuft()`, `warte(int)`,
  `zufallszahl(int,int)`, Konstanten `BREITE`/`HOEHE`.

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

Beide Laufzeiten bedienen dieselben Abläufe (übernehmen → platzieren →
Methoden aufrufen → Spiel starten). Der **Übungsmodus** interpretiert die
typische Unterrichts-Teilmenge von Java selbst (Methodenaufrufe, Variablen
mit `new`, `for`-Zählschleifen, `while (laeuft())`) und erklärt freundlich,
wenn etwas nur mit echtem Java geht. **CheerpJ** kompiliert und führt
vollständiges Java aus — komplett clientseitig, auch auf dem iPad.

## CheerpJ-Pfad validieren (einziger offener Punkt)

Der CheerpJ-Pfad ist vollständig implementiert, konnte in der Build-Umgebung
aber nicht ausgeführt werden (CDN blockiert). Bitte im Browser prüfen:

1. Schalter **„Echtes Java“** → „CheerpJ bereit“ sollte erscheinen.
   Wenn nicht: Das (Schul-)Netz blockiert `cjrtnc.leaningtech.com`
   → CheerpJ selbst hosten (Lizenz für Schulen prüfen, Datenschutz!).
2. **✓ Übernehmen** übersetzt die Klassen mit ECJ (liegt als
   `public/ecj.jar` bei); Compilerfehler erscheinen mit korrigierten
   Zeilennummern in der Konsole.
3. Objekt platzieren, Methode aufrufen, **▶ Start** — läuft alles über
   `de.schule.jle.Steuerung` (Reflexion) bzw. die `nativ*`-Bridge.

Fällt CheerpJ aus, wechselt die App automatisch zurück in den Übungsmodus.

## Projektstruktur

```
index.html                     Oberfläche (Welt, Objektbank, Editor, Konsole)
src/engine/                    Welt, Figur (Aktions-Queue), Eingabe (Touch)
src/ui/klassenVerwaltung.ts    Quelltexte, Vorlagen, localStorage, Vererbung
src/ui/objektbank.ts           Klassen → neu/Quelltext · Objekte · Methoden
src/java/javaParser.ts         kleiner Java-Parser (Signaturen + Übungsmodus)
src/java/laufzeit.ts           Interface Übungsmodus ⇄ CheerpJ
src/java/mockLaufzeit.ts       Übungsmodus-Interpreter (offline)
src/java/cheerpjLaufzeit.ts    echtes Java im Browser (ECJ + Reflexion)
java-framework/                Java-API (Figur, Welt, Steuerung)
                               build.sh → public/framework.jar
```

Nach Änderungen an den Java-Framework-Klassen: `npm run build:framework`
(braucht ein lokales JDK ≥ 11), damit `public/framework.jar` zu den
Quelltexten passt.

## Nächste Schritte (Vorschlag)

1. CheerpJ im Schulnetz validieren; ggf. Self-Hosting klären.
2. Monaco-Editor mit Java-Syntaxfarben statt `textarea`.
3. Tastatur-/Touch-Eingabe für Spiele (`istTasteGedrueckt(...)`),
   Kollisionen (`beruehrt(...)`), Bilder/Sprites.
4. Projekte teilen (Export/Import als Datei oder Link) für Abgaben.
