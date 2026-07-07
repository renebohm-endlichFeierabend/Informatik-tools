import { JavaLaufzeit, Ausgabe } from "./laufzeit";
import { Welt } from "../engine/welt";
import {
  Anweisung,
  Ausdruck,
  KlassenDef,
  MethodenDef,
  ParseFehler,
  parseKlasse,
} from "./javaParser";

/**
 * Übungsmodus: führt den typischen Unterrichts-Code OHNE echte JVM aus –
 * sofort lauffähig, offline, auch wenn das CheerpJ-CDN blockiert ist.
 *
 * Er versteht bewusst nur eine Teilmenge von Java (Methodenaufrufe,
 * Variablen mit new, for-Zählschleifen, while(laeuft()), Zahlen/Texte/
 * Variablen als Argumente). Alles darüber hinaus meldet er verständlich
 * und verweist auf den Schalter "Echtes Java".
 */

type Wert = number | string | boolean | MockObjekt | null | undefined;

interface MockObjekt {
  id: number;
  klasse: string;
  felder: Map<string, Wert>;
}

/** Fehler, der dem Schüler in der Konsole gezeigt wird. */
class LaufFehler extends Error {}

/** Ein Neustart/Neu-Übernehmen hat diesen Lauf überholt. */
class Abbruch extends Error {}

/** Signal, mit dem `return` eine Methode verlässt (kein Fehler). */
class RueckgabeSignal {
  constructor(readonly wert: Wert) {}
}

const MAX_TIEFE = 64;
const MAX_SCHLEIFEN = 100_000;

const FIGUR_METHODEN: Record<string, string[]> = {
  geheVor: ["int"],
  dreheDich: ["int"],
  setzePosition: ["int", "int"],
  sage: ["String"],
  nenne: ["String"],
  gibX: [],
  gibY: [],
  gibWinkel: [],
  entferne: [],
};

const WELT_METHODEN: Record<string, string[]> = {
  warte: ["int"],
  laeuft: [],
  zufallszahl: ["int", "int"],
};

export class MockLaufzeit implements JavaLaufzeit {
  readonly name = "Übungsmodus (ohne echtes Java)";
  private welt!: Welt;
  private ausgabe!: Ausgabe;
  private klassen = new Map<string, KlassenDef>();
  private objekte = new Map<number, MockObjekt>();
  private laeuftFlag = false;
  private generation = 0;

  async init(welt: Welt, ausgabe: Ausgabe): Promise<void> {
    this.welt = welt;
    this.ausgabe = ausgabe;
    this.ausgabe("Übungsmodus bereit (führt den typischen Unterrichts-Code direkt aus).");
  }

  async kompiliere(klassen: Record<string, string>): Promise<boolean> {
    this.generation++;
    this.laeuftFlag = false;
    const neu = new Map<string, KlassenDef>();
    let ok = true;
    for (const [name, quelle] of Object.entries(klassen)) {
      try {
        const def = parseKlasse(quelle);
        if (def.name !== name) {
          this.ausgabe(`✗ ${name}.java: Die Klasse heißt im Quelltext „${def.name}“ – Datei und Klasse müssen gleich heißen.`);
          ok = false;
          continue;
        }
        neu.set(name, def);
      } catch (e) {
        if (e instanceof ParseFehler) {
          this.ausgabe(`✗ ${name}.java: ${e.message}`);
          ok = false;
        } else {
          throw e;
        }
      }
    }
    if (!ok) return false;
    this.klassen = neu;
    this.objekte.clear();
    return true;
  }

  async erzeugeObjekt(klasse: string, x: number, y: number): Promise<number> {
    return this.erzeuge(klasse, x, y, this.generation);
  }

  async rufeMethode(id: number, methode: string, args: string[]): Promise<string> {
    const objekt = this.objekte.get(id);
    if (!objekt) throw new LaufFehler("Objekt nicht (mehr) bekannt.");
    const gen = this.generation;
    const wert = await this.rufeAuf(objekt, methode, args.map(textZuWert), gen);
    return wert === null || wert === undefined ? "" : String(wert);
  }

