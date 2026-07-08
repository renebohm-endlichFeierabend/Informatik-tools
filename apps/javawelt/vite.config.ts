import { defineConfig } from "vite";

// Einfache statische Single-Page-App. Keine Server-Komponente:
// Java läuft (im echten Pfad) clientseitig über CheerpJ.
export default defineConfig({
  root: ".",
  // Relative Pfade: funktioniert auf GitHub Pages (Unterpfad /<repo>/)
  // ebenso wie beim Self-Hosting im Schulnetz.
  base: "./",
  // Build-Zeitpunkt, erscheint beim Start in der Konsole – so ist in
  // jedem Fehlerbericht erkennbar, welcher Stand wirklich lief (Cache!).
  define: {
    __BUILD_ZEIT__: JSON.stringify(new Date().toISOString()),
  },
  build: {
    target: "es2022",
    outDir: "dist",
  },
});
