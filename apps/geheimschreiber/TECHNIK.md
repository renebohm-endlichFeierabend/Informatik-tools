# Die Gilde der Geheimschreiber — Technisches Konzept

Umsetzungskonzept zum didaktischen Entwurf in [DIDAKTIK.md](DIDAKTIK.md).

> **Status:** Konzept. Die inhaltlichen Festlegungen sind mit der
> Fachlehrkraft abgestimmt (siehe DIDAKTIK.md, Abschnitt 11), die
> Umsetzung ist noch nicht begonnen. Versionsangaben sind zum
> 02.08.2026 geprüft (`npm view`), alles Weitere ist begründeter
> Vorschlag.

---

## 1 Anforderungen

| Anforderung | Herkunft | Konsequenz |
|---|---|---|
| Läuft auf **iPad 9** (2021) per Touch | Klassensatz der Schule | Touch-Bedienung ist gleichwertig, nicht nachgerüstet |
| Läuft auf **Windows-PC** mit Tastatur | Informatikraum | Zwei Eingabewege parallel aktiv, ohne Moduswahl |
| **Gesamtes Thema** eigenständig erarbeitbar | Auftrag | Durchgehender Story-Modus mit Fortschritt |
| **Einzelne Kapitel separat wählbar** | Auftrag | Kapitel sind voneinander unabhängig startbar |
| Grafik im **Pokémon-Stil** (GBA-Ära) | Auftrag | 2D-Top-Down, Pixel-Art, 16-px-Tiles |
| Läuft **auf einem Server**, Speicherung möglich | Auftrag | Konten mit Name/Passwort, Fortschritt serverseitig |
| Schul-WLAN, bis zu 30 Geräte gleichzeitig | Praxis | Kleines Initialpaket, Offline-Fähigkeit |

**Zielgerät iPad 9** (geprüft): 10,2″, physisch 2160 × 1620 px,
Browser-Viewport **810 × 1080 pt** (hoch) bzw. 1080 × 810 pt (quer) bei
Pixelverhältnis 2. Seitenverhältnis 4:3. Prozessor A13 Bionic — für ein
2D-Pixel-Art-Spiel reichlich dimensioniert; WebGL ist kein Problem.

Der Kontrast zum PC-Monitor (16:9, meist 1920 × 1080) ist die
eigentliche Layout-Herausforderung, nicht die Leistung.

---

## 2 Architektur im Überblick

```
┌─────────────────────────────────────────────────┐
│  Browser                                        │
│                                                 │
│  ┌───────────────────┐   ┌───────────────────┐  │
│  │  Spielwelt        │   │  Rätsel & Menüs   │  │
│  │  (Canvas/WebGL)   │   │  (DOM-Overlay)    │  │
│  │  Phaser           │   │  HTML/CSS/SVG     │  │
│  │  Karte, Figuren,  │   │  Cäsar-Scheibe,   │  │
│  │  Kamera, Kollision│   │  Diagramme,       │  │
│  │                   │   │  Gildenbuch       │  │
│  └─────────┬─────────┘   └─────────┬─────────┘  │
│            │                       │            │
│  ┌─────────┴───────────────────────┴─────────┐  │
│  │  Spielkern (framework-frei, testbar)      │  │
│  │  Kapitelsteuerung · Krypto-Logik ·        │  │
│  │  Inventar · Eingabe-Abstraktion           │  │
│  └─────────────────┬─────────────────────────┘  │
│                    │                            │
│  ┌─────────────────┴─────────────────────────┐  │
│  │  Speicher-Adapter (austauschbar)          │  │
│  │  lokal (localStorage)  │  Server (HTTPS)  │  │
│  └─────────────────┬─────────────────────────┘  │
└────────────────────┼────────────────────────────┘
                     │
              ┌──────┴──────┐
              │  Server     │  Node + Fastify + SQLite
              │  Konten,    │  Argon2id-Hashes
              │  Spielstände│  Sitzungs-Cookies
              └─────────────┘
```

