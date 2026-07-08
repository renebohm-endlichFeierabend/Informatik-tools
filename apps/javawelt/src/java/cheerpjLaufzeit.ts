import { JavaLaufzeit, Ausgabe, fehlerText } from "./laufzeit";
import { Welt } from "../engine/welt";
import { Datenbank, ZOO_SEED } from "./datenbank";

// CheerpJ wird per <script> vom CDN geladen und stellt diese globalen
// Funktionen bereit. Versionen/Signaturen ggf. an die bei euch genutzte
// CheerpJ-Version anpassen (siehe https://cheerpj.com/docs/).
declare function cheerpjInit(opts?: Record<string, unknown>): Promise<void>;
declare function cheerpjRunLibrary(classPath: string): Promise<any>;
declare function cheerpjAddStringFile(pfad: string, inhalt: string): void;

const LOADER_URL = "https://cjrtnc.leaningtech.com/4.2/loader.js";

/**
 * CheerpJs virtuelles Verzeichnis /app/ zeigt auf die WURZEL des Webservers
 * (Origin), nicht auf den Ordner der App. Auf GitHub Pages liegt die App
 * aber unter einem Unterpfad (z. B. /Informatik-tools/javawelt/) – feste
 * Pfade wie /app/ecj.jar liefen dort ins Leere (404), und jedes Übersetzen
 * schlug fehl. Deshalb: Pfad aus der tatsächlichen Seitenadresse ableiten.
 */
function appPfad(datei: string): string {
  return "/app" + new URL(datei, location.href).pathname;
}

// Eclipse Compiler for Java und das Framework (liegen unter public/,
// werden mit ausgeliefert – also im selben Ordner wie die App selbst).
const ECJ_JAR = appPfad("ecj.jar");
const FRAMEWORK_JAR = appPfad("framework.jar");

// Trennzeichen für Argumentlisten – muss zu Steuerung.TRENNER passen.
const TRENNER = "\u001F";

// Unsichtbares Gerüst: EINE Zeile, die vor jeden Schüler-Quelltext gesetzt
// wird, damit Figur/Welt ohne import nutzbar sind. Fehler-Zeilennummern
// werden entsprechend um 1 korrigiert.
const GERUEST = "import de.schule.jle.*;\n";

/**
 * Echte Java-Laufzeit über CheerpJ (clientseitige JVM in WebAssembly):
 * kompiliert die Schülerklassen mit ECJ im Browser und spricht sie per
 * Reflexion an (de.schule.jle.Steuerung). Kein Server nötig – iPad-tauglich.
 *
 * HINWEIS: Im Build-Sandbox nicht ausführbar (CDN blockiert, kein Browser);
 * bitte im Browser validieren, siehe README.
 */
export class CheerpJLaufzeit implements JavaLaufzeit {
  readonly name = "Echtes Java (CheerpJ)";
  private welt!: Welt;
  private ausgabe!: Ausgabe;
  private bereit = false;
  private laufNr = 0;
  private laeuftFlag = false;
  /** Library des letzten erfolgreichen Kompilierens (Schülerklassen + Framework). */
  private lib: any = null;
  private steuerung: any = null;
  private ecj: any = null;
  /** ecj.jar/framework.jar wurden schon einmal erfolgreich per HEAD geprüft. */
  private dateienGeprueft = false;
  /** SQL-Datenbank (SQLite im Browser) für die NRW-Datenbankklassen. */
  private readonly datenbank = new Datenbank(ZOO_SEED);

  async init(welt: Welt, ausgabe: Ausgabe): Promise<void> {
    this.welt = welt;
    this.ausgabe = ausgabe;
    this.ausgabe("Lade CheerpJ …");
    await this.ladeLoader();
    await cheerpjInit({ natives: this.natives() });
    this.bereit = true;
    this.ausgabe("CheerpJ bereit – es läuft echtes Java im Browser.");
  }

