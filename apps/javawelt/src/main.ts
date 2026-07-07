import { Welt } from "./engine/welt";
import { Eingabe } from "./engine/eingabe";
import { Objektbank } from "./ui/objektbank";
import { KlassenVerwaltung } from "./ui/klassenVerwaltung";
import { BilderVerwaltung, erstelleBildDialog } from "./ui/bilder";
import { SZENARIEN } from "./ui/szenarien";
import { NRW_BIBLIOTHEK } from "./java/nrwBibliothek";
import { JavaLaufzeit } from "./java/laufzeit";
import { MockLaufzeit, MockAbbruch } from "./java/mockLaufzeit";
import { CheerpJLaufzeit } from "./java/cheerpjLaufzeit";

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

// --- Welt und Eingabe ------------------------------------------------------
const canvas = $<HTMLCanvasElement>("canvas");
const welt = new Welt(canvas);
const eingabe = new Eingabe(canvas, welt);

// --- Bilder für Klassen ------------------------------------------------------
const bilder = new BilderVerwaltung();
welt.bildFuer = (klasse) => bilder.fuerEngine(klasse);

// --- Konsole -----------------------------------------------------------------
const konsole = $("konsole");
const log = (zeile: string) => {
  const el = document.createElement("div");
  el.textContent = zeile;
  if (zeile.startsWith("✗")) el.className = "fehler";
  if (zeile.startsWith("✓")) el.className = "erfolg";
  konsole.appendChild(el);
  konsole.scrollTop = konsole.scrollHeight;
};
$("konsole-leeren").addEventListener("click", () => (konsole.innerHTML = ""));

// --- Laufzeit (Übungsmodus ⇄ CheerpJ) ---------------------------------------
let laufzeit: JavaLaufzeit = new MockLaufzeit();
let initVersprechen = laufzeit.init(welt, log);
let uebernommen = false; // seit Laufzeit-Start erfolgreich übersetzt
let geaendert = true; // Quelltext geändert seit letztem Übernehmen
const status = $("status");

// --- Klassen und Objektbank ----------------------------------------------------
const klassenVerwaltung = new KlassenVerwaltung();
const objektbank = new Objektbank(
  welt,
  klassenVerwaltung,
  () => laufzeit,
  log,
  $("klassen"),
  $("objekte"),
  $("methoden"),
  $("neue-klasse"),
);
eingabe.onAuswahl = (f) => objektbank.waehleAktiv(f);
objektbank.onBildWaehlen = erstelleBildDialog(bilder, log);

// --- Quelltext-Editor ------------------------------------------------------------
const codeEl = $<HTMLTextAreaElement>("klassen-code");
const tabsEl = $("klassen-tabs");
const editorHinweis = $("editor-hinweis");
const loeschenKnopf = $<HTMLButtonElement>("klasse-loeschen");
const uebernehmenKnopf = $<HTMLButtonElement>("uebernehmen");
let aktiveKlasse = klassenVerwaltung.weltKlasse() ?? klassenVerwaltung.alle()[0].name;

function zeichneTabs(): void {
  tabsEl.innerHTML = "";
  for (const k of klassenVerwaltung.alle()) {
    const tab = document.createElement("button");
    tab.className = "tab" + (k.name === aktiveKlasse ? " aktiv" : "");
    tab.textContent = k.framework ? `🔒 ${k.name}.java` : `${k.name}.java`;
    tab.onclick = () => oeffneKlasse(k.name);
    tabsEl.appendChild(tab);
  }
}

function oeffneKlasse(name: string): void {
  const info = klassenVerwaltung.gib(name);
  if (!info) return;
  aktiveKlasse = name;
  codeEl.value = info.code;
  codeEl.readOnly = info.framework;
  editorHinweis.hidden = !info.framework;
  loeschenKnopf.hidden = !klassenVerwaltung.loeschbar(name);
  zeichneTabs();
}

codeEl.addEventListener("input", () => {
  klassenVerwaltung.setzeCode(aktiveKlasse, codeEl.value);
});

// Tab rückt ein (4 Leerzeichen), statt den Fokus zu verlieren.
codeEl.addEventListener("keydown", (e) => {
  if (e.key === "Tab" && !codeEl.readOnly) {
    e.preventDefault();
    codeEl.setRangeText("    ", codeEl.selectionStart, codeEl.selectionEnd, "end");
    klassenVerwaltung.setzeCode(aktiveKlasse, codeEl.value);
  }
});

loeschenKnopf.addEventListener("click", () => {
  if (!confirm(`Die Klasse ${aktiveKlasse} wirklich löschen?`)) return;
  klassenVerwaltung.loesche(aktiveKlasse);
});

objektbank.onKlasseOeffnen = oeffneKlasse;

