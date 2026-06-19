import { defineConfig } from "vite";

// Einfache statische Single-Page-App. Keine Server-Komponente:
// Java läuft (im echten Pfad) clientseitig über CheerpJ.
export default defineConfig({
  root: ".",
  build: {
    target: "es2022",
    outDir: "dist",
  },
});
