# Informatik-tools

Anwendungen für den Informatik Unterricht.

Eine Sammlung KI-gestützter Lernwerkzeuge, die als statische Website über
GitHub Pages ausgeliefert wird. Die Übersichtsseite (`index.html`) verlinkt auf
die einzelnen Tools.

## Tools

| Tool | Pfad | Beschreibung |
|------|------|--------------|
| **Übersicht** | `index.html` | Einstiegsseite mit allen Werkzeugen |
| **Java Methoden-Trainer** | `java_analyse_tool.html` | KI-Methoden analysieren oder selbst implementieren (NRW-Datenstrukturen) |
| **JavaWelt** | `apps/javawelt/` → `/javawelt/` | Visuelle Lernumgebung für Java (Objekte interaktiv steuern + echtes Java via CheerpJ) |

## Projektstruktur

```
index.html               Übersichtsseite (verlinkt alle Tools)
java_analyse_tool.html   Statisches Einzeltool (Java Methoden-Trainer)
apps/javawelt/           Unterprojekt: JavaWelt (Vite + TypeScript)
.github/workflows/       deploy.yml – baut alles und deployt nach GitHub Pages
```

## Build & Deploy

Der Workflow `.github/workflows/deploy.yml` läuft bei jedem Push auf `main`:

1. Die statischen HTML-Tools werden nach `dist/` kopiert (der Mistral-API-Key
   wird aus dem Secret `MISTRAL_KEY` eingesetzt).
2. Das Unterprojekt `apps/javawelt` wird mit `npm ci && npm run build` gebaut
   und nach `dist/javawelt/` gelegt.
3. `dist/` wird auf GitHub Pages veröffentlicht.

Die JavaWelt nutzt relative Asset-Pfade (`base: "./"` in `vite.config.ts`),
funktioniert also problemlos im Unterordner `/javawelt/`.

> Hinweis zu CheerpJ: Der echte Java-Pfad lädt die mitgelieferten JARs über die
> CheerpJ-Dateisystem-Pfade (`/app/ecj.jar`). Dieser Pfad ist – wie in
> `apps/javawelt/README.md` beschrieben – noch im Browser zu validieren; die
> sofort lauffähige Mock-Laufzeit funktioniert auch im Unterordner.

### JavaWelt lokal entwickeln

```bash
cd apps/javawelt
npm install
npm run dev      # http://localhost:5173
```

Details zur JavaWelt-Architektur: siehe [`apps/javawelt/README.md`](apps/javawelt/README.md).
