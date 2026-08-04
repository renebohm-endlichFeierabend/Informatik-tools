# Informatik-Tools — Überblick für neue Sessions

Anwendungen für den Informatik-Unterricht von René Böhm (Oberstufe,
Kernlehrplan NRW; Geheimschreiber: Sek I). Zielgeräte: **Schul-iPads**,
Hosting bislang **GitHub Pages** (statisch). Ein **Schulserver mit
Backend** ist im Aufbau — neue Konzepte dürfen ihn voraussetzen,
bestehende Anwendungen laufen weiter ohne Server. Sprache in UI,
Code-Bezeichnern, Commits und PRs: **Deutsch**.

## Was liegt wo?

| Pfad | Was |
|---|---|
| `index.html` | Übersichtsseite, verlinkt die Werkzeuge |
| `java_analyse_tool.html` | KI-gestützte Java-Analyse (OpenRouter, `OPENROUTER_KEY`); kennt die NRW-Klassen-APIs als Beschreibungstexte. ⚠ Der Schlüssel wird beim Deploy in das öffentliche HTML eingesetzt — mit Server auf ein Gateway umstellen |
| `apps/javawelt/` | **Hauptprojekt**: browserbasierte Java-Lernumgebung (BlueJ-Objektbank + Greenfoot-Spielwelt, echtes Java via CheerpJ, NRW-Klassenbibliothek, SQL/SQLite, Lernszenarien) |
| `apps/geheimschreiber/` | Lernspiel Kryptologie Klasse 6 (Konzept: `DIDAKTIK.md`, `TECHNIK.md`; noch nicht umgesetzt) |
| `KONZEPT_SELBSTLERNEN.md` | KI-gestütztes Java-Selbstlernprogramm, **Didaktik**: geführte Lernsitzung, Aufgabenformate (Abiturbezug), Werkbank, Lernstand, Sozialformen — **vor Arbeiten daran lesen** |
| `KONZEPT_SELBSTLERNEN_TECHNIK.md` | dasselbe Projekt, **Infrastruktur** als Auftrag: Server, Schnittstelle, Datenmodell, KI-Gateway, Abnahmekriterien (wird von einem Schüler umgesetzt) |
| `PILOT_Q1_WIEDERHOLUNG.md` | **erster Unterrichtseinsatz**: 9 Stunden Q1-Wiederholung, ohne Server und ohne KI zur Laufzeit — Bausteinfolge, Baureihenfolge, Zeitplan, Risiken |

## Vor der Arbeit an JavaWelt

**Zuerst `apps/javawelt/ENTWICKLUNG.md` lesen** — dort stehen Stand,
Architektur, Kernkonzepte (nicht brechen!), offene Punkte und die
priorisierte Roadmap. Kurzfassung der wichtigsten Regeln:

- Schülercode braucht minimales Gerüst: `extends Figur`, kein Paket,
  kein `super(...)`; Objekte benennen über `nenne(String)`.
- Es läuft **immer echtes Java** (CheerpJ); der Übungsmodus ist nur
  automatischer Notbetrieb — kein wählbarer Modus.
- NRW-Klassen (Stack, Queue, List, Bäume, Graph, DatabaseConnector …)
  kommen als **editierbare Kopien** aus der 📚-Bibliothek.
- Nach Änderungen an `apps/javawelt/java-framework/`:
  `npm run build:framework` und das neue `public/framework.jar`
  mitcommitten.
- Steuerzeichen (U+001E/U+001F u. ä.) nie roh in Quelltexte schreiben,
  nur als Escape-Sequenzen.

## Tests & Build (in `apps/javawelt/`)

```bash
npm test        # Parser-, Interpreter-, SQL- und javac-Checks
npm run build   # Typecheck + Vite-Build
npm run test:ui # Playwright (Preview-Server auf :4173 vorher starten)
```

Vor jedem Push: `npm test` und `npm run build` müssen grün sein.
Neue Java-Quelltexte (Szenarien/Bibliothek) immer durch die
javac-Prüfung laufen lassen — der Übungsmodus-Parser ist toleranter als
der echte Compiler.

## Git-Konventionen

- Arbeitsbranch: `claude/java-ipad-learning-platform-ztoc3r`.
  Nach einem Merge den Branch von `origin/main` **neu aufsetzen**
  (gemergte Historie nicht weiterverwenden).
- Kleine, thematisch geschlossene PRs mit deutscher Beschreibung;
  am Ende jeder Session offene Arbeit committen/pushen und
  `ENTWICKLUNG.md` aktualisieren.