klassenVerwaltung.onCodeGeaendert = () => {
  geaendert = true;
  aktualisiereKnoepfe();
};
klassenVerwaltung.onListeGeaendert = () => {
  geaendert = true;
  if (!klassenVerwaltung.gib(aktiveKlasse)) {
    aktiveKlasse = klassenVerwaltung.weltKlasse() ?? klassenVerwaltung.alle()[0].name;
  }
  oeffneKlasse(aktiveKlasse);
  objektbank.aktualisiere();
  aktualisiereKnoepfe();
};

// --- Übernehmen (Kompilieren) ------------------------------------------------------
async function uebernehmen(): Promise<boolean> {
  await initVersprechen;
  const ok = await laufzeit.kompiliere(klassenVerwaltung.quelltexte());
  if (ok) {
    welt.leeren();
    uebernommen = true;
    geaendert = false;
    objektbank.aktualisiere();
    log("✓ Klassen übernommen – die Welt wurde geleert.");
  }
  aktualisiereKnoepfe();
  return ok;
}

/** Stellt sicher, dass der aktuelle Quelltext übersetzt ist. */
async function stelleUebernommenSicher(): Promise<void> {
  if (uebernommen && !geaendert) return;
  if (!(await uebernehmen())) {
    throw new Error("Übernehmen fehlgeschlagen – siehe Meldungen in der Konsole.");
  }
}

uebernehmenKnopf.addEventListener("click", () => {
  void uebernehmen().catch((e: Error) => log("✗ " + e.message));
});

// --- Platzieren ------------------------------------------------------------------------
const platzierenHinweis = $("platzieren-hinweis");
objektbank.onPlatzieren = (klasse) => {
  if (eingabe.platzierenKlasse === klasse) {
    eingabe.brichAb();
    return;
  }
  eingabe.starte(klasse);
  platzierenHinweis.textContent = `Tippe auf die Welt, um ein ${klasse}-Objekt zu platzieren.`;
  platzierenHinweis.hidden = false;
};
eingabe.onPlatzierenEnde = () => {
  platzierenHinweis.hidden = true;
};
eingabe.onPlatziere = (klasse, x, y) => {
  void (async () => {
    try {
      await stelleUebernommenSicher();
      const id = await laufzeit.erzeugeObjekt(klasse, x, y);
      welt.waehle(id);
      objektbank.waehleAktiv(welt.figur(id));
    } catch (e) {
      log("✗ " + (e as Error).message);
    }
  })();
};

// --- Spiel starten/stoppen ----------------------------------------------------------------
const startKnopf = $<HTMLButtonElement>("start");
const stoppKnopf = $<HTMLButtonElement>("stopp");
let spielLaeuft = false;

function aktualisiereKnoepfe(): void {
  startKnopf.disabled = spielLaeuft;
  stoppKnopf.disabled = !spielLaeuft;
  uebernehmenKnopf.classList.toggle("auffaellig", geaendert);
}

startKnopf.addEventListener("click", () => {
  void (async () => {
    if (spielLaeuft) return;
    try {
      await stelleUebernommenSicher();
      const weltKlasse = klassenVerwaltung.weltKlasse();
      if (!weltKlasse) {
        log("✗ Keine Weltklasse gefunden – eine Klasse muss von Welt erben (z. B. MeineWelt).");
        return;
      }
      spielLaeuft = true;
      aktualisiereKnoepfe();
      objektbank.waehleAktiv(null);
      log(`▶ ${weltKlasse} gestartet: bereiteVor(), dann spiele().`);
      await laufzeit.starteSpiel(weltKlasse);
      log("■ Spiel beendet.");
    } catch (e) {
      if (!(e instanceof MockAbbruch)) log("✗ " + (e as Error).message);
    } finally {
      spielLaeuft = false;
      aktualisiereKnoepfe();
    }
  })();
});

stoppKnopf.addEventListener("click", () => laufzeit.stoppeSpiel());

$("leeren").addEventListener("click", () => {
  void (async () => {
    laufzeit.stoppeSpiel();
    for (const f of welt.alleFiguren()) {
      try {
        await laufzeit.entferneObjekt(f.id);
      } catch {
        welt.entferne(f.id);
      }
    }
    objektbank.waehleAktiv(null);
  })();
});

// --- Laufzeit umschalten (Übungsmodus ⇄ echtes Java) -----------------------------------------
const cheerpjBox = $<HTMLInputElement>("cheerpj");
cheerpjBox.addEventListener("change", () => {
  void (async () => {
    laufzeit.stoppeSpiel();
    welt.leeren();
    objektbank.waehleAktiv(null);
    uebernommen = false;
    geaendert = true;
    laufzeit = cheerpjBox.checked ? new CheerpJLaufzeit() : new MockLaufzeit();
    status.textContent = cheerpjBox.checked ? "CheerpJ wird geladen …" : laufzeit.name;
    try {
      initVersprechen = laufzeit.init(welt, log);
      await initVersprechen;
      status.textContent = laufzeit.name;
      await uebernehmen();
    } catch (e) {
      log("✗ " + (e as Error).message);
      log("Zurück zum Übungsmodus. (Läuft das Schulnetz über einen Filter? Siehe README.)");
      cheerpjBox.checked = false;
      laufzeit = new MockLaufzeit();
      initVersprechen = laufzeit.init(welt, log);
      status.textContent = laufzeit.name;
      await uebernehmen();
    }
  })();
});

