/**
 * JVM-Semantiktest für das Platzieren-/Aufruf-Protokoll der Steuerung
 * (UI → de.schule.jle.Steuerung → Figur → nativ*-Brücke).
 *
 * Stellt die CheerpJ-Situation auf einer echten JVM nach:
 *  - framework-Klassen + Schülerklassen liegen in EINEM eigenen ClassLoader
 *    (wie bei cheerpjRunLibrary("<ausgabeDir>:framework.jar")),
 *  - der Aufrufer (Test) liegt bewusst außerhalb dieses Loaders,
 *  - die nativ*-Methoden der Figur werden durch ein Test-Double ersetzt,
 *    das alle Aufrufe aufzeichnet (TestWelt).
 *
 * Läuft nur mit installiertem JDK; wird von laufAlle.mjs im javac-Block
 * aufgerufen. Direktaufruf: node tests/testSteuerung.mjs
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HIER = dirname(fileURLToPath(import.meta.url));
const FRAMEWORK_QUELLEN = join(HIER, "..", "java-framework", "de", "schule", "jle");
const AUS = join(HIER, ".out", "steuerung");

rmSync(AUS, { recursive: true, force: true });
const quellDir = join(AUS, "quellen", "de", "schule", "jle");
const schuelerQuellDir = join(AUS, "schueler-quellen");
const frameworkDir = join(AUS, "framework");
const schuelerDir = join(AUS, "schueler");
const testDir = join(AUS, "test");
for (const d of [quellDir, schuelerQuellDir, frameworkDir, schuelerDir, testDir]) {
  mkdirSync(d, { recursive: true });
}

// --- 1. Figur.java: nativ*-Methoden auf das Test-Double TestWelt umleiten ---
const figurOriginal = readFileSync(join(FRAMEWORK_QUELLEN, "Figur.java"), "utf8");
let ersetzt = 0;
const figurTestbar = figurOriginal.replace(
  /private static native (int|void) (\w+)\(([^)]*)\);/g,
  (_alles, rueckgabe, name, params) => {
    ersetzt++;
    const namen = params
      .split(",")
      .map((p) => p.trim().split(/\s+/).pop())
      .filter(Boolean)
      .join(", ");
    const aufruf = `TestWelt.${name}(${namen});`;
    return `private static ${rueckgabe} ${name}(${params}) { ${rueckgabe === "void" ? aufruf : "return " + aufruf} }`;
  },
);
if (ersetzt < 9) {
  console.log(`FEHLER  Erwartet mind. 9 nativ*-Methoden in Figur.java, gefunden: ${ersetzt}`);
  process.exit(1);
}
writeFileSync(join(quellDir, "Figur.java"), figurTestbar);
// Steuerung ist die Klasse unter Test – UNVERÄNDERT übernehmen.
writeFileSync(join(quellDir, "Steuerung.java"), readFileSync(join(FRAMEWORK_QUELLEN, "Steuerung.java"), "utf8"));

// Test-Double: zeichnet alle nativ*-Aufrufe auf (statt Canvas-Welt).
writeFileSync(
  join(quellDir, "TestWelt.java"),
  `package de.schule.jle;

import java.util.ArrayList;
import java.util.List;

/** Test-Double der Welt-Anzeige: zeichnet alle nativ*-Aufrufe auf. */
public final class TestWelt {
  private static final List<String> protokoll = new ArrayList<>();
  private static int naechsteId = 1;

  private TestWelt() {
  }

  public static synchronized int nativErzeuge(String name, String klasse) {
    int id = naechsteId++;
    protokoll.add("erzeuge:" + id + ":" + klasse + ":" + name);
    return id;
  }

  public static synchronized void nativVerschiebe(int id, int dx, int dy) {
    protokoll.add("verschiebe:" + id + ":" + dx + ":" + dy);
  }

  public static synchronized void nativDrehe(int id, int grad) {
    protokoll.add("drehe:" + id + ":" + grad);
  }

  public static synchronized void nativSetzePosition(int id, int x, int y) {
    protokoll.add("position:" + id + ":" + x + ":" + y);
  }

  public static synchronized void nativSage(int id, String text) {
    protokoll.add("sage:" + id + ":" + text);
  }