  async entferneObjekt(id: number): Promise<void> {
    this.objekte.delete(id);
    this.welt.entferne(id);
  }

  async starteSpiel(weltKlasse: string): Promise<void> {
    const def = this.klassen.get(weltKlasse);
    if (!def) throw new LaufFehler(`Die Klasse ${weltKlasse} wurde noch nicht übernommen.`);
    if (def.erbtVon !== "Welt") {
      throw new LaufFehler(`${weltKlasse} muss von Welt erben (extends Welt).`);
    }
    // Frischer Lauf: Welt und Objekte zurücksetzen.
    const gen = ++this.generation;
    this.objekte.clear();
    this.welt.leeren();
    this.laeuftFlag = true;

    const spiel: MockObjekt = { id: -1, klasse: weltKlasse, felder: this.feldStandardwerte(def) };
    try {
      const bereiteVor = this.findeMethode(def, "bereiteVor", 0);
      if (bereiteVor) await this.fuehreMethodeAus(spiel, bereiteVor, [], gen, 0);
      const spiele = this.findeMethode(def, "spiele", 0);
      if (spiele) await this.fuehreMethodeAus(spiel, spiele, [], gen, 0);
    } finally {
      if (gen === this.generation) this.laeuftFlag = false;
    }
  }

  stoppeSpiel(): void {
    this.laeuftFlag = false;
  }

  // ---- Objekterzeugung ----------------------------------------------------

  private async erzeuge(klasse: string, x: number, y: number, gen: number): Promise<number> {
    if (!this.erbtVonFigur(klasse)) {
      throw new LaufFehler(`Die Klasse ${klasse} erbt nicht von Figur – nur Figuren können auf der Welt stehen.`);
    }
    const id = this.welt.erzeugeFigur("", klasse, x, y);
    const def = this.klassen.get(klasse);
    const objekt: MockObjekt = {
      id,
      klasse,
      felder: def ? this.feldStandardwerte(def) : new Map(),
    };
    this.objekte.set(id, objekt);
    // Konstruktor ohne Parameter ausführen, falls vorhanden (ganze Kette).
    for (const d of this.klassenKette(klasse).reverse()) {
      if (d.konstruktor) {
        try {
          await this.fuehreAnweisungenAus(objekt, d.konstruktor, new Map(), gen, 0);
        } catch (e) {
          if (!(e instanceof RueckgabeSignal)) throw e;
        }
      }
    }
    return id;
  }

  private feldStandardwerte(def: KlassenDef): Map<string, Wert> {
    const felder = new Map<string, Wert>();
    for (const d of this.klassenKette(def.name)) {
      for (const feld of d.felder) {
        felder.set(feld.name, feld.typ === "int" || feld.typ === "double" ? 0 : feld.typ === "boolean" ? false : null);
      }
    }
    return felder;
  }

  /** Alle bekannten Klassendefinitionen von `klasse` aufwärts (ohne Figur/Welt). */
  private klassenKette(klasse: string): KlassenDef[] {
    const kette: KlassenDef[] = [];
    let aktuell: string | null = klasse;
    let schutz = 0;
    while (aktuell && schutz++ < 20) {
      const def = this.klassen.get(aktuell);
      if (!def) break;
      kette.push(def);
      aktuell = def.erbtVon;
    }
    return kette;
  }

  private erbtVonFigur(klasse: string): boolean {
    if (klasse === "Figur") return true;
    const kette = this.klassenKette(klasse);
    return kette.length > 0 && kette[kette.length - 1].erbtVon === "Figur";
  }

  // ---- Interpreter --------------------------------------------------------

  private findeMethode(def: KlassenDef, name: string, argAnzahl: number): MethodenDef | null {
    for (const d of this.klassenKette(def.name)) {
      const treffer = d.methoden.find((m) => m.name === name && m.params.length === argAnzahl);
      if (treffer) return treffer;
    }
    return null;
  }