**Die zentrale Entscheidung: Welt in Canvas, Rätsel im DOM.**

Die begehbare Stadt ist ein klassisches Tilemap-Spiel und gehört auf ein
Canvas. Die Rätsel dagegen sind Bedienoberflächen: eine drehbare
Chiffrierscheibe, ein Balkendiagramm, ein Texteingabefeld, eine
Schalterreihe. Diese im DOM zu bauen bringt konkrete Vorteile:

- **Texteingabe funktioniert.** Ein echtes `<input>` öffnet auf dem iPad
  die Systemtastatur korrekt, mit Autokorrektur-Abschaltung und
  passendem Tastaturlayout. In Canvas nachgebaute Eingabefelder sind auf
  iOS eine dauerhafte Fehlerquelle.
- **Vorlesefunktion und Bedienhilfen** greifen auf echten Text zu.
  Canvas-Text ist für VoiceOver unsichtbar.
- **Schriftgröße, Kontrast, Umbruch** kommen von CSS statt aus
  Handarbeit.
- **Die Rätsel sind einzeln testbar**, ohne die Spielwelt zu starten.

Die Grenze ist scharf: Phaser weiß nichts von den Rätseln, die Rätsel
wissen nichts von Phaser. Beide sprechen nur mit dem Spielkern.

---

## 3 Engine-Wahl

**Empfehlung: Phaser 3.90.0** für den Prototyp.

Stand 02.08.2026 auf npm (geprüft): `latest` ist **4.2.1**, die letzte
3.x-Version ist **3.90.0**. Phaser 4 erschien im April 2026 und bringt
u. a. GPU-gerenderte Tilemap-Layer — eine Optimierung, die bei
Stadtkarten dieser Größe keinen Unterschied macht.

Für Phaser 3.90 spricht das Ökosystem: Sämtliche Beispiele, Tutorials
und Antworten, die man bei einem Problem findet, beziehen sich darauf.
Bei einem Projekt, das auch von Kolleginnen und Kollegen oder in einer
Projektgruppe weitergeführt werden soll, ist das ein handfestes
Argument. Phaser 4 als Ziel für eine spätere Migration im Blick
behalten; ein eintägiger Vorversuch vor dem endgültigen Festlegen ist
sinnvoll — Marktreife nach vier Monaten ist schwer einzuschätzen, das
ist ausdrücklich eine Unsicherheit in dieser Empfehlung.

**Warum überhaupt eine Engine?** Tilemap-Rendering, Kachel-Kollision,
Kamera mit Verfolgung, Sprite-Animationen, Szenenverwaltung und
Tiled-Import selbst zu schreiben kostet mehrere Wochen und bringt
didaktisch nichts. Der Eigenanteil gehört in die Rätsel.

**Nicht empfohlen:** Godot- oder Unity-Web-Export. Beide liefern
WASM-Pakete im zweistelligen Megabyte-Bereich und setzen für
Multithreading Header voraus, die weder GitHub Pages noch ein einfacher
Schulserver ohne Weiteres liefert.

---

## 4 Darstellung und Auflösung

**Pixelraster.** Tiles 16 × 16 px, Figuren 16 × 24 px (Kopf ragt über
das Tile), Bewegung tile-basiert mit weicher Zwischenanimation — der
Look, den die GBA-Rollenspiele hatten.

**Skalierung.** Pixel-Art verträgt nur ganzzahlige Vergrößerung, sonst
werden Kanten unscharf oder ungleichmäßig dick. Verfahren:

```
Bezugssichtfeld: 320 × 240 virtuelle Pixel  (20 × 15 Tiles)
Zoom = max(2, floor(min(Fensterbreite / 320, Fensterhöhe / 240)))
Sichtfeld = Fenstergröße / Zoom   (kann größer als 320 × 240 sein)
```

Ergebnis auf den Zielgeräten:

| Gerät | Viewport (CSS-px) | Zoom | sichtbares Feld | Tiles |
|---|---|---|---|---|
| iPad 9 quer | 1080 × 810 | 3 | 360 × 270 | 22,5 × 16,9 |
| iPad 9 hoch | 810 × 1080 | 2 | 405 × 540 | 25,3 × 33,8 |
| PC 1920 × 1080 | 1920 × 1080 | 4 | 480 × 270 | 30 × 16,9 |
| PC 1366 × 768 | 1366 × 768 | 3 | 455 × 256 | 28,4 × 16 |

Am PC sieht man also mehr von der Welt als auf dem iPad. Bei einem
Rätselspiel ohne Wettbewerb ist das unkritisch — Alternative wäre
Letterboxing mit schwarzen Balken, was mehr kostet als es bringt.
Räume werden so gebaut, dass das Wesentliche in 320 × 240 passt.

**Wichtig:** `image-rendering: pixelated` im CSS und `pixelArt: true` in
der Phaser-Konfiguration; auf Geräten mit Pixelverhältnis 2 rendert
Phaser in Geräte-Pixeln, ein CSS-Zoom von 3 entspricht dann 6 echten
Pixeln pro Bildpunkt — bleibt ganzzahlig, bleibt scharf.

**Hoch- und Querformat.** Beides wird unterstützt. Quer ist der
empfohlene Modus (Hinweis beim ersten Start, nicht blockierend). Die
DOM-Overlays sind ohnehin responsiv und funktionieren in beiden
Ausrichtungen.

---

## 5 Eingabe

Eine Abstraktionsschicht übersetzt alle Eingaben in dieselben Aktionen:

```ts
type Aktion =
  | "hoch" | "runter" | "links" | "rechts"
  | "bestaetigen" | "abbrechen" | "menue" | "hilfe";
```

**Tastatur (Windows-PC).** Pfeiltasten und WASD für Bewegung,
Leertaste/Enter zum Bestätigen und für Gespräche, Esc für das Menü,
H für Bits Hilfe, Tab für den Gildenbeutel. Vollständige
Tastaturbedienbarkeit ist Pflicht — auch die Rätsel-Overlays müssen ohne
Maus lösbar sein (Fokusreihenfolge, sichtbarer Fokusrahmen).

**Touch (iPad).** Zwei Wege gleichzeitig:

- **Steuerkreuz unten links**, Aktionsknopf unten rechts, beide
  halbtransparent und in der Größe einstellbar. Vertrautes Muster.
- **Antippen eines Zielpunkts** bewegt die Figur dorthin (Wegsuche auf
  dem Kachelraster). Für Kinder, die mit virtuellen Steuerkreuzen
  fremdeln.

Beide sind immer aktiv, es gibt keine Umschaltung.

**Safari-Fallstricke** — hier steckt der Aufwand:

| Problem | Lösung |
|---|---|
| Doppeltipp zoomt die Seite | `touch-action: none` auf dem Spielbereich, `dblclick` unterdrücken |
| Überziehen scrollt die Seite | `overscroll-behavior: none`, Body fixiert |
| Graue Blitzer beim Tippen | `-webkit-tap-highlight-color: transparent` |
| Versehentliche Textmarkierung | `user-select: none` außerhalb von Eingabefeldern |
| Ton startet nicht | AudioContext erst nach der ersten Berührung starten |
| Ausschnitte unter der Home-Leiste | `viewport-fit=cover` + `env(safe-area-inset-*)` |
| Safari-Leisten fressen Platz | Als Web-App zum Home-Bildschirm hinzufügen (`apple-mobile-web-app-capable`); für den Klassensatz per MDM ausrollbar |

Ein früher Test auf einem echten iPad 9 ist wichtiger als jede
Simulation im Desktop-Browser. Das gehört in Etappe 1.

---

## 6 Inhalte als Daten

Kapitel sind Datenobjekte, kein Programmcode. Das ist die Voraussetzung
dafür, dass die freie Kapitelwahl sauber funktioniert:

