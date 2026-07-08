import { parseKlasse } from "../src/java/javaParser";

let fehler = 0;
function pruefe(name: string, bedingung: boolean, detail?: unknown) {
  if (bedingung) {
    console.log("OK  " + name);
  } else {
    fehler++;
    console.log("FEHLER  " + name, detail !== undefined ? JSON.stringify(detail, null, 1) : "");
  }
}

// --- Roboter-Vorlage ---------------------------------------------------------
const roboter = parseKlasse(`public class Roboter extends Figur {

    // Eigene Methode: läuft ein Quadrat mit der angegebenen Seitenlänge.
    public void laufeQuadrat(int seite) {
        for (int i = 0; i < 4; i++) {
            geheVor(seite);
            dreheDich(90);
        }
    }
}
`);
pruefe("Roboter: Name/erbtVon", roboter.name === "Roboter" && roboter.erbtVon === "Figur");
pruefe("Roboter: 1 Methode", roboter.methoden.length === 1, roboter.methoden);
const lq = roboter.methoden[0];
pruefe("laufeQuadrat public + param", lq.oeffentlich && lq.params.length === 1 && lq.params[0].typ === "int" && lq.params[0].name === "seite");
pruefe("laufeQuadrat body = for", lq.body.length === 1 && lq.body[0].art === "for", lq.body);
if (lq.body[0].art === "for") {
  const f = lq.body[0];
  pruefe("for 0..<4", (f.von as any).wert === 0 && (f.bis as any).wert === 4 && !f.inklusive);
  pruefe("for-Body 2 Aufrufe", f.body.length === 2 && f.body.every((a) => a.art === "aufruf"), f.body);
  if (f.body[0].art === "aufruf") {
    pruefe("geheVor(seite) mit Variable", f.body[0].methode === "geheVor" && f.body[0].args[0].art === "variable");
  }
}

// --- MeineWelt-Vorlage -------------------------------------------------------
const meineWelt = parseKlasse(`public class MeineWelt extends Welt {

    Roboter rob;

    public void bereiteVor() {
        rob = new Roboter();
        rob.setzePosition(200, 240);
        rob.sage("Los geht's!");
    }

    public void spiele() {
        while (laeuft()) {
            rob.geheVor(25);
            rob.dreheDich(15);
            warte(100);
        }
    }
}
`);
pruefe("MeineWelt erbt von Welt", meineWelt.erbtVon === "Welt");
pruefe("MeineWelt Feld rob", meineWelt.felder.length === 1 && meineWelt.felder[0].name === "rob" && meineWelt.felder[0].typ === "Roboter", meineWelt.felder);
pruefe("MeineWelt 2 Methoden", meineWelt.methoden.length === 2, meineWelt.methoden.map((m) => m.name));
const bv = meineWelt.methoden.find((m) => m.name === "bereiteVor")!;
pruefe("bereiteVor: zuweisungNeu + 2 aufrufe", bv.body.length === 3 && bv.body[0].art === "zuweisung" && bv.body[1].art === "aufruf" && bv.body[2].art === "aufruf", bv.body);
if (bv.body[2].art === "aufruf") {
  pruefe('sage("Los geht\'s!")', bv.body[2].methode === "sage" && (bv.body[2].args[0] as any).wert === "Los geht's!");
}
const sp = meineWelt.methoden.find((m) => m.name === "spiele")!;
pruefe("spiele: whileLaeuft", sp.body.length === 1 && sp.body[0].art === "whileLaeuft", sp.body);
if (sp.body[0].art === "whileLaeuft") {
  pruefe("while-Body 3 Anweisungen", sp.body[0].body.length === 3);
}

// --- Deklaration mit new, Ausdrucks-Aufrufe, Zeilennummern ----------------------
const test3 = parseKlasse(`public class Test extends Figur {
    public void probiere() {
        Roboter r = new Roboter("Bello");
        r.geheVor(zufallszahl(10, 50));
        int x;
        kaputt +;
    }
}
`);
const p = test3.methoden[0];
pruefe("Deklaration mit new + String-Arg", p.body[0].art === "deklaration" && (p.body[0] as any).wert.args[0].wert === "Bello", p.body[0]);
pruefe("Aufruf mit Aufruf-Argument", p.body[1].art === "aufruf" && (p.body[1] as any).args[0].art === "aufrufAusdruck", p.body[1]);
pruefe("Deklaration ohne new", p.body[2].art === "deklaration" && (p.body[2] as any).wert === null);
pruefe("Unbekanntes bleibt unbekannt", p.body[3].art === "unbekannt");
pruefe("Zeilennummer der 4. Anweisung = 6", (p.body[3] as any).zeile === 6, p.body[3]);

