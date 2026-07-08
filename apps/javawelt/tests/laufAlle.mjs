/**
 * Führt alle Tests aus, die ohne Browser laufen:
 *   1. Parser-Tests            (tests/testParser.ts)
 *   2. Übungsmodus-Interpreter (tests/testMock.ts)
 *   3. SQL-Datenbank           (tests/testDatenbank.ts, echte SQLite)
 *   4. javac-Kompilierung aller Szenarien + Bibliotheksklassen
 *      (nur wenn ein JDK installiert ist; sonst übersprungen)
 *
 * Aufruf:  npm test   (im Verzeichnis apps/javawelt)
 *
 * Die Playwright-UI-Tests laufen separat: Preview-Server starten
 * (npm run preview -- --port 4173), dann node tests/uiTest.mjs und
 * node tests/uiTest2.mjs (Playwright + Chromium werden benötigt).
 */
import { execFileSync, execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HIER = dirname(fileURLToPath(import.meta.url));
const WURZEL = join(HIER, "..");
const AUS = join(HIER, ".out");
const ESBUILD = join(WURZEL, "node_modules", ".bin", "esbuild");

// Shim für CommonJS-Abhängigkeiten (sql.js) in ESM-Bundles.
const BANNER =
  "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url); " +
  "import { fileURLToPath as __flp } from 'node:url'; import { dirname as __dn } from 'node:path'; " +
  "const __filename = __flp(import.meta.url); const __dirname = __dn(__filename);";

let fehlgeschlagen = 0;

function schritt(name, quelle) {
  const ziel = join(AUS, quelle.replace(/\.ts$/, ".mjs"));
  console.log(`\n=== ${name} ===`);
  try {
    execFileSync(
      ESBUILD,
      [join(HIER, quelle), "--bundle", "--format=esm", "--platform=node", `--outfile=${ziel}`, "--log-level=error", `--banner:js=${BANNER}`],
      { stdio: "inherit", cwd: WURZEL },
    );
    execFileSync(process.execPath, [ziel], { stdio: "inherit", cwd: WURZEL });
  } catch {
    fehlgeschlagen++;
  }
}

rmSync(AUS, { recursive: true, force: true });
mkdirSync(AUS, { recursive: true });

schritt("Parser", "testParser.ts");
schritt("Übungsmodus-Interpreter", "testMock.ts");
schritt("SQL-Datenbank (sql.js)", "testDatenbank.ts");

// --- javac-Kompilierung (optional, braucht JDK >= 11) ------------------------
let javacDa = false;
try {
  execSync("javac -version", { stdio: "ignore" });
  javacDa = true;
} catch {
  console.log("\n=== javac-Kompilierung übersprungen (kein JDK gefunden) ===");
}

if (javacDa) {
  console.log("\n=== javac: Szenarien + Bibliothek gegen framework.jar ===");
  try {
    schritt("Szenario-Quelltexte exportieren", "exportJava.ts");
    schritt("Bibliotheks-Quelltexte exportieren", "exportBib.ts");
    const jar = join(WURZEL, "public", "framework.jar");
    const szenarienDir = join(AUS, "javasrc");
    for (const d of readdirSync(szenarienDir)) {
      const quellDir = join(szenarienDir, d);
      execSync(`javac --release 11 -nowarn -cp "${jar}" -d "${join(quellDir, "out")}" "${quellDir}"/*.java`, { stdio: "inherit" });
      console.log(`OK  Szenario ${d}`);
    }
    const bibDir = join(AUS, "javabib");
    if (existsSync(bibDir)) {
      execSync(`javac --release 11 -nowarn -cp "${jar}" -d "${join(bibDir, "out")}" "${bibDir}"/*.java`, { stdio: "inherit" });
      console.log("OK  Bibliothek (alle NRW-Klassen + Probe)");
    }
  } catch {
    fehlgeschlagen++;
  }

  console.log("\n=== Steuerung-Protokoll auf der JVM (Platzieren/Methodenaufruf) ===");
  try {
    execFileSync(process.execPath, [join(HIER, "testSteuerung.mjs")], { stdio: "inherit", cwd: WURZEL });
  } catch {
    fehlgeschlagen++;
  }
}

console.log(fehlgeschlagen === 0 ? "\n✓ Alle Test-Schritte bestanden." : `\n✗ ${fehlgeschlagen} Test-Schritt(e) fehlgeschlagen.`);
process.exit(fehlgeschlagen === 0 ? 0 : 1);