// --- Bibliothek (NRW-Klassen als editierbare Kopie) --------------------------------------------
const bibliothekDialog = document.getElementById("bibliothek-dialog") as HTMLDialogElement;
const bibliothekListe = $("bibliothek-liste");

function zeichneBibliothek(): void {
  bibliothekListe.innerHTML = "";
  for (const eintrag of NRW_BIBLIOTHEK) {
    const karte = document.createElement("div");
    karte.className = "eintrag";
    const text = document.createElement("div");
    text.className = "eintrag-text";
    const titel = document.createElement("b");
    titel.textContent = eintrag.titel; // textContent: Generics wie <ContentType> sind kein HTML
    const beschreibung = document.createElement("p");
    beschreibung.textContent = eintrag.beschreibung;
    text.append(titel, beschreibung);
    karte.appendChild(text);

    const knopf = document.createElement("button");
    if (klassenVerwaltung.gib(eintrag.name)) {
      knopf.textContent = "im Projekt";
      knopf.disabled = true;
      knopf.className = "sekundaer";
    } else {
      knopf.textContent = "Hinzufügen";
      knopf.onclick = () => {
        const fehler = klassenVerwaltung.fuegeHinzu(eintrag.name, eintrag.code);
        if (fehler) {
          log("✗ " + fehler);
          return;
        }
        bibliothekDialog.close();
        oeffneKlasse(eintrag.name);
        log(`✓ ${eintrag.name} als editierbare Kopie hinzugefügt.`);
      };
    }
    karte.appendChild(knopf);
    bibliothekListe.appendChild(karte);
  }
}

$("bibliothek-auf").addEventListener("click", () => {
  zeichneBibliothek();
  bibliothekDialog.showModal();
});
$("bibliothek-zu").addEventListener("click", () => bibliothekDialog.close());

// --- Lernszenarien -------------------------------------------------------------------------------
const szenarienDialog = document.getElementById("szenarien-dialog") as HTMLDialogElement;
const szenarienListe = $("szenarien-liste");

for (const szenario of SZENARIEN) {
  const karte = document.createElement("div");
  karte.className = "eintrag";
  const text = document.createElement("div");
  text.className = "eintrag-text";
  const titel = document.createElement("b");
  titel.textContent = szenario.titel;
  const stufe = document.createElement("span");
  stufe.className = "abzeichen";
  stufe.textContent = szenario.stufe;
  text.append(titel, " ", stufe);
  if (szenario.hinweis) {
    const hinweis = document.createElement("span");
    hinweis.className = "abzeichen warnung";
    hinweis.textContent = szenario.hinweis;
    text.append(" ", hinweis);
  }
  const beschreibung = document.createElement("p");
  beschreibung.textContent = szenario.beschreibung;
  text.appendChild(beschreibung);
  karte.appendChild(text);

  const knopf = document.createElement("button");
  knopf.textContent = "Laden";
  knopf.onclick = () => {
    if (!confirm(`Szenario „${szenario.titel}“ laden?\nDie aktuellen Klassen werden ersetzt.`)) return;
    klassenVerwaltung.ersetzeAlle(szenario.klassen);
    if (szenario.emojis) bilder.setzeEmojis(szenario.emojis);
    szenarienDialog.close();
    log(`✓ Szenario „${szenario.titel}“ geladen.`);
    if (szenario.hinweis && !cheerpjBox.checked) {
      log(`Hinweis: Dieses Szenario ${szenario.hinweis} – oben rechts einschalten.`);
    }
    void uebernehmen().catch((e: Error) => log("✗ " + e.message));
  };
  karte.appendChild(knopf);
  szenarienListe.appendChild(karte);
}

$("szenarien-auf").addEventListener("click", () => szenarienDialog.showModal());
$("szenarien-zu").addEventListener("click", () => szenarienDialog.close());

// --- Hilfe ------------------------------------------------------------------------------------
const hilfe = document.getElementById("hilfe") as HTMLDialogElement;
$("hilfe-auf").addEventListener("click", () => hilfe.showModal());
$("hilfe-zu").addEventListener("click", () => hilfe.close());
$("zuruecksetzen").addEventListener("click", () => {
  if (!confirm("Wirklich alle Klassen auf die Ausgangs-Vorlagen zurücksetzen? Eigener Code geht verloren.")) return;
  klassenVerwaltung.zuruecksetzen();
  hilfe.close();
  void uebernehmen().catch((e: Error) => log("✗ " + e.message));
});

// --- Start -------------------------------------------------------------------------------------
oeffneKlasse(aktiveKlasse);
aktualisiereKnoepfe();
void (async () => {
  await initVersprechen;
  status.textContent = laufzeit.name;
  await uebernehmen().catch((e: Error) => log("✗ " + e.message));
})();