```ts
export const leuchtturm: Kapitel = {
  id: "leuchtturm",
  nummer: 1,
  titel: "Der Leuchtturm",
  ort: "leuchtturm",
  kompetenzen: ["K3", "K4", "K6"],

  // Für den Story-Modus
  voraussetzungen: ["prolog"],
  verleihtWerkzeuge: ["signallampe"],
  verleihtGildenbuch: ["codes", "morse"],

  // Für den Direkteinstieg über die Werkstatt:
  // Was die Figur mitbekommt, wenn die Vorkapitel fehlen
  startZustandBeiDirektwahl: {
    werkzeuge: ["gildenbuch"],
    gildenbuchEintraege: ["daten-und-information"],
    einordnung: "Du weißt schon, dass Daten erst durch den Zusammenhang "
              + "zu einer Information werden. Morten braucht jetzt deine Hilfe."
  },

  karte: "karten/leuchtturm.json",
  dialoge: "dialoge/leuchtturm.de.json",
  raetsel: [/* ... */],
};
```

Ein Kapitel darf nie auf einen Zustand zugreifen, der nicht in
`voraussetzungen` oder `startZustandBeiDirektwahl` steht. Eine
Testroutine prüft das automatisch: Jedes Kapitel wird mit leerem
Spielstand plus Direktwahl-Startzustand geladen und durchlaufen.

**Krypto-Logik strikt getrennt.** `src/krypto/` enthält reine
Funktionen ohne UI-Bezug — Cäsar, Vigenère, Skytale, Gartenzaun,
Morse, Binär, Häufigkeitszählung. Diese sind vollständig unit-getestet.
Ein Fehler in der Cäsar-Verschiebung wäre im Unterricht fatal.

**Detail Umlaute.** Das deutsche Alphabet mit ÄÖÜß bricht jedes
26-Buchstaben-Verfahren. Festlegung: Vor dem Verschlüsseln werden
Ä→AE, Ö→OE, Ü→UE, ß→SS ersetzt, Satzzeichen und Leerzeichen entfernt.
Das ist die historisch übliche Praxis und wird im Spiel von Livia
ausdrücklich erklärt — nicht stillschweigend im Code versteckt.

---

## 7 Speicherung

### Stufe 1 — lokal (auch für GitHub Pages)

Spielstand als versioniertes JSON in `localStorage`. Vollständig
spielbar ohne Server, ohne Konto, ohne Netz. Ein Export als kurze
Zeichenkette erlaubt den Wechsel zwischen Geräten von Hand.

### Stufe 2 — Server mit Konten

Die Anwendung selbst bleibt identisch. Getauscht wird nur der
Speicher-Adapter:

```ts
interface SpeicherAdapter {
  laden(): Promise<Spielstand | null>;
  speichern(stand: Spielstand): Promise<void>;
}
```

**Offline zuerst.** Es wird immer erst lokal gespeichert, die
Übertragung zum Server läuft danach im Hintergrund. Bricht das
Schul-WLAN weg — was es tut —, spielt das Kind ungestört weiter, und der
Fortschritt geht beim nächsten Kontakt hoch. Ohne dieses Prinzip friert
das Spiel bei jedem Netzhänger ein.

**Zusammenführung.** Spielfortschritt ist fast überall einwegig:
Ein gelöstes Kapitel bleibt gelöst, ein Werkzeug bleibt im Beutel. Bei
Konflikten wird deshalb vereinigt statt überschrieben. Nur bei frei
geschriebenen Gildenbuch-Texten gewinnt der neuere Zeitstempel.

### Server-Entwurf

> **Die Zielumgebung steht noch nicht fest** und wird bewusst
> offengehalten. Deshalb ist unten die *Schnittstelle* festgelegt, nicht
> die Technik dahinter: Solange Frontend und Server nur über die
> beschriebenen HTTP-Aufrufe reden, lässt sich der Server später ohne
> Änderung am Spiel austauschen. Die lokale Speicherstufe funktioniert
> unabhängig davon — das Spiel ist zu keinem Zeitpunkt vom Server
> abhängig.