  private async rufeAuf(objekt: MockObjekt, methode: string, args: Wert[], gen: number, tiefe = 0): Promise<Wert> {
    const def = this.klassen.get(objekt.klasse);
    const eigene = def ? this.findeMethode(def, methode, args.length) : null;
    if (eigene) return this.fuehreMethodeAus(objekt, eigene, args, gen, tiefe);

    // Eingebaute Methoden (Figur bzw. Welt).
    const istWelt = objekt.id === -1;
    const tabelle = istWelt ? WELT_METHODEN : FIGUR_METHODEN;
    const signatur = tabelle[methode];
    if (!signatur || signatur.length !== args.length) {
      throw new LaufFehler(`${objekt.klasse} hat keine Methode ${methode} mit ${args.length} Parameter(n).`);
    }
    const werte = args.map((a, i) => wandle(a, signatur[i], methode));
    return istWelt ? this.weltMethode(methode, werte, gen) : this.figurMethode(objekt, methode, werte);
  }

  private figurMethode(objekt: MockObjekt, methode: string, args: Wert[]): Wert {
    const { id } = objekt;
    const figur = this.welt.figur(id);
    if (!figur) throw new LaufFehler("Die Figur steht nicht mehr auf der Welt.");
    switch (methode) {
      case "geheVor": {
        // Wie in Figur.java: Trigonometrie aus Blickrichtung und Schrittweite.
        const bogenmass = (figur.logischWinkel * Math.PI) / 180;
        const pixel = args[0] as number;
        this.welt.verschiebe(id, Math.round(Math.cos(bogenmass) * pixel), Math.round(Math.sin(bogenmass) * pixel));
        return null;
      }
      case "dreheDich":
        this.welt.dreheDich(id, args[0] as number);
        return null;
      case "setzePosition":
        this.welt.setzePosition(id, args[0] as number, args[1] as number);
        return null;
      case "sage":
        this.welt.sage(id, String(args[0]));
        return null;
      case "nenne":
        this.welt.benenne(id, String(args[0]));
        return null;
      case "gibX":
        return this.welt.gibX(id);
      case "gibY":
        return this.welt.gibY(id);
      case "gibWinkel":
        return ((Math.round(figur.logischWinkel) % 360) + 360) % 360;
      case "entferne":
        this.objekte.delete(id);
        this.welt.entferne(id);
        return null;
      default:
        throw new LaufFehler(`Unbekannte Methode ${methode}.`);
    }
  }

  private async weltMethode(methode: string, args: Wert[], gen: number): Promise<Wert> {
    switch (methode) {
      case "warte":
        await schlafe(Math.max(0, args[0] as number));
        this.pruefeAktiv(gen);
        return null;
      case "laeuft":
        return this.laeuftFlag && gen === this.generation;
      case "zufallszahl": {
        const von = args[0] as number;
        const bis = args[1] as number;
        return von + Math.floor(Math.random() * (bis - von + 1));
      }
      default:
        throw new LaufFehler(`Die Welt hat keine Methode ${methode}.`);
    }
  }

  private async fuehreMethodeAus(
    selbst: MockObjekt,
    methode: MethodenDef,
    args: Wert[],
    gen: number,
    tiefe: number,
  ): Promise<Wert> {
    if (tiefe > MAX_TIEFE) throw new LaufFehler(`Zu viele verschachtelte Aufrufe (Methode ${methode.name}).`);
    const umgebung = new Map<string, Wert>();
    methode.params.forEach((p, i) => umgebung.set(p.name, wandle(args[i], p.typ, methode.name)));
    try {
      await this.fuehreAnweisungenAus(selbst, methode.body, umgebung, gen, tiefe);
    } catch (e) {
      if (e instanceof RueckgabeSignal) return e.wert;
      throw e;
    }
    return null;
  }

