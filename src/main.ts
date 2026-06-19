import { Welt } from "./engine/welt";
import { Eingabe } from "./engine/eingabe";
import { Objektbank } from "./ui/objektbank";
import { JavaLaufzeit } from "./java/laufzeit";
import { MockLaufzeit } from "./java/mockLaufzeit";
import { CheerpJLaufzeit } from "./java/cheerpjLaufzeit";

const $ = <T extends HTMLElement>(id: string): T =>
  document.getElementById(id) as T;

const canvas = $<HTMLCanvasElement>("canvas");
const welt = new Welt(canvas);
const eingabe = new Eingabe(canvas, welt);

const objektbank = new Objektbank(
  welt,
  $("klassen"),
  $("objekte"),
  $("methoden"),
);
eingabe.onAuswahl = (f) => objektbank.waehleAktiv(f);

// --- Konsole -------------------------------------------------------------
const konsole = $("konsole");
const log = (z: string) => {
  konsole.textContent += z + "\n";
  konsole.scrollTop = konsole.scrollHeight;
};

// --- Laufzeit (Mock ⇄ CheerpJ) ------------------------------------------
let laufzeit: JavaLaufzeit = new MockLaufzeit();
let initVersprechen = laufzeit.init(welt, log);

const status = $("status");
const cheerpjBox = $<HTMLInputElement>("cheerpj");
cheerpjBox.addEventListener("change", async () => {
  laufzeit = cheerpjBox.checked ? new CheerpJLaufzeit() : new MockLaufzeit();
  status.textContent = cheerpjBox.checked ? "CheerpJ wird geladen …" : "Mock-Laufzeit";
  try {
    initVersprechen = laufzeit.init(welt, log);
    await initVersprechen;
    status.textContent = laufzeit.name;
  } catch (e) {
    log("Fehler: " + (e as Error).message);
    status.textContent = "CheerpJ nicht verfügbar – zurück zu Mock";
    cheerpjBox.checked = false;
    laufzeit = new MockLaufzeit();
    initVersprechen = laufzeit.init(welt, log);
  }
});

// --- Werkzeuge -----------------------------------------------------------
const platzierenBtn = $("platzieren");
platzierenBtn.addEventListener("click", () => {
  eingabe.platzierenModus = !eingabe.platzierenModus;
  platzierenBtn.textContent = `Platzieren: ${eingabe.platzierenModus ? "an" : "aus"}`;
});

$("leeren").addEventListener("click", () => {
  for (const f of welt.alleFiguren()) welt.entferne(f.id);
  objektbank.waehleAktiv(null);
});

$("ausfuehren").addEventListener("click", async () => {
  const code = $<HTMLTextAreaElement>("editor").value;
  try {
    await initVersprechen;
    await laufzeit.fuehreAus(code);
  } catch (e) {
    log("Fehler: " + (e as Error).message);
  }
});