**Stack, falls frei wählbar:** Node 22 + Fastify + SQLite
(`better-sqlite3`). Begründung: Das Repository bringt die
Node-Werkzeugkette bereits mit, SQLite braucht keinen eigenen
Datenbankdienst, das Ganze läuft als ein Prozess in einem Container.

**Falls der Schulserver nur PHP anbietet:** Dieselbe API in PHP 8 +
SQLite, mit `password_hash()` und dem Algorithmus `PASSWORD_ARGON2ID`.
Der Aufwand ist überschaubar, weil die Schnittstelle klein ist — sieben
Endpunkte, zwei Tabellen.

**Schnittstelle:**

| Methode | Pfad | Zweck |
|---|---|---|
| `POST` | `/api/anmelden` | Name + Passwort → Sitzungs-Cookie |
| `POST` | `/api/abmelden` | Sitzung beenden |
| `POST` | `/api/passwort` | eigenes Passwort ändern |
| `GET` | `/api/spielstand` | Spielstand laden |
| `PUT` | `/api/spielstand` | Spielstand sichern |
| `GET` | `/api/lehrkraft/klasse/:id` | Fortschrittsübersicht, ausschließlich „gelöst / offen" je Kapitel (nur Rolle Lehrkraft) |
| `POST` | `/api/lehrkraft/konten` | Konten anlegen, Passwort zurücksetzen |

Eine Selbstregistrierung gibt es nicht — Konten legt allein die
Lehrkraft an. Damit entfällt jede Notwendigkeit, Kontaktdaten zur
Verifikation zu erheben.

**Datenmodell:**

```sql
CREATE TABLE konto (
  id            INTEGER PRIMARY KEY,
  anmeldename   TEXT NOT NULL UNIQUE,   -- Pseudonym, kein Klarname
  passwort_hash TEXT NOT NULL,          -- Argon2id
  rolle         TEXT NOT NULL           -- 'schueler' | 'lehrkraft'
                  CHECK (rolle IN ('schueler','lehrkraft')),
  klasse        TEXT,
  muss_passwort_aendern INTEGER NOT NULL DEFAULT 1,
  erstellt_am   TEXT NOT NULL
);

CREATE TABLE spielstand (
  konto_id    INTEGER PRIMARY KEY REFERENCES konto(id) ON DELETE CASCADE,
  version     INTEGER NOT NULL,
  daten       TEXT NOT NULL,            -- JSON
  geaendert_am TEXT NOT NULL
);
```

Mehr Tabellen braucht es nicht. Keine E-Mail-Adressen, keine
Geburtsdaten, keine Klarnamen, keine Anmeldeprotokolle über das
technisch Nötige hinaus.

**Sicherheit.** Ein paar Punkte sind bei einem Schulprojekt mit
Zwölfjährigen nicht verhandelbar:

- **Passwörter nur als Hash**, Argon2id (Alternative: bcrypt mit
  Kostenfaktor ≥ 12). Der Wunsch „Benutzername und Passwort werden auf
  dem Server gespeichert" wird genau so umgesetzt — der Name im
  Klartext, das Passwort als Hash. Kinder verwenden ihre Passwörter
  erfahrungsgemäß mehrfach; eine Klartextliste wäre der Fund, den man
  auf einem Schulserver am wenigsten hinterlassen will.
- **Nur über HTTPS** ausliefern, Sitzungs-Cookie `HttpOnly`, `Secure`,
  `SameSite=Lax`.
- **Anmeldeversuche begrenzen** (z. B. 10 pro Minute je Konto und je
  IP-Adresse) gegen simples Durchprobieren.
