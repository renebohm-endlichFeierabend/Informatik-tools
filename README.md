# JavaWelt — visuelle Lernumgebung für Java (Prototyp)

Eine web-native Lernumgebung für den Informatik-Unterricht der Oberstufe:
Objekte per Mausklick erzeugen, auf einer Welt platzieren und steuern — und
denselben Effekt mit **echtem Java**-Code erzielen. Ziel: das Gute aus BlueJ
(interaktive Objekte) und Greenfoot (Spielwelt) verbinden, aber **im Browser**
(iPad-tauglich) und **ohne Greenfoots verwirrenden Vererbungszwang**.

> Status: **früher Prototyp / Spike**. Er soll die Machbarkeit zeigen und über
> die Architektur entscheidbar machen — noch kein fertiges Produkt.

## Schnellstart

```bash
npm install
npm run dev      # http://localhost:5173
```

Das läuft sofort mit der **Mock-Laufzeit** (kein Download, kein Server).
Funktioniert ohne Internet und auf dem iPad.

## Was funktioniert (im Sandbox verifiziert)

- **Welt-Engine** (TypeScript/Canvas): Render-Schleife, weiche Bewegung,
  Maus- **und** Touch-Steuerung (Pointer Events → iPad).
- **Objektbank im BlueJ-Stil**: „neue Figur" erzeugt ein Objekt; Methoden
  (`geheVor`, `dreheDich`, `sage`) per Knopf interaktiv aufrufen — **ohne Code**.
- **Platzieren per Klick** auf die Welt; Figuren ziehen.
- **Code-Editor + „Ausführen"** (mit Mock: klar gekennzeichnete Demo-Animation).
- Sauberer Build (`npm run build`) und Framework-Jar (`npm run build:framework`).

## Was noch zu validieren ist (CheerpJ-Pfad)

Der echte Java-Pfad (`src/java/cheerpjLaufzeit.ts`) ist **vollständig
geschrieben**, konnte aber im Build-Sandbox **nicht ausgeführt** werden, weil
dort das CheerpJ-CDN blockiert ist und kein Browser läuft. Bitte bei euch testen:

1. **Checkbox „echtes Java (CheerpJ)"** oben rechts aktivieren. Dann sollte
   CheerpJ vom CDN laden und „CheerpJ bereit." erscheinen.
2. **Interop prüfen**: Figuren werden von Java über die `nativ*`-Methoden
   bewegt (Bridge in `cheerpjLaufzeit.ts`, Java-Seite in
   `java-framework/de/schule/jle/Figur.java`).
3. **In-Browser-Kompilierung**: benötigt den Eclipse-Compiler `ecj.jar`.
   - Lade eine `ecj-*.jar` (Eclipse Compiler for Java) herunter und lege sie
     als `public/ecj.jar` ab. (Kein Download im Sandbox möglich.)
   - Der Code ruft `org.eclipse.jdt.internal.compiler.batch.Main` via
     `cheerpjRunMain` auf und lädt das Ergebnis mit `cheerpjRunLibrary`.
   - Loader-Version/Pfade in `cheerpjLaufzeit.ts` ggf. an die genutzte
     CheerpJ-Version anpassen (`LOADER_URL`, `cheerpjAddStringFile`-Signatur).

Wenn CheerpJ nicht lädt, fällt die App automatisch auf die Mock-Laufzeit zurück.

## Architektur

```
┌─────────────────────────────────────────────────────────┐
│  Oberfläche (TypeScript)                                  │
│  · Welt-Engine (Canvas, Loop, Touch)   src/engine/        │
│  · Objektbank / Inspektor              src/ui/            │
│  · Code-Editor + Konsole               index.html         │
└───────────────┬───────────────────────────────────────────┘
                │ JavaLaufzeit-Interface  (src/java/laufzeit.ts)
        ┌───────┴────────┐
        ▼                ▼
  MockLaufzeit      CheerpJLaufzeit ──► CheerpJ (WASM-JVM)
  (pur JS,           · kompiliert Schülercode (ECJ) im Browser
   sofort lauffähig) · echtes Java + Reflexion, clientseitig
                     · Natives bewegen die Figuren der Engine
```

**Schlüsselidee:** Die Engine kennt CheerpJ nicht direkt. Sowohl die
Maus-Objektbank als auch echter Java-Code rufen **dieselbe Welt-API** auf
(`erzeugeFigur`, `geheVor`, …). Dadurch ist die App heute vorführbar und der
schwer testbare Java-Teil sauber gekapselt und einzeln validierbar.

### Warum CheerpJ?

Es ist (Stand 2026) der einzige Weg, **echtes Java inklusive Kompilierung
vollständig clientseitig** im Browser auszuführen — ohne Compile-Server, auch
auf dem iPad. Alternativen: TeaVM (braucht serverseitiges `javac`), DoppioJVM
(alt/langsam). Zu klären für den Schulbetrieb: CheerpJ-**Lizenz** für
Self-Hosting und **Datenschutz** (eigenes Hosting statt CDN).

## Pädagogik: bewusst anders als Greenfoot

- Die **Welt existiert bereits** als Objekt — sie muss **nicht** beerbt werden.
- Eine **Figur** ist ein normales Objekt: `new Figur("Bello")`. Erst der
  **Objektbegriff**, dann (später, wenn er dran ist) **Vererbung** — nicht vom
  Framework erzwungen.
- Deutsche, sprechende API (`geheVor`, `dreheDich`, `sage`).

## Nächste Schritte (Vorschlag)

1. CheerpJ-Pfad bei euch validieren (Punkte oben) — entscheidet die Architektur.
2. Monaco-Editor mit Java-Syntax statt `textarea`.
3. Eigene Klassen der Schüler in die Objektbank aufnehmen (Reflexion).
4. Framework ausbauen: Kollision, Tastatur/Spiel-Loop, Bilder/Sprites, Klänge.
5. Curriculum-Mapping Oberstufe (OOP, Datenstrukturen, Such-/Sortier­verfahren,
   Zustandsautomaten) als Beispiel-Szenarien.

## Projektstruktur

```
index.html                     Oberfläche
src/engine/                    Welt, Figur, Eingabe (Canvas/Touch)
src/ui/objektbank.ts           BlueJ-artige Objektinteraktion
src/java/laufzeit.ts           Interface MockLaufzeit ⇄ CheerpJLaufzeit
java-framework/                Java-API (Figur), build.sh → public/framework.jar
```
