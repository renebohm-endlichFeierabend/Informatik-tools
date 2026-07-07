/**
 * Ein kleiner Java-Parser für Schülerklassen.
 *
 * Er hat zwei Aufgaben:
 * 1. Die Objektbank liest hieraus die öffentlichen Methoden einer Klasse,
 *    um Aufruf-Knöpfe anzuzeigen (funktioniert in beiden Laufzeiten).
 * 2. Der Übungsmodus (ohne echtes Java) führt die geparsten Anweisungen
 *    direkt aus – für den typischen Unterrichts-Code (Methodenaufrufe,
 *    Variablen mit new, for-Zählschleifen, while(laeuft())).
 *
 * Alles, was der Parser nicht versteht, wird als "unbekannt" markiert –
 * der Übungsmodus meldet das beim Ausführen verständlich; die echte
 * Java-Laufzeit (CheerpJ) kompiliert den Code ohnehin vollständig.
 */

export interface Param {
  typ: string;
  name: string;
}

export interface MethodenDef {
  name: string;
  oeffentlich: boolean;
  statisch: boolean;
  rueckgabe: string;
  params: Param[];
  body: Anweisung[];
  zeile: number;
}

export interface KlassenDef {
  name: string;
  erbtVon: string | null;
  felder: Param[];
  methoden: MethodenDef[];
  /** Konstruktor ohne Parameter (falls im Quelltext vorhanden). */
  konstruktor: Anweisung[] | null;
}

export interface NeuAusdruck {
  klasse: string;
  args: Ausdruck[];
}

export type Ausdruck =
  | { art: "zahl"; wert: number }
  | { art: "text"; wert: string }
  | { art: "wahrheit"; wert: boolean }
  | { art: "variable"; name: string }
  | { art: "aufrufAusdruck"; ziel: string | null; methode: string; args: Ausdruck[] }
  | { art: "unbekanntAusdruck"; text: string };

export type Anweisung =
  | { art: "deklaration"; typ: string; name: string; neu: NeuAusdruck | null; zeile: number }
  | { art: "zuweisungNeu"; name: string; neu: NeuAusdruck; zeile: number }
  | { art: "aufruf"; ziel: string | null; methode: string; args: Ausdruck[]; zeile: number }
  | { art: "for"; variable: string; von: Ausdruck; bis: Ausdruck; inklusive: boolean; body: Anweisung[]; zeile: number }
  | { art: "whileLaeuft"; body: Anweisung[]; zeile: number }
  | { art: "unbekannt"; text: string; zeile: number };

export class ParseFehler extends Error {}

// ---------------------------------------------------------------------------

/** Ersetzt Kommentare durch Leerzeichen (Zeilennummern bleiben erhalten). */
export function entferneKommentare(quelle: string): string {
  let ergebnis = "";
  let i = 0;
  while (i < quelle.length) {
    const c = quelle[i];
    if (c === '"') {
      // String-Literal unverändert übernehmen
      ergebnis += c;
      i++;
      while (i < quelle.length && quelle[i] !== '"') {
        if (quelle[i] === "\\") {
          ergebnis += quelle[i] + (quelle[i + 1] ?? "");
          i += 2;
          continue;
        }
        ergebnis += quelle[i];
        i++;
      }
      if (i < quelle.length) {
        ergebnis += '"';
        i++;
      }
    } else if (c === "/" && quelle[i + 1] === "/") {
      while (i < quelle.length && quelle[i] !== "\n") i++;
    } else if (c === "/" && quelle[i + 1] === "*") {
      i += 2;
      while (i < quelle.length && !(quelle[i] === "*" && quelle[i + 1] === "/")) {
        if (quelle[i] === "\n") ergebnis += "\n";
        i++;
      }
      i += 2;
    } else {
      ergebnis += c;
      i++;
    }
  }
  return ergebnis;
}

/** 0-basierter Index → 1-basierte Zeilennummer. */
function zeileBei(quelle: string, index: number): number {
  let z = 1;
  for (let i = 0; i < index && i < quelle.length; i++) {
    if (quelle[i] === "\n") z++;
  }
  return z;
}