  private async fuehreAnweisungenAus(
    selbst: MockObjekt,
    anweisungen: Anweisung[],
    umgebung: Map<string, Wert>,
    gen: number,
    tiefe: number,
  ): Promise<void> {
    for (const a of anweisungen) {
      this.pruefeAktiv(gen);
      switch (a.art) {
        case "deklaration": {
          const wert = a.wert ? await this.werteAusdruck(a.wert, selbst, umgebung, gen, tiefe) : standardwert(a.typ);
          umgebung.set(a.name, wert);
          break;
        }
        case "zuweisung": {
          const wert = await this.werteAusdruck(a.wert, selbst, umgebung, gen, tiefe);
          if (umgebung.has(a.name)) umgebung.set(a.name, wert);
          else if (selbst.felder.has(a.name)) selbst.felder.set(a.name, wert);
          else throw new LaufFehler(`Zeile ${a.zeile}: Die Variable ${a.name} wurde nicht deklariert.`);
          break;
        }
        case "aufruf":
          await this.werteAufruf(a.ziel, a.methode, a.args, selbst, umgebung, gen, tiefe, a.zeile);
          break;
        case "rueckgabe":
          throw new RueckgabeSignal(
            a.wert ? await this.werteAusdruck(a.wert, selbst, umgebung, gen, tiefe) : null,
          );
        case "for": {
          const von = erwarteZahl(await this.werteAusdruck(a.von, selbst, umgebung, gen, tiefe), a.zeile);
          const bisRoh = erwarteZahl(await this.werteAusdruck(a.bis, selbst, umgebung, gen, tiefe), a.zeile);
          const bis = a.inklusive ? bisRoh + 1 : bisRoh;
          if (bis - von > MAX_SCHLEIFEN) throw new LaufFehler(`Zeile ${a.zeile}: Die Schleife hat zu viele Durchläufe.`);
          const vorher = umgebung.get(a.variable);
          for (let i = von; i < bis; i++) {
            umgebung.set(a.variable, i);
            await this.fuehreAnweisungenAus(selbst, a.body, umgebung, gen, tiefe);
          }
          umgebung.set(a.variable, vorher);
          break;
        }
        case "whileLaeuft": {
          while (this.laeuftFlag && gen === this.generation) {
            const start = performance.now();
            await this.fuehreAnweisungenAus(selbst, a.body, umgebung, gen, tiefe);
            // Ohne warte() im Rumpf trotzdem den Browser atmen lassen.
            const dauer = performance.now() - start;
            await schlafe(dauer < 15 ? 50 : 0);
          }
          this.pruefeAktiv(gen);
          break;
        }
        case "unbekannt":
          throw new LaufFehler(
            `Zeile ${a.zeile}: „${a.text}“ – das versteht der Übungsmodus (Notbetrieb) nicht. ` +
              `Er kann: Methodenaufrufe, Variablen mit new, for-Zählschleifen, while (laeuft()), return. ` +
              `Vollständiges Java läuft, sobald CheerpJ geladen werden kann – oben „erneut versuchen“.`,
          );
      }
    }
  }

  private async werteNeu(
    klasse: string,
    args: Ausdruck[],
    selbst: MockObjekt,
    umgebung: Map<string, Wert>,
    gen: number,
    tiefe: number,
  ): Promise<Wert> {
    if (args.length > 1) {
      throw new LaufFehler(`new ${klasse}(…): Der Übungsmodus unterstützt nur new ${klasse}() oder new Figur("Name").`);
    }
    // Wie in echtem Java: Konstruktoren werden NICHT vererbt. new Hund("Bello")
    // geht nur, wenn Hund selbst so einen Konstruktor hätte – Figur hat ihn.
    if (args.length === 1 && klasse !== "Figur") {
      throw new LaufFehler(
        `new ${klasse}("…"): ${klasse} hat keinen Konstruktor mit einem Namen – Konstruktoren werden nicht vererbt. ` +
          `Nutze new ${klasse}() und danach nenne("…").`,
      );
    }
    const id = await this.erzeuge(klasse, this.welt.breite / 2, this.welt.hoehe / 2, gen);
    if (args.length === 1) {
      const name = await this.werteAusdruck(args[0], selbst, umgebung, gen, tiefe);
      const figur = this.welt.figur(id);
      if (figur && typeof name === "string") figur.name = name;
    }
    return this.objekte.get(id) ?? null;
  }

