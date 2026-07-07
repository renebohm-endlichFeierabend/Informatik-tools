import { Welt } from "./engine/welt";
import { Eingabe } from "./engine/eingabe";
import { Objektbank } from "./ui/objektbank";
import { KlassenVerwaltung } from "./ui/klassenVerwaltung";
import { BilderVerwaltung, erstelleBildDialog } from "./ui/bilder";
import { SZENARIEN, Szenario } from "./ui/szenarien";
import {
  kodiereProjektFuerLink,
  dekodiereProjektAusLink,
  erstelleAbgabeHtml,
  teileDateien,
} from "./ui/teilen";
import { NRW_BIBLIOTHEK, bibliothekEintrag } from "./java/nrwBibliothek";
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

// --- Laufzeit: immer echtes Java (CheerpJ) -----------------------------------
// Es gibt keinen Modus-Schalter: Der echte Compiler ist der Normalfall.
// Nur wenn CheerpJ nicht geladen werden kann (offline, Filter), springt
// automatisch der eingeschränkte Übungsmodus als NOTBETRIEB ein – klar
// gekennzeichnet und mit „erneut versuchen“-Knopf.
let laufzeit: JavaLaufzeit;
let notbetrieb = false;
let uebernommen = false; // seit Laufzeit-Start erfolgreich übersetzt
let geaendert = true; // Quelltext geändert seit letztem Übernehmen
const status = $("status");
const laufzeitNeuKnopf = $<HTMLButtonElement>("laufzeit-neu");

async function starteLaufzeit(): Promise<void> {
  laufzeit = new CheerpJLaufzeit();
  notbetrieb = false;
  laufzeitNeuKnopf.hidden = true;
  status.textContent = "Echtes Java wird geladen …";
  try {
    await laufzeit.init(welt, log);
    status.textContent = laufzeit.name;
  } catch (e) {
    log("✗ " + (e as Error).message);
    log("⚠ Echtes Java (CheerpJ) ist nicht erreichbar – Notbetrieb im eingeschränkten Übungsmodus. Internet/Filter prüfen, dann oben „erneut versuchen“.");
    laufzeit = new MockLaufzeit();
    notbetrieb = true;
    await laufzeit.init(welt, log);
    status.textContent = "⚠ Notbetrieb: " + laufzeit.name;
    laufzeitNeuKnopf.hidden = false;
  }
}

let initVersprechen = starteLaufzeit();

laufzeitNeuKnopf.addEventListener("click", () => {
  void (async () => {
    laufzeit?.stoppeSpiel();
    welt.leeren();
    objektbank.waehleAktiv(null);
    uebernommen = false;
    geaendert = true;
    initVersprechen = starteLaufzeit();
    await initVersprechen;
    await uebernehmen().catch((e: Error) => log("✗ " + e.message));
  })();
});

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

// --- Projekt speichern / öffnen (Datei mit Klassen + Bildern) -----------------------------------
// localStorage sichert nur auf DIESEM Gerät/Browser. Für „mitnehmen und
// später weitermachen“ (anderes iPad, Abgabe, Sicherung) gibt es die
// Projektdatei: über die iPad-Dateien-App speicher- und ladbar.
const projektDatei = $<HTMLInputElement>("projekt-datei");

/** Der komplette Projektstand (Klassen + Bilder) – für Datei, Link und Abgabe. */
function erstelleProjektDaten(): Record<string, unknown> {
  return {
    format: "javawelt-projekt",
    version: 1,
    gespeichert: new Date().toISOString(),
    klassen: klassenVerwaltung.quelltexte(),
    bilder: bilder.alle(),
  };
}

/**
 * Prüft Projektdaten (aus Datei, Link oder URL) und übernimmt sie nach
 * Rückfrage. Gibt true zurück, wenn das Projekt geladen wurde.
 */