- **Erstpasswörter** erzeugt die Lehrkraft als Liste; beim ersten
  Anmelden ist eine Änderung erzwungen. Zurücksetzen kann nur die
  Lehrkraft — kein E-Mail-Versand, also auch keine E-Mail-Adressen nötig.
- **Rollentrennung serverseitig prüfen**, nicht im Frontend. Eine
  Lehrkraft sieht nur die eigenen Klassen.
- Passwörter niemals in Protokolldateien.

Die rechtliche Seite (Einwilligung, Elterninformation, Verzeichnis der
Verarbeitungstätigkeiten, ggf. Auftragsverarbeitungsvertrag beim
Hosting) steht in [DIDAKTIK.md](DIDAKTIK.md), Abschnitt 10. Technisch
ist das Konzept auf Datensparsamkeit ausgelegt; die juristische
Bewertung muss die Schule treffen.

---

## 8 Grafik und Assets

### Der rechtliche Punkt zuerst

Der **Stil** der Pokémon-Spiele ist nicht geschützt und darf frei
nachempfunden werden. Die **konkreten Grafiken** — Tilesets, Sprites,
Menürahmen, Schriftarten aus den Spielen — sind es sehr wohl
(Nintendo/Game Freak/Creatures). Aus Sprite-Archiven entnommenes
Material auf einer öffentlich erreichbaren Schulseite ist ein reales
Risiko und sollte nicht verwendet werden, auch nicht „nur für den
Prototyp": Solche Platzhalter überleben Projekte erfahrungsgemäß.

**Festgelegter Weg: CC0-Grundlage plus eigene Grafik**, ergänzt um
Charakterentwürfe aus einem begleitenden Kunst- oder Wahlpflichtkurs der
Schule.

- **Kenney.nl** — CC0, keine Namensnennung nötig, umfangreiche
  Top-Down-Pakete. Grundlage für Tilesets und Objekte.
- **OpenGameArt / itch.io**, konsequent auf CC0 gefiltert.
- **Liberated Pixel Cup (LPC)** — sehr passender Stil, aber CC-BY-SA:
  Namensnennung und Weitergabe unter gleichen Bedingungen. Nur im
  Notfall, weil es Buchführung über die Herkunft jeder Grafik erzwingt.

**Warum CC0, obwohl das Spiel zunächst nur an der LFSM laufen soll:**
Eine spätere Weitergabe an andere Schulen ist ausdrücklich offengehalten.
Lizenzen lassen sich nachträglich nicht mehr wechseln, ohne Grafik
auszutauschen — die Entscheidung fällt also faktisch jetzt. CC0 von
Anfang an kostet nichts und hält die Tür offen.

Für Grafiken aus einem Schulkurs gilt dasselbe: Wer zeichnet, sollte
vorab wissen und schriftlich zustimmen, dass die Bilder im Spiel
verwendet und ggf. weitergegeben werden. Bei minderjährigen
Urheberinnen und Urhebern gehört die Einwilligung der Eltern dazu.
Eine Nennung im Abspann des Spiels ist ohnehin selbstverständlich.

### Was ich beisteuern kann

Damit hier keine falsche Erwartung entsteht:

**Ja:**
- **SVG von Hand** — Bedienoberflächen, Cäsar-Scheibe, Siegel, Wappen,
  Symbole, Diagramme. Scharf auf jedem Bildschirm, sehr klein.
- **Prozedural erzeugte Pixelgrafik** — Skripte, die Tilesets, Muster,
  Bodenvariationen, Farbpaletten und einfache Objekte als PNG erzeugen.
  Reproduzierbar und im Repository versionierbar.
- **Karten** im Tiled-Format, von Hand oder generiert.
- **Blender-Python-Skripte** für parametrische Requisiten, die als
  Sprites gerendert werden (der Weg, den viele 2D-Spiele historisch
  gegangen sind: 3D produzieren, 2D ausliefern). Blender ist in dieser
  Arbeitsumgebung nicht installiert — die Skripte laufen lokal oder in
  einem CI-Schritt.