  public static synchronized void nativBenenne(int id, String name) {
    protokoll.add("benenne:" + id + ":" + name);
  }

  public static synchronized void nativEntferne(int id) {
    protokoll.add("entferne:" + id);
  }

  public static synchronized int nativGibX(int id) {
    return 111;
  }

  public static synchronized int nativGibY(int id) {
    return 222;
  }

  public static synchronized String protokollText() {
    return String.join("\\n", protokoll);
  }
}
`,
);

// --- 2. Schülerklassen wie in der App: unsichtbare Gerüst-Zeile davor --------
const GERUEST = "import de.schule.jle.*;\n";
writeFileSync(
  join(schuelerQuellDir, "Roboter.java"),
  GERUEST +
    `public class Roboter extends Figur {

    private int schrittweite;

    public Roboter() {
        schrittweite = 25;
    }

    public int gibSchrittweite() {
        return schrittweite;
    }

    public void laufeQuadrat(int seite) {
        for (int i = 0; i < 4; i++) {
            geheVor(seite);
            dreheDich(90);
        }
    }
}
`,
);
writeFileSync(
  join(schuelerQuellDir, "Kiste.java"),
  GERUEST +
    `public class Kiste extends Figur {

    private String inhalt;

    public Kiste() {
        inhalt = "leer";
    }

    public Kiste(String pInhalt) {
        inhalt = pInhalt;
    }

    public String gibInhalt() {
        return inhalt;
    }
}
`,
);

// --- 3. Testtreiber: liegt AUSSERHALB des Loaders von Framework+Schülern -----
writeFileSync(
  join(testDir, "ProtokollTest.java"),
  `import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URL;
import java.net.URLClassLoader;
import java.nio.file.Paths;

public class ProtokollTest {
  static int fehler = 0;
  // Muss zu Steuerung.TRENNER (U+001F) passen – ohne rohes Steuerzeichen.
  static final String TRENNER = String.valueOf((char) 31);

  static void pruefe(String name, boolean bedingung, String detail) {
    if (bedingung) {
      System.out.println("OK  " + name);
    } else {
      fehler++;
      System.out.println("FEHLER  " + name + "  " + detail);
    }
  }

  static String meldung(Exception e) {
    Throwable t = e instanceof InvocationTargetException ? e.getCause() : e;
    return t == null ? String.valueOf(e) : String.valueOf(t.getMessage());
  }

