# KI-gestütztes Selbstlernprogramm Java — Konzept

Ein geführtes Selbstlernangebot für **Java in der gymnasialen Oberstufe
(Kernlehrplan NRW)**, aufbauend auf den vorhandenen Werkzeugen dieses
Repositorys und auf dem Schulserver mit Backend.

> **Status:** Konzeptentwurf, noch nicht umgesetzt. Die didaktischen
> Festlegungen sind Vorschläge zur Abstimmung; die technischen sind
> begründete Empfehlungen unter den in Abschnitt 13 genannten offenen
> Entscheidungen. Recherchestand: 04.08.2026.

**Verhältnis zu den anderen Dokumenten:** Dieses Papier beschreibt die
*Lernsitzung* und die *Serverseite*. Was innerhalb einer Aufgabe
passiert — Teilszenarien, Checks, visuelles Feedback, Hilfestufen,
Gamification-Regeln — ist bereits in
[`apps/javawelt/KONZEPT_AUFGABEN.md`](apps/javawelt/KONZEPT_AUFGABEN.md)
entschieden und wird hier **nicht neu verhandelt, sondern eingebettet**.
Der technische Stand der Lernumgebung steht in
[`apps/javawelt/ENTWICKLUNG.md`](apps/javawelt/ENTWICKLUNG.md).

---

## 1 Ausgangslage

### Was schon da ist

| Baustein | Zustand | Rolle im Selbstlernprogramm |
|---|---|---|
| **JavaWelt** (`apps/javawelt/`) | in Betrieb, echtes Java per CheerpJ, 7 Szenarien, NRW-Klassenbibliothek, SQL | **Der Arbeitsplatz.** Hier wird programmiert, hier entsteht das Feedback |
| **Java-Analyse-Tool** (`java_analyse_tool.html`) | in Betrieb, OpenRouter, kennt die NRW-Klassen-APIs | Vorlage für die KI-Anbindung; wird durch das Server-Gateway ersetzt |
| **Aufgabenkonzept** (`KONZEPT_AUFGABEN.md`) | entschieden, Umsetzung in Phasen | **Die Aufgabendidaktik.** Teilszenarien, Checks, Hilfestufen 0–4 |
| **Schulserver mit Backend** | im Aufbau | **Der Ermöglicher.** Lernstand, Gateway, Lehrkraft-Sicht |

### Was der Server ändert

Drei Kompromisse des bisherigen Konzepts fallen damit weg:

1. **Der API-Schlüssel muss nicht mehr ins Frontend.** Aktuell setzt
   `.github/workflows/deploy.yml` das Secret `OPENROUTER_KEY` per `sed`
   in `java_analyse_tool.html` ein — der Schlüssel steht damit im
   Klartext im öffentlich abrufbaren HTML auf GitHub Pages. Für eine
   Einzelnutzung ein Kostenrisiko, als Grundlage für Klassensätze
   untragbar. Mit Server geht jeder KI-Aufruf über ein Gateway, der
   Schlüssel bleibt serverseitig.
