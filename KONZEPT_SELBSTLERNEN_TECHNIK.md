# Selbstlernprogramm Java — Infrastruktur

Technisches Konzept und Auftragsbeschreibung für die Serverseite des
Selbstlernprogramms. Die Didaktik steht in
[`KONZEPT_SELBSTLERNEN.md`](KONZEPT_SELBSTLERNEN.md) — dieses Papier
beschreibt, **was gebaut wird**, nicht warum es didaktisch sinnvoll ist.

> **Status:** Konzept, Umsetzung nicht begonnen. Die Schnittstelle in
> Abschnitt 5 ist der Vertrag zwischen Inhalten und Infrastruktur;
> Änderungen daran bitte abstimmen, alles andere ist Vorschlag.
> Recherchestand 04.08.2026.

**An wen sich das richtet:** Die Infrastruktur wird als Projektarbeit
von einem Schüler gebaut. Dieses Papier ist so geschrieben, dass daran
selbstständig gearbeitet werden kann — mit Abnahmekriterien pro Etappe
(Abschnitt 10) und einer klaren Liste dessen, was ausdrücklich **nicht**
dazugehört (Abschnitt 12). Wo eine Entscheidung begründet ist, steht die
Begründung dabei; wo etwas nicht verhandelbar ist, steht das auch.

---

## 1 Was hier gebaut wird

Ein kleiner Server, der vier Dinge tut:

1. **Konten und Sitzungen** — Anmeldung, Rollen (Schüler/Lehrkraft).
2. **Lernstand speichern** — wer hat welchen Baustein in welcher
   Tätigkeit belegt, mit welchen Belegen und Fehlermustern.
3. **KI-Aufrufe vermitteln** — das Gateway, damit der API-Schlüssel
   niemals im Browser landet.
4. **Lehrkraft-Sicht ausliefern** — Übersicht der Lerngruppe, Sichtung
   von Freitexten, Kontenverwaltung.

**Was nicht dazugehört:** Java kompilieren oder ausführen. Das passiert
weiterhin im Browser (CheerpJ, siehe `apps/javawelt/ENTWICKLUNG.md`).
Ein serverseitiger Java-Runner würde Sandboxing, Ressourcenlimits und
eine Warteschlange als neue Probleme einbringen und wird bewusst nicht
gebaut.

---

## 2 Rahmenbedingungen

| Anforderung | Herkunft | Konsequenz |
|---|---|---|
| Bis zu 30 iPads gleichzeitig | Klassensatz | kleine Nutzlasten, keine Dauerverbindungen nötig |
| Schul-WLAN, bricht weg | Praxis | **Offline zuerst**: erst lokal speichern, dann übertragen |
| iPad 9, Safari | Klassensatz | keine exotischen Browser-APIs, Cookies statt Header-Tokens |
| API-Schlüssel niemals im Frontend | Sicherheit | jeder Modellaufruf über das Gateway |
| Lernstand geräteunabhängig | Didaktik | serverseitige Speicherung, Konten |
| Ausfall der KI darf nicht blockieren | Didaktik (Etappe D3) | Chat ist Schicht, nicht Fundament |
| Kosten begrenzbar | Betrieb | Budget je Konto und Sitzung, **serverseitig** durchgesetzt |
| Daten Minderjähriger | Recht | Abschnitte 8 und 9, nicht verhandelbar |

**Offline zuerst** heißt konkret: Das Frontend schreibt jeden Fortschritt
sofort in `localStorage` und schickt ihn danach zum Server. Bricht das
Netz weg, arbeitet die Schülerin weiter; beim nächsten Kontakt wird
nachgetragen. Ohne dieses Prinzip friert die Anwendung bei jedem
Netzhänger ein — und im Schul-WLAN hängt es.

**Zusammenführung bei Konflikten:** Lernstand ist fast überall einwegig
(belegt bleibt belegt). Deshalb wird **vereinigt statt überschrieben**;
nur bei Freitexten gewinnt der neuere Zeitstempel.

---

## 3 Architektur im Überblick

```
┌──────────────────────────────────────────────────────────┐
│  Browser (iPad / PC)                                     │
│                                                          │
│  ┌────────────┐  ┌────────────┐  ┌───────────────────┐   │
│  │ Chat-Panel │  │  Werkbank  │  │  JavaWelt         │   │
│  │ (Phasen    │  │  (Formate  │  │  (Editor, Welt,   │   │
│  │  1,2,5,6)  │  │   F1-F8)   │  │   Objektbank)     │   │
│  └──────┬─────┘  └──────┬─────┘  └─────────┬─────────┘   │
│         │               │                  │             │
│  ┌──────┴───────────────┴──────────────────┴─────────┐   │
│  │  Sitzungssteuerung + Prüflogik (Checks!)          │   │
│  │  Kompetenzgraph, Formatwahl, Fehlermuster         │   │
│  └──────────────────────┬────────────────────────────┘   │
│                         │                                │
│  ┌──────────────────────┴────────────────────────────┐   │
│  │  Speicher-Adapter:  localStorage  +  Server-API   │   │
│  └──────────────────────┬────────────────────────────┘   │
└─────────────────────────┼────────────────────────────────┘
                          │ HTTPS, Sitzungs-Cookie
              ┌───────────┴────────────┐
              │  Server                │
              │                        │
              │  Konten & Rollen       │
              │  Lernstand             │
              │  Freitexte & Abgaben   │
              │  Lehrkraft-Sicht       │
              │  ┌──────────────────┐  │
              │  │  KI-Gateway      │──┼──► Modellanbieter
              │  │  Schlüssel,      │  │
              │  │  Budget, Prompts │  │
              │  └──────────────────┘  │
              └────────────────────────┘
```