  public static void main(String[] argv) throws Exception {
    URL framework = Paths.get(argv[0]).toUri().toURL();
    URL schueler = Paths.get(argv[1]).toUri().toURL();
    // Wie in CheerpJ: EIN Loader kennt Framework UND Schülerklassen;
    // der Aufrufer (diese Klasse) liegt bewusst nicht darin.
    URLClassLoader lader = new URLClassLoader(
        new URL[] { schueler, framework }, ClassLoader.getPlatformClassLoader());
    Class<?> steuerung = Class.forName("de.schule.jle.Steuerung", true, lader);
    Class<?> testWelt = Class.forName("de.schule.jle.TestWelt", true, lader);
    Method erzeuge = steuerung.getMethod(
        "erzeuge", String.class, int.class, int.class, int.class, String.class);
    Method rufe = steuerung.getMethod(
        "rufe", int.class, String.class, int.class, String.class);
    Method protokoll = testWelt.getMethod("protokollText");

    // 1. Platzieren ohne Argumente: Objekt entsteht und landet am Tipp-Punkt.
    int id = (Integer) erzeuge.invoke(null, "Roboter", 300, 200, 0, "");
    pruefe("Roboter erzeugt (id > 0)", id > 0, "id=" + id);
    String p = (String) protokoll.invoke(null);
    pruefe("Engine-Protokoll: erzeugt + an Tipp-Position",
        p.contains("erzeuge:" + id + ":Roboter") && p.contains("position:" + id + ":300:200"), p);

    // 2. Methodenaufrufe über die Objektbank (mit/ohne Rückgabewert).
    String weite = (String) rufe.invoke(null, id, "gibSchrittweite", 0, "");
    pruefe("gibSchrittweite() liefert 25", "25".equals(weite), weite);
    rufe.invoke(null, id, "laufeQuadrat", 1, "80");
    p = (String) protokoll.invoke(null);
    pruefe("laufeQuadrat(80) bewegt und dreht",
        p.contains("verschiebe:" + id + ":80:0") && p.contains("drehe:" + id + ":90"), p);
    rufe.invoke(null, id, "setzePosition", 2, "40" + TRENNER + "50");
    p = (String) protokoll.invoke(null);
    pruefe("Zwei int-Argumente (setzePosition)", p.contains("position:" + id + ":40:50"), p);

    // 3. Konstruktor mit String-Argument (Auswahl-Dialog wie BlueJ).
    int kiste = (Integer) erzeuge.invoke(null, "Kiste", 10, 20, 1, "Paket 1");
    String inhalt = (String) rufe.invoke(null, kiste, "gibInhalt", 0, "");
    pruefe("new Kiste(\\"Paket 1\\") gewählt", "Paket 1".equals(inhalt), inhalt);

    // 4. Ein LEERES Eingabefeld ist EIN Argument, nicht null Argumente.
    int leere = (Integer) erzeuge.invoke(null, "Kiste", 10, 20, 1, "");
    inhalt = (String) rufe.invoke(null, leere, "gibInhalt", 0, "");
    pruefe("new Kiste(\\"\\") trifft den String-Konstruktor", "".equals(inhalt), inhalt);
    int ohne = (Integer) erzeuge.invoke(null, "Kiste", 10, 20, 0, "");
    inhalt = (String) rufe.invoke(null, ohne, "gibInhalt", 0, "");
    pruefe("new Kiste() trifft den Konstruktor ohne Parameter", "leer".equals(inhalt), inhalt);
    rufe.invoke(null, kiste, "sage", 1, "");
    p = (String) protokoll.invoke(null);
    pruefe("sage(\\"\\") ruft die Methode mit leerem Text", p.contains("sage:" + kiste + ":"), p);

    // 5. Framework-Basisklasse Figur: liegt im Paket de.schule.jle.
    try {
      int figur = (Integer) erzeuge.invoke(null, "Figur", 5, 6, 0, "");
      pruefe("Basisklasse Figur platzierbar", figur > 0, "id=" + figur);
    } catch (Exception e) {
      pruefe("Basisklasse Figur platzierbar", false, meldung(e));
    }

    // 6. Verständliche Fehlermeldungen.
    try {
      erzeuge.invoke(null, "Roboter", 0, 0, 1, "50");
      pruefe("Falsche Parameterzahl wird gemeldet", false, "kein Fehler");
    } catch (Exception e) {
      pruefe("Falsche Parameterzahl wird gemeldet",
          String.valueOf(meldung(e)).contains("Konstruktor"), meldung(e));
    }
    try {
      erzeuge.invoke(null, "GibtEsNicht", 0, 0, 0, "");
      pruefe("Unbekannte Klasse wird verständlich gemeldet", false, "kein Fehler");
    } catch (Exception e) {
      pruefe("Unbekannte Klasse wird verständlich gemeldet",
          String.valueOf(meldung(e)).contains("nicht gefunden"), meldung(e));
    }

    lader.close();
    System.out.println(fehler == 0
        ? "Alle Steuerung-Protokoll-Tests bestanden."
        : fehler + " Steuerung-Protokoll-Fehler");
    System.exit(fehler == 0 ? 0 : 1);
  }
}
`,
);

// --- 4. Kompilieren und ausführen --------------------------------------------
const javac = (args) => execFileSync("javac", args, { stdio: "inherit" });
javac(["--release", "11", "-nowarn", "-d", frameworkDir,
  join(quellDir, "Figur.java"), join(quellDir, "Steuerung.java"), join(quellDir, "TestWelt.java")]);
javac(["--release", "11", "-nowarn", "-cp", frameworkDir, "-d", schuelerDir,
  join(schuelerQuellDir, "Roboter.java"), join(schuelerQuellDir, "Kiste.java")]);
javac(["--release", "11", "-nowarn", "-d", testDir, join(testDir, "ProtokollTest.java")]);
execFileSync("java", ["-cp", testDir, "ProtokollTest", frameworkDir, schuelerDir], { stdio: "inherit" });