  /** Lädt das CheerpJ-Loader-Skript einmalig. */
  private ladeLoader(): Promise<void> {
    if (typeof (globalThis as any).cheerpjInit === "function") return Promise.resolve();
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = LOADER_URL;
      s.onload = () => res();
      s.onerror = () => rej(new Error(`CheerpJ-Loader nicht erreichbar: ${LOADER_URL}`));
      document.head.appendChild(s);
    });
  }

  /**
   * JavaScript-Implementierungen der `native`-Methoden des Frameworks.
   * Konvention: Java_<voll.qualifizierte.Klasse mit _>_<methode>(lib, ...args).
   * Unsere Natives sind statisch → kein `self`-Parameter.
   */
  private natives(): Record<string, (...a: any[]) => unknown> {
    const welt = () => this.welt;
    return {
      Java_de_schule_jle_Figur_nativErzeuge: (_lib: unknown, name: unknown, klasse: unknown) =>
        welt().erzeugeFigur(String(name ?? ""), String(klasse ?? "Figur")),
      Java_de_schule_jle_Figur_nativVerschiebe: (_lib: unknown, id: number, dx: number, dy: number) =>
        welt().verschiebe(id, dx, dy),
      Java_de_schule_jle_Figur_nativDrehe: (_lib: unknown, id: number, grad: number) =>
        welt().dreheDich(id, grad),
      Java_de_schule_jle_Figur_nativSetzePosition: (_lib: unknown, id: number, x: number, y: number) =>
        welt().setzePosition(id, x, y),
      Java_de_schule_jle_Figur_nativSage: (_lib: unknown, id: number, text: unknown) =>
        welt().sage(id, String(text)),
      Java_de_schule_jle_Figur_nativBenenne: (_lib: unknown, id: number, name: unknown) =>
        welt().benenne(id, String(name)),
      Java_de_schule_jle_Figur_nativEntferne: (_lib: unknown, id: number) => welt().entferne(id),
      Java_de_schule_jle_Figur_nativGibX: (_lib: unknown, id: number) => welt().gibX(id),
      Java_de_schule_jle_Figur_nativGibY: (_lib: unknown, id: number) => welt().gibY(id),
      Java_de_schule_jle_Welt_nativLaeuft: () => this.laeuftFlag,
      // Async-Native: CheerpJ wartet auf das Promise (SQL läuft in sql.js).
      Java_de_schule_jle_DatenbankBruecke_nativFuehreAus: (_lib: unknown, sql: unknown) =>
        this.datenbank.fuehreAus(String(sql)),
    };
  }

  // ---- Kompilieren ---------------------------------------------------------

  async kompiliere(klassen: Record<string, string>): Promise<boolean> {
    this.pruefeBereit();
    this.laeuftFlag = false;
    // Wie die Welt: Die Datenbank startet nach jedem Übernehmen frisch.
    this.datenbank.setzeZurueck();
    const nr = ++this.laufNr;
    const quellDir = `/str/quellen${nr}`;
    const ausgabeDir = `/files/out${nr}`;

    const pfade: string[] = [];
    for (const [name, quelle] of Object.entries(klassen)) {
      const pfad = `${quellDir}/${name}.java`;
      cheerpjAddStringFile(pfad, GERUEST + quelle);
      pfade.push(pfad);
    }

    this.ausgabe("Übersetze Klassen …");
    try {
      if (!this.dateienGeprueft) {
        await Promise.all([this.pruefeErreichbar(ECJ_JAR), this.pruefeErreichbar(FRAMEWORK_JAR)]);
        this.dateienGeprueft = true;
      }
      if (!this.ecj) this.ecj = await cheerpjRunLibrary(ECJ_JAR);
      const StringWriter = await this.ecj.java.io.StringWriter;
      const PrintWriter = await this.ecj.java.io.PrintWriter;
      const BatchCompiler = await this.ecj.org.eclipse.jdt.core.compiler.batch.BatchCompiler;
      const puffer = await new StringWriter();
      const schreiber = await new PrintWriter(puffer);

      const kommando = [
        "-source", "11",
        "-target", "11",
        "-nowarn",
        "-cp", FRAMEWORK_JAR,
        "-d", ausgabeDir,
        ...pfade,
      ].join(" ");
      const ok = await BatchCompiler.compile(kommando, schreiber, schreiber, null);
      await schreiber.flush();
      const meldungen = String(await puffer.toString());

      if (!ok) {
        this.ausgabe(this.lesbareFehler(meldungen, quellDir));
        return false;
      }
      this.lib = await cheerpjRunLibrary(`${ausgabeDir}:${FRAMEWORK_JAR}`);
      this.steuerung = await this.lib.de.schule.jle.Steuerung;
      await this.steuerung.vergissAlle();
      // Frühkontrolle: Ist eine frisch übersetzte Klasse über die neue
      // Library wirklich auffindbar? Sonst scheitert erst das Platzieren –
      // mit einer Meldung, die nach Schülerfehler aussieht.
      const probeName = Object.keys(klassen)[0];
      if (probeName) {
        let probe: unknown = null;
        try {
          probe = await this.lib[probeName];
        } catch {
          // unten einheitlich gemeldet
        }
        if (!probe) {
          throw new Error(
            `Die übersetzte Klasse ${probeName} ist über den Klassenpfad ${ausgabeDir} nicht ladbar.`,
          );
        }
      }
      return true;
    } catch (e) {
      throw new Error("Übersetzen nicht möglich: " + fehlerText(e));
    }
  }

  /**
   * Stellt sicher, dass eine mitgelieferte Datei (Jar) wirklich abrufbar
   * ist. Ein Tippfehler im Hosting fiele sonst erst tief in CheerpJ auf –
   * mit einer Meldung, die niemandem weiterhilft.
   */
  private async pruefeErreichbar(appDatei: string): Promise<void> {
    const url = appDatei.replace(/^\/app/, "");
    let antwort: Response | null = null;
    try {
      antwort = await fetch(url, { method: "HEAD" });
    } catch {
      // Netzfehler → unten als "nicht erreichbar" gemeldet.
    }
    if (!antwort?.ok) {
      throw new Error(
        `${url} ist nicht erreichbar` +
          (antwort ? ` (HTTP ${antwort.status})` : "") +
          " – die Datei muss mit der App ausgeliefert werden.",
      );
    }
  }

  /** Macht ECJ-Meldungen schülertauglich: Dateipfade kürzen, Gerüst-Zeile abziehen. */
  private lesbareFehler(meldungen: string, quellDir: string): string {
    return meldungen
      .replace(new RegExp(quellDir.replace(/[/\\]/g, "[/\\\\]") + "[/\\\\]", "g"), "")
      .replace(/\(at line (\d+)\)/g, (_, z) => `(Zeile ${Math.max(1, Number(z) - 1)})`)
      .trim();
  }

  // ---- Objekte und Methoden --------------------------------------------------

  async erzeugeObjekt(klasse: string, x: number, y: number, args: string[] = []): Promise<number> {
    this.pruefeKompiliert();
    try {
      // Die Argument-ANZAHL geht getrennt mit: args=[""] (ein leeres Feld)
      // und args=[] ergeben denselben String – Java braucht den Unterschied.
      return Number(
        await this.steuerung.erzeuge(
          klasse, Math.round(x), Math.round(y), args.length, args.join(TRENNER),
        ),
      );
    } catch (e) {
      throw new Error(javaFehlerText(e));
    }
  }

  async rufeMethode(id: number, methode: string, args: string[]): Promise<string> {
    this.pruefeKompiliert();
    try {
      const ergebnis = await this.steuerung.rufe(id, methode, args.length, args.join(TRENNER));
      return ergebnis === null || ergebnis === undefined ? "" : String(ergebnis);
    } catch (e) {
      throw new Error(javaFehlerText(e));
    }
  }

  async entferneObjekt(id: number): Promise<void> {
    if (!this.steuerung) {
      this.welt.entferne(id);
      return;
    }
    await this.steuerung.entferne(id);
    this.welt.entferne(id); // falls das Objekt der Java-Seite unbekannt war
  }

  // ---- Spiel (Weltklasse) ------------------------------------------------------

  async starteSpiel(weltKlasse: string): Promise<void> {
    this.pruefeKompiliert();
    // Frischer Lauf: Welt und Java-Objekte zurücksetzen.
    await this.steuerung.vergissAlle();
    this.welt.leeren();
    this.laeuftFlag = true;
    try {
      const Klasse = await this.lib[weltKlasse];
      if (!Klasse) throw new Error(`Die Klasse ${weltKlasse} wurde nicht gefunden.`);
      const spiel = await new Klasse();
      await spiel.starte();
    } catch (e) {
      throw new Error(javaFehlerText(e));
    } finally {
      this.laeuftFlag = false;
    }
  }

  stoppeSpiel(): void {
    this.laeuftFlag = false;
  }

  // ---- intern -------------------------------------------------------------------

  private pruefeBereit(): void {
    if (!this.bereit) throw new Error("CheerpJ ist noch nicht initialisiert.");
  }

  private pruefeKompiliert(): void {
    this.pruefeBereit();
    if (!this.lib) throw new Error("Bitte zuerst „Übernehmen“ drücken (Klassen übersetzen).");
  }
}

/** Holt aus einem CheerpJ-/Java-Fehler eine lesbare Meldung heraus. */
function javaFehlerText(e: unknown): string {
  const text = fehlerText(e);
  // Java-Exception-Texte wie "java.lang.Exception: eigentliche Meldung" kürzen.
  const m = /(?:^|\s)(?:[\w.]+Exception|[\w.]+Error):\s*(.+)$/.exec(text);
  return m ? m[1] : text;
}