**Die Prüflogik liegt im Client**, nicht auf dem Server. Parser,
Weltzustand und Tabellenvergleich sind schon dort (bzw. entstehen dort);
der Server bekommt das *Ergebnis* gemeldet. Das ist manipulierbar — und
zulässig, weil das System nicht bewertet (siehe
`KONZEPT_SELBSTLERNEN.md`, Abschnitt 11). Der eingereichte Code liegt
jeder Abgabe bei, die Lehrkraft kann nachsehen.

Wer das ändern wollte, müsste Java serverseitig ausführen — siehe
Abschnitt 12.

---

## 4 Technikwahl

**Empfehlung: Node 22 + Fastify + SQLite (`better-sqlite3`),
Argon2id für Passwörter, ein Prozess in einem Container.**

Begründung:

- Das Repository bringt die Node-Werkzeugkette schon mit (JavaWelt baut
  mit Vite und npm) — keine zweite Sprache im Projekt.
- SQLite braucht keinen eigenen Datenbankdienst. Bei 30 gleichzeitigen
  Nutzern liegt die Last beim Modellanbieter, nicht in der Datenbank.
  *Das ist eine Schätzung, nicht gemessen* — bei mehreren Lerngruppen
  parallel und wachsenden Chatverläufen ist PostgreSQL die naheliegende
  Ausbaustufe. Die Schnittstelle bleibt dabei gleich, deshalb ist der
  Wechsel später billig.
- Dasselbe Gespann ist im Geheimschreiber-Konzept vorgeschlagen
  (`apps/geheimschreiber/TECHNIK.md`, Abschnitt 7). Die Schule betreibt
  dann **einen** Servertyp für beide Anwendungen statt zwei.

**Falls der Schulserver nur PHP anbietet:** dieselbe Schnittstelle in
PHP 8 + SQLite, mit `password_hash()` und `PASSWORD_ARGON2ID`. Der
Aufwand ist überschaubar, weil die Schnittstelle klein ist.

**Attrappen-Server zuerst.** Bevor irgendetwas Echtes steht, sollte es
einen Attrappen-Server geben, der alle Endpunkte aus Abschnitt 5 mit
festen Beispieldaten beantwortet (in-memory, keine Datenbank). Zwei
Gründe: Die Inhalte-Seite kann sofort dagegen entwickeln, und die
Schnittstelle wird einmal komplett durchdacht, bevor Datenbankschema und
Logik entstehen. Das ist ausdrücklich Teil von Etappe S1.

---

## 4a Ablage, Umgebung und Auslieferung

### Wo der Code hingehört

```
apps/lernserver/          <- neu, dein Teil
  src/                    Server (Endpunkte, Regeln, Gateway)
  migrationen/            versionierte SQL-Dateien
  tests/
  README.md               Start, Konfiguration, Backup, Wiederherstellung
  package.json
```

Die Konventionen des Repositorys gelten (`CLAUDE.md`): **Deutsch** in
Bezeichnern, Meldungen und Commits; eigener Arbeitsbranch, kleine
thematisch geschlossene Pull Requests; `npm test` und `npm run build`
müssen vor jedem Push grün sein.

**Abgrenzung:** `apps/lernserver/` ist dein Bereich. Die
Lernumgebung (`apps/javawelt/`), die Werkbank und die Inhalte kommen von
der didaktischen Seite. Berührungspunkt ist ausschließlich die
Schnittstelle in Abschnitt 5 — dann können beide Seiten parallel
arbeiten, ohne sich in die Dateien zu fassen. Eine Ausnahme ist
abgesprochen: die Umstellung von `java_analyse_tool.html` auf das
Gateway (Etappe S3).

### Umgebungsvariablen

Keine Pfade, Ports oder Schlüssel im Code. Vorschlag für die Namen:

| Variable | Bedeutung | Beispiel |
|---|---|---|
| `PORT` | Port des Servers | `8080` |
| `DB_PFAD` | Datei der SQLite-Datenbank | `/daten/lernserver.db` |
| `SITZUNG_GEHEIMNIS` | Schlüssel zum Signieren der Sitzungs-Cookies | (langer Zufallswert) |
| `KI_SCHLUESSEL` | API-Schlüssel für das Gateway | — |
| `KI_MODELL` | Modellbezeichner | `deepseek/deepseek-chat` |
| `KI_BUDGET_SITZUNG` | Obergrenze Modellaufrufe je Sitzung | `20` |
| `HINTER_PROXY` | ob ein Reverse Proxy davor steht (beeinflusst Cookie und IP-Erkennung) | `true` |

Ohne gesetzten `KI_SCHLUESSEL` startet der Server trotzdem und
verhält sich wie bei einem Gateway-Ausfall — das ist der Normalzustand
während der Entwicklung.

### Auslieferung: alles unter einem Ursprung

Der Server liefert **auch die statischen Dateien** des Frontends aus
(den Vite-Build von JavaWelt) — unter demselben Host und Port wie die
`/api/...`-Pfade. Zwei Gründe: Es gibt dann **kein CORS** zu
konfigurieren, und das Sitzungs-Cookie funktioniert ohne Sonderfälle
(`SameSite=Lax` reicht). Ein zusätzlicher Webserver ist nicht nötig.

Praktisch: alles, was nicht mit `/api/` beginnt, wird aus dem
Build-Verzeichnis bedient, unbekannte Pfade auf `index.html`.

## 5 Schnittstelle

Alle Antworten JSON, alle Fehler mit passendem HTTP-Status und einem
Feld `fehler` mit einer **deutschen, für Lernende verständlichen**
Meldung. Authentifizierung über ein Sitzungs-Cookie.

### Konten und Sitzung

