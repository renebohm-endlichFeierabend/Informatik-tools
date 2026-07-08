import { MockLaufzeit } from "../src/java/mockLaufzeit";

// Fake-Engine: nur das, was die Mock-Laufzeit anspricht.
class FakeFigur {
  id: number;
  klasse: string;
  logischX = 0;
  logischY = 0;
  logischWinkel = 0;
  name = "";
  sprueche: string[] = [];
  constructor(id: number, klasse: string, x: number, y: number) {
    this.id = id;
    this.klasse = klasse;
    this.logischX = x;
    this.logischY = y;
  }
}
class FakeWelt {
  breite = 720;
  hoehe = 480;
  figuren = new Map<number, FakeFigur>();
  naechste = 1;
  erzeugeFigur(name: string, klasse: string, x = 360, y = 240): number {
    const id = this.naechste++;
    const f = new FakeFigur(id, klasse, x, y);
    f.name = name || klasse.toLowerCase() + id;
    this.figuren.set(id, f);
    return id;
  }
  figur(id: number) {
    return this.figuren.get(id) ?? null;
  }
  verschiebe(id: number, dx: number, dy: number) {
    const f = this.figuren.get(id)!;
    f.logischX += dx;
    f.logischY += dy;
  }
  dreheDich(id: number, grad: number) {
    this.figuren.get(id)!.logischWinkel += grad;
  }
  setzePosition(id: number, x: number, y: number) {
    const f = this.figuren.get(id)!;
    f.logischX = x;
    f.logischY = y;
  }
  sage(id: number, text: string) {
    this.figuren.get(id)!.sprueche.push(text);
  }
  gibX(id: number) {
    return Math.round(this.figuren.get(id)?.logischX ?? 0);
  }
  gibY(id: number) {
    return Math.round(this.figuren.get(id)?.logischY ?? 0);
  }
  entferne(id: number) {
    this.figuren.delete(id);
  }
  leeren() {
    this.figuren.clear();
  }
  benenne(id: number, name: string) {
    const f = this.figuren.get(id);
    if (f && name) f.name = name;
  }
}

let fehler = 0;
function pruefe(name: string, bedingung: boolean, detail?: unknown) {
  if (bedingung) console.log("OK  " + name);
  else {
    fehler++;
    console.log("FEHLER  " + name, detail !== undefined ? JSON.stringify(detail) : "");
  }
}

const welt = new FakeWelt();
const konsole: string[] = [];
const laufzeit = new MockLaufzeit();
await laufzeit.init(welt as any, (z) => konsole.push(z));

const ROBOTER = `public class Roboter extends Figur {
    public void laufeQuadrat(int seite) {
        for (int i = 0; i < 4; i++) {
            geheVor(seite);
            dreheDich(90);
        }
    }
    public void doppelt(int n) {
        laufeQuadrat(n);
        laufeQuadrat(n);
    }
}
`;
const MEINEWELT = `public class MeineWelt extends Welt {
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
            warte(20);
        }
    }
}
`;

const ok = await laufzeit.kompiliere({ Roboter: ROBOTER, MeineWelt: MEINEWELT });
pruefe("kompiliere ok", ok, konsole);

// Objekt platzieren + eigene Methode mit Parameter aufrufen
const id = await laufzeit.erzeugeObjekt("Roboter", 100, 100);
pruefe("Objekt erzeugt", welt.figur(id) !== null);
await laufzeit.rufeMethode(id, "laufeQuadrat", ["50"]);
const f = welt.figur(id)!;
pruefe("Quadrat: zurück am Start", Math.round(f.logischX) === 100 && Math.round(f.logischY) === 100, [f.logischX, f.logischY]);
pruefe("Quadrat: 360° gedreht", f.logischWinkel === 360, f.logischWinkel);

// Methode, die eigene Methode aufruft
await laufzeit.rufeMethode(id, "doppelt", ["10"]);
pruefe("doppelt: 2 weitere Quadrate", f.logischWinkel === 360 * 3, f.logischWinkel);

// Geerbte Figur-Methoden über die Laufzeit
await laufzeit.rufeMethode(id, "setzePosition", ["300", "200"]);
const x = await laufzeit.rufeMethode(id, "gibX", []);
pruefe("gibX → 300", x === "300", x);
await laufzeit.rufeMethode(id, "sage", ["Hallo!"]);
pruefe("sage kam an", f.sprueche.includes("Hallo!"));

// Fehlerfälle: verständliche Meldungen
let meldung = "";
try {
  await laufzeit.rufeMethode(id, "gibtEsNicht", []);
} catch (e) {
  meldung = (e as Error).message;
}
pruefe("unbekannte Methode meldet sich", meldung.includes("gibtEsNicht"), meldung);

const kaputt = await laufzeit.kompiliere({ Roboter: "public class Falsch extends Figur {}" });
pruefe("Klassenname ≠ Dateiname wird gemeldet", !kaputt && konsole.some((z) => z.includes("Falsch")), konsole.slice(-2));
await laufzeit.kompiliere({ Roboter: ROBOTER, MeineWelt: MEINEWELT });

// Spiel: bereiteVor + Schleife, Stopp nach 150 ms
const spielVersprechen = laufzeit.starteSpiel("MeineWelt");
await new Promise((r) => setTimeout(r, 150));
laufzeit.stoppeSpiel();
await spielVersprechen;
const alle = [...welt.figuren.values()];
pruefe("Spiel: 1 Roboter erzeugt", alle.length === 1, alle.length);
pruefe("Spiel: Roboter hat sich bewegt/gedreht", alle[0].logischWinkel > 0, alle[0].logischWinkel);
pruefe("Spiel: Sprechblase aus bereiteVor", alle[0].sprueche[0] === "Los geht's!", alle[0].sprueche);

