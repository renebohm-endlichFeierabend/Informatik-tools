// Start: erst "npm run preview -- --port 4173", dann "node tests/uiTest.mjs".
// Braucht Playwright (npm i -D playwright oder global) und Chromium.
const { chromium } = await import(process.env.PLAYWRIGHT_MODUL ?? "playwright");

const scratch = new URL(".out", import.meta.url).pathname;
let fehler = 0;
const pruefe = (name, bedingung, detail = "") => {
  if (bedingung) console.log("OK  " + name);
  else {
    fehler++;
    console.log("FEHLER  " + name, detail);
  }
};

const browser = await chromium.launch(
  process.env.CHROMIUM_PFAD ? { executablePath: process.env.CHROMIUM_PFAD } : {},
);
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const seitenFehler = [];
page.on("pageerror", (e) => seitenFehler.push(String(e)));
await page.goto(process.env.JAVAWELT_URL ?? "http://localhost:4173/");

const konsole = page.locator("#konsole");
await page.waitForFunction(() => document.getElementById("konsole").textContent.includes("übernommen"), null, { timeout: 20000 });
pruefe("App startet, Klassen automatisch übernommen", true);
// Ohne CDN: automatischer Notbetrieb, klar gekennzeichnet + Retry-Knopf
pruefe("Notbetrieb erkannt und angezeigt", (await page.locator("#status").textContent()).includes("Notbetrieb"), await page.locator("#status").textContent());
pruefe("erneut-versuchen-Knopf sichtbar", await page.locator("#laufzeit-neu").isVisible());
const fehlerVorher = ((await konsole.textContent()).match(/✗/g) ?? []).length;
await page.screenshot({ path: scratch + "/ui-start.png" });

// 1. Objekt platzieren: Roboter → "neu" → auf die Welt tippen
await page.locator(".klasse", { hasText: "Roboter" }).getByRole("button", { name: "neu" }).click();
pruefe("Platzieren-Hinweis sichtbar", await page.locator("#platzieren-hinweis").isVisible());
await page.locator("#canvas").click({ position: { x: 300, y: 200 } });
await page.waitForTimeout(300);
const objektText = await page.locator("#objekte").textContent();
pruefe("Objekt erscheint in der Objektbank", objektText.includes(": Roboter"), objektText);

// 2. Methoden des ausgewählten Objekts: eigene Methode laufeQuadrat sichtbar + aufrufbar
const methoden = await page.locator("#methoden").textContent();
pruefe("Eigene Methode laufeQuadrat wird angezeigt", methoden.includes("laufeQuadrat"), methoden);
pruefe("Geerbte Methoden (geheVor) werden angezeigt", methoden.includes("geheVor"), methoden);
await page.locator("#methoden .methode", { hasText: "laufeQuadrat" }).getByRole("button").click();
await page.waitForTimeout(400);
pruefe("laufeQuadrat ohne neue Fehlermeldung", ((await konsole.textContent()).match(/✗/g) ?? []).length === fehlerVorher, await konsole.textContent());

// gibX liefert Rückgabewert in die Konsole
await page.locator("#methoden .methode", { hasText: "gibX" }).getByRole("button").click();
await page.waitForTimeout(200);
pruefe("gibX() → Wert in Konsole", (await konsole.textContent()).includes("gibX() → "), await konsole.textContent());

// 3. Spiel starten und stoppen (MeineWelt: bereiteVor + while(laeuft()))
await page.getByRole("button", { name: "▶ Start" }).click();
await page.waitForTimeout(900);
pruefe("Start meldet sich", (await konsole.textContent()).includes("MeineWelt gestartet"), await konsole.textContent());
const objekteImSpiel = await page.locator("#objekte").textContent();
pruefe("bereiteVor hat rob erzeugt", objekteImSpiel.includes("roboter"), objekteImSpiel);
await page.screenshot({ path: scratch + "/ui-spiel.png" });
await page.getByRole("button", { name: "■ Stopp" }).click();
await page.waitForFunction(() => document.getElementById("konsole").textContent.includes("Spiel beendet"), null, { timeout: 3000 });
pruefe("Stopp beendet die Schleife sauber", true);