| Methode | Pfad | Zweck |
|---|---|---|
| `POST` | `/api/anmelden` | Pseudonym + Passwort → Sitzungs-Cookie |
| `POST` | `/api/abmelden` | Sitzung beenden |
| `POST` | `/api/passwort` | eigenes Passwort ändern |
| `GET` | `/api/ich` | eigenes Konto: Pseudonym, Rolle, Kurs |

### Inhalte (öffentlich lesbar, keine personenbezogenen Daten)

| Methode | Pfad | Zweck |
|---|---|---|
| `GET` | `/api/bausteine` | alle Bausteindefinitionen + Kompetenzgraph |
| `GET` | `/api/uebungen?baustein=<id>` | Übungen zu einem Baustein |

Beide liefern die Dateien aus Abschnitt 7 von
`KONZEPT_SELBSTLERNEN.md`. Sie dürfen aggressiv zwischengespeichert
werden (ETag), sie ändern sich selten.

### Lernen

| Methode | Pfad | Zweck |
|---|---|---|
| `GET` | `/api/lernstand` | eigener Lernstand (Baustein × Operatorgruppe) |
| `POST` | `/api/sitzung/start` | Sitzung eröffnen → Wiederholungsfragen + Vorschlag für Baustein/Format |
| `POST` | `/api/sitzung/nachricht` | Chatbeitrag → Antwort des Tutors (über Gateway) |
| `POST` | `/api/versuch` | Ergebnis eines Checks oder Übungsversuchs melden → Lernstand fortschreiben |
| `POST` | `/api/hilfe` | Hilfestufe anfordern (statisch aus dem Baustein oder über Gateway) |
| `POST` | `/api/freitext` | Freitextantwort einreichen (Reflexion, Erläuterung, Beurteilung) |
| `POST` | `/api/sitzung/abschluss` | Sitzung beenden, Abgabe speichern |