// --- if-Block wird als Ganzes unbekannt, danach geht es weiter ------------------
const test4 = parseKlasse(`public class Test extends Figur {
    public void probiere() {
        if (gibX() > 100) {
            geheVor(10);
        }
        dreheDich(90);
    }
}
`);
const q = test4.methoden[0];
pruefe("if unbekannt, dann weiter", q.body.length === 2 && q.body[0].art === "unbekannt" && q.body[1].art === "aufruf", q.body);

// --- Konstruktor + geschachtelte Klammern in Strings ----------------------------
const test5 = parseKlasse(`public class Test extends Figur {
    public Test() {
        sage("Hallo { Welt } ; (alles gut)");
    }
    public void los() { geheVor(5); }
}
`);
pruefe(
  "Konstruktor erkannt",
  test5.konstruktoren.length === 1 && test5.konstruktoren[0].params.length === 0 && test5.konstruktoren[0].body.length === 1,
  test5.konstruktoren,
);
pruefe("Methode nach Konstruktor", test5.methoden.length === 1 && test5.methoden[0].name === "los");

// --- Überladene Konstruktoren (mit und ohne Parameter) --------------------------
const test5b = parseKlasse(`public class Kiste extends Figur {
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
`);
pruefe("Beide Konstruktoren erkannt", test5b.konstruktoren.length === 2, test5b.konstruktoren);
pruefe(
  "Konstruktor-Parameter erkannt",
  test5b.konstruktoren[1].params.length === 1 &&
    test5b.konstruktoren[1].params[0].typ === "String" &&
    test5b.konstruktoren[1].params[0].name === "pInhalt",
  test5b.konstruktoren[1].params,
);
pruefe("Methoden trotz Konstruktoren vollständig", test5b.methoden.length === 1 && test5b.methoden[0].name === "gibInhalt");

// --- Neu: return, Generics, Zuweisung mit Ausdruck --------------------------
const tier = parseKlasse(`public class Hund extends Tier {
    public String gibLaut() {
        return "Wuff!";
    }
}
`);
const gl = tier.methoden[0];
pruefe("return mit Text", gl.body[0].art === "rueckgabe" && (gl.body[0] as any).wert.wert === "Wuff!", gl.body[0]);

const queue = parseKlasse(`public class Queue<ContentType> {
    private QueueNode head;
    public boolean isEmpty() {
        return true;
    }
    public void enqueue(ContentType pContent) {
        head = null;
    }
}
`);
pruefe("Generics-Klassenkopf", queue.name === "Queue" && queue.erbtVon === null, queue.name);
pruefe("Queue-Methoden gefunden", queue.methoden.length === 2, queue.methoden.map((m) => m.name));

const nrwQueue = parseKlasse(`public class Queue<ContentType> {
    private class QueueNode {
        private ContentType content = null;
        public ContentType getContent() {
            return content;
        }
    }
    private QueueNode head;
    public boolean isEmpty() {
        return true;
    }
}
`);
pruefe("Innere Klasse wird übersprungen", nrwQueue.methoden.length === 1 && nrwQueue.methoden[0].name === "isEmpty", nrwQueue.methoden.map((m) => m.name));

const stapelWelt = parseKlasse(`public class MeineWelt extends Welt {
    Stack<Kiste> stapel;
    public void bereiteVor() {
        stapel = new Stack<Kiste>();
    }
}
`);
pruefe("Feld mit Generics-Typ", stapelWelt.felder[0].name === "stapel", stapelWelt.felder);
const sv = stapelWelt.methoden[0].body[0];
pruefe("Zuweisung mit new+Generics", sv.art === "zuweisung" && (sv as any).wert.art === "neuAusdruck" && (sv as any).wert.klasse === "Stack", sv);

// --- Verschachtelte Generics + Interface -------------------------------------
const bst = parseKlasse(`public class BinarySearchTree<ContentType extends ComparableContent<ContentType>> {
    private int dummy;
    public boolean isEmpty() {
        return true;
    }
}
`);
pruefe("BST-Kopf mit verschachtelten Generics", bst.name === "BinarySearchTree" && bst.erbtVon === null && bst.methoden.length === 1, bst.name);

const cc = parseKlasse(`public interface ComparableContent<ContentType> {
    public boolean isGreater(ContentType pContent);
    public boolean isEqual(ContentType pContent);
    public boolean isLess(ContentType pContent);
}
`);
pruefe("Interface wird erkannt", cc.istInterface && cc.name === "ComparableContent", cc);

const impl = parseKlasse(`public class Kunde extends Figur implements ComparableContent<Kunde> {
    public boolean isGreater(Kunde p) {
        return false;
    }
}
`);
pruefe("extends + implements mit Generics", impl.name === "Kunde" && impl.erbtVon === "Figur" && !impl.istInterface, impl);

process.exit(fehler === 0 ? 0 : 1);