// 4. Neue Klasse anlegen
await page.getByRole("button", { name: "＋ Neue Klasse" }).click();
await page.locator(".neue-klasse-formular input").fill("Biene");
await page.getByRole("button", { name: "Anlegen" }).click();
await page.waitForTimeout(200);
pruefe("Biene-Tab im Editor geöffnet", (await page.locator(".tab.aktiv").textContent()).includes("Biene.java"));
pruefe("Biene als Klasse platzierbar", (await page.locator("#klassen").textContent()).includes("Biene"));

// 5. Framework-Klasse ist schreibgeschützt
await page.locator(".tab", { hasText: "🔒 Figur.java" }).click();
pruefe("Figur.java nur lesbar", await page.locator("#klassen-code").evaluate((el) => el.readOnly));
pruefe("Schreibschutz-Hinweis sichtbar", await page.locator("#editor-hinweis").isVisible());

// 6. Kompilierfehler-Meldung im Übungsmodus (Tab-Name ≠ Klassenname)
await page.locator(".tab", { hasText: "Biene.java" }).click();
await page.locator("#klassen-code").fill("public class Falsch extends Figur {\n}\n");
await page.getByRole("button", { name: "✓ Übernehmen" }).click();
await page.waitForTimeout(300);
pruefe("Namens-Fehler wird gemeldet", (await konsole.textContent()).includes("Falsch"), await konsole.textContent());

// 7. Bibliothek: Stack als editierbare Kopie hinzufügen
page.on("dialog", (d) => d.accept());
await page.getByRole("button", { name: "📚 Bibliothek" }).click();
await page.locator("#bibliothek-liste .eintrag", { hasText: "Stack<ContentType>" }).getByRole("button", { name: "Hinzufügen" }).click();
await page.waitForTimeout(200);
pruefe("Stack.java-Tab geöffnet und editierbar", (await page.locator(".tab.aktiv").textContent()).includes("Stack.java") && !(await page.locator("#klassen-code").evaluate((el) => el.readOnly)));
pruefe("Stack unter weiteren Klassen gelistet", (await page.locator("#klassen").textContent()).includes("Stack"));
pruefe("Stack-Quelltext ist NRW-Stack", (await page.locator("#klassen-code").inputValue()).includes("push(ContentType pContent)"));

// 8. Bild-Dialog: Emoji für Roboter wählen
await page.locator(".klasse", { hasText: "Roboter" }).getByRole("button", { name: "🖼" }).click();
await page.locator("#bild-dialog .emoji", { hasText: "🤖" }).click();
await page.waitForTimeout(200);
pruefe("Bild-Dialog schließt nach Auswahl", !(await page.locator("#bild-dialog").isVisible()));

// 9. Szenario laden (Vererbung) und im Übungsmodus starten
await page.getByRole("button", { name: "Szenarien" }).click();
await page.locator("#szenarien-liste .eintrag", { hasText: "Vererbung & Polymorphie" }).getByRole("button", { name: "Laden" }).click();
await page.waitForTimeout(400);
const tabsText = await page.locator("#klassen-tabs").textContent();
pruefe("Szenario-Klassen als Tabs (Tier, Hund, Katze)", tabsText.includes("Tier.java") && tabsText.includes("Hund.java") && tabsText.includes("Katze.java"), tabsText);
await page.getByRole("button", { name: "▶ Start" }).click();
await page.waitForFunction(() => document.getElementById("konsole").textContent.includes("Spiel beendet"), null, { timeout: 8000 });
const objekteVererbung = await page.locator("#objekte").textContent();
pruefe("Szenario läuft: Bello und Minka auf der Welt", objekteVererbung.includes("Bello") && objekteVererbung.includes("Minka"), objekteVererbung);
await page.screenshot({ path: scratch + "/ui-szenario.png" });

await page.screenshot({ path: scratch + "/ui-ende.png" });
pruefe("Keine JavaScript-Fehler auf der Seite", seitenFehler.length === 0, seitenFehler.join(" | "));

await browser.close();
console.log(fehler === 0 ? "\nAlle UI-Tests bestanden." : `\n${fehler} UI-Fehler`);
process.exit(fehler === 0 ? 0 : 1);
