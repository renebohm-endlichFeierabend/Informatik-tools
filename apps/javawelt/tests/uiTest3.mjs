// UI-Tests Teil 3: Aufgaben-Links (Deep-Links) und Abgabe erstellen.
// Start: erst "npm run preview -- --port 4173", dann "node tests/uiTest3.mjs".
// Braucht Playwright (npm i -D playwright oder global) und Chromium.
const { chromium } = await import(process.env.PLAYWRIGHT_MODUL ?? "playwright");
import { writeFileSync, readFileSync, rmSync, mkdirSync } from "node:fs";

const scratch = new URL(".out", import.meta.url).pathname;
mkdirSync(scratch, { recursive: true });
const BASIS = process.env.JAVAWELT_URL ?? "http://localhost:4173/";
let fehler = 0;
const pruefe = (name, b, detail = "") => {
  if (b) console.log("OK  " + name);
  else { fehler++; console.log("FEHLER  " + name, detail); }
};

const browser = await chromium.launch(
  process.env.CHROMIUM_PFAD ? { executablePath: process.env.CHROMIUM_PFAD } : {},
);

async function neueSeite(seitenFehler) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    permissions: ["clipboard-read", "clipboard-write"],
  });
  page.on("pageerror", (e) => seitenFehler.push(String(e)));
  page.on("dialog", (d) => d.accept());
  return page;
}

const seitenFehler = [];

// 1. Deep-Link ?szenario=vererbung lädt das Szenario direkt (nach Rückfrage)
const seite1 = await neueSeite(seitenFehler);
await seite1.goto(BASIS + "?szenario=vererbung");
await seite1.waitForFunction(
  () => document.getElementById("konsole").textContent.includes("Szenario „Vererbung"),
  null, { timeout: 20000 },
);
pruefe("?szenario=vererbung lädt das Szenario", true);
await seite1.waitForFunction(
  () => document.getElementById("konsole").textContent.includes("übernommen"),
  null, { timeout: 20000 },
);
const tabs1 = await seite1.locator("#klassen-tabs").textContent();
pruefe("Szenario-Klassen als Tabs (Tier, Hund, Katze)", ["Tier", "Hund", "Katze"].every((k) => tabs1.includes(k)), tabs1);
pruefe("Adresse nach dem Laden aufgeräumt", !seite1.url().includes("szenario="), seite1.url());

// 2. 🔗 Link erzeugen: Dialog zeigt einen #projekt=…-Link, Kopieren funktioniert
await seite1.getByRole("button", { name: "🔗 Link" }).click();
await seite1.waitForTimeout(300);
pruefe("Link-Dialog offen", await seite1.locator("#link-dialog").isVisible());
const link = await seite1.locator("#link-text").inputValue();
pruefe("Link enthält #projekt=… (komprimiert)", link.includes("#projekt=1."), link.slice(0, 80));
await seite1.getByRole("button", { name: "Kopieren" }).click();
await seite1.waitForTimeout(300);
pruefe("Link kopiert gemeldet, Dialog zu", (await seite1.locator("#konsole").textContent()).includes("Link kopiert") && !(await seite1.locator("#link-dialog").isVisible()));
const zwischenablage = await seite1.evaluate(() => navigator.clipboard.readText());
pruefe("Zwischenablage enthält den Link", zwischenablage === link);

// 3. Der erzeugte Link lädt das Projekt in einem frischen Browser-Kontext
const seite2 = await neueSeite(seitenFehler);
await seite2.goto(link);
await seite2.waitForFunction(
  () => document.getElementById("konsole").textContent.includes("Aufgaben-Link"),
  null, { timeout: 20000 },
);
const tabs2 = await seite2.locator("#klassen-tabs").textContent();
pruefe("Projekt aus dem Link geladen (Tier, Hund, Katze)", ["Tier", "Hund", "Katze"].every((k) => tabs2.includes(k)), tabs2);
pruefe("Link-Hash nach dem Laden aufgeräumt", !seite2.url().includes("#projekt="), seite2.url());
await seite2.close();

// 4. Deep-Link ?projekt=<URL> lädt eine bereitgestellte Projektdatei
const distDatei = new URL("../dist/test-projekt.json", import.meta.url).pathname;
writeFileSync(distDatei, JSON.stringify({
  format: "javawelt-projekt", version: 1,
  klassen: {
    MeineWelt: "public class MeineWelt extends Welt {\n    public void bereiteVor() {\n    }\n}\n",
    LinkFigur: "public class LinkFigur extends Figur {\n    public void winke() {\n        sage(\"Hallo!\");\n    }\n}\n",
  },
}));
try {
  const seite3 = await neueSeite(seitenFehler);
  await seite3.goto(BASIS + "?projekt=test-projekt.json");
  await seite3.waitForFunction(
    () => document.getElementById("konsole").textContent.includes("test-projekt.json"),
    null, { timeout: 20000 },
  );
  const tabs3 = await seite3.locator("#klassen-tabs").textContent();
  pruefe("?projekt=<URL> lädt die Projektdatei (LinkFigur)", tabs3.includes("LinkFigur"), tabs3);
  await seite3.close();
} finally {
  rmSync(distDatei, { force: true });
}

// 5. Unbekanntes Szenario im Link: klare Meldung, normaler Start läuft weiter
const seite4 = await neueSeite(seitenFehler);
await seite4.goto(BASIS + "?szenario=quatsch");
await seite4.waitForFunction(
  () => document.getElementById("konsole").textContent.includes("übernommen"),
  null, { timeout: 20000 },
);
pruefe("Unbekanntes Szenario wird gemeldet", (await seite4.locator("#konsole").textContent()).includes("Unbekanntes Szenario"));
await seite4.close();

// 6. 📤 Abgabe: ohne Share-Sheet (Headless) werden Dokument + Projektdatei geladen
const downloads = [];
seite1.on("download", (d) => downloads.push(d));
await seite1.getByRole("button", { name: "📤 Abgabe" }).click();
await seite1.waitForFunction(() => document.getElementById("konsole").textContent.includes("Abgabe"), null, { timeout: 10000 });
await seite1.waitForTimeout(500);
pruefe("Abgabe erzeugt zwei Dateien (Dokument + Projekt)", downloads.length === 2, String(downloads.length));
const namen = downloads.map((d) => d.suggestedFilename()).sort();
pruefe("Dateinamen: abgabe.html + projekt.json", /javawelt-abgabe-.*\.html/.test(namen[0]) && /javawelt-projekt-.*\.json/.test(namen[1]), namen.join(", "));
const abgabePfad = scratch + "/abgabe-test.html";
await downloads[namen[0] === downloads[0].suggestedFilename() ? 0 : 1].saveAs(abgabePfad);
const abgabeHtml = readFileSync(abgabePfad, "utf8");
pruefe("Abgabe enthält Welt-Bild, Quelltext und Kopfzeile",
  abgabeHtml.includes("data:image/png") && abgabeHtml.includes("Tier.java") && abgabeHtml.includes("JavaWelt-Abgabe"),
  abgabeHtml.slice(0, 200));
pruefe("Abgabe-Quelltext ist HTML-sicher eingebettet", abgabeHtml.includes("extends Figur") && !/<pre>[^<]*<[a-z]/.test(abgabeHtml));
await seite1.close();

pruefe("Keine JavaScript-Fehler auf den Seiten", seitenFehler.length === 0, seitenFehler.join(" | "));

await browser.close();
console.log(fehler === 0 ? "\nAlle UI-Tests (Teil 3) bestanden." : `\n${fehler} UI-Test(s) fehlgeschlagen.`);
process.exit(fehler === 0 ? 0 : 1);
