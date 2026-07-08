import figurQuelle from "../../java-framework/de/schule/jle/Figur.java?raw";
import weltQuelle from "../../java-framework/de/schule/jle/Welt.java?raw";
import { KlassenDef, Param, parseKlasse } from "../java/javaParser";
import { STANDARD_KLASSEN } from "./szenarien";

const SPEICHER_SCHLUESSEL = "javawelt.klassen.v2";

/** Eine Methodensignatur für die Objektbank. */
export interface MethodenSignatur {
  name: string;
  params: { typ: string; name: string }[];
  /** true = kommt aus der Basisklasse Figur (immer verfügbar). */
  geerbt: boolean;
}

export interface KlassenInfo {
  name: string;
  code: string;
  /** Framework-Klassen (Figur, Welt) sind nur lesbar. */
  framework: boolean;
}

function neueKlassenVorlage(name: string): string {
  return `public class ${name} extends Figur {

    public void tuEtwas() {
        geheVor(80);
        dreheDich(90);
        sage("Hallo!");
    }
}
`;
}

/** Öffentliche Methoden, die jede Figur von der Basisklasse erbt. */
const FIGUR_GEERBT: MethodenSignatur[] = [
  { name: "geheVor", params: [{ typ: "int", name: "pixel" }], geerbt: true },
  { name: "dreheDich", params: [{ typ: "int", name: "grad" }], geerbt: true },
  { name: "sage", params: [{ typ: "String", name: "text" }], geerbt: true },
  { name: "nenne", params: [{ typ: "String", name: "name" }], geerbt: true },
  { name: "setzePosition", params: [{ typ: "int", name: "x" }, { typ: "int", name: "y" }], geerbt: true },
  { name: "gibX", params: [], geerbt: true },
  { name: "gibY", params: [], geerbt: true },
  { name: "gibWinkel", params: [], geerbt: true },
];

/**
 * Verwaltet die Quelltexte aller Klassen:
 * - Framework-Klassen (Figur, Welt): nur lesbar, direkt aus den echten
 *   Framework-Quellen (?raw-Import) – eine Quelle der Wahrheit.
 * - Schülerklassen (MeineWelt, Roboter, eigene): editierbar, werden im
 *   localStorage des Geräts gesichert (iPad-Neustart ≠ Datenverlust).
 */
export class KlassenVerwaltung {
  private readonly framework = new Map<string, KlassenInfo>();
  private schueler = new Map<string, KlassenInfo>();

  /** Wird gerufen, wenn sich die Klassenliste ändert (neu/gelöscht). */
  onListeGeaendert: (() => void) | null = null;
  /** Wird gerufen, wenn sich ein Quelltext ändert. */
  onCodeGeaendert: (() => void) | null = null;

  constructor() {
    this.framework.set("Figur", { name: "Figur", code: figurQuelle, framework: true });
    this.framework.set("Welt", { name: "Welt", code: weltQuelle, framework: true });
    if (!this.ladeAusSpeicher()) this.setzeVorlagen();
  }

  private setzeVorlagen(): void {
    this.schueler = new Map(
      Object.entries(STANDARD_KLASSEN).map(([name, code]) => [name, { name, code, framework: false }]),
    );
  }

  /** Ersetzt alle Schülerklassen (Szenario laden). */
  ersetzeAlle(klassen: Record<string, string>): void {
    this.schueler = new Map(
      Object.entries(klassen).map(([name, code]) => [name, { name, code, framework: false }]),
    );
    this.speichere();
    this.onListeGeaendert?.();
  }

  /** Fügt eine Klasse mit vorgegebenem Quelltext hinzu (Bibliothek). */
  fuegeHinzu(name: string, code: string): string | null {
    if (this.gib(name)) return `Die Klasse ${name} ist schon im Projekt.`;
    this.schueler.set(name, { name, code, framework: false });
    this.speichere();
    this.onListeGeaendert?.();
    return null;
  }

  // ---- Zugriff --------------------------------------------------------------

  /** Alle Klassen in Anzeige-Reihenfolge: Schülerklassen, dann Framework. */
  alle(): KlassenInfo[] {
    return [...this.schueler.values(), ...this.framework.values()];
  }

  gib(name: string): KlassenInfo | null {
    return this.schueler.get(name) ?? this.framework.get(name) ?? null;
  }

  /** Nur die Schülerklassen – das ist, was übersetzt wird. */
  quelltexte(): Record<string, string> {
    const r: Record<string, string> = {};
    for (const k of this.schueler.values()) r[k.name] = k.code;
    return r;
  }

  setzeCode(name: string, code: string): void {
    const info = this.schueler.get(name);
    if (!info) return;
    info.code = code;
    this.speichere();
    this.onCodeGeaendert?.();
  }

  // ---- Anlegen / Löschen / Zurücksetzen --------------------------------------