  private async werteAufruf(
    ziel: string | null,
    methode: string,
    argAusdruecke: Ausdruck[],
    selbst: MockObjekt,
    umgebung: Map<string, Wert>,
    gen: number,
    tiefe: number,
    zeile: number,
  ): Promise<Wert> {
    const args: Wert[] = [];
    for (const ausdruck of argAusdruecke) {
      args.push(await this.werteAusdruck(ausdruck, selbst, umgebung, gen, tiefe));
    }
    let empfaenger: MockObjekt = selbst;
    if (ziel !== null) {
      const wert = umgebung.has(ziel) ? umgebung.get(ziel) : selbst.felder.get(ziel);
      if (wert === undefined) throw new LaufFehler(`Zeile ${zeile}: Die Variable ${ziel} wurde nicht deklariert.`);
      if (wert === null) throw new LaufFehler(`Zeile ${zeile}: ${ziel} ist noch null – zuerst mit new ein Objekt erzeugen.`);
      if (typeof wert !== "object") throw new LaufFehler(`Zeile ${zeile}: ${ziel} ist kein Objekt.`);
      empfaenger = wert;
    }
    return this.rufeAuf(empfaenger, methode, args, gen, tiefe + 1);
  }

  private async werteAusdruck(
    ausdruck: Ausdruck,
    selbst: MockObjekt,
    umgebung: Map<string, Wert>,
    gen: number,
    tiefe: number,
  ): Promise<Wert> {
    switch (ausdruck.art) {
      case "zahl":
        return ausdruck.wert;
      case "text":
        return ausdruck.wert;
      case "wahrheit":
        return ausdruck.wert;
      case "variable": {
        if (umgebung.has(ausdruck.name)) return umgebung.get(ausdruck.name);
        if (selbst.felder.has(ausdruck.name)) return selbst.felder.get(ausdruck.name);
        throw new LaufFehler(`Die Variable ${ausdruck.name} wurde nicht deklariert.`);
      }
      case "neuAusdruck":
        return this.werteNeu(ausdruck.klasse, ausdruck.args, selbst, umgebung, gen, tiefe);
      case "aufrufAusdruck":
        return this.werteAufruf(ausdruck.ziel, ausdruck.methode, ausdruck.args, selbst, umgebung, gen, tiefe, 0);
      case "unbekanntAusdruck":
        throw new LaufFehler(
          `„${ausdruck.text}“ – solche Ausdrücke (z. B. Rechnungen) kann der Übungsmodus (Notbetrieb) nicht.`,
        );
    }
  }

  private pruefeAktiv(gen: number): void {
    if (gen !== this.generation) throw new Abbruch("überholt");
  }
}

// ---------------------------------------------------------------------------

function schlafe(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function standardwert(typ: string): Wert {
  if (typ === "int" || typ === "double") return 0;
  if (typ === "boolean") return false;
  return null;
}

/** Wandelt einen Wert in den erwarteten Parametertyp (Fehler, wenn unpassend). */
function wandle(wert: Wert, typ: string, methode: string): Wert {
  if (typ === "int" || typ === "double") {
    const n = typeof wert === "number" ? wert : Number(wert);
    if (Number.isNaN(n)) throw new LaufFehler(`${methode}: „${String(wert)}“ ist keine Zahl.`);
    return typ === "int" ? Math.trunc(n) : n;
  }
  if (typ === "boolean") {
    if (typeof wert === "boolean") return wert;
    return String(wert) === "true";
  }
  if (typ === "String") return wert === null || wert === undefined ? "" : String(wert);
  return wert;
}

/** UI-Argumente kommen als Text; hier bleibt Text einfach Text. */
function textZuWert(text: string): Wert {
  return text;
}

function erwarteZahl(wert: Wert, zeile: number): number {
  if (typeof wert === "number") return wert;
  const n = Number(wert);
  if (Number.isNaN(n)) throw new LaufFehler(`Zeile ${zeile}: Hier wird eine Zahl erwartet.`);
  return n;
}

export { Abbruch as MockAbbruch, LaufFehler as MockLaufFehler };
