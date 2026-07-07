import { SZENARIEN } from "../src/ui/szenarien";
import { mkdirSync, writeFileSync } from "node:fs";

// Schreibt jedes Szenario als eigenes Java-Paketverzeichnis heraus,
// mit demselben unsichtbaren Gerüst wie die CheerpJ-Laufzeit.
for (const s of SZENARIEN) {
  const dir = `tests/.out/javasrc/${s.id}`;
  mkdirSync(dir, { recursive: true });
  for (const [name, code] of Object.entries(s.klassen)) {
    writeFileSync(`${dir}/${name}.java`, "import de.schule.jle.*;\n" + code);
  }
}
console.log("geschrieben");
