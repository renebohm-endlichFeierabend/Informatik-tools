/**
 * SQL im Browser: eine echte SQLite-Datenbank über sql.js (WebAssembly),
 * selbst gehostet unter public/sql-wasm.{js,wasm} — kein CDN, keine
 * Server-Datenbank, iPad-tauglich.
 *
 * Die Java-Seite (de.schule.jle.DatenbankBruecke → DatabaseConnector)
 * schickt SQL-Text herein und bekommt das Ergebnis als kodierten String
 * zurück (Zeilen durch U+001E, Felder durch U+001F getrennt), den die
 * NRW-Klasse QueryResult wieder in String[][] auspackt.
 *
 * Lebenszyklus: Beim Übernehmen (Kompilieren) wird die Datenbank auf den
 * Startzustand (Seed) zurückgesetzt — wie die Welt. So starten alle
 * Schülerinnen und Schüler reproduzierbar mit denselben Daten.
 */

declare function initSqlJs(config?: Record<string, unknown>): Promise<any>;

const ZEILE = "\u001E";
const FELD = "\u001F";

/**
 * Beispiel-Datenbank "Zoo" für den Unterricht (Q1 · Datenbanken):
 * zwei Tabellen mit 1:n-Beziehung über einen Fremdschlüssel — Grundlage
 * für ER-Diagramm, Schema-Diskussion, Normalformen und JOIN-Abfragen.
 */
export const ZOO_SEED = `
CREATE TABLE gehege (
  id      INTEGER PRIMARY KEY,
  name    TEXT NOT NULL,
  klima   TEXT NOT NULL
);
CREATE TABLE tier (
  id           INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  art          TEXT NOT NULL,
  geburtsjahr  INTEGER,
  gehege_id    INTEGER REFERENCES gehege(id)
);
INSERT INTO gehege (id, name, klima) VALUES
  (1, 'Savanne',    'warm'),
  (2, 'Polarwelt',  'kalt'),
  (3, 'Dschungel',  'feucht'),
  (4, 'Streichelzoo', 'gemaessigt');
INSERT INTO tier (id, name, art, geburtsjahr, gehege_id) VALUES
  (1, 'Kibo',    'Elefant',  2014, 1),
  (2, 'Zuri',    'Loewe',    2018, 1),
  (3, 'Pinga',   'Pinguin',  2021, 2),
  (4, 'Waddle',  'Pinguin',  2019, 2),
  (5, 'Frostine','Eisbaer',  2016, 2),
  (6, 'Coco',    'Papagei',  2020, 3),
  (7, 'Kaa',     'Schlange', 2015, 3),
  (8, 'Momo',    'Affe',     2022, 3),
  (9, 'Wolle',   'Schaf',    2021, 4),
  (10,'Hoppel',  'Kaninchen',2023, 4);
`;

export class Datenbank {
  private db: any = null;
  private sqlModul: any = null;

  constructor(private readonly seed: string) {}

  /** Setzt die Datenbank beim nächsten Zugriff auf den Seed zurück. */
  setzeZurueck(): void {
    try {
      this.db?.close();
    } catch {
      // Schließen darf nie etwas kaputt machen.
    }
    this.db = null;
  }

  /**
   * Führt SQL aus und liefert das kodierte Ergebnis:
   *   "ok<ZEILE>spalten<ZEILE>typen<ZEILE>zeile1<ZEILE>zeile2…"  bzw.
   *   "ok"                          (kein Abfrage-Ergebnis, z. B. INSERT)
   *   "fehler<ZEILE>meldung"        (SQL-Fehler)
   */
  async fuehreAus(sql: string): Promise<string> {
    try {
      await this.stelleBereit();
      const ergebnisse = this.db.exec(sql);
      if (!ergebnisse || ergebnisse.length === 0) return "ok";
      // Bei mehreren Statements zählt das letzte Abfrage-Ergebnis.
      const letztes = ergebnisse[ergebnisse.length - 1];
      const spalten: string[] = letztes.columns ?? [];
      const zeilen: unknown[][] = letztes.values ?? [];
      const typen = spalten.map((_, s) => {
        const wert = zeilen.map((z) => z[s]).find((w) => w !== null && w !== undefined);
        if (typeof wert === "number") return Number.isInteger(wert) ? "INTEGER" : "REAL";
        if (wert === undefined) return "NULL";
        return "TEXT";
      });
      const kopf = ["ok", spalten.join(FELD), typen.join(FELD)];
      const daten = zeilen.map((z) => z.map((w) => (w === null || w === undefined ? "" : String(w))).join(FELD));
      return [...kopf, ...daten].join(ZEILE);
    } catch (e) {
      return "fehler" + ZEILE + (e as Error).message;
    }
  }

  private async stelleBereit(): Promise<void> {
    if (this.db) return;
    if (!this.sqlModul) {
      await ladeSkript("./sql-wasm.js");
      this.sqlModul = await initSqlJs({ locateFile: (datei: string) => "./" + datei });
    }
    this.db = new this.sqlModul.Database();
    this.db.run(this.seed);
  }
}

function ladeSkript(url: string): Promise<void> {
  if (typeof (globalThis as any).initSqlJs === "function") return Promise.resolve();
  return new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = url;
    s.onload = () => res();
    s.onerror = () => rej(new Error(`SQL-Engine nicht erreichbar: ${url}`));
    document.head.appendChild(s);
  });
}