  /** Legt eine neue Figuren-Klasse an; gibt eine Fehlermeldung oder null zurück. */
  neueKlasse(name: string): string | null {
    if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
      return "Klassennamen beginnen mit einem Großbuchstaben und bestehen aus Buchstaben/Ziffern (z. B. Biene).";
    }
    if (this.gib(name)) return `Die Klasse ${name} gibt es schon.`;
    this.schueler.set(name, { name, code: neueKlassenVorlage(name), framework: false });
    this.speichere();
    this.onListeGeaendert?.();
    return null;
  }

  loeschbar(name: string): boolean {
    return this.schueler.has(name) && name !== "MeineWelt";
  }

  loesche(name: string): void {
    if (!this.loeschbar(name)) return;
    this.schueler.delete(name);
    this.speichere();
    this.onListeGeaendert?.();
  }

  /** Stellt die Ausgangs-Vorlagen wieder her (alle eigenen Klassen weg). */
  zuruecksetzen(): void {
    this.setzeVorlagen();
    this.speichere();
    this.onListeGeaendert?.();
  }

  // ---- Struktur (für Objektbank und Spielstart) -------------------------------

  /** Parst eine Schülerklasse; null, wenn der Quelltext (noch) kaputt ist. */
  private parse(name: string): KlassenDef | null {
    const info = this.schueler.get(name);
    if (!info) return null;
    try {
      return parseKlasse(info.code);
    } catch {
      return null;
    }
  }

  /** Basisklasse laut Quelltext (Tab-Name zählt, nicht der Klassenname im Code). */
  private erbtVon(name: string): string | null {
    return this.parse(name)?.erbtVon ?? null;
  }

  /** Erbt die Klasse (über beliebig viele Stufen) von Figur? */
  istFigurKlasse(name: string): boolean {
    if (name === "Figur") return true;
    let aktuell: string | null = name;
    for (let schutz = 0; aktuell && schutz < 20; schutz++) {
      const basis: string | null = this.erbtVon(aktuell);
      if (basis === "Figur") return true;
      aktuell = this.schueler.has(basis ?? "") ? basis : null;
    }
    return false;
  }

  /** Klassen, deren Objekte man auf der Welt platzieren kann. */
  platzierbareKlassen(): string[] {
    return [
      ...[...this.schueler.keys()].filter((n) => this.istFigurKlasse(n)),
      "Figur",
    ];
  }

  /** Übrige Schülerklassen (Weltklasse, Datenstrukturen …) für die Anzeige. */
  weitereKlassen(): string[] {
    return [...this.schueler.keys()].filter((n) => !this.istFigurKlasse(n));
  }

  /** Die Weltklasse fürs Spiel (erste Schülerklasse, die von Welt erbt). */
  weltKlasse(): string | null {
    for (const name of this.schueler.keys()) {
      if (this.erbtVon(name) === "Welt") return name;
    }
    return null;
  }

  /**
   * Konstruktoren einer Klasse für das Platzieren über die Objektbank.
   * Nur die SELBST deklarierten zählen (Konstruktoren werden nicht vererbt);
   * ohne deklarierte Konstruktoren gibt es den impliziten ohne Parameter.
   * Konstruktoren mit Parametertypen, die die Oberfläche nicht abfragen
   * kann, werden ausgeblendet.
   */
  konstruktorenFuer(klasse: string): { params: Param[] }[] {
    const def = this.parse(klasse);
    const deklariert = (def?.konstruktoren ?? []).filter((k) =>
      k.params.every((p) => ["int", "double", "boolean", "String"].includes(p.typ)),
    );
    if (deklariert.length === 0) return [{ params: [] }];
    return deklariert.map((k) => ({ params: k.params }));
  }

  /**
   * Aufrufbare Methoden einer Klasse für die Objektbank: eigene öffentliche
   * Methoden (inkl. geerbter aus Schüler-Basisklassen), dann die von Figur.
   */
  methodenFuer(klasse: string): MethodenSignatur[] {
    const eigene: MethodenSignatur[] = [];
    const gesehen = new Set<string>();
    let aktuell: string | null = klasse;
    for (let schutz = 0; aktuell && this.schueler.has(aktuell) && schutz < 20; schutz++) {
      const def = this.parse(aktuell);
      if (!def) break;
      for (const m of def.methoden) {
        const schluessel = `${m.name}/${m.params.length}`;
        if (!m.oeffentlich || m.statisch || gesehen.has(schluessel)) continue;
        if (!m.params.every((p) => ["int", "double", "boolean", "String"].includes(p.typ))) continue;
        gesehen.add(schluessel);
        eigene.push({ name: m.name, params: m.params, geerbt: aktuell !== klasse });
      }
      aktuell = def.erbtVon;
    }
    return [...eigene, ...FIGUR_GEERBT.filter((m) => !gesehen.has(`${m.name}/${m.params.length}`))];
  }

  // ---- Speicherung -------------------------------------------------------------

  private speichere(): void {
    try {
      const daten: Record<string, string> = {};
      for (const k of this.schueler.values()) daten[k.name] = k.code;
      localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(daten));
    } catch {
      // Speicher voll/verboten → Arbeiten geht trotzdem weiter.
    }
  }

  private ladeAusSpeicher(): boolean {
    try {
      const roh = localStorage.getItem(SPEICHER_SCHLUESSEL);
      if (!roh) return false;
      const daten = JSON.parse(roh) as Record<string, string>;
      const namen = Object.keys(daten).filter((n) => /^[A-Z][A-Za-z0-9]*$/.test(n));
      if (namen.length === 0) return false;
      this.schueler = new Map(
        namen.map((n) => [n, { name: n, code: String(daten[n]), framework: false }]),
      );
      // Ohne Weltklasse fehlt der Spiel-Einstieg → Vorlage ergänzen.
      if (!this.weltKlasse() && !this.schueler.has("MeineWelt")) {
        this.schueler.set("MeineWelt", {
          name: "MeineWelt",
          code: STANDARD_KLASSEN["MeineWelt"],
          framework: false,
        });
      }
      return true;
    } catch {
      return false;
    }
  }
}