/** Findet zur öffnenden Klammer bei `start` die passende schließende. */
function blockEnde(text: string, start: number): number {
  let tiefe = 0;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      i++;
      while (i < text.length && text[i] !== '"') {
        if (text[i] === "\\") i++;
        i++;
      }
    } else if (c === "{") {
      tiefe++;
    } else if (c === "}") {
      tiefe--;
      if (tiefe === 0) return i;
    }
  }
  return -1;
}

/** Teilt `text` an Kommas auf oberster Ebene (Klammern/Strings bleiben ganz). */
function trenneArgumente(text: string): string[] {
  const teile: string[] = [];
  let tiefe = 0;
  let aktuell = "";
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      aktuell += c;
      i++;
      while (i < text.length && text[i] !== '"') {
        if (text[i] === "\\") {
          aktuell += text[i];
          i++;
        }
        aktuell += text[i];
        i++;
      }
      aktuell += text[i] ?? "";
    } else if (c === "(" || c === "[") {
      tiefe++;
      aktuell += c;
    } else if (c === ")" || c === "]") {
      tiefe--;
      aktuell += c;
    } else if (c === "," && tiefe === 0) {
      teile.push(aktuell);
      aktuell = "";
    } else {
      aktuell += c;
    }
  }
  if (aktuell.trim() !== "") teile.push(aktuell);
  return teile.map((t) => t.trim()).filter((t) => t !== "");
}

// ---------------------------------------------------------------------------

/**
 * Parst die (erste) Klasse eines Quelltexts.
 * Wirft ParseFehler, wenn gar keine Klasse gefunden wird.
 */