**Wichtig zu `/api/versuch`:** Der Server entscheidet, was das Ergebnis
für den Lernstand bedeutet — nicht der Client. Der Client meldet
Tatsachen („Check `weltzustand:pinguine` bestanden", „Übung
`ue.stack.rueckgabestapel` Tabelle exakt"), der Server wendet die Regeln
an und antwortet mit dem neuen Status. So bleibt die Regel an einer
Stelle.

### Paararbeit

| Methode | Pfad | Zweck |
|---|---|---|
| `GET` | `/api/paar/auftrag` | eigener Paarauftrag: Rolle, Teilauftrag, vereinbarte Schnittstelle |
| `POST` | `/api/paar/teil` | eigenen Teil einreichen |
| `GET` | `/api/paar/zusammenfuehrung` | beide Teile, sobald **beide** eingereicht haben |
| `POST` | `/api/paar/feedback` | strukturiertes Peer-Feedback (feste Fragen, keine freie Nachricht) |

**Regel:** `/api/paar/zusammenfuehrung` gibt den Teil des Partners erst
heraus, wenn der eigene Teil eingereicht ist. Sonst wäre der
didaktische Kern (sich abstimmen müssen) umgangen. Es gibt **keinen
Endpunkt für Nachrichten zwischen Lernenden** — bewusst nicht.

### Lehrkraft (Rolle serverseitig prüfen!)

| Methode | Pfad | Zweck |
|---|---|---|
| `GET` | `/api/lehrkraft/kurs/:id` | Übersicht: je Person und Baustein der Status |
| `GET` | `/api/lehrkraft/sichtung` | offene Freitexte zur Sichtung, älteste zuerst |
| `POST` | `/api/lehrkraft/sichtung/:id` | Status setzen (`belegt` / `offen`) + optionale Rückmeldung |
| `GET` | `/api/lehrkraft/abgabe/:id` | einzelne Abgabe samt Code und Freitexten |
| `GET` | `/api/lehrkraft/muster?kurs=:id` | Fehlermuster **aggregiert über den Kurs** (für die Plenumsplanung) |
| `POST` | `/api/lehrkraft/konten` | Konten anlegen, Passwort zurücksetzen |
| `POST` | `/api/lehrkraft/paare` | Paare bilden, Paarauftrag zuweisen |
| `POST` | `/api/lehrkraft/entwurf` | KI-Entwurf für Aufgaben, Hilfen, Prüffälle (Autorenwerkstatt) |

`/api/lehrkraft/muster` liefert **nur Summen**, keine Namen — die
Endpunktform erzwingt, was in der Didaktik festgelegt ist.

### Nutzlasten der Kern-Endpunkte

Damit Frontend und Server nicht aneinander vorbeibauen, hier die Form
der vier wichtigsten Aufrufe. Feldnamen sind verbindlich, Reihenfolge
und zusätzliche Felder nicht.

**Anmelden**

```jsonc
// POST /api/anmelden
{ "anmeldename": "held07", "passwort": "..." }
// 200: setzt Cookie, liefert
{ "anmeldename": "held07", "rolle": "schueler", "kurs": "Q1-LK",
  "mussPasswortAendern": false }
// 401: { "fehler": "Anmeldename oder Passwort stimmt nicht." }
```

**Lernstand lesen**

```jsonc
// GET /api/lernstand   -> 200
{ "eintraege": [
    { "baustein": "q1w.vererbung.modell",
      "operatorgruppe": "implementieren",
      "status": "belegt",
      "belege": [ { "check": "parser:Kriegerin erbt von Held",
                    "am": "2026-08-18T10:14:00Z" } ],
      "fehlermuster": ["signatur_abweichend"],
      "hilfestufeMax": 2,
      "geaendertAm": "2026-08-18T10:14:00Z" }
  ] }
```

**Versuch melden** — der Client meldet Tatsachen, der Server entscheidet
über den Status und antwortet mit dem neuen Stand:

```jsonc
// POST /api/versuch
{ "sitzungId": 42,
  "bezug": "ue.inventar.ereignisfolge",     // Baustein-Teil oder Uebung
  "format": "F3",
  "ergebnis": "bestanden",
  "fehlermuster": [] }
// 200:
{ "baustein": "q1w.arrays.inventar",
  "operatorgruppe": "analysieren",
  "statusNeu": "belegt",
  "naechsterVorschlag": "q1w.arrays.objektfeld" }
```

Mehrere nachgetragene Versuche gehen als Liste im Feld `versuche` an
denselben Endpunkt — nötig für den Offline-Nachtrag, und das Ergebnis
muss **reihenfolgeunabhängig** sein (Abschnitt 11).

**Hilfe anfordern**

```jsonc
// POST /api/hilfe
{ "bezug": "q1w.vererbung.modell", "stufe": 2,
  "reflexion": "Ich dachte, Kriegerin bekommt gibAngriff automatisch." }
// 200:
{ "stufe": 2, "quelle": "statisch",          // oder "ki"
  "text": "Was muesste in Kriegerin stehen, damit ..." }
// 200 bei Ausfall des Gateways:
{ "stufe": 2, "quelle": "statisch", "text": "...", "hinweis": "ohne KI" }
```

Die **Reflexionsschranke** (Konzept, Abschnitt 9) wird serverseitig
geprüft: Stufe 2 und höher ohne Feld `reflexion` gibt `400` mit einer
verständlichen Meldung — nicht als Gängelung, sondern damit die Regel
nicht am Frontend hängt.

---

## 6 Datenmodell

```sql
CREATE TABLE konto (
  id INTEGER PRIMARY KEY,
  anmeldename TEXT NOT NULL UNIQUE,      -- Pseudonym, kein Klarname
  passwort_hash TEXT NOT NULL,           -- Argon2id
  rolle TEXT NOT NULL CHECK (rolle IN ('schueler','lehrkraft')),
  kurs TEXT,
  muss_passwort_aendern INTEGER NOT NULL DEFAULT 1,
  erstellt_am TEXT NOT NULL
);

-- Lernstand: eine Zeile je Person, Baustein UND Operatorgruppe
CREATE TABLE lernstand (
  konto_id INTEGER NOT NULL REFERENCES konto(id) ON DELETE CASCADE,
  baustein TEXT NOT NULL,
  operatorgruppe TEXT NOT NULL,          -- 'analysieren' | 'implementieren'
                                         -- | 'modellieren' | 'beurteilen'
  status TEXT NOT NULL
    CHECK (status IN ('offen','in_arbeit','belegt','zur_sichtung')),
  belege TEXT,                           -- JSON: welcher Check wann
  fehlermuster TEXT,                     -- JSON: Katalog-IDs
  hilfestufe_max INTEGER,
  geaendert_am TEXT NOT NULL,
  PRIMARY KEY (konto_id, baustein, operatorgruppe)
);

CREATE TABLE sitzung (
  id INTEGER PRIMARY KEY,
  konto_id INTEGER NOT NULL REFERENCES konto(id) ON DELETE CASCADE,
  begonnen_am TEXT NOT NULL,
  beendet_am TEXT,
  baustein TEXT,
  verlauf TEXT                           -- JSON, Löschfrist siehe 9
);

CREATE TABLE versuch (
  id INTEGER PRIMARY KEY,
  sitzung_id INTEGER NOT NULL REFERENCES sitzung(id) ON DELETE CASCADE,
  bezug TEXT NOT NULL,                   -- Baustein-Teil oder Übungs-ID
  format TEXT NOT NULL,                  -- 'F1' ... 'F12'
  ergebnis TEXT NOT NULL
    CHECK (ergebnis IN ('bestanden','nicht_bestanden')),
  fehlermuster TEXT,                     -- JSON: erkannte Katalog-IDs
  erstellt_am TEXT NOT NULL
);

CREATE TABLE freitext (
  id INTEGER PRIMARY KEY,
  sitzung_id INTEGER NOT NULL REFERENCES sitzung(id) ON DELETE CASCADE,
  bezug TEXT NOT NULL,
  art TEXT NOT NULL,                     -- 'reflexion' | 'erlaeuterung'
                                         -- | 'beurteilung'
  text TEXT NOT NULL,                    -- Wortlaut der Lernenden
  ki_einordnung TEXT,                    -- Vorschlag, ohne Wirkung
  gesichtet_am TEXT,
  gesichtet_von INTEGER REFERENCES konto(id),
  rueckmeldung TEXT
);

CREATE TABLE abgabe (
  id INTEGER PRIMARY KEY,
  sitzung_id INTEGER NOT NULL REFERENCES sitzung(id) ON DELETE CASCADE,
  projekt TEXT NOT NULL,                 -- Quelltexte als JSON
  erstellt_am TEXT NOT NULL
);

CREATE TABLE paarauftrag (
  id INTEGER PRIMARY KEY,
  kurs TEXT NOT NULL,
  baustein TEXT NOT NULL,
  schnittstelle TEXT NOT NULL,           -- JSON: Klassen, Signaturen
  erstellt_am TEXT NOT NULL
);

CREATE TABLE paarrolle (
  paarauftrag_id INTEGER NOT NULL REFERENCES paarauftrag(id) ON DELETE CASCADE,
  konto_id INTEGER NOT NULL REFERENCES konto(id) ON DELETE CASCADE,
  rolle TEXT NOT NULL,                   -- 'A' | 'B'
  teil TEXT,                             -- eingereichter Quelltext
  eingereicht_am TEXT,
  feedback TEXT,                         -- JSON: Antworten auf feste Fragen
  PRIMARY KEY (paarauftrag_id, konto_id)
);
```

**Warum `lernstand` drei Spalten im Schlüssel hat:** Die Didaktik
braucht die Aussage „Vererbung implementieren sitzt, Vererbung erläutern
noch nicht" (`KONZEPT_SELBSTLERNEN.md`, Abschnitt 6). Mit nur
`(konto_id, baustein)` wäre das nicht abbildbar, und ein späterer Umbau
wäre eine Migration über alle Bestandsdaten. Deshalb von Anfang an so.

**Was es nicht gibt:** keine E-Mail-Adressen, keine Klarnamen, keine
Geburtsdaten, keine Bearbeitungsdauern, keine Anmeldeprotokolle über das
technisch Nötige hinaus.

---

## 7 KI-Gateway

Ein eigener Modul im Server, damit der Modellanbieter austauschbar
bleibt. Anforderungen:

1. **Schlüssel nur serverseitig**, aus einer Umgebungsvariablen, nie in
   einer Antwort, nie in einem Protokoll. Als Teil dieser Etappe wird
   `java_analyse_tool.html` auf das Gateway umgestellt und der
   `sed`-Schritt aus `.github/workflows/deploy.yml` entfernt. Der
   bisherige Schlüssel gilt danach als offengelegt und **muss ersetzt
   werden** — er stand im öffentlichen HTML.
2. **Ein Ort für den Kontextvertrag.** Was an das Modell geht, ist in
   `KONZEPT_SELBSTLERNEN.md`, Abschnitt 9, abschließend aufgezählt. Das
   Gateway baut die Anfrage zusammen; kein anderer Codeteil ruft das
   Modell auf. Damit gibt es eine Stelle, an der man prüfen kann, ob die
   Regel eingehalten ist.
3. **Budget und Ratelimit je Konto und Sitzung**, serverseitig
   durchgesetzt, mit verständlicher Meldung beim Erreichen („Für heute
   ist Schluss mit Nachfragen — die Hinweise im Aufgabenblatt gehen
   weiter"). Die tatsächlichen Kosten sind vorab nicht seriös schätzbar
   und in einer Pilotgruppe zu **messen**, bevor eine Jahrgangsstufe
   startet.
4. **Promptversionen im Repository**, nicht in der Datenbank.
   Änderungen am Tutorverhalten sind Codeänderungen mit Review, keine
   Konfiguration, die jemand nachmittags anpasst.
5. **Ausfall ist ein Normalfall, kein Fehler.** Antwortet der Anbieter
   nicht, liefert das Gateway einen definierten Status zurück, und das
   Frontend fällt auf statische Hilfen und Textbausteine zurück. Das ist
   zu **testen**, nicht zu hoffen: ein Schalter, der das Gateway
   abschaltet, gehört zur Abnahme.
6. **Protokollierung sparsam:** Zeitpunkt, Baustein, Modell, Tokenzahl,
   Dauer, Status. Inhalte nur, soweit Abschnitt 9 es erlaubt.
7. **Modellwahl offen** (Abschnitt 13). Das Gateway wird so gebaut, dass
   der Anbieter über Konfiguration wechselt, nicht über Codeänderung.

---

## 8 Sicherheit

Nicht verhandelbar, weil hier Konten von Minderjährigen verwaltet
werden. Dieselben Punkte wie in `apps/geheimschreiber/TECHNIK.md`:

- **Passwörter nur als Hash** (Argon2id; Alternative bcrypt mit
  Kostenfaktor ≥ 12). Niemals im Klartext, niemals in Protokollen.
  Lernende benutzen ihre Passwörter erfahrungsgemäß mehrfach — eine
  Klartextliste ist der Fund, den man auf einem Schulserver am wenigsten
  hinterlassen will.
- **Nur HTTPS.** Sitzungs-Cookie `HttpOnly`, `Secure`, `SameSite=Lax`.
  Auf einem kleinen Server im Informatikraum ist das der Punkt, an dem
  es praktisch klemmt — dazu Abschnitt 8a.
- **Anmeldeversuche begrenzen** (z. B. 10 pro Minute je Konto und je
  IP-Adresse).
- **Erstpasswörter** erzeugt die Lehrkraft als Liste; beim ersten
  Anmelden ist die Änderung erzwungen. Zurücksetzen kann nur die
  Lehrkraft — kein E-Mail-Versand, also keine E-Mail-Adressen nötig.
- **Keine Selbstregistrierung.**
- **Rollentrennung serverseitig prüfen**, nie im Frontend. Eine
  Lehrkraft sieht nur die eigenen Kurse. Jeder `/api/lehrkraft/...`-Pfad
  prüft Rolle *und* Kurszugehörigkeit.
- **Fremde Daten sind unerreichbar:** Jeder Zugriff auf Lernstand,
  Freitexte und Abgaben filtert serverseitig über die eigene `konto_id`.
  Eine ID in der URL ist kein Nachweis einer Berechtigung. (Der
  klassische Anfängerfehler bei genau dieser Art Anwendung — hier ist er
  ein Datenschutzvorfall, nicht ein Bug.)
- **Eingaben validieren**, alles über ein Schema (Fastify bringt das
  mit). SQL nur mit gebundenen Parametern, nie zusammengesetzt.

---

## 8a HTTPS auf einem Server im Informatikraum

Ein Rechner im Schulnetz hat meist keinen öffentlichen Namen, und ohne
Namen gibt es kein normales Zertifikat. Damit steht die
Anmeldung — Passwörter über das Netz — vor einer echten Hürde. Drei
Wege, in der Reihenfolge, in der ich sie versuchen würde:

1. **Interner Name plus eigene Zertifizierungsstelle.** Wenn der
   Schulserver einen Namen im lokalen Netz hat (z. B.
   `lernserver.schule.intern`), lässt sich mit einer schuleigenen CA ein
   Zertifikat ausstellen. Die iPads brauchen dann einmalig das
   CA-Profil — das kann die Geräteverwaltung ausrollen. Sauberste
   Lösung, hängt aber an der Schul-IT.
2. **Reverse Proxy mit echtem Zertifikat**, falls die Schule einen
   erreichbaren Hostnamen vergeben kann. Der Server selbst bleibt dann
   auf HTTP hinter dem Proxy (`HINTER_PROXY=true`).
3. **Nur zur Entwicklung: HTTP im lokalen Netz**, `Secure` am Cookie
   aus. Das ist ein bewusster Kompromiss und **kein Zustand für den
   Klasseneinsatz**: Wer im gleichen WLAN mitliest, sieht Passwörter im
   Klartext, und Lernende verwenden Passwörter erfahrungsgemäß mehrfach.
   Solange dieser Zustand gilt: Testkonten mit Wegwerf-Passwörtern, keine
   echten Schülerdaten.

Die Entscheidung gehört nicht in den Code, sondern zur Absprache mit der
Schul-IT — und sie sollte **vor** Etappe S2 fallen, weil an ihr die
Kontenanlage hängt. Für die Entwicklung selbst reicht `localhost`, dort
gilt HTTP als sicherer Ursprung.

## 9 Datenschutz in der Entwicklung

Das Projekt verarbeitet später Daten von Mitschülerinnen und
Mitschülern. Daraus folgen Regeln für die Entwicklungsarbeit selbst —
keine Misstrauensfrage, sondern Konsequenz daraus, wer da in der
Datenbank steht:

- **Entwicklung ausschließlich mit Testdaten.** Erfundene Pseudonyme,
  erfundene Lernstände. Ein Skript, das eine Testdatenbank füllt, gehört
  zum Projekt.
- **Kein Zugriff auf die Produktivdatenbank.** Wer entwickelt, hat keine
  Zugangsdaten zum Produktivsystem und braucht sie nicht. Fehlerbilder
  aus dem Betrieb kommen als Beschreibung oder anonymisierter Auszug.
- **Betrieb und Administration liegen bei der Schule**, nicht beim
  Entwickler: Wer den Server aufsetzt, betreibt und Backups verwaltet,
  wird von der Schule festgelegt.
- **Keine echten Schülerdaten in Git**, in Screenshots, in
  Fehlerberichten oder in einer Präsentation über das Projekt.
- **Protokolle nicht mitnehmen.** Kein Kopieren von Logdateien auf
  private Geräte.

Diese Punkte gehören vor Projektbeginn besprochen und, wenn die Schule
das so hält, schriftlich festgehalten. Die rechtliche Bewertung —
Verzeichnis der Verarbeitungstätigkeiten, Elterninformation, Einwilligung
oder Rechtsgrundlage, Auftragsverarbeitung beim Modellanbieter — steht in
`KONZEPT_SELBSTLERNEN.md`, Abschnitt 10, und ist Sache der Schule.

---

## 10 Etappen und Abnahme

Jede Etappe ist einzeln abnehmbar und liefert etwas Benutzbares.

### S1 — Attrappe und Gerüst

- Alle Endpunkte aus Abschnitt 5 antworten mit festen Beispieldaten.
- Projekt startet mit einem Befehl, README erklärt Start und Testlauf.
- Keine Datenbank, keine echte Anmeldung.

*Abnahme:* Die Inhalte-Seite kann gegen die Attrappe entwickeln. Jeder
Endpunkt liefert ein Beispiel, das dem Schema aus diesem Papier
entspricht.

### S2 — Konten und Lernstand

- Datenbankschema aus Abschnitt 6, Migrationen versioniert.
- Anmeldung, Rollen, Passwortwechsel, Kontenanlage per Liste.
- Lernstand lesen und über `/api/versuch` fortschreiben, Regeln
  serverseitig.
- Offline-zuerst: Nachtragen mehrerer Versuche in einem Aufruf,
  Vereinigung statt Überschreiben.

*Abnahme:* Zwei Testkonten, ein Kurs. Ein Versuch, der offline
entstanden ist, wird korrekt nachgetragen. Konto A kann Daten von
Konto B **nicht** lesen — nachgewiesen durch einen Test, nicht durch
Zusehen. Passwörter liegen als Argon2id-Hash in der Datenbank.

### S3 — Gateway

- Modellaufruf serverseitig, Schlüssel aus der Umgebung.
- Kontextvertrag an einer Stelle gebaut, Budget und Ratelimit aktiv.
- Abschaltbar für Ausfalltests.
- `java_analyse_tool.html` auf das Gateway umgestellt, `sed`-Schritt
  aus dem Workflow entfernt, alter Schlüssel ersetzt.

*Abnahme:* Im ausgelieferten Frontend ist per Suche kein Schlüssel
findbar. Bei abgeschaltetem Gateway bleibt die Anwendung vollständig
benutzbar. Ein überschrittenes Budget führt zu einer verständlichen
deutschen Meldung, nicht zu einem Absturz.

### S4 — Lehrkraft-Sicht

- Kursübersicht, Sichtung der Freitexte, Abgaben, aggregierte
  Fehlermuster, Paarbildung.
- Rollen- und Kursprüfung auf jedem Pfad.

*Abnahme:* Eine Lehrkraft sieht ausschließlich die eigenen Kurse; ein
Schülerkonto bekommt auf jeden `/api/lehrkraft/...`-Pfad einen 403.
`/api/lehrkraft/muster` enthält in der Antwort keine Namen.

### S5 — Betrieb (mit der Schule)

Backup, Wiederherstellung, Löschroutine zum Schuljahresende,
Zertifikate, Monitoring. Wer was macht, legt die Schule fest.

---

## 11 Tests

Was grün sein muss, bevor eine Etappe als fertig gilt:

- **Rollen und Zugriff:** Für jeden Endpunkt ein Test, dass ein fremdes
  Konto ihn nicht nutzen kann. Das ist die wichtigste Testgruppe des
  Projekts.
- **Lernstandsregeln:** Ein Versuch führt zum erwarteten Status —
  inklusive der Fälle „Freitext ohne prüfbaren Anteil bleibt zur
  Sichtung" und „bereits belegt bleibt belegt".
- **Offline-Nachtrag:** mehrere Versuche in beliebiger Reihenfolge
  ergeben denselben Endstand (Reihenfolgeunabhängigkeit).
- **Gateway aus:** Alle Lernpfade funktionieren ohne Modell.
- **Schema:** Ungültige Eingaben werden abgewiesen, ohne den Prozess zu
  beenden.
- **Kein Schlüssel im Auslieferungsstand:** ein Test, der die gebauten
  Dateien nach Schlüsselmustern durchsucht.

Die Testkonventionen des Repositorys gelten (`npm test` läuft durch,
`npm run build` ist grün, siehe `CLAUDE.md`). Ein zusätzliches
Testframework ist nicht nötig — der eingebaute Testläufer von Node
(`node:test`) reicht für diese Art Prüfungen und hält die
Abhängigkeiten klein.

**Der Geheimschreiber braucht später dieselbe Kontenverwaltung.**
`apps/geheimschreiber/TECHNIK.md` beschreibt einen Server mit
Konten, Rollen und Argon2id-Hashes — dieselbe `konto`-Tabelle, dieselbe
Anmeldung. Wenn du den Kontenteil von Anfang an so schneidest, dass er
nicht von den Lerndaten abhängt, kann die zweite Anwendung ihn später
mitbenutzen, statt dass die Schule zwei Anmeldesysteme betreibt. Das
ist eine Anregung, keine Anforderung — der Geheimschreiber ist noch
nicht gebaut, und Klasse 6 ist eine andere Nutzergruppe als die Q1.

---

## 12 Ausdrücklich nicht gebaut

Damit der Umfang nicht wächst:

| Nicht dabei | Warum |
|---|---|
| **Serverseitiger Java-Compiler/Runner** | **Neu zu bewerten**, weil Java im Container läuft — Bedingungen in Abschnitt 12a. Nicht Teil der Etappen S1–S5 |
| **Live-Dashboard** über die Lerngruppe | braucht Dauerverbindungen und erzeugt Überwachungsdruck; die Kursübersicht wird beim Aufruf geladen |
| **Chat zwischen Lernenden** | didaktisch nicht gewollt (Abstimmung im Raum), Moderationspflichten, Jugendschutz |
| **Selbstregistrierung, E-Mail-Versand** | dann bräuchte man Kontaktdaten; Konten legt die Lehrkraft an |
| **Noten, Punkte, Ranglisten** | das Programm bewertet nicht (`KONZEPT_SELBSTLERNEN.md`, Abschnitt 11) |
| **Bearbeitungszeiten, Tastenprotokolle** | wird gar nicht erst erhoben |
| **Single Sign-on / Anbindung an Schulsysteme** | erst wenn der Betrieb steht und die Schule es will |
| **Mehrsprachigkeit** | die Zielgruppe ist ein NRW-Informatikkurs |

Wenn eines davon doch gebraucht wird, ist das eine Änderung am Konzept
und nicht am Code — bitte vorher besprechen.

---

## 12a Serverseitiges Java — falls es kommt

**Stand:** Auf dem Schulserver läuft Java in einem Container; der
Schüler, der die Infrastruktur baut, hat das eingerichtet und will es
nutzen. Ob der browserseitige Weg (CheerpJ) auf dem Schul-iPad
funktioniert, ist weiterhin **ungeprüft**.

### Was das bringt — und was nicht

**Es hilft** bei den isolierten Formaten: „Methode schreiben" (F6) und
„Prüffälle entwickeln" (F15) lassen sich mit `javac` und einem
Testgerüst robust und **manipulationssicher** prüfen, unabhängig davon,
ob CheerpJ im Schulnetz erreichbar ist.

**Es ersetzt CheerpJ nicht.** Die Spielwelt — Objektbank, sichtbare
Konsequenz in der Welt, Objekte zur Laufzeit inspizieren — ist eine
interaktive Oberfläche im Browser. Ein Server kann das Ergebnis
berechnen, aber nicht die Erfahrung erzeugen, die
`KONZEPT_AUFGABEN.md` als primäres Feedback fordert. Serverseitiges
Java ist also ein **zweiter Prüfweg für Werkbank-Formate**, kein Ersatz
für die Lernumgebung.

### Die eine Sache, die dabei wirklich zählt

Ein Dienst, der eingesandten Java-Code kompiliert und ausführt, ist
**Codeausführung durch Fremde auf dem Schulserver**. Ohne Isolation ist
das kein Feature, sondern eine offene Tür — und zwar die gefährlichste
Komponente des ganzen Systems. Wenn dieser Weg gebaut wird, gelten die
folgenden Punkte als Mindestanforderung, nicht als Empfehlung:

1. **Ein eigener Container pro Lauf**, danach verworfen. Kein
   Wiederverwenden, kein gemeinsamer Zustand zwischen Läufen.
2. **Kein Netzwerk** im Ausführungscontainer (`--network none`). Sonst
   ist der Schulserver ein offener Ausgangspunkt für beliebige
   Verbindungen.
3. **Nicht als `root`**, Dateisystem `read-only` außer einem
   `/tmp` mit Größenbegrenzung.
4. **Harte Grenzen:** Speicher, CPU, Prozess- bzw. Threadzahl
   (`--pids-limit`, gegen Endlosschleifen mit Thread-Erzeugung) und eine
   **Zeitgrenze** von wenigen Sekunden, nach der der Container von außen
   beendet wird.
5. **Niemals den Docker-Socket in den Container geben.** Wer ihn
   erreicht, kontrolliert den Host.
6. **Kein Vertrauen auf Java-Bordmittel.** Der `SecurityManager` ist in
   aktuellen JDK-Versionen abgekündigt bzw. entfernt — die Isolation
   muss vollständig vom Container kommen, nicht von der JVM.
7. **Ausgabe begrenzen und filtern:** Zeichenzahl deckeln, keine
   Server-Pfade, Hostnamen oder Umgebungsvariablen in Fehlermeldungen an
   den Browser durchlassen.
8. **Warteschlange und Ratelimit pro Konto.** Zwölf Lernende, die
   gleichzeitig auf „Prüfen" tippen, dürfen den Server nicht in die
   Knie bringen; Läufe werden serialisiert, nicht parallel gestartet.
9. **Nur Prüffälle der Lehrkraft ausführen** — der Schülercode ist das
   Prüfobjekt, nicht das Testprogramm. (Bei F15 kehrt sich das um: Dort
   ist der Prüffall die Schülereingabe. Dann gilt derselbe
   Isolationsrahmen, und die zu testende Fassung stammt aus dem
   Baustein.)

### Wann

**Nicht im Piloten und nicht vor Etappe S2.** Der Pilot läuft ohne
Server; solange Konten, Lernstand und Rollentrennung nicht stehen, ist
ein Ausführungsdienst verfrüht. Sinnvolle Reihenfolge: S1, S2, dann
entweder S3 (Gateway) oder dieser Runner — je nachdem, was der
Unterricht zuerst braucht.

Als eigene Etappe formuliert, mit Abnahme: Ein Testfall, der eine
Endlosschleife einsendet, muss nach der Zeitgrenze abgebrochen werden,
ohne den Server zu beeinträchtigen; ein Testfall, der eine
Netzwerkverbindung öffnet, muss scheitern; ein Testfall, der eine große
Datei schreibt, muss am Größenlimit scheitern. Alle drei gehören als
automatisierte Tests dazu, bevor der Dienst Schülern zugänglich ist.

---

## 13 Getroffene und offene Entscheidungen

**Entschieden** (04.08.2026, mit der Fachlehrkraft):

| Frage | Entscheidung | Folge für die Umsetzung |
|---|---|---|
| **Stack** | frei wählbar | Empfehlung aus Abschnitt 4 gilt: Node 22 + Fastify + SQLite, Argon2id |
| **Datenbank** | SQLite | Kursgröße höchstens 12 Lernende — SQLite ist dafür reichlich dimensioniert, PostgreSQL wäre unnötiger Betriebsaufwand |
| **Zielumgebung** | **noch offen, bewusst** — wahrscheinlich später ein Server des Schulträgers | Deshalb: keine Abhängigkeit von einer bestimmten Umgebung. Alles läuft als ein Prozess plus eine Datei, konfiguriert über Umgebungsvariablen, ohne Annahmen über Pfade, Ports oder Hostnamen. Ein Dockerfile ist sinnvoll, darf aber nicht Voraussetzung sein |
| **Betrieb** | die Lehrkraft später | Der Entwickler baut, betreibt aber nicht (Abschnitt 9). Zur Übergabe gehört eine kurze Betriebsanleitung: Start, Backup, Wiederherstellung, Löschroutine |
| **Modellanbieter** | vorläufig OpenRouter mit kostengünstigem Modell | Gateway wie in Abschnitt 7. Anbieterwechsel muss über Konfiguration gehen, nicht über Codeänderung — die Rechtsfrage ist noch offen (siehe unten) |
| **Fehlversuche pro Person** | werden erhoben | Die Tabelle `versuch` hält das bereits vor. `/api/lehrkraft/kurs/:id` darf sie **pro Person** ausgeben; die aggregierte Sicht bleibt zusätzlich bestehen |
| **Aufbewahrung** | Lernstand und Freitexte bis Schuljahresende | Löschroutine gehört zu S5 und muss auf Knopfdruck laufen, nicht per SQL von Hand |
| **Wer baut** | ein Schüler, eigenständig | Dieses Papier ist die Spezifikation; ein Startgerüst wird nicht vorgegeben |

**Wichtig für die Zeitplanung:** Der erste Unterrichtseinsatz ist die
9-stündige Q1-Wiederholung zu Schuljahresbeginn
([`PILOT_Q1_WIEDERHOLUNG.md`](PILOT_Q1_WIEDERHOLUNG.md)) — und der läuft
**ohne Server**, mit `localStorage` und Dateiabgabe. Die Infrastruktur
steht damit nicht unter Zeitdruck und kann sauber statt schnell
entstehen. Sie wird ab dem zweiten Einsatzblock gebraucht.

**Noch offen:**

| Frage | Wer | Bis wann nötig |
|---|---|---|
| **Rechtsgrundlage für KI-Nutzung mit Schülerdaten** (pseudonymisierte Daten bleiben personenbezogen; Drittlandübermittlung) und Einordnung nach KI-Verordnung | Schulleitung + DSB | vor S3 in Produktion |
| **Aufbewahrungsfrist für Chatverläufe** | Schule / DSB | vor S3 |
| **Konkrete Zielumgebung** samt HTTPS-Zertifikat | Schule | vor S5 |

---

*Didaktik und Begründung: siehe
[KONZEPT_SELBSTLERNEN.md](KONZEPT_SELBSTLERNEN.md).
Stand der Lernumgebung: `apps/javawelt/ENTWICKLUNG.md`.*