// Unbekannte Anweisung → klare Meldung
await laufzeit.kompiliere({
  Roboter: `public class Roboter extends Figur {
    public void kaputt() {
        int summe = 1 + 2;
    }
}`,
});
const id2 = await laufzeit.erzeugeObjekt("Roboter", 0, 0);
let meldung2 = "";
try {
  await laufzeit.rufeMethode(id2, "kaputt", []);
} catch (e) {
  meldung2 = (e as Error).message;
}
pruefe("Übungsmodus-Grenze wird erklärt", meldung2.includes("Notbetrieb"), meldung2);

// --- Vererbung & Polymorphie (return + Überschreiben) ---------------------------
const TIER = `public class Tier extends Figur {
    public void stelleDichVor() {
        sage(gibLaut());
    }
    public String gibLaut() {
        return "...";
    }
}`;
const HUND = `public class Hund extends Tier {
    public String gibLaut() {
        return "Wuff!";
    }
}`;
const VWELT = `public class MeineWelt extends Welt {
    Hund bello;
    public void bereiteVor() {
        bello = new Hund();
        bello.nenne("Bello");
        bello.setzePosition(220, 240);
        bello.stelleDichVor();
    }
    public void spiele() {
    }
}`;
const vok = await laufzeit.kompiliere({ Tier: TIER, Hund: HUND, MeineWelt: VWELT });
pruefe("Vererbungs-Szenario kompiliert", vok, konsole.slice(-3));
await laufzeit.starteSpiel("MeineWelt");
const hunde = [...welt.figuren.values()];
pruefe("Hund erzeugt mit Namen", hunde.length === 1 && hunde[0].name === "Bello", hunde.map((f) => f.name));
pruefe("Polymorphie: gibLaut von Hund überschreibt Tier", hunde[0].sprueche.includes("Wuff!"), hunde[0].sprueche);

// geerbte eigene Methode über die Objektbank (rufeMethode) inkl. Rückgabewert
const hid = hunde[0].id;
const laut = await laufzeit.rufeMethode(hid, "gibLaut", []);
pruefe("rufeMethode liefert Rückgabewert", laut === "Wuff!", laut);

// --- NRW-Klasse (Generics) wird toleriert, Nutzung erklärt sich ------------------
const QUEUE_MINI = `public class Queue<ContentType> {
    private class QueueNode {
        private ContentType content = null;
    }
    public boolean isEmpty() {
        return true;
    }
}`;
const qok = await laufzeit.kompiliere({ Queue: QUEUE_MINI, Roboter: ROBOTER, MeineWelt: MEINEWELT });
pruefe("Projekt mit Generics-Klasse kompiliert im Übungsmodus", qok, konsole.slice(-3));

// Wie echtes Java: Konstruktoren werden nicht vererbt.
let meldung3 = "";
try {
  await laufzeit.kompiliere({ Tier: TIER, Hund: HUND, MeineWelt: `public class MeineWelt extends Welt {
    public void bereiteVor() {
        Hund h = new Hund("Rex");
    }
}` });
  await laufzeit.starteSpiel("MeineWelt");
} catch (e) {
  meldung3 = (e as Error).message;
}
pruefe("new Hund(\"Rex\") wird wie in Java abgelehnt", meldung3.includes("nenne"), meldung3);

// --- Deklarierte Konstruktoren mit Parametern werden ausgeführt -----------------
const KISTE = `public class Kiste extends Figur {
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
}`;
const KWELT = `public class MeineWelt extends Welt {
    Kiste voll;
    Kiste leer;
    public void bereiteVor() {
        voll = new Kiste("Paket 1");
        leer = new Kiste();
    }
    public void spiele() {
    }
}`;
const kok = await laufzeit.kompiliere({ Kiste: KISTE, MeineWelt: KWELT });
pruefe("Kisten-Projekt kompiliert", kok, konsole.slice(-3));
await laufzeit.starteSpiel("MeineWelt");
const kisten = [...welt.figuren.values()];
pruefe("Beide Kisten erzeugt", kisten.length === 2, kisten.length);
const inhalt1 = await laufzeit.rufeMethode(kisten[0].id, "gibInhalt", []);
const inhalt2 = await laufzeit.rufeMethode(kisten[1].id, "gibInhalt", []);
pruefe("Konstruktor mit Parameter setzt Attribut", inhalt1 === "Paket 1", inhalt1);
pruefe("Überladener Konstruktor ohne Parameter", inhalt2 === "leer", inhalt2);

// Platzieren über die Objektbank mit Konstruktor-Argumenten (Text-Args).
const pid = await laufzeit.erzeugeObjekt("Kiste", 100, 100, ["Bücher"]);
const pinhalt = await laufzeit.rufeMethode(pid, "gibInhalt", []);
pruefe("erzeugeObjekt mit Konstruktor-Argument", pinhalt === "Bücher", pinhalt);

// Falsche Parameteranzahl bleibt ein Fehler (wie javac).
let meldung4 = "";
try {
  await laufzeit.kompiliere({ Kiste: KISTE, MeineWelt: `public class MeineWelt extends Welt {
    public void bereiteVor() {
        Kiste k = new Kiste("a", "b");
    }
}` });
  await laufzeit.starteSpiel("MeineWelt");
} catch (e) {
  meldung4 = (e as Error).message;
}
pruefe("new Kiste(\"a\", \"b\") wird abgelehnt", meldung4.includes("Konstruktor"), meldung4);

console.log(fehler === 0 ? "\nAlle Mock-Tests bestanden." : `\n${fehler} Fehler`);
process.exit(fehler === 0 ? 0 : 1);