export function parseKlasse(quelltext: string): KlassenDef {
  const quelle = entferneKommentare(quelltext);
  const kopf = /(?:public\s+)?class\s+([A-Za-z_]\w*)(?:\s+extends\s+([A-Za-z_]\w*))?\s*\{/.exec(quelle);
  if (!kopf || kopf.index === undefined) {
    throw new ParseFehler("Keine Klasse gefunden. Erwartet wird z. B.: public class Roboter extends Figur { … }");
  }
  const name = kopf[1];
  const erbtVon = kopf[2] ?? null;
  const auf = kopf.index + kopf[0].length - 1; // Position der öffnenden Klammer
  const zu = blockEnde(quelle, auf);
  if (zu < 0) {
    throw new ParseFehler(`Klasse ${name}: Eine schließende Klammer } fehlt.`);
  }

  const def: KlassenDef = { name, erbtVon, felder: [], methoden: [], konstruktor: null };
  parseMitglieder(quelle, auf + 1, zu, def);
  return def;
}

const METHODEN_KOPF =
  /^((?:(?:public|private|protected|static|final)\s+)*)([A-Za-z_][\w<>[\]]*)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)\s*\{/;
const KONSTRUKTOR_KOPF = /^((?:(?:public|private|protected)\s+)*)([A-Z]\w*)\s*\(([^)]*)\)\s*\{/;
const FELD =
  /^((?:(?:public|private|protected|static|final)\s+)*)([A-Za-z_][\w<>[\]]*)\s+([A-Za-z_]\w*)\s*(?:=\s*([^;]+))?;/;

function parseMitglieder(quelle: string, von: number, bis: number, def: KlassenDef): void {
  let i = von;
  while (i < bis) {
    if (/\s/.test(quelle[i]) || quelle[i] === ";") {
      i++;
      continue;
    }
    const rest = quelle.slice(i, bis);

    // Konstruktor VOR der Methoden-Regex prüfen: "public Test() {" würde
    // sonst per Backtracking als Methode (Rückgabetyp "public") gelesen.
    const konstruktor = KONSTRUKTOR_KOPF.exec(rest);
    if (konstruktor && konstruktor[2] === def.name) {
      const koerperAuf = i + konstruktor[0].length - 1;
      const koerperZu = blockEnde(quelle, koerperAuf);
      if (koerperZu < 0) break;
      if (konstruktor[3].trim() === "") {
        def.konstruktor = parseAnweisungen(quelle, koerperAuf + 1, koerperZu);
      }
      i = koerperZu + 1;
      continue;
    }

    const methode = METHODEN_KOPF.exec(rest);
    if (methode && !/^(public|private|protected|static|final)$/.test(methode[2])) {
      const koerperAuf = i + methode[0].length - 1;
      const koerperZu = blockEnde(quelle, koerperAuf);
      if (koerperZu < 0) break;
      def.methoden.push({
        name: methode[3],
        oeffentlich: methode[1].includes("public"),
        statisch: methode[1].includes("static"),
        rueckgabe: methode[2],
        params: parseParams(methode[4]),
        body: parseAnweisungen(quelle, koerperAuf + 1, koerperZu),
        zeile: zeileBei(quelle, i),
      });
      i = koerperZu + 1;
      continue;
    }

    const feld = FELD.exec(rest);
    if (feld) {
      def.felder.push({ typ: feld[2], name: feld[3] });
      i += feld[0].length;
      continue;
    }

    // Unbekanntes Mitglied: bis zum nächsten ; oder Blockende überspringen.
    const naechsteKlammer = rest.indexOf("{");
    const naechstesSemikolon = rest.indexOf(";");
    if (naechsteKlammer >= 0 && (naechstesSemikolon < 0 || naechsteKlammer < naechstesSemikolon)) {
      const zu = blockEnde(quelle, i + naechsteKlammer);
      i = zu < 0 ? bis : zu + 1;
    } else if (naechstesSemikolon >= 0) {
      i += naechstesSemikolon + 1;
    } else {
      break;
    }
  }
}

function parseParams(text: string): Param[] {
  return trenneArgumente(text).map((p) => {
    const teile = p.split(/\s+/);
    return { typ: teile[0] ?? "?", name: teile[1] ?? "?" };
  });
}

// ---------------------------------------------------------------------------

const FOR_KOPF =
  /^for\s*\(\s*int\s+([A-Za-z_]\w*)\s*=\s*([^;]+);\s*\1\s*(<=|<)\s*([^;]+);\s*\1\s*\+\+\s*\)\s*\{/;
const WHILE_LAEUFT_KOPF = /^while\s*\(\s*laeuft\s*\(\s*\)\s*\)\s*\{/;
const BLOCK_KONSTRUKT = /^(if|else|while|for|switch|do|try)\b/;

function parseAnweisungen(quelle: string, von: number, bis: number): Anweisung[] {
  const anweisungen: Anweisung[] = [];
  let i = von;
  while (i < bis) {
    if (/\s/.test(quelle[i]) || quelle[i] === ";") {
      i++;
      continue;
    }
    const zeile = zeileBei(quelle, i);
    const rest = quelle.slice(i, bis);

    const forKopf = FOR_KOPF.exec(rest);
    if (forKopf) {
      const auf = i + forKopf[0].length - 1;
      const zu = blockEnde(quelle, auf);
      if (zu < 0) break;
      anweisungen.push({
        art: "for",
        variable: forKopf[1],
        von: parseAusdruck(forKopf[2]),
        bis: parseAusdruck(forKopf[4]),
        inklusive: forKopf[3] === "<=",
        body: parseAnweisungen(quelle, auf + 1, zu),
        zeile,
      });
      i = zu + 1;
      continue;
    }

    const whileKopf = WHILE_LAEUFT_KOPF.exec(rest);
    if (whileKopf) {
      const auf = i + whileKopf[0].length - 1;
      const zu = blockEnde(quelle, auf);
      if (zu < 0) break;
      anweisungen.push({ art: "whileLaeuft", body: parseAnweisungen(quelle, auf + 1, zu), zeile });
      i = zu + 1;
      continue;
    }

    // Andere Block-Konstrukte (if, while mit Bedingung, …): als Ganzes
    // "unbekannt" – der Übungsmodus meldet das, echtes Java kann es.
    if (BLOCK_KONSTRUKT.test(rest)) {
      const auf = rest.indexOf("{");
      const zu = auf >= 0 ? blockEnde(quelle, i + auf) : -1;
      const textEnde = zu >= 0 ? zu + 1 : Math.min(bis, i + rest.length);
      anweisungen.push({
        art: "unbekannt",
        text: quelle.slice(i, Math.min(textEnde, i + 60)).replace(/\s+/g, " "),
        zeile,
      });
      i = zu >= 0 ? zu + 1 : bis;
      continue;
    }

    // Normale Anweisung bis zum Semikolon.
    const semikolon = findeSemikolon(quelle, i, bis);
    if (semikolon < 0) {
      anweisungen.push({ art: "unbekannt", text: rest.slice(0, 60).replace(/\s+/g, " "), zeile });
      break;
    }
    const text = quelle.slice(i, semikolon).trim();
    anweisungen.push(parseEinfacheAnweisung(text, zeile));
    i = semikolon + 1;
  }
  return anweisungen;
}

function findeSemikolon(quelle: string, von: number, bis: number): number {
  let tiefe = 0;
  for (let i = von; i < bis; i++) {
    const c = quelle[i];
    if (c === '"') {
      i++;
      while (i < bis && quelle[i] !== '"') {
        if (quelle[i] === "\\") i++;
        i++;
      }
    } else if (c === "(") tiefe++;
    else if (c === ")") tiefe--;
    else if (c === ";" && tiefe === 0) return i;
    else if (c === "{") return -1;
  }
  return -1;
}

const DEKL_MIT_NEU = /^([A-Za-z_][\w<>[\]]*)\s+([A-Za-z_]\w*)\s*=\s*new\s+([A-Za-z_]\w*)\s*\((.*)\)$/;
const DEKL_OHNE = /^([A-Za-z_][\w<>[\]]*)\s+([A-Za-z_]\w*)$/;
const ZUWEISUNG_NEU = /^([A-Za-z_]\w*)\s*=\s*new\s+([A-Za-z_]\w*)\s*\((.*)\)$/;
const AUFRUF_MIT_ZIEL = /^([A-Za-z_]\w*)\s*\.\s*([A-Za-z_]\w*)\s*\((.*)\)$/;
const AUFRUF_OHNE_ZIEL = /^([A-Za-z_]\w*)\s*\((.*)\)$/;

function parseEinfacheAnweisung(text: string, zeile: number): Anweisung {
  let m = DEKL_MIT_NEU.exec(text);
  if (m) {
    return {
      art: "deklaration",
      typ: m[1],
      name: m[2],
      neu: { klasse: m[3], args: trenneArgumente(m[4]).map(parseAusdruck) },
      zeile,
    };
  }
  m = ZUWEISUNG_NEU.exec(text);
  if (m) {
    return {
      art: "zuweisungNeu",
      name: m[1],
      neu: { klasse: m[2], args: trenneArgumente(m[3]).map(parseAusdruck) },
      zeile,
    };
  }
  m = AUFRUF_MIT_ZIEL.exec(text);
  if (m) {
    return { art: "aufruf", ziel: m[1], methode: m[2], args: trenneArgumente(m[3]).map(parseAusdruck), zeile };
  }
  m = AUFRUF_OHNE_ZIEL.exec(text);
  if (m && !/^(if|while|for|switch|return|new)$/.test(m[1])) {
    return { art: "aufruf", ziel: null, methode: m[1], args: trenneArgumente(m[2]).map(parseAusdruck), zeile };
  }
  m = DEKL_OHNE.exec(text);
  if (m && !/^(return|break|continue)$/.test(m[1])) {
    return { art: "deklaration", typ: m[1], name: m[2], neu: null, zeile };
  }
  return { art: "unbekannt", text: text.slice(0, 60), zeile };
}

export function parseAusdruck(text: string): Ausdruck {
  const t = text.trim();
  const str = /^"((?:[^"\\]|\\.)*)"$/.exec(t);
  if (str) {
    return { art: "text", wert: str[1].replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\\\/g, "\\") };
  }
  if (/^-?\d+(\.\d+)?$/.test(t)) return { art: "zahl", wert: Number(t) };
  if (t === "true") return { art: "wahrheit", wert: true };
  if (t === "false") return { art: "wahrheit", wert: false };
  let m = /^([A-Za-z_]\w*)\s*\.\s*([A-Za-z_]\w*)\s*\((.*)\)$/.exec(t);
  if (m) {
    return { art: "aufrufAusdruck", ziel: m[1], methode: m[2], args: trenneArgumente(m[3]).map(parseAusdruck) };
  }
  m = /^([A-Za-z_]\w*)\s*\((.*)\)$/.exec(t);
  if (m) {
    return { art: "aufrufAusdruck", ziel: null, methode: m[1], args: trenneArgumente(m[2]).map(parseAusdruck) };
  }
  if (/^[A-Za-z_]\w*$/.test(t)) return { art: "variable", name: t };
  return { art: "unbekanntAusdruck", text: t.slice(0, 40) };
}