- **Farbpalette und Stilvorgaben**, damit zugekaufte und eigene Grafik
  zusammenpassen.

**Nein:** gemalte Charakter-Sprites, Portraits, handgezeichnete
Hintergründe. Dafür fehlt mir hier ein Bildgenerator. Realistisch
sind CC0-Grundlagen, extern erzeugte Sprites, die ich einbaue, oder —
naheliegend an einer Schule — ein Kunst- oder Wahlpflichtkurs, der
Figuren beisteuert.

### Budget

Ziel: **unter 5 MB** für den ersten Start, Kapitel-Assets werden bei
Bedarf nachgeladen. Bei 30 iPads im selben WLAN ist das der Unterschied
zwischen „geht sofort" und „die ersten zehn Minuten der Stunde sind weg".

Ton: CC0-Quellen, standardmäßig **aus** (Klassenraum!), mit Hinweis auf
Kopfhörer. Die Klopfzeichen in Kapitel 1 haben immer eine sichtbare
Entsprechung — kein Rätsel ist ohne Ton unlösbar.

---

## 9 Projektstruktur

Eigene App neben JavaWelt, gleiche Werkzeugkette, getrennter Build.
JavaWelt richtet sich an die Oberstufe, dies hier an Klasse 6 — eine
gemeinsame Anwendung würde beiden schaden.

```
apps/geheimschreiber/
├── DIDAKTIK.md
├── TECHNIK.md
├── index.html
├── package.json
├── vite.config.ts            # base: "./", wie javawelt
├── public/
│   └── assets/
│       ├── tilesets/  sprites/  karten/  ton/
├── src/
│   ├── main.ts
│   ├── welt/                 # Phaser-Szenen: Stadt, Innenräume, Kamera
│   ├── ui/                   # DOM-Overlays: Rätsel, Gildenbuch, Menü
│   ├── krypto/               # reine Logik, vollständig getestet
│   ├── inhalte/              # Kapitel-Manifeste, Dialoge, Rätseldaten
│   ├── speicher/             # Adapter lokal | server
│   ├── eingabe/              # Tastatur, Touch, Aktions-Abstraktion
│   └── kern/                 # Spielstand, Inventar, Kapitelsteuerung
├── tests/
│   ├── krypto/               # node:test
│   ├── kapitel/              # Direktwahl-Prüfung jedes Kapitels
│   └── ui/                   # Playwright
└── server/                   # Stufe 2
    ├── src/
    └── schema.sql
```

**Name (festgelegt).** Ordner und URL-Pfad `geheimschreiber`,
Spieltitel „Die Gilde der Geheimschreiber".

