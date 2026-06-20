import { defineConfig } from "vite";

// Einfache statische Single-Page-App. Keine Server-Komponente:
// Java läuft (im echten Pfad) clientseitig über CheerpJ.
export default defineConfig({
  root: ".",
  // Relative Pfade: funktioniert auf GitHub Pages (Unterpfad /<repo>/)
  // ebenso wie beim Self-Hosting im Schulnetz.
  base: "./",
  build: {
    target: "es2022",
    outDir: "dist",
  },
});
