import { JavaLaufzeit, Ausgabe, fehlerText } from "./laufzeit";
import { Welt } from "../engine/welt";
import { Datenbank, ZOO_SEED } from "./datenbank";

// CheerpJ wird per <script> vom CDN geladen und stellt diese globalen
// Funktionen bereit. Versionen/Signaturen ggf. an die bei euch genutzte
// CheerpJ-Version anpassen (siehe https://cheerpj.com/docs/).
declare function cheerpjInit(opts?: Record<string, unknown>): Promise<void>;
declare function cheerpjRunLibrary(classPath: string): Promise<any>;

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
  /** Warteschlange: CheerpJ verträgt nur EINEN Java-Aufruf gleichzeitig. */
  private warteschlange: Promise<unknown> = Promise.resolve();

  /**
   * Reiht einen Java-Aufruf hinter alle laufenden ein. CheerpJ im
   * Library-Modus erlaubt nur einen Aufruf zur Zeit („Only one library
   * thread supported“) – ohne Warteschlange kollidierte z. B. das Laden
   * eines Szenarios mit der noch laufenden Start-Kompilierung.
   */
  private nacheinander<T>(aufgabe: () => Promise<T>): Promise<T> {
    const ergebnis = this.warteschlange.then(aufgabe);
    this.warteschlange = ergebnis.catch(() => undefined);
    return ergebnis;
  }

  async init(welt: Welt, ausgabe: Ausgabe): Promise<void> {
    this.welt = welt;
    this.ausgabe = ausgabe;
    this.ausgabe("Lade CheerpJ …");
    await this.ladeLoader();
    // Bewusst die Java-8-Laufzeit: Nur dort findet der Compiler die
    // JDK-Klassen über sun.boot.class.path (so kompiliert auch CheerpJs
    // eigenes JavaFiddle im Browser). Unter version: 11 sucht ECJ das
    // JRT-Modul-Image (lib/modules), das es in CheerpJs Dateisystem
    // nicht gibt → NullPointerException in JRTUtil.walkModuleImage bei
    // jedem Übersetzen. Passend dazu: ecj.jar ist ECJ 3.20 (läuft auf
    // Java 8), framework.jar wird mit --release 8 gebaut, kompiliert
    // wird mit -source/-target 1.8 – immer zusammen ändern.
    await cheerpjInit({ version: 8, natives: this.natives() });
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

  kompiliere(klassen: Record<string, string>): Promise<boolean> {
    return this.nacheinander(() => this.kompiliereJetzt(klassen));
  }

  private async kompiliereJetzt(klassen: Record<string, string>): Promise<boolean> {
    this.pruefeBereit();
    this.laeuftFlag = false;
    // Wie die Welt: Die Datenbank startet nach jedem Übernehmen frisch.
    this.datenbank.setzeZurueck();
    const nr = ++this.laufNr;
    const quellDir = `/files/src${nr}`;
    const ausgabeDir = `/files/out${nr}`;

    this.ausgabe("Übersetze Klassen …");
    try {
      if (!this.dateienGeprueft) {
        await Promise.all([this.pruefeErreichbar(ECJ_JAR), this.pruefeErreichbar(FRAMEWORK_JAR)]);
        this.dateienGeprueft = true;
      }
      if (!this.ecj) this.ecj = await cheerpjRunLibrary(ECJ_JAR);

      // Quelltexte AUS JAVA HERAUS nach /files/ schreiben (CheerpJs
      // beschreibbares Dateisystem, in das auch ECJs -d-Ausgabe geht).
      // Der /str/-Weg (cheerpjAddStringFile) war für ECJ nicht sichtbar:
      // „File … is missing“ für jede Quelldatei.
      const pfade = await this.schreibeQuellen(klassen, quellDir);

      const StringWriter = await this.ecj.java.io.StringWriter;
      const PrintWriter = await this.ecj.java.io.PrintWriter;
      const BatchCompiler = await this.ecj.org.eclipse.jdt.core.compiler.batch.BatchCompiler;
      const puffer = await new StringWriter();
      const schreiber = await new PrintWriter(puffer);

      const kommando = [
        "-source", "1.8",
        "-target", "1.8",
        "-encoding", "UTF-8",
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
      return true;
    } catch (e) {
      throw new Error("Übersetzen nicht möglich: " + fehlerText(e));
    }
  }

  /**
   * Schreibt die Schülerquelltexte über Java-IO (aus der ECJ-Library)
   * nach /files/ – mit UTF-8, passend zu -encoding im Kompilierkommando.
   * cheerpjAddStringFile/​/str/ war für ECJ nicht sichtbar; /files/ ist
   * derselbe Speicher, in den ECJ auch seine .class-Ausgabe schreibt.
   * Gibt die geschriebenen Pfade zurück; wirft eine verständliche
   * Meldung, wenn die Dateien hinterher nicht lesbar sind.
   */
  private async schreibeQuellen(
    klassen: Record<string, string>,
    quellDir: string,
  ): Promise<string[]> {
    const File = await this.ecj.java.io.File;
    const FileOutputStream = await this.ecj.java.io.FileOutputStream;
    const OutputStreamWriter = await this.ecj.java.io.OutputStreamWriter;
    const dir = await new File(quellDir);
    await dir.mkdirs();
    const pfade: string[] = [];
    for (const [name, quelle] of Object.entries(klassen)) {
      const pfad = `${quellDir}/${name}.java`;
      const strom = await new FileOutputStream(pfad);
      const schreiber = await new OutputStreamWriter(strom, "UTF-8");
      await schreiber.write(GERUEST + quelle);
      await schreiber.close();
      pfade.push(pfad);
    }
    // Kontrolle aus Java-Sicht: Genau das prüft ECJ gleich auch.
    const probe = await new File(pfade[0]);
    if (!(await probe.exists())) {
      throw new Error(
        `Quelltexte konnten nicht ins CheerpJ-Dateisystem geschrieben werden (${pfade[0]} fehlt).`,
      );
    }
    return pfade;
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
      return Number(
        await this.nacheinander(() =>
          this.steuerung.erzeuge(klasse, Math.round(x), Math.round(y), args.join(TRENNER)),
        ),
      );
    } catch (e) {
      throw new Error(javaFehlerText(e));
    }
  }

  async rufeMethode(id: number, methode: string, args: string[]): Promise<string> {
    this.pruefeKompiliert();
    try {
      const ergebnis = await this.nacheinander(() =>
        this.steuerung.rufe(id, methode, args.join(TRENNER)),
      );
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
    await this.nacheinander(() => this.steuerung.entferne(id));
    this.welt.entferne(id); // falls das Objekt der Java-Seite unbekannt war
  }

  // ---- Spiel (Weltklasse) ------------------------------------------------------

  starteSpiel(weltKlasse: string): Promise<void> {
    this.pruefeKompiliert();
    return this.nacheinander(() => this.starteSpielJetzt(weltKlasse));
  }

  private async starteSpielJetzt(weltKlasse: string): Promise<void> {
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