function uebernimmProjektDaten(roh: unknown, quelle: string): boolean {
  const daten = roh as {
    format?: string;
    klassen?: Record<string, string>;
    bilder?: Record<string, never>;
  } | null;
  const klassen = daten?.klassen ?? {};
  const namen = Object.keys(klassen).filter((n) => /^[A-Z][A-Za-z0-9]*$/.test(n));
  if (daten?.format !== "javawelt-projekt" || namen.length === 0) {
    log(`✗ ${quelle} ist keine JavaWelt-Projektdatei.`);
    return false;
  }
  if (!confirm(`Projekt „${quelle}“ öffnen?\nDie aktuellen Klassen werden ersetzt.`)) return false;
  klassenVerwaltung.ersetzeAlle(
    Object.fromEntries(namen.map((n) => [n, String(klassen[n])])),
  );
  bilder.ersetzeAlle(daten.bilder ?? {});
  log(`✓ Projekt „${quelle}“ geöffnet (${namen.length} Klassen).`);
  void uebernehmen().catch((e: Error) => log("✗ " + e.message));
  return true;
}

$("projekt-speichern").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(erstelleProjektDaten(), null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `javawelt-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  log("✓ Projekt als Datei gespeichert (siehe Downloads bzw. Dateien-App).");
});

$("projekt-oeffnen").addEventListener("click", () => projektDatei.click());
projektDatei.addEventListener("change", () => {
  const datei = projektDatei.files?.[0];
  projektDatei.value = "";
  if (!datei) return;
  void datei.text().then((text) => {
    let daten: unknown;
    try {
      daten = JSON.parse(text);
    } catch {
      log("✗ Das ist keine lesbare Projektdatei.");
      return;
    }
    uebernimmProjektDaten(daten, datei.name);
  });
});

// --- Aufgaben-Link erzeugen (Projekt komprimiert im Link) ---------------------------------------
const linkDialog = document.getElementById("link-dialog") as HTMLDialogElement;
const linkText = $<HTMLTextAreaElement>("link-text");

$("link-erstellen").addEventListener("click", () => {
  void (async () => {
    try {
      const kode = await kodiereProjektFuerLink(erstelleProjektDaten());
      linkText.value = `${location.origin}${location.pathname}#projekt=${kode}`;
      linkDialog.showModal();
    } catch (e) {
      log("✗ Link konnte nicht erzeugt werden: " + (e as Error).message);
    }
  })();
});
$("link-kopieren").addEventListener("click", () => {
  // Synchron aus der Geste heraus – so erlaubt auch Safari das Kopieren.
  navigator.clipboard.writeText(linkText.value).then(
    () => {
      linkDialog.close();
      log("✓ Aufgaben-Link kopiert – in OneNote/Teams einfügen.");
    },
    () => {
      linkText.select();
      log("✗ Kopieren nicht erlaubt – Link im Feld markieren und manuell kopieren.");
    },
  );
});
$("link-zu").addEventListener("click", () => linkDialog.close());