**Erweiterbarkeit auf Klasse 5.** Kapitel 1 der Klasse 5 („Digitaler
Informationsaustausch") soll perspektivisch ergänzt werden können. Die
Struktur trägt das bereits: Kapitel sind Datenobjekte, Orte sind
eigenständige Karten, der Spielstand kennt Kapitel nur über ihre `id`.
Nötig wäre lediglich ein zweiter Städte-Abschnitt und eine
Jahrgangsauswahl beim Start — kein Umbau. Damit das so bleibt, darf
nirgends im Code eine feste Kapitelliste stehen; die Kapitel werden
ausschließlich aus `src/inhalte/` eingelesen.

---

## 10 Bauen und Ausliefern

Der bestehende Workflow `.github/workflows/deploy.yml` bekommt einen
zweiten App-Block analog zu JavaWelt:

```yaml
- name: Geheimschreiber bauen
  working-directory: apps/geheimschreiber
  run: npm ci && npm run build

- name: Geheimschreiber einbinden
  run: mkdir -p dist/geheimschreiber && cp -r apps/geheimschreiber/dist/. dist/geheimschreiber/
```

Damit läuft das Spiel unter `…/geheimschreiber/` auf GitHub Pages — in
der lokalen Speicherstufe voll spielbar. Das ist der Weg für Erprobung
und Elternabend.

Für den Serverbetrieb wird derselbe Build zusammen mit dem
Node-Serverprozess ausgeliefert; der Server liefert die statischen
Dateien aus und beantwortet `/api/*`. Ein Docker-Container, eine
SQLite-Datei, eine Sicherungskopie im Backup-Plan der Schule.

---

## 11 Tests

Passend zum Stil des Repositorys (`node tests/laufAlle.mjs` in JavaWelt):

- **Krypto-Logik** (`node:test`): Cäsar für alle 26 Verschiebungen hin
  und zurück, Vigenère, Skytale mit verschiedenen Stabdicken,
  Gartenzaun, Morse, Binärumrechnung, Häufigkeitszählung. Dazu
  Umlautbehandlung und Randfälle (leerer Text, ein Zeichen).
- **Kapitel-Integrität:** Jedes Kapitel wird mit leerem Spielstand plus
  Direktwahl-Startzustand geladen; verweist ein Rätsel auf ein Werkzeug,
  das dort nicht enthalten ist, schlägt der Test fehl. Das hält die
  freie Kapitelwahl dauerhaft funktionsfähig.
- **Oberfläche** (Playwright): Durchspielen eines Kapitels per Tastatur
  *und* per simuliertem Touch; Prüfung, dass beide Wege ans Ziel führen.
- **Speicher:** Zusammenführung lokaler und serverseitiger Stände,
  besonders der Netzabbruch mitten im Kapitel.

Vor jedem Push müssen `npm test` und `npm run build` grün sein — analog
zur Regel in `CLAUDE.md`.

---

## 12 Umsetzung in Etappen

| Etappe | Inhalt | Ergebnis |
|---|---|---|
| **1** | Gerüst, eine begehbare Karte, Tastatur + Touch, Skalierung | **Test auf echtem iPad 9** — trägt das Bedienkonzept? |
| **2** | Rätsel-Rahmen + Kapitel 4 (Cäsar) vollständig | Ein Kapitel von vorn bis hinten, als Muster für alle weiteren |
| **3** | Krypto-Logik komplett mit Tests | Fachliche Korrektheit gesichert |
| **4** | Kapitel P, 1, 2, 3 | Erste Hälfte im Unterricht erprobbar |
| **5** | Kapitel 5–8, Finale, optional 4a | Inhaltlich vollständig |
| **6** | Speicher-Adapter, Server, Anmeldung, Lehrkraft-Ansicht | Serverbetrieb |
| **7** | Grafik-Politur, Ton, Vorlesefunktion, Bedienhilfen | Auslieferungsreif |

Nach Etappe 2 ist die belastbarste Einschätzung des Gesamtaufwands
möglich — vorher wäre jede Zahl geraten. Etappe 1 und 2 sind der
sinnvolle erste Auftrag.

---

## 13 Risiken

| Risiko | Einschätzung | Umgang |
|---|---|---|
| **Grafik ist der Engpass**, nicht der Code | hoch | Früh entscheiden: CC0-Basis oder eigene Produktion. Etappe 2 mit Platzhaltern, aber CC0-lizenzierten |
| Safari-Eigenheiten auf dem iPad | mittel | Test auf echtem Gerät in Etappe 1, nicht am Ende |
| Umfang: 10 Kapitel sind viel | mittel | Kapitel sind unabhängig — auch vier fertige Kapitel sind im Unterricht nutzbar |
| Serverbetrieb und Wartung an der Schule | mittel | Lokale Speicherstufe bleibt dauerhaft funktionsfähig; der Server ist Komfort, keine Voraussetzung |
| Phaser-4-Umstieg später nötig | gering | Spielkern ist framework-frei; nur `src/welt/` wäre betroffen |
| Datenschutzklärung dauert | gering–mittel | Stufe 1 (ohne Konten) ist sofort einsetzbar und braucht keine Klärung |

---

*Didaktische Grundlage: [DIDAKTIK.md](DIDAKTIK.md).*
