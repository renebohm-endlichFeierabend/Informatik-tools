// Start: erst "npm run preview -- --port 4173", dann "node tests/uiTest.mjs".
// Braucht Playwright (npm i -D playwright oder global) und Chromium.
const { chromium } = await import(process.env.PLAYWRIGHT_MODUL ?? "playwright");
import { writeFileSync, mkdirSync } from "node:fs";
mkdirSync(new URL(".out", import.meta.url).pathname, { recursive: true });

const scratch = new URL(".out", import.meta.url).pathname;
let fehler = 0;
const pruefe = (name, b, detail = "") => {
  if (b) console.log("OK  " + name);
  else { fehler++; console.log("FEHLER  " + name, detail); }
};

const browser = await chromium.launch(
  process.env.CHROMIUM_PFAD ? { executablePath: process.env.CHROMIUM_PFAD } : {},
);
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const seitenFehler = [];
page.on("pageerror", (e) => seitenFehler.push(String(e)));
page.on("dialog", (d) => d.accept());
await page.goto(process.env.JAVAWELT_URL ?? "http://localhost:4173/");
await page.waitForFunction(() => document.getElementById("konsole").textContent.includes("übernommen"), null, { timeout: 20000 });

// 1. Bibliothek: alle 9 NRW-Klassen vorhanden
await page.getByRole("button", { name: "📚 Bibliothek" }).click();
const anzahl = await page.locator("#bibliothek-liste .eintrag").count();
pruefe("Bibliothek zeigt 11 NRW-Klassen", anzahl === 11, String(anzahl));
const listeText = await page.locator("#bibliothek-liste").textContent();
pruefe("BinaryTree/BST/Graph/DB gelistet", ["BinaryTree", "BinarySearchTree", "Graph", "ComparableContent", "DatabaseConnector", "QueryResult"].every((k) => listeText.includes(k)), listeText.slice(0, 200));

// 2. Graph hinzufügen zieht Vertex, Edge, List automatisch mit
await page.locator("#bibliothek-liste .eintrag", { hasText: "Graph —" }).getByRole("button", { name: "Hinzufügen" }).click();
await page.waitForTimeout(300);
const klassenText = await page.locator("#klassen").textContent();
pruefe("Graph + Abhängigkeiten im Projekt", ["Graph", "Vertex", "Edge", "List"].every((k) => klassenText.includes(k)), klassenText);
pruefe("Konsole meldet mitinstallierte Klassen", (await page.locator("#konsole").textContent()).includes("Vertex, Edge, List, Graph"), "");

// 3. BST hinzufügen zieht das Interface ComparableContent mit; Übungsmodus toleriert es
await page.getByRole("button", { name: "📚 Bibliothek" }).click();
await page.locator("#bibliothek-liste .eintrag", { hasText: "BinarySearchTree" }).getByRole("button", { name: "Hinzufügen" }).click();
await page.waitForTimeout(200);
await page.getByRole("button", { name: "✓ Übernehmen" }).click();
await page.waitForTimeout(400);
const konsoleText = await page.locator("#konsole").textContent();
pruefe("Übernehmen mit Interface + Bäumen ohne Fehler", !konsoleText.split("hinzugefügt").pop().includes("✗"), konsoleText.slice(-300));

// 4. Projekt speichern → Download mit allen Klassen
const downloadVersprechen = page.waitForEvent("download");
await page.getByRole("button", { name: "⬇ Speichern" }).click();
const download = await downloadVersprechen;
const pfad = scratch + "/projekt-test.json";
await download.saveAs(pfad);
const daten = JSON.parse((await import("node:fs")).readFileSync(pfad, "utf8"));
pruefe("Projektdatei enthält Klassen + Format", daten.format === "javawelt-projekt" && daten.klassen.Graph && daten.klassen.MeineWelt, Object.keys(daten.klassen ?? {}).join(","));

// 5. Projekt öffnen: eigene Datei mit anderer Klasse laden
writeFileSync(scratch + "/projekt-import.json", JSON.stringify({
  format: "javawelt-projekt", version: 1,
  klassen: {
    MeineWelt: "public class MeineWelt extends Welt {\n    public void bereiteVor() {\n    }\n}\n",
    Pinguin: "public class Pinguin extends Figur {\n    public void watschle() {\n        geheVor(30);\n    }\n}\n",
  },
  bilder: { Pinguin: { art: "emoji", wert: "🐧" } },
}));
await page.locator("#projekt-datei").setInputFiles(scratch + "/projekt-import.json");
await page.waitForTimeout(400);
pruefe("Import: Pinguin platzierbar, Graph weg", (await page.locator("#klassen").textContent()).includes("Pinguin") && !(await page.locator("#klassen").textContent()).includes("Graph"));
pruefe("Import gemeldet (2 Klassen)", (await page.locator("#konsole").textContent()).includes("2 Klassen"));


// 5b. Datenbank-Szenario: laden, Klassen + Hinweis prüfen
await page.getByRole("button", { name: "Szenarien" }).click();
const szenarienText = await page.locator("#szenarien-liste").textContent();
pruefe("Datenbank-Szenario gelistet (Q1)", szenarienText.includes("Datenbank: der Zoo") && szenarienText.includes("Q1 · Datenbanken"), szenarienText.slice(0, 200));
await page.locator("#szenarien-liste .eintrag", { hasText: "Datenbank: der Zoo" }).getByRole("button", { name: "Laden" }).click();
await page.waitForTimeout(400);
const dbTabs = await page.locator("#klassen-tabs").textContent();
pruefe("DB-Szenario-Klassen als Tabs", ["MeineWelt.java", "Zootier.java", "DatabaseConnector.java", "QueryResult.java"].every((k) => dbTabs.includes(k)), dbTabs);
pruefe("Notbetriebs-Hinweis beim DB-Szenario", (await page.locator("#konsole").textContent()).includes("läuft nicht im Notbetrieb"));
await page.locator(".tab", { hasText: "DatabaseConnector.java" }).click();
pruefe("DatabaseConnector editierbar mit NRW-API", (await page.locator("#klassen-code").inputValue()).includes("executeStatement") && !(await page.locator("#klassen-code").evaluate((el) => el.readOnly)));
// 6. Kein Schalter mehr: immer echtes Java, bei blockiertem CDN Notbetrieb + Retry
pruefe("Kein Laufzeit-Schalter mehr vorhanden", (await page.locator("#cheerpj").count()) === 0);
pruefe("Status zeigt Notbetrieb", (await page.locator("#status").textContent()).includes("Notbetrieb"));
await page.locator("#laufzeit-neu").click();
await page.waitForFunction(() => document.getElementById("status").textContent.includes("geladen"), null, { timeout: 5000 }).catch(() => {});
await page.waitForFunction(() => document.getElementById("status").textContent.includes("Notbetrieb"), null, { timeout: 20000 });
pruefe("erneut versuchen: fällt sauber in den Notbetrieb zurück", true);

pruefe("Keine JavaScript-Fehler", seitenFehler.length === 0, seitenFehler.join(" | "));
await browser.close();
console.log(fehler === 0 ? "\nAlle UI-Tests (Teil 2) bestanden." : `\n${fehler} Fehler`);
process.exit(fehler === 0 ? 0 : 1);