2. **Der Lernstand kann bestehen bleiben.** Bisher: `localStorage`
   (gerätegebunden, von Safari löschbar) plus Projektdatei von Hand.
   Ein geführter Einstieg („was war letztes Mal?") braucht dagegen ein
   Gedächtnis über Sitzungen und Geräte hinweg.
3. **Die Lehrkraft-Sicht ist nicht mehr zurückgestellt.**
   `KONZEPT_AUFGABEN.md` hatte das Dashboard ausdrücklich vertagt, weil
   es zentrale Datenhaltung braucht. Die ist jetzt vorhanden.

Was der Server **nicht** ändert: Java läuft weiter im Browser
(CheerpJ). Ein serverseitiger Java-Runner ist nicht nötig und wird
bewusst zurückgestellt — er brächte Sandboxing, Ressourcenlimits und
Warteschlangen als neue Probleme ein (siehe 12).

### Vorbedingung, die noch offen ist

`ENTWICKLUNG.md`, offener Punkt 1: **Läuft CheerpJ im Schulnetz auf dem
iPad?** Solange das ungeprüft ist, ist unklar, ob die Lernumgebung im
Vollbetrieb oder im Notbetrieb landet. Ein Selbstlernprogramm auf einer
Umgebung im Notbetrieb aufzubauen wäre die falsche Reihenfolge — dieser
Test steht vor Phase 1 (siehe 12).

---

## 2 Leitbild: die Lernsitzung als geführter Zyklus

Der Wunsch ist ein Ablauf, der sich wie Unterricht anfühlt: erst
sprechen und anknüpfen, dann arbeiten, dann sichern. Genau das ist die
klassische Artikulation einer Stunde — Einstieg, Erarbeitung, Sicherung
— nur für eine Person. Sechs Phasen:

| # | Phase | Ort | ca. | Wer führt |
|---|---|---|---|---|
| 1 | **Anknüpfen** — Rückblick, 2–3 Wiederholungsfragen | Chat (groß) | 3–6 min | Tutor fragt |
| 2 | **Zielklärung** — was heute dran ist und warum | Chat (groß) | 1–2 min | Tutor schlägt vor, Lernende:r wählt |
| 3 | **Erarbeitung / Übung** | JavaWelt, Chat als Seitenleiste | 20–40 min | Lernende:r arbeitet |
| 4 | **Begleitung** — Hilfestufen 0–4 auf Anforderung | Seitenleiste | laufend | Lernende:r fordert an |
| 5 | **Sicherung** — Regel selbst formulieren, Abgabe | Chat (groß) | 5–8 min | Tutor fragt, Lernende:r formuliert |
| 6 | **Abschluss** — was sitzt, was kommt | Chat (groß) | 1–2 min | Tutor |

Fünf Festlegungen dazu:

**1. Ein Fenster, kein Werkzeugwechsel.** Chat und Entwicklungsumgebung
sind dieselbe Seite. In den Phasen 1, 2, 5 und 6 nimmt der Chat den
Hauptteil des Bildschirms ein; in Phase 3 schrumpft er zur
Seitenleiste, ohne den Verlauf zu verlieren. Auf einem iPad im
Hochformat (Viewport 810 × 1080 pt) ist ein Nebeneinander von Chat,
Editor und Welt nicht darstellbar — der Chat wird dort zur
einklappbaren Lasche.

**2. Die Wiederholung ist echt, nicht dekorativ.** Die Fragen in Phase 1
werden aus dem Lernstand gezogen, und zwar bevorzugt aus den
**Fehlermustern der letzten Sitzungen** und aus Bausteinen, deren letzte
Bearbeitung länger zurückliegt (Prinzip verteiltes Üben). Wer letzte
Woche `nenne()` und Konstruktor verwechselt hat, wird genau daran
angeknüpft.

**3. Der Übergang in die Aufgabe ist ein Sprung, kein Link.** Am Ende
von Phase 2 lädt die Umgebung das Teilszenario, legt die Klassen an und
zeigt den Aufgabentext — im selben Zustand, in dem eine Lehrkraft eine
Aufgabe verteilt. Technisch ist das der vorhandene Deep-Link-Mechanismus
(`?szenario=`, `#projekt=`), nur serverseitig gesteuert.

**4. Sicherung heißt: die Lernenden formulieren.** In Phase 5 fasst
nicht der Tutor zusammen. Der Tutor fragt, die Lernenden schreiben
1–3 Sätze, und *erst danach* ergänzt oder schärft der Tutor. Das ist die
in `KONZEPT_AUFGABEN.md` vorgesehene Reflexion, an die richtige Stelle
im Ablauf gesetzt.

**5. Sitzungen dürfen unfertig enden.** Nach einer eingestellten
Zeitspanne (Vorschlag: konfigurierbar, Standard 45 min) leitet der Tutor
zur Sicherung über, auch wenn der Baustein nicht fertig ist. Der Stand
wird gespeichert und beim nächsten Mal in Phase 1 aufgegriffen. Ohne
diese Regel entstehen ausufernde Sitzungen ohne Sicherung — der
häufigste Fehler bei Selbstlernprogrammen.

---

## 3 Die zentrale Architekturentscheidung

> **Adaptivität deterministisch, Formulierung generativ.**

Die Auswahl der nächsten Aufgabe, die Bewertung „bestanden / offen" und
die Fortschreibung des Lernstands entstehen aus **Regeln über
überprüfbaren Fakten** — Parser-Ergebnisse, Weltzustand nach dem Lauf,
Prüffälle, SQL-Ergebnisvergleiche. Das Sprachmodell formuliert, fragt,
erklärt und diagnostiziert *Vorschläge*. Es entscheidet nichts, was den
Lernstand verändert.

Warum diese Trennung nicht verhandelbar ist:

- **Nachvollziehbarkeit.** Wenn der Tutor sagt „das hast du drauf", muss
  ein Beleg dahinterstehen, den die Lehrkraft nachlesen kann.
- **Kein Durchreden.** Ein Modell, das aus dem Gespräch auf Kompetenz
  schließt, lässt sich durch selbstsicheres Auftreten überzeugen. Ein
  Check nicht.
- **Reproduzierbarkeit.** Dieselbe Ausgangslage soll morgen zur selben
  Empfehlung führen.
- **Ausfallsicherheit.** Fällt das Gateway aus, funktioniert der Ablauf
  weiter — mit statischen Hilfen und Textbausteinen statt Gespräch
  (siehe 11).
- **Kosten und Datenschutz.** Jede Entscheidung, die eine Regel treffen
  kann, ist ein Aufruf weniger und eine Datenübermittlung weniger.

Konkret heißt das:

| Aufgabe | Wer erledigt sie |
|---|---|
| Nächsten Baustein bestimmen | Regelwerk über dem Kompetenzgraph |
| Baustein als bestanden markieren | ausschließlich Checks |
| Wiederholungsfragen auswählen | Regelwerk (Fehlermuster + Abstand) |
| Wiederholungsfragen *formulieren* | Modell (oder statischer Fragenpool) |
| Fehlermeldung eindeutschen und verorten | Umgebung (Stufe 0, deterministisch) |
| Hilfestufen 1–3 zum konkreten Code | Modell, im Rahmen der Guardrails |
| Hilfestufe 4 (Letzthilfe) | statisch im Baustein hinterlegt |
| Reflexionstext einordnen | Modell schlägt vor, Lehrkraft sieht Original |
| Note | niemand im System (siehe 9) |

---

## 4 Lernstandsmodell

### Kompetenzgraph statt Kursliste

Die Inhalte werden als **Bausteine mit Voraussetzungen** modelliert, nicht
als lineare Kapitelfolge. Ein Baustein ist die kleinste Einheit, die man
sinnvoll in einer Sitzung schaffen kann (Richtwert 20–40 min Arbeit) und
die sich durch Checks belegen lässt.

Beispiel aus dem Q1-Kontext (Wiederholung Vererbung → Datenstrukturen):

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

Der Graph erlaubt, was eine Liste nicht kann: mehrere gleichzeitig
offene Wege, gezieltes Nachholen einer Lücke mitten im Kurs, und einen
Einstieg an beliebiger Stelle für Wiederholung vor der Klausur.

### Was gespeichert wird — und was nicht

Pro Lernende:r und Baustein:

| Feld | Beispiel | Zweck |
|---|---|---|
| Status | `offen` / `in Arbeit` / `belegt` | Wegwahl |
| Belege | „Check *Kuh erbt von Tier* bestanden, 04.08." | Nachvollziehbarkeit |
| Fehlermuster | `konstruktor_statt_nenne`, `off_by_one` | Wiederholungsfragen, Diagnose |
| höchste genutzte Hilfestufe | 2 | Einschätzung der Selbstständigkeit |
| Reflexionstext | Freitext, 1–3 Sätze | Sicherung, Lehrkraft-Sicht |
| letzte Bearbeitung | Zeitstempel | verteiltes Üben |

**Fehlermuster sind ein eigener, gepflegter Katalog** — keine
Freitext-Diagnosen des Modells. Startbestand aus der Erfahrung, die in
`ENTWICKLUNG.md` schon dokumentiert ist: `super`-Aufruf erwartet,
`new Hund("Rex")` ohne deklarierten Konstruktor, Groß-/Kleinschreibung,
fehlendes Semikolon, Endlosschleife ohne `warte()`, Vergleich mit `==`
bei Objekten. Neue Muster ergänzt die Lehrkraft; das Modell darf
*vorschlagen*, dass ein Muster vorliegt, aber keines erfinden.

**Nicht erhoben** wird alles, was nach Leistungsmessung aussieht, ohne
diagnostisch nötig zu sein: keine Bearbeitungsdauer pro Aufgabe, keine
Tastenprotokolle, keine Zahl der Compilerläufe, kein Vergleich zwischen
Lernenden. Die Argumentation ist dieselbe wie in
`apps/geheimschreiber/DIDAKTIK.md`, Abschnitt 9: Was nicht erhoben wird,
kann nicht missverstanden werden — und ist zugleich die datensparsamste
Lösung. **Anzahl der Fehlversuche** ist der Grenzfall: für die
Diagnose („wo bleiben viele hängen?") nützlich, als Zahl neben einem
Namen problematisch. Vorschlag: nur aggregiert über die Lerngruppe
auswerten, nicht pro Person anzeigen (offene Entscheidung, 13).

---

## 5 Baustein-Format

Ein Baustein ist eine Datendatei, kein Code — damit Fachkolleginnen und
-kollegen ihn ohne Programmierkenntnisse anpassen können und damit alle
Inhalte versionierbar bleiben. Skizze:

```jsonc
{
  "id": "q1.vererbung.polymorphie",
  "titel": "Dieselbe Methode, verschiedenes Verhalten",
  "stufe": "Q1",
  "inhaltsfeld": "Daten und ihre Strukturierung",
  "kompetenzen": ["MI", "DI"],          // Bereiche des KLP, siehe 8
  "voraussetzungen": ["q1.vererbung.grundidee"],
  "dauer_min": 30,

  "anknuepfen": [                        // Phase 1, Pool
    { "frage": "Was erbt eine Unterklasse von ihrer Oberklasse - und was nicht?",
      "erwartet": ["Attribute", "Methoden", "nicht: Konstruktoren"] }
  ],

  "teilszenario": "vererbung_tiere_stimmen",   // Klassensatz in JavaWelt

  "auftrag": "Gib Hund und Katze je eine eigene Fassung von gibLaut().",

  "checks": [
    { "art": "parser", "regel": "klasse Hund ueberschreibt gibLaut" },
    { "art": "parser", "regel": "klasse Katze ueberschreibt gibLaut" },
    { "art": "weltzustand", "regel": "konsole enthaelt 'Wau' und 'Miau'",
      "sichtbar": "Beide Tiere zeigen ihre Sprechblase" }
  ],

  "hilfen": {
    "1": "Schau dir an, welche Methode du in Tier vorfindest.",
    "2": "Was muesste in Hund stehen, damit Hund etwas anderes tut als Tier?",
    "3": "Eine Unterklasse kann eine geerbte Methode neu schreiben - mit genau derselben Signatur.",
    "4": "gerüst:public void gibLaut() {\n  // hier die Ausgabe fuer den Hund\n}"
  },

  "reflexion": "Woher weiss Java bei tier.gibLaut(), welche Fassung gilt?",

  "fehlermuster_erwartet": ["signatur_abweichend", "super_aufruf_erwartet"]
}
```

Die Felder `checks`, `hilfen` und `reflexion` entsprechen eins zu eins
den Festlegungen in `KONZEPT_AUFGABEN.md` (Prüfformen je Aufgabenformat,
Hilfestufen 0–4, Reflexion als Übergang zur Sicherung). Neu sind nur
`voraussetzungen`, `anknuepfen` und `fehlermuster_erwartet` — die drei
Felder, die den geführten Sitzungsablauf tragen.

**Erstellt werden Bausteine KI-gestützt, aber nicht KI-verantwortet:**
Das Modell generiert Entwürfe für Fragen, Hilfen, Prüffälle und
Varianten, die Lehrkraft redigiert und gibt frei. Das ist genau die
Rolle, die `KONZEPT_AUFGABEN.md` der KI zuweist („statisch hinterlegte
Hilfen sind der Normalfall; KI ist Zusatzstufe") — hier nur systematisch
zur Autorenwerkstatt ausgebaut.

---

## 6 Rolle und Grenzen des Sprachmodells

### Was der Tutor bekommt (Kontextvertrag)

Bei jedem Aufruf **genau das** und nichts weiter:

- Rolle und Regeln (Systemprompt, versioniert)
- der aktuelle Baustein: Ziel, Auftrag, erwartete Fehlermuster, die
  hinterlegten Hilfen (damit er sie *benutzt* statt eigene zu erfinden)
- Auszug aus dem Lernstand: Status der Nachbarbausteine, offene
  Fehlermuster — **pseudonymisiert**, ohne Klarnamen
- der aktuelle Schülercode der betroffenen Klasse(n)
- die letzte Compiler- oder Laufzeitmeldung im Original
- die Check-Ergebnisse des letzten Laufs
- die aktuell angeforderte Hilfestufe
- der Gesprächsverlauf der laufenden Sitzung

**Nie:** Klarnamen, Noten, Daten anderer Lernender, frühere
Reflexionstexte im Wortlaut (nur als Fehlermuster verdichtet).

### Guardrails

Angelehnt an den Stand der Forschung zu CodeHelp, CodeAid und Iris —
alle drei setzen darauf, dass kein vollständiger Lösungscode
herausgegeben wird, sondern Hinweise und Gegenfragen:

1. **Kein lauffähiger Lösungscode.** Auch nicht auf Nachfrage, auch
   nicht „nur als Beispiel". Zulässig sind Gerüste mit Lücken und
   analoge Beispiele an *anderem* Gegenstand — genau die Formen, die
   `KONZEPT_AUFGABEN.md` als Stufe 4 vorsieht.
2. **Reflexionsschranke vor Stufe 2.** Vor einer inhaltlichen Hilfe
   beantwortet die Lernende eine kurze Frage: „Was hast du erwartet,
   was passiert stattdessen?" Kein Punktabzug, keine Wartezeit — nur
   diese eine Frage. Begründung: Studien zu KI-Hinweisen finden einen
   *Reflection-Satisfaction-Tradeoff*: Reflexion vor dem Hinweis wirkt
   lernförderlich, senkt aber die Zufriedenheit. Der Kompromiss ist
   eine einzige Frage statt eines Formulars.
   *Unsicherheit:* Diese Befunde stammen aus dem Hochschulkontext; ob
   Oberstufenschüler die Frage als Hürde oder als Hilfe erleben, ist
   im Feld zu prüfen (siehe 11).
3. **Hilfen kosten nie etwas.** Unverändert aus
   `KONZEPT_AUFGABEN.md`: keine Coin-Verluste, keine schlechteren
   Abzeichen, kein Vermerk „hat Hilfe gebraucht" in irgendeiner
   Bewertung. Die höchste genutzte Hilfestufe ist ein
   *Diagnose*-Merkmal, kein Leistungsmerkmal.
4. **Auf dem Boden bleiben.** Der Tutor bezieht sich auf den
   tatsächlichen Code, die tatsächliche Meldung, das tatsächliche
   Szenario. Keine erfundenen Klassennamen, keine Java-Konstrukte, die
   die Umgebung nicht kann (Threads, Sockets, Dateizugriff, Pakete —
   siehe die Grenzen in `ENTWICKLUNG.md`).
5. **Fachlich auf NRW-Kurs.** Datenstrukturen nur mit den
   NRW-Klassen-Signaturen; kein `java.util.Stack`, keine
   `ArrayList`-Vorschläge. Der Bestand an API-Beschreibungen im
   `java_analyse_tool.html` wird dafür übernommen.
6. **Kein Rollenspiel, keine Umwidmung.** Der Tutor bleibt beim Thema.
   Auf Off-Topic reagiert er kurz und führt zurück; auf Versuche, die
   Regeln zu überschreiben, gar nicht.
7. **Sprache.** Deutsch, Oberstufenniveau, kurze Sätze, Fachbegriffe
   werden benutzt und beim ersten Mal erklärt. Duzen.
8. **Zuständigkeitsgrenze.** Bei allem, was über Fachliches
   hinausgeht — Frust, Überforderung, persönliche Belastung —
   antwortet der Tutor freundlich, aber nicht beratend, und verweist
   auf die Lehrkraft. Er protokolliert das nicht.

### Was gegen Missbrauch schützt

Die belegbasierte Architektur nimmt dem naheliegenden Umweg den Reiz:
Man kann den Tutor nicht überreden, einen Baustein als bestanden zu
markieren, und man kann die Aufgabe nicht durch Reden ersetzen. Wer die
Lösung anderswo besorgt, bekommt den Haken — das ist auch bei
Papieraufgaben so und wird durch die Reflexionsfrage in Phase 5 zumindest
sichtbar: Wer nicht erklären kann, was er abgibt, fällt auf.

---

## 7 Serverseite

### Anforderungen

| Anforderung | Konsequenz |
|---|---|
| Bis zu 30 iPads gleichzeitig, Schul-WLAN | kleine Nutzlasten, lokaler Puffer, Wiederaufnahme nach Netzhänger |
| KI-Schlüssel niemals im Frontend | jeder Modellaufruf über das Gateway |
| Lernstand geräteunabhängig | serverseitige Speicherung, Konten |
| Ausfall der KI darf nicht blockieren | Chat ist Schicht, nicht Fundament |
| Lehrkraft sieht Bearbeitungsstände | Rollen, Klassenzuordnung |
| Kosten begrenzbar | Budget je Konto und Sitzung, serverseitig durchgesetzt |

### Stack

**Vorschlag: derselbe wie im Geheimschreiber-Konzept** — Node 22 +
Fastify + SQLite (`better-sqlite3`), Argon2id für Passwörter, ein
Prozess in einem Container. Begründung: Die Werkzeugkette liegt im
Repository schon vor, es gibt keinen zweiten Dienst zu betreiben, und
die Schule betreibt dann **einen** Servertyp für beide Anwendungen statt
zwei. Falls der Schulserver nur PHP anbietet, gilt dieselbe Überlegung
wie dort: Die Schnittstelle ist klein genug, um sie in PHP 8 + SQLite
nachzubauen.

Bei mehr als einer Lerngruppe gleichzeitig und wachsendem Chatverlauf
ist PostgreSQL statt SQLite die naheliegende Ausbaustufe; die
Schnittstelle bleibt gleich. *Schätzung, nicht gemessen:* Für 30
gleichzeitige Sitzungen reicht SQLite deutlich — die Last liegt beim
Modellanbieter, nicht in der Datenbank.

### Schnittstelle (Entwurf)

| Methode | Pfad | Zweck |
|---|---|---|
| `POST` | `/api/anmelden` | Pseudonym + Passwort → Sitzungs-Cookie |
| `POST` | `/api/abmelden` | Sitzung beenden |
| `POST` | `/api/passwort` | eigenes Passwort ändern |
| `GET` | `/api/lernstand` | eigener Lernstand |
| `POST` | `/api/sitzung/start` | Sitzung eröffnen → Phase-1-Fragen + Vorschlag |
| `POST` | `/api/sitzung/nachricht` | Chatbeitrag → Antwort des Tutors (Gateway) |
| `POST` | `/api/baustein/pruefen` | Check-Ergebnisse melden → Lernstand fortschreiben |
| `POST` | `/api/hilfe` | Hilfestufe anfordern (statisch oder Gateway) |
| `POST` | `/api/sitzung/abschluss` | Reflexion + Abgabe speichern |
| `GET` | `/api/bausteine` | Kurs-/Bausteindefinitionen (öffentlich lesbar) |
| `GET` | `/api/lehrkraft/klasse/:id` | Übersicht der Lerngruppe (nur Lehrkraft) |
| `GET` | `/api/lehrkraft/abgabe/:id` | einzelne Abgabe samt Reflexion (nur Lehrkraft) |
| `POST` | `/api/lehrkraft/konten` | Konten anlegen, Passwort zurücksetzen |
| `POST` | `/api/lehrkraft/entwurf` | KI-Entwurf für Hilfen/Fragen/Prüffälle (nur Lehrkraft) |

**Die Checks laufen im Client** (Parser + Weltzustand liegen dort), das
Ergebnis wird gemeldet. Das ist manipulierbar — und akzeptabel, weil das
System nicht bewertet. Wo Manipulationssicherheit nötig wäre, gäbe es
Noten, und die gibt es hier nicht (siehe 9). Der eingereichte Code liegt
der Abgabe bei; die Lehrkraft kann jederzeit nachsehen.

### Datenmodell (Skizze)

```sql
CREATE TABLE konto (            -- wie Geheimschreiber, gleiche Regeln
  id INTEGER PRIMARY KEY,
  anmeldename TEXT NOT NULL UNIQUE,      -- Pseudonym, kein Klarname
  passwort_hash TEXT NOT NULL,           -- Argon2id
  rolle TEXT NOT NULL CHECK (rolle IN ('schueler','lehrkraft')),
  kurs TEXT,
  muss_passwort_aendern INTEGER NOT NULL DEFAULT 1,
  erstellt_am TEXT NOT NULL
);

CREATE TABLE lernstand (
  konto_id INTEGER NOT NULL REFERENCES konto(id) ON DELETE CASCADE,
  baustein TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('offen','in_arbeit','belegt')),
  belege TEXT,                  -- JSON: welche Checks wann bestanden
  fehlermuster TEXT,            -- JSON: Katalog-IDs
  hilfestufe_max INTEGER,
  geaendert_am TEXT NOT NULL,
  PRIMARY KEY (konto_id, baustein)
);

CREATE TABLE sitzung (
  id INTEGER PRIMARY KEY,
  konto_id INTEGER NOT NULL REFERENCES konto(id) ON DELETE CASCADE,
  begonnen_am TEXT NOT NULL,
  beendet_am TEXT,
  baustein TEXT,
  reflexion TEXT,               -- Freitext der Lernenden
  verlauf TEXT                  -- JSON, Aufbewahrungsfrist siehe 8
);

CREATE TABLE abgabe (
  id INTEGER PRIMARY KEY,
  sitzung_id INTEGER NOT NULL REFERENCES sitzung(id) ON DELETE CASCADE,
  projekt TEXT NOT NULL,        -- Quelltexte als JSON
  erstellt_am TEXT NOT NULL
);
```

### KI-Gateway

Ein eigener Serverbaustein, damit der Modellanbieter austauschbar bleibt:

- **Schlüssel nur serverseitig.** `java_analyse_tool.html` wird auf das
  Gateway umgestellt und der `sed`-Schritt aus dem Workflow entfernt.
  Der bisherige Schlüssel gilt danach als offengelegt und ist zu
  ersetzen.
- **Pseudonymisierung im Gateway**, nicht im Frontend: Klarnamen kommen
  dort ohnehin nicht vor, aber der Prüfpunkt gehört an eine Stelle.
- **Budget und Ratelimit je Konto und Sitzung**, serverseitig
  durchgesetzt. Die tatsächlichen Kosten sind vorab nicht seriös
  schätzbar (Modellwahl, Kontextlänge, Nutzungsintensität) — sie sind in
  einer Pilotgruppe zu **messen**, bevor eine Jahrgangsstufe startet.
- **Promptversionen im Repository**, nicht in der Datenbank. Änderungen
  am Tutorverhalten sind Codeänderungen mit Review — nicht
  Konfiguration, die jemand nachmittags anpasst.
- **Modellwahl offen.** Zwei Wege: gehostete API mit EU-Verarbeitung und
  Auftragsverarbeitungsvertrag, oder ein lokales Modell auf dem
  Schulserver. Letzteres braucht GPU und liefert bei kleinen Modellen
  *vermutlich* nicht die Qualität, die deutschsprachige, fachlich
  präzise Rückfragen brauchen — das ist eine ausdrückliche Unsicherheit
  und praktisch zu testen, nicht zu behaupten.
- **Protokollierung sparsam:** Aufruf, Baustein, Modell, Tokenzahl,
  Dauer, Ergebnisstatus. Inhalte nur, soweit für die Reflexion nötig
  (siehe 8).

---

## 8 Datenschutz

Die Anwendung verarbeitet Daten Minderjähriger über Schülerkonten und
schickt Schülertexte an einen KI-Dienst. Das ist vor dem ersten Einsatz
zu klären, nicht danach. Die Grundlinien folgen
`apps/geheimschreiber/DIDAKTIK.md`, Abschnitt 10:

- **Pseudonyme statt Klarnamen**, keine Selbstregistrierung, Konten
  ausschließlich durch die Lehrkraft; Passwörter nur als Argon2id-Hash;
  Auslieferung nur über HTTPS.
- **Datensparsamkeit als Voreinstellung.** Erhoben wird, was Abschnitt 4
  auflistet — nicht mehr.
- **Was an das Modell geht**, ist in Abschnitt 6 abschließend
  aufgezählt: Code, Fehlermeldung, Baustein, Fehlermuster,
  Gesprächsverlauf der Sitzung. Kein Name, keine Klasse, keine Noten.
- **Aufbewahrung.** Vorschlag: Chatverläufe 14 Tage (für Rückfragen und
  Fehleranalyse), Lernstand und Reflexion bis Schuljahresende, Konten
  danach gelöscht. Frist ist festzulegen, nicht offenzulassen.
- **Transparenz.** Zu Beginn der Einheit wird gesagt: Was gespeichert
  wird, was die Lehrkraft sieht, dass der Chat an einen Dienstleister
  geht, und dass nichts davon in die Note eingeht.
- **Auftragsverarbeitung.** Für den Modellanbieter ist ein AV-Vertrag
  nötig; die Verarbeitung sollte in der EU stattfinden. Die im Repo
  bislang genutzte OpenRouter-Kette ist dafür **nicht ohne Prüfung
  geeignet** — dort steht ein Vermittler zwischen Schule und
  Modellanbieter. Alternative Wege: direkter Vertrag mit einem Anbieter
  mit EU-Verarbeitung, ein Schul-Layer wie fobizz/schulKI (falls eine
  NRW-Landeslizenz besteht — *nicht verifiziert*), oder lokales Modell.

**KI-Verordnung (EU AI Act).** Anhang III der Verordnung listet
Bildungssysteme als Hochrisiko-Bereich, unter anderem für Systeme, die
Lernergebnisse bewerten oder über Zugang entscheiden. Nach meiner
Lesart ist das ein weiteres starkes Argument für die Trennung aus
Abschnitt 3: Das System **bewertet nicht**, es diagnostiziert formativ;
die Bewertung bleibt vollständig bei der Lehrkraft, und der Lernstand
fließt nicht in Noten ein. Ob das die Einordnung sicher vermeidet, kann
ich nicht beurteilen — das ist eine juristische Frage für die
Schulleitung und die Datenschutzbeauftragte, und sie sollte **vor** dem
Klasseneinsatz gestellt werden. Ich kann das Konzept datensparsam und
bewertungsfrei auslegen; die rechtliche Bewertung kann ich nicht
ersetzen.

---

## 9 Leistungsbewertung

**Das Selbstlernprogramm bewertet nicht.** Keine Noten, keine
Punktzahlen, keine Rangfolge, kein Vergleich zwischen Lernenden. Der
Lernstand ist Diagnose — und das wird den Lernenden zu Beginn gesagt.

Das ist keine Zurückhaltung aus Vorsicht, sondern Voraussetzung dafür,
dass das System funktioniert: Sobald der Fortschritt zählt, wird
Hilfeverzicht rational und Täuschung attraktiv. Beides zerstört genau
die Daten, aus denen die Adaptivität lebt.

Was in die „Sonstigen Leistungen" eingeht, entsteht **außerhalb** des
Programms: im Unterrichtsgespräch, in der Präsentation einer Lösung, in
der Klausur. Die Abgabe (Projektdatei + Reflexion) ist dafür Material,
das die Lehrkraft heranziehen kann — sie ist Dokumentation der Arbeit,
nicht ihre Messung.

**Rahmen in NRW:** Es gibt seit 2023 einen Handlungsleitfaden des
Ministeriums zu textgenerierenden KI-Systemen sowie eine unter
NRW-Federführung erarbeitete KMK-Handlungsempfehlung. Praktisch heißt
das: Selbstlernphasen mit KI-Unterstützung ja, Bewertungssituationen
davon getrennt. Genau so ist das Konzept angelegt. Die konkreten
Vorgaben sind am Original zu prüfen — ich habe sie nur über
Sekundärquellen und Pressemitteilungen gesehen.

---

## 10 Curriculare Verankerung

Die Bausteine werden den Inhaltsfeldern und Kompetenzbereichen des
Kernlehrplans Informatik SII zugeordnet; jeder Baustein trägt die
Zuordnung im Feld `inhaltsfeld` und `kompetenzen` (Abschnitt 5). Grober
Rahmen, wie er zum Unterrichtskontext in `ENTWICKLUNG.md` passt:

| Abschnitt | Schwerpunkt | vorhandene JavaWelt-Szenarien |
|---|---|---|
| EF | Objekte und Klassen, Attribute, Methoden, Kontrollstrukturen | „Erste Schritte" |
| Q1 | Vererbung und Polymorphie, Arrays, lineare Strukturen (Stack, Queue, List), Datenbanken (ER, Normalformen, SQL) | „Vererbung & Polymorphie", „Arrays", „Stack/Queue/List", „Datenbank Zoo" |
| Q2 | Bäume, Graphen, Suchen und Sortieren, formale Sprachen und Automaten | geplant (Roadmap-Punkt 5) |

**Zwei Vorbehalte, ausdrücklich:**

1. Die **exakten Formulierungen der Kompetenzerwartungen** müssen aus
   dem KLP-Original übernommen werden, wie es im
   Geheimschreiber-Konzept für die Sek I gemacht wurde. Ich habe sie
   hier nicht zitiert, weil ich sie nicht am Original prüfen konnte —
   `lehrplannavigator.nrw.de` liefert dem Proxy dieser Umgebung 403
   (dasselbe Problem ist in `DIDAKTIK.md` dokumentiert).
2. **Novellierung.** Nach den Suchergebnissen werden die
   Oberstufen-Kernlehrpläne bis zum Schuljahr 2025/26 novelliert. Ob
   für Informatik SII inzwischen ein neuer KLP gilt, konnte ich nicht
   verifizieren. Das ist zu klären, bevor die Bausteinstruktur
   festgeschrieben wird — sie hängt daran.

Der schulinterne Lehrplan der LFSM für die SII ist die verbindliche
Grundlage und liegt mir nicht vor. Wenn er verfügbar ist, sollte die
Zuordnungstabelle nach dem Muster von `DIDAKTIK.md`, Abschnitt 2,
vollständig ausgeführt werden.

---

## 11 Beispielsitzung

So soll sich das anfühlen — Q1, Wiederholung Vererbung, zweite Sitzung.
„T" ist der Tutor, „S" die Schülerin.

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
> **T** Richtig. Damit ist die Baustelle zu. Heute würde ich an genau
> der Stelle weitermachen: Katze soll etwas anderes sagen als Hund, und
> danach schauen wir, was passiert, wenn beide als `Tier` in einem
> Array liegen. Das ist der Kern von Polymorphie — Klausurthema.
> Passt das, oder willst du erst noch Arrays üben?
>
> **S** passt.
>
> **T** Gut. Ich lade dein Projekt von letztem Mal, Katze ist schon
> angelegt. Auftrag steht rechts. Ich bin in der Seitenleiste, wenn du
> mich brauchst.

*Die Umgebung öffnet das Teilszenario. Nach acht Minuten kommt eine
Compilermeldung, die Umgebung übersetzt sie selbst (Stufe 0). Nach
zwei weiteren Versuchen tippt S auf „Ich brauche einen Hinweis".*

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
zwei Sprechblasen. Nach 40 Minuten leitet der Tutor zur Sicherung
über.*

> **T** Das läuft. Bevor wir Schluss machen: Warum ruft
> `tier.gibLaut()` bei einem Hund die Hund-Fassung auf, obwohl die
> Variable vom Typ `Tier` ist? Zwei, drei Sätze in deinen Worten.
>
> **S** weil java erst beim laufen guckt was das objekt wirklich ist,
> nicht was in der variable steht.
>
> **T** Das ist genau der Punkt — der Fachbegriff dafür ist
> *dynamische Bindung*, den brauchst du in der Klausur. Ich habe deinen
> Satz gespeichert, du kannst ihn ins Heft übernehmen. Nächstes Mal:
> dieselben Tiere in einem Array, und eine Schleife, die alle
> durchgeht. Bis dann!

Was daran technisch bemerkenswert ist: Jeder Schritt, der etwas am
Lernstand ändert, hängt an einem Check — die Konstruktor-Frage in Phase
1 an einem Fehlermuster aus der letzten Sitzung, der Haken am
bestandenen Weltzustand, die Reflexion als Freitext ohne Bewertung. Das
Gespräch ist die Oberfläche, nicht die Buchführung.

**Wenn das Gateway ausfällt**, läuft dieselbe Sitzung ohne Gespräch:
Phase 1 zeigt die Wiederholungsfragen aus dem Pool als Karten mit
Auflösung, Phase 2 den Vorschlag als Text mit Auswahl, Phase 4 die
statischen Hilfen 1–4, Phase 5 das Reflexionsfeld. Spürbar nüchterner —
aber vollständig. Diese Betriebsart ist zugleich die erste Ausbaustufe
(siehe 12) und damit von Anfang an getestet, nicht nur theoretisch
vorhanden.

---

## 12 Umsetzung in Etappen

Jede Etappe endet mit etwas Benutzbarem und mit einer Frage, die vorher
beantwortet sein muss.

| # | Etappe | Inhalt | Abbruchfrage davor |
|---|---|---|---|
| 0 | **Vorbedingungen** | CheerpJ auf dem Schul-iPad prüfen; Serverumgebung festlegen; OpenRouter-Schlüssel aus dem Frontend entfernen und ersetzen | Läuft echtes Java im Schulnetz oder nur Notbetrieb? |
| 1 | **Bausteine ohne KI** | Baustein-Format, Kompetenzgraph, Aufgabenpanel, Checks, statische Hilfen 0–4, Reflexion, Sitzungsablauf deterministisch; Lernstand noch lokal | Trägt Selbstlernen fachlich, bevor KI dazukommt? |
| 2 | **Server** | Konten, Lernstand, Abgaben, Lehrkraft-Übersicht; Offline-zuerst mit Nachtragen | Ist der Datenschutzrahmen geklärt? |
| 3 | **Autorenwerkstatt** | KI-Entwürfe für Hilfen, Fragen, Prüffälle, Varianten — nur für die Lehrkraft, Freigabe von Hand | Spart das echte Vorbereitungszeit? |
| 4 | **Tutor im Gespräch** | Gateway, Phasen 1, 2, 5, 6 als Chat; Hilfestufen 1–3 dynamisch mit Reflexionsschranke | Kosten gemessen? Guardrails im Pilot gehalten? |
| 5 | **Adaptiv** | verteiltes Üben über Fehlermuster, Wiederholungsvorschläge vor Klausuren, Differenzierung nach oben | Nutzen die Lernenden das Angebot freiwillig? |
| 6 | **Perspektivisch** | kooperative Szenarien, serverseitige Prüfläufe (javac/JUnit), Ausweitung auf weitere Kurse | Reicht der clientseitige Weg nachweislich nicht? |

Die Reihenfolge ist bewusst so: **Etappe 1 ist der ehrliche Test.**
Wenn Selbstlernen mit guten Aufgaben, echten Checks und statischen
Hilfen nicht trägt, wird ein Chat es nicht retten — er würde das
Problem nur verdecken. Und Etappe 1 ist zugleich die
Ausfallbetriebsart aus Abschnitt 11, die man sowieso braucht.

---

## 13 Evaluation

Woran erkennen wir, dass es wirkt — und woran, dass es schadet?

**Fachlich.** Anteil der Bausteine, die ohne Hilfestufe 3/4 bestanden
werden; Bestehen von Bausteinen, deren Voraussetzungen länger
zurückliegen (Behaltensleistung); Vergleich zweier Kurse oder
Halbjahre, wenn es sich anbietet — mit der ausdrücklichen Einschränkung,
dass das keine Studie ist und Kohorteneffekte nicht kontrolliert.

**Der Gegenbefund, auf den wir achten müssen.** Die Forschung zu
KI-Unterstützung beschreibt *metacognitive laziness*: Lernende lagern
Zielsetzung, Fehlerüberwachung und Reflexion an die KI aus, statt sich
anzustrengen. Beobachtbare Warnzeichen in unseren Daten:

- Sprünge direkt auf die höchste Hilfestufe ohne eigenen Versuch
  zwischendurch
- Reflexionstexte, die wie die Tutor-Formulierung klingen statt wie
  eigene Worte
- Bausteine bestanden, deren Voraussetzung kurz darauf nicht mehr sitzt
- viele Chatbeiträge bei wenigen Compilerläufen

Reagiert wird darauf mit dem Ablauf, nicht mit Strafen: mehr
Reflexionsschranken, kürzere Hilfen, mehr Bausteine mit produktivem
Anteil. Was ausdrücklich **nicht** passiert: Hilfen verteuern oder
Hilfenutzung sichtbar sanktionieren.

**Praktisch.** Verfügbarkeit im Schulnetz, Kosten je Sitzung, Anteil der
Sitzungen, die im Ausfallbetrieb liefen, und die einfachste Frage
überhaupt: Nutzen die Lernenden es, wenn sie nicht müssen?

---

## 14 Offene Entscheidungen

| Frage | Wer entscheidet | Warum sie blockiert |
|---|---|---|
| **Serverumgebung**: Schulserver, VPS, Schulträger; Stack frei wählbar? | Schule / du | bestimmt Abschnitt 7 |
| **Modellanbieter und Rechtsweg**: eigener AVV, Schul-Layer (fobizz/schulKI, NRW-Lizenz?), oder lokales Modell | Schulleitung + DSB | Abschnitt 8; ohne das keine Etappe 4 |
| **Aufbewahrungsfristen** für Chatverläufe und Lernstand | Schule / DSB | Abschnitt 8 |
| **Fehlversuche pro Person**: erheben oder nur aggregiert? | Fachschaft | Abschnitt 4 |
| **KLP-Stand**: gilt für Informatik SII ein novellierter Kernlehrplan? Schulinterner LP verfügbar? | du | Abschnitt 10; bestimmt den Bausteinschnitt |
| **Kurs für den Piloten**: EF-Einstieg oder Q1-Wiederholung Vererbung? | du | bestimmt den ersten Bausteinsatz |
| **Einsatzform**: Hausaufgabe, STUDIO-/Selbstlernzeit, Vertretung, Klausurvorbereitung, Binnendifferenzierung? | du | bestimmt Sitzungslänge und Umfang |
| **Verhältnis zu OneNote**: bleibt OneNote die Sicherung, oder wandert sie ins Programm? | du | bestimmt den Export in Phase 5 |

---

## 15 Recherchestand

Die Einordnung beruht auf einer Marktsichtung vom 04.08.2026. Kurzfassung
dessen, was es gibt, und woran wir uns anlehnen:

| System | Was wir übernehmen |
|---|---|
| **Artemis** (TUM, Open Source) mit KI-Tutor **Iris** | Trennung Autograding / Tutor; Hinweise und Gegenfragen statt Lösungen |
| **CodeHelp**, **CodeAid** (CHI/SIGCSE, im Semesterbetrieb evaluiert) | Guardrail-Katalog; Befund, dass KI-Hilfe vor allem bei Fehlersuche genutzt wird |
| **CodeOcean / CodeHarbor** (HPI, openHPI) | Aufgaben als austauschbare Datenobjekte, Autograding per Prüffällen |
| **inf-schule.de** | Referenz für deutschsprachiges, lehrplankonformes Selbstlernen — statisch, ohne Prüfung und ohne KI |
| **ChatGPT Study Mode / Gemini Guided Learning / Khanmigo** | Sokratischer Gesprächsstil; für Java ohne Fachkontext und ohne Lernstand aber nicht ausreichend |

**Die Lücke, die dieses Konzept füllt:** Keines der recherchierten
Systeme verbindet deutschsprachige Oberstufendidaktik nach NRW-Lehrplan,
die NRW-Klassenbibliothek, iPad-Betrieb ohne Installation und —
entscheidend — **Feedback aus dem Weltzustand statt aus einem Chat**.
Der letzte Punkt ist der eigentliche Unterschied: Bei Artemis und
CodeOcean sagt ein Testlauf, ob es stimmt; hier sieht man es an der
Figur. Das kann keines der genannten Systeme, und es ist bereits gebaut.