// --- Abgabe erstellen (Screenshot + Quelltext + Konsole + Projektdatei) --------------------------
$("abgabe-erstellen").addEventListener("click", () => {
  // Alles synchron vorbereiten: Safari erlaubt das Share-Sheet nur direkt
  // aus der Nutzer-Geste heraus (kein await vor navigator.share).
  const datum = new Date();
  const stempel = datum.toISOString().slice(0, 10);
  const html = erstelleAbgabeHtml({
    datum,
    laufzeit: status.textContent ?? "",
    bild: canvas.toDataURL("image/png"),
    klassen: klassenVerwaltung.quelltexte(),
    konsole: konsole.innerText,
  });
  const dateien = [
    new File([html], `javawelt-abgabe-${stempel}.html`, { type: "text/html" }),
    new File([JSON.stringify(erstelleProjektDaten(), null, 2)], `javawelt-projekt-${stempel}.json`, {
      type: "application/json",
    }),
  ];
  void teileDateien(dateien, "JavaWelt-Abgabe").then((ergebnis) => {
    if (ergebnis === "geteilt") {
      log("✓ Abgabe geteilt (Dokument + Projektdatei).");
    } else if (ergebnis === "heruntergeladen") {
      log("✓ Abgabe heruntergeladen: Dokument (.html) + Projektdatei (.json) – z. B. in OneNote einfügen.");
    }
  });
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
        // Erst die benötigten Klassen (z. B. Graph → List, Vertex, Edge).
        const hinzugefuegt: string[] = [];
        for (const abhaengigkeit of eintrag.benoetigt ?? []) {
          const ab = bibliothekEintrag(abhaengigkeit);
          if (ab && !klassenVerwaltung.gib(ab.name)) {
            klassenVerwaltung.fuegeHinzu(ab.name, ab.code);
            hinzugefuegt.push(ab.name);
          }
        }
        const fehler = klassenVerwaltung.fuegeHinzu(eintrag.name, eintrag.code);
        if (fehler) {
          log("✗ " + fehler);
          return;
        }
        hinzugefuegt.push(eintrag.name);
        bibliothekDialog.close();
        oeffneKlasse(eintrag.name);
        log(`✓ Als editierbare Kopie hinzugefügt: ${hinzugefuegt.join(", ")}.`);
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

/** Lädt ein Szenario nach Rückfrage; true, wenn geladen wurde. */
function ladeSzenario(szenario: Szenario): boolean {
  if (!confirm(`Szenario „${szenario.titel}“ laden?\nDie aktuellen Klassen werden ersetzt.`)) return false;
  klassenVerwaltung.ersetzeAlle(szenario.klassen);
  if (szenario.emojis) bilder.setzeEmojis(szenario.emojis);
  log(`✓ Szenario „${szenario.titel}“ geladen.`);
  if (szenario.hinweis && notbetrieb) {
    log(`⚠ Dieses Szenario ${szenario.hinweis} – zurzeit läuft nur der Notbetrieb (oben „erneut versuchen“).`);
  }
  void uebernehmen().catch((e: Error) => log("✗ " + e.message));
  return true;
}

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
    if (ladeSzenario(szenario)) szenarienDialog.close();
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

// --- Aufgaben-Links (Deep-Links) -----------------------------------------------------------------
// Die Aufgabe öffnet die Umgebung im richtigen Zustand – ein Tipp in OneNote:
//   ?szenario=<id>          lädt ein Lernszenario direkt
//   ?projekt=<URL>          lädt eine vorbereitete Projektdatei (z. B. GitHub Pages)
//   #projekt=<komprimiert>  das komplette Projekt im Link selbst (🔗-Knopf)
async function verarbeiteStartLink(): Promise<boolean> {
  const params = new URLSearchParams(location.search);
  const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
  const szenarioId = params.get("szenario");
  const projektUrl = params.get("projekt");
  const projektImLink = hash.get("projekt");
  if (!szenarioId && !projektUrl && !projektImLink) return false;
  // Adresse aufräumen: Neuladen soll das Projekt nicht noch einmal ersetzen.
  history.replaceState(null, "", location.pathname);
  if (szenarioId) {
    const szenario = SZENARIEN.find((s) => s.id === szenarioId);
    if (!szenario) {
      log(`✗ Unbekanntes Szenario im Link: „${szenarioId}“.`);
      return false;
    }
    return ladeSzenario(szenario);
  }
  if (projektImLink) {
    try {
      return uebernimmProjektDaten(await dekodiereProjektAusLink(projektImLink), "Aufgaben-Link");
    } catch (e) {
      log("✗ " + (e as Error).message);
      return false;
    }
  }
  try {
    const antwort = await fetch(projektUrl!);
    if (!antwort.ok) throw new Error(`HTTP ${antwort.status}`);
    const name = projektUrl!.split("/").pop() || projektUrl!;
    return uebernimmProjektDaten(await antwort.json(), name);
  } catch (e) {
    log(`✗ Projekt aus dem Link konnte nicht geladen werden (${(e as Error).message}).`);
    return false;
  }
}

// --- Start -------------------------------------------------------------------------------------
oeffneKlasse(aktiveKlasse);
aktualisiereKnoepfe();
void (async () => {
  // Erst der Link (löst bei Erfolg selbst das Übernehmen aus), sonst normal.
  const linkGeladen = await verarbeiteStartLink().catch(() => false);
  if (!linkGeladen) {
    await initVersprechen;
    await uebernehmen().catch((e: Error) => log("✗ " + e.message));
  }
})();
