import { NRW_BIBLIOTHEK } from "../java/nrwBibliothek";

/**
 * Lernszenarien: fertige Klassensätze für Unterrichtsreihen, orientiert
 * am Kernlehrplan Informatik NRW (GOSt). Jedes Szenario bringt die
 * benötigten Klassen (inkl. NRW-Datenstrukturen), Aufgaben als Kommentare
 * und passende Bilder mit. Laden ersetzt die aktuellen Klassen.
 */
export interface Szenario {
  id: string;
  titel: string;
  stufe: string;
  beschreibung: string;
  /** z. B. "braucht Echtes Java" bei Generics/Arrays/if. */
  hinweis?: string;
  klassen: Record<string, string>;
  emojis?: Record<string, string>;
}

function nrwKlasse(name: string): string {
  const eintrag = NRW_BIBLIOTHEK.find((e) => e.name === name);
  if (!eintrag) throw new Error(`NRW-Klasse ${name} fehlt in der Bibliothek.`);
  return eintrag.code;
}

// ---------------------------------------------------------------------------
// Erste Schritte (EF): Objekte, Klassen, Methoden
// ---------------------------------------------------------------------------

const ROBOTER_VORLAGE = `public class Roboter extends Figur {

    // ATTRIBUT (Instanzvariable): Jedes Roboter-Objekt hat hier seinen
    // EIGENEN Wert – ein zweiter Roboter kann eine andere Schrittweite haben.
    private int schrittweite;

    // KONSTRUKTOR: heißt genau wie die Klasse und hat keinen Rückgabetyp.
    // Er wird bei new Roboter() automatisch ausgeführt und gibt den
    // Attributen ihre Startwerte.
    public Roboter() {
        schrittweite = 25;
    }

    // Sondierende Methode: verrät den Wert des Attributs.
    public int gibSchrittweite() {
        return schrittweite;
    }

    // Verändernde Methode: setzt das Attribut auf einen neuen Wert.
    public void setzeSchrittweite(int neueWeite) {
        schrittweite = neueWeite;
    }

    // Nutzt das Attribut: Jeder Roboter geht SEINE Schrittweite vor.
    public void geheSchritt() {
        geheVor(schrittweite);
    }

    // Eigene Methode: läuft ein Quadrat mit der angegebenen Seitenlänge.
    public void laufeQuadrat(int seite) {
        for (int i = 0; i < 4; i++) {
            geheVor(seite);
            dreheDich(90);
        }
    }
}
`;

const ERSTE_SCHRITTE_WELT = `public class MeineWelt extends Welt {

    Roboter rob;

    // Wird einmal beim Start ausgeführt: Figuren erzeugen und platzieren.
    public void bereiteVor() {
        rob = new Roboter();
        rob.setzePosition(200, 240);
        rob.sage("Los geht's!");
    }

    // Das Spiel: Diese Schleife läuft, bis du auf Stopp drückst.
    public void spiele() {
        while (laeuft()) {
            rob.geheSchritt();
            rob.dreheDich(15);
            warte(100);
        }
    }

    // AUFGABE 1: Platziere einen zweiten Roboter über die Objektbank und
    //            rufe setzeSchrittweite(60) auf – nur ER wird schneller.
    //            Warum? (Stichwort: Attribut = Wert PRO Objekt)
    // AUFGABE 2: Schau in Roboter.java: Was macht der Konstruktor, und
    //            wann wird er ausgeführt?
    // AUFGABE 3: Gib dem Roboter ein zweites Attribut drehwinkel samt
    //            Startwert im Konstruktor und nutze es in spiele().
}
`;

// ---------------------------------------------------------------------------
// Vererbung (Q1, Wiederholung): Oberklasse, Überschreiben, Polymorphie
// ---------------------------------------------------------------------------

const TIER = `public class Tier extends Figur {

    // ATTRIBUTE (Instanzvariablen): Jedes Tier-Objekt hat eigene Werte.
    // protected: auch die Unterklassen (Hund, Katze) dürfen zugreifen.
    protected String laut;
    protected int alter;

    // KONSTRUKTOR: wird bei new automatisch ausgeführt und setzt die
    // Startwerte. Unterklassen führen ihn IMMER ZUERST mit aus.
    public Tier() {
        laut = "...";
        alter = 1;
    }

    // Jedes Tier kann sich vorstellen. WELCHER Laut dabei herauskommt,
    // entscheidet die Unterklasse (Konstruktor oder Überschreiben).
    public void stelleDichVor() {
        sage(gibLaut());
    }

    public String gibLaut() {
        return laut;
    }

    public int gibAlter() {
        return alter;
    }
}
`;

const HUND = `public class Hund extends Tier {

    // KONSTRUKTOR der Unterklasse: Java führt erst den Konstruktor von
    // Tier aus, DANACH diesen – er überschreibt die geerbten Startwerte.
    public Hund() {
        laut = "Wuff!";
        alter = 3;
    }

    // Eine zusätzliche Methode, die nur Hunde haben.
    public void machMaennchen() {
        dreheDich(-90);
        sage("Bitte, bitte!");
        dreheDich(90);
    }
}
`;

const KATZE = `public class Katze extends Tier {

    public Katze() {
        alter = 2;
    }

    // Zweiter Weg zur Polymorphie: Katze ÜBERSCHREIBT gibLaut() –
    // diese Version gewinnt, egal was im Attribut laut steht.
    public String gibLaut() {
        return "Miau!";
    }
}
`;

const VERERBUNG_WELT = `public class MeineWelt extends Welt {

    Hund bello;
    Katze minka;

    public void bereiteVor() {
        bello = new Hund();
        bello.nenne("Bello");
        bello.setzePosition(220, 240);
        minka = new Katze();
        minka.nenne("Minka");
        minka.setzePosition(500, 240);
    }

    public void spiele() {
        bello.stelleDichVor();
        warte(1500);
        minka.stelleDichVor();
        warte(1500);
        bello.machMaennchen();
    }

    // AUFGABE 1: Warum sagt Bello "Wuff!", obwohl stelleDichVor() in der
    //            Klasse Tier steht? (Stichwort: Polymorphie / dynamische
    //            Bindung – schaue in Tier.java und Hund.java.)
    // AUFGABE 2: Hund und Katze lösen das unterschiedlich: Hund setzt das
    //            ATTRIBUT laut im KONSTRUKTOR um, Katze ÜBERSCHREIBT die
    //            Methode gibLaut(). Vergleiche beide Wege.
    // AUFGABE 3: Erstelle eine eigene Klasse Kuh, die von Tier erbt, mit
    //            einem Konstruktor, der laut auf "Muh!" setzt. Platziere
    //            eine Kuh und rufe stelleDichVor() über die Objektbank auf.
    // AUFGABE 4: Rufe gibAlter() bei Bello und Minka über die Objektbank
    //            auf. Woher kommen die Werte 3 und 2?
    // AUFGABE 5: Gib der Katze eine eigene Methode (z. B. schleiche(int)),
    //            die es nur bei Katzen gibt.
}
`;

// ---------------------------------------------------------------------------
// Arrays (Q1, Wiederholung): Zählschleifen über Felder
// ---------------------------------------------------------------------------

const ARRAYS_WELT = `public class MeineWelt extends Welt {

    // Ein Array fasst mehrere Objekte unter EINEM Namen zusammen.
    Roboter[] gruppe;

    public void bereiteVor() {
        gruppe = new Roboter[5];
        for (int i = 0; i < gruppe.length; i++) {
            gruppe[i] = new Roboter();
            gruppe[i].setzePosition(120 + i * 120, 240);
        }
    }

    public void spiele() {
        // Ein Array wird ELEMENT für ELEMENT durchlaufen – mit einer
        // Zählschleife über den Index (kein for-each im Abitur!).
        while (laeuft()) {
            for (int i = 0; i < gruppe.length; i++) {
                gruppe[i].dreheDich(30);
            }
            warte(200);
        }
    }

    // AUFGABE 1: Lass nur jeden zweiten Roboter drehen.
    //            (Tipp: Schrittweite der Schleife ändern.)
    // AUFGABE 2: Baue eine "Welle": Roboter i dreht sich erst nach
    //            i * 100 Millisekunden. (Tipp: warte im Schleifenrumpf.)
    // AUFGABE 3: Schreibe eine Methode sageNummern(), in der jeder
    //            Roboter seinen Index ansagt: "Ich bin Nummer i".
}
`;

// ---------------------------------------------------------------------------
// Stack (Q1): LIFO am Kistenstapel
// ---------------------------------------------------------------------------

const KISTE = `public class Kiste extends Figur {

    // ATTRIBUT: Jede Kiste kennt ihren eigenen Inhalt.
    private String inhalt;

    // KONSTRUKTOR ohne Parameter: Neue Kisten sind zunächst leer.
    public Kiste() {
        inhalt = "leer";
    }

    // ÜBERLADENER KONSTRUKTOR: gleicher Name, andere Parameterliste.
    // new Kiste("Paket 1") packt den Inhalt direkt beim Erzeugen ein.
    public Kiste(String pInhalt) {
        inhalt = pInhalt;
    }

    public void packeEin(String neuerInhalt) {
        inhalt = neuerInhalt;
    }

    public String gibInhalt() {
        return inhalt;
    }

    public void zeigeInhalt() {
        sage(inhalt);
    }
}
`;

const STACK_WELT = `public class MeineWelt extends Welt {

    Stack<Kiste> stapel;

    public void bereiteVor() {
        stapel = new Stack<Kiste>();
        // Fünf Kisten werden gestapelt – die zuletzt gestapelte liegt OBEN.
        // Der Konstruktor mit Parameter packt den Inhalt direkt ein.
        for (int i = 0; i < 5; i++) {
            Kiste k = new Kiste("Paket " + (i + 1));
            k.setzePosition(220, 400 - i * 55);
            stapel.push(k);
        }
    }

    public void spiele() {
        // Der Stapel wird abgebaut: Zugriff gibt es NUR auf die oberste
        // Kiste (top), entfernt wird NUR oben (pop) – das ist LIFO.
        int platz = 0;
        while (!stapel.isEmpty()) {
            Kiste oberste = stapel.top();
            stapel.pop();
            oberste.zeigeInhalt();
            oberste.setzePosition(520, 400 - platz * 55);
            platz = platz + 1;
            warte(900);
        }
    }

    // AUFGABE 1: Beobachte die Sprechblasen beim Abbau: "Paket 5" kommt
    //            zuerst. Warum ist die Reihenfolge genau umgekehrt zur
    //            Reihenfolge des Einpackens? (LIFO-Prinzip)
    // AUFGABE 2: Fülle die Kisten beim Abbau in einen ZWEITEN Stack und
    //            baue auch den wieder ab – welche Reihenfolge entsteht?
    // AUFGABE 3 (LK): Öffne Stack.java. Erkläre anhand der inneren Klasse
    //            StackNode, wie push() und pop() in O(1) funktionieren.
}
`;

// ---------------------------------------------------------------------------
// Queue (Q1): FIFO an der Warteschlange
// ---------------------------------------------------------------------------

const KUNDE = `public class Kunde extends Figur {

    // ATTRIBUT: Jeder Kunde hat seinen eigenen Wunsch.
    private String wunsch;

    // KONSTRUKTOR ohne Parameter: Standardwunsch für neue Kunden.
    public Kunde() {
        wunsch = "eine Brezel";
    }

    // ÜBERLADENER KONSTRUKTOR: new Kunde("ein Eis") setzt den Wunsch
    // direkt beim Erzeugen.
    public Kunde(String pWunsch) {
        wunsch = pWunsch;
    }

    public void setzeWunsch(String neuerWunsch) {
        wunsch = neuerWunsch;
    }

    public String gibWunsch() {
        return wunsch;
    }
}
`;

const QUEUE_WELT = `public class MeineWelt extends Welt {

    Queue<Kunde> schlange;

    public void bereiteVor() {
        schlange = new Queue<Kunde>();
        for (int i = 0; i < 4; i++) {
            Kunde k = new Kunde();
            schlange.enqueue(k);
        }
        rueckeAuf();
    }

    public void spiele() {
        // Der Kiosk bedient: Wer ZUERST kam, ist ZUERST dran (FIFO).
        while (laeuft()) {
            if (!schlange.isEmpty()) {
                Kunde vorne = schlange.front();
                vorne.sage("Ich möchte " + vorne.gibWunsch() + "!");
                warte(1000);
                schlange.dequeue();
                vorne.entferne();
                rueckeAuf();
            }
            if (zufallszahl(1, 3) == 1) {
                Kunde neu = new Kunde("ein Eis");
                schlange.enqueue(neu);
                rueckeAuf();
            }
            warte(800);
        }
    }

    // Alle rücken auf. Eine Queue kennt nur ihr VORDERSTES Objekt –
    // deshalb wird sie einmal komplett in eine neue Queue umgefüllt.
    public void rueckeAuf() {
        Queue<Kunde> neu = new Queue<Kunde>();
        int platz = 0;
        while (!schlange.isEmpty()) {
            Kunde k = schlange.front();
            schlange.dequeue();
            k.setzePosition(160 + platz * 90, 240);
            neu.enqueue(k);
            platz = platz + 1;
        }
        schlange = neu;
    }

    // AUFGABE 1: Woran erkennst du das FIFO-Prinzip im Ablauf?
    // AUFGABE 2: In bereiteVor() entsteht jeder Kunde mit new Kunde(),
    //            in spiele() mit new Kunde("ein Eis"). Vergleiche die
    //            beiden Konstruktoren in Kunde.java – woran erkennt Java,
    //            welcher gemeint ist? (Stichwort: Überladung)
    // AUFGABE 3: Warum muss rueckeAuf() die Schlange umfüllen? Welche
    //            Methoden bietet Queue – und welche gerade NICHT?
    // AUFGABE 4 (LK): Öffne Queue.java und erkläre die Rolle von head
    //            und tail bei enqueue() und dequeue().
}
`;

// ---------------------------------------------------------------------------
// List (Q1): Listendurchlauf am Zug
// ---------------------------------------------------------------------------

const WAGGON = `public class Waggon extends Figur {

    // ATTRIBUTE: Platz im Zug und Ladung des Waggons.
    private int nummer;
    private String ladung;

    // KONSTRUKTOR ohne Parameter: Startwerte für jeden neuen Waggon.
    public Waggon() {
        nummer = 0;
        ladung = "leer";
    }

    // ÜBERLADENER KONSTRUKTOR: new Waggon("Kohle") belädt sofort.
    public Waggon(String pLadung) {
        nummer = 0;
        ladung = pLadung;
    }

    public void setzeNummer(int neueNummer) {
        nummer = neueNummer;
    }

    public int gibNummer() {
        return nummer;
    }

    public void belade(String neueLadung) {
        ladung = neueLadung;
    }

    public String gibLadung() {
        return ladung;
    }
}
`;

const LIST_WELT = `public class MeineWelt extends Welt {

    List<Waggon> zug;

    public void bereiteVor() {
        zug = new List<Waggon>();
        for (int i = 0; i < 4; i++) {
            zug.append(new Waggon());
        }
        ordneZug();
    }

    // Stellt alle Waggons in Reihe auf – der typische NRW-Listendurchlauf:
    // toFirst() / hasAccess() / getContent() / next()
    public void ordneZug() {
        int platz = 0;
        zug.toFirst();
        while (zug.hasAccess()) {
            Waggon w = zug.getContent();
            w.setzeNummer(platz + 1);
            w.setzePosition(140 + platz * 110, 240);
            platz = platz + 1;
            zug.next();
        }
    }

    public void spiele() {
        warte(1200);
        // Ein Speisewagen wird VOR dem zweiten Waggon eingefügt:
        zug.toFirst();
        zug.next();
        Waggon speisewagen = new Waggon("Speisen");
        speisewagen.nenne("Speisewagen");
        zug.insert(speisewagen);
        speisewagen.sage("Neu dabei!");
        ordneZug();
        warte(2000);
        // Der letzte Waggon wird abgekoppelt:
        zug.toLast();
        Waggon letzter = zug.getContent();
        letzter.sage("Tschüss!");
        warte(1000);
        zug.remove();
        letzter.entferne();
        ordneZug();
    }

    // AUFGABE 1: Hänge in bereiteVor() zwei weitere Waggons an.
    // AUFGABE 2: Belade in bereiteVor() jeden Waggon (belade("Kohle") …)
    //            und lass ihn beim Ordnen seine Ladung sagen. Wo bekommt
    //            ein neuer Waggon den Startwert "leer" her?
    // AUFGABE 3: Schreibe eine Methode zaehleWaggons(): Bestimme die
    //            Zuglänge mit einem Listendurchlauf und lass den ersten
    //            Waggon sagen: "Wir sind N Waggons."
    // AUFGABE 4: Entferne mit toFirst()/next()/remove() gezielt den
    //            DRITTEN Waggon. Was ist danach das aktuelle Objekt?
    // AUFGABE 5 (LK): Öffne List.java. Wie findet remove() den Vorgänger
    //            des aktuellen Objekts? Welche Kosten hat das?
}
`;

// ---------------------------------------------------------------------------
// Datenbanken (Q1): SQL-Abfragen bevölkern die Welt
// ---------------------------------------------------------------------------

const ZOOTIER = `public class Zootier extends Figur {

    // ATTRIBUT: die Art des Tieres (kommt später aus der Datenbank).
    private String art;

    // KONSTRUKTOR ohne Parameter: Solange nichts aus der Datenbank
    // geladen wurde, ist die Art unbekannt.
    public Zootier() {
        art = "unbekannt";
    }

    // ÜBERLADENER KONSTRUKTOR: new Zootier("Pinguin") setzt die Art
    // direkt beim Erzeugen – so nutzt ihn zeigeTiere() in MeineWelt.
    public Zootier(String pArt) {
        art = pArt;
    }

    public void setzeArt(String neueArt) {
        art = neueArt;
    }

    public String gibArt() {
        return art;
    }
}
`;

const DATENBANK_WELT = `public class MeineWelt extends Welt {

    DatabaseConnector db;

    public void bereiteVor() {
        // Verbindungsdaten wie im Abitur - die Datenbank läuft hier aber
        // direkt im Browser. Sie enthält die Tabellen
        //   gehege(id, name, klima)
        //   tier(id, name, art, geburtsjahr, gehege_id -> gehege.id)
        // und wird bei jedem "Übernehmen" auf den Anfang zurückgesetzt.
        db = new DatabaseConnector("localhost", 3306, "zoo", "schule", "geheim");
        zeigeTiere("SELECT name, art FROM tier");
    }

    public void spiele() {
    }

    // Führt die Abfrage aus und stellt pro Ergebnis-Zeile ein Zootier auf
    // die Welt. Erwartet werden zwei Spalten: zuerst der Name (steht unter
    // der Figur), dann ein Text für die Sprechblase.
    public void zeigeTiere(String sql) {
        db.executeStatement(sql);
        if (db.getErrorMessage() != null) {
            Zootier warnschild = new Zootier();
            warnschild.nenne("SQL-Fehler");
            warnschild.setzePosition(360, 240);
            warnschild.sage(db.getErrorMessage());
            return;
        }
        QueryResult ergebnis = db.getCurrentQueryResult();
        if (ergebnis == null) {
            return;
        }
        String[][] daten = ergebnis.getData();
        for (int i = 0; i < daten.length; i++) {
            Zootier tier = new Zootier(daten[i][1]);
            tier.nenne(daten[i][0]);
            tier.setzePosition(110 + (i % 5) * 130, 130 + (i / 5) * 160);
            tier.sage(tier.gibArt());
        }
    }

    // AUFGABE 1: Zeige nur die Pinguine.
    //            (WHERE art = 'Pinguin')
    // AUFGABE 2: Sortiere die Tiere nach Geburtsjahr, das jüngste zuerst.
    //            (ORDER BY geburtsjahr DESC)
    // AUFGABE 3: Zeige zu jedem Tier den Namen seines Geheges:
    //            SELECT tier.name, gehege.name FROM tier
    //            JOIN gehege ON tier.gehege_id = gehege.id
    // AUFGABE 4: Füge mit INSERT ein eigenes Tier hinzu und starte neu.
    // AUFGABE 5 (Modellierung): Zeichne das ER-Diagramm zu gehege und
    //            tier. Warum wäre eine einzige Tabelle mit den Spalten
    //            (tiername, art, gehegename, klima) eine schlechte Idee?
    //            (Stichworte: Redundanz, Änderungsanomalie, Normalformen)
}
`;

// ---------------------------------------------------------------------------

export const SZENARIEN: Szenario[] = [
  {
    id: "erste-schritte",
    titel: "Erste Schritte: Objekte & Klassen",
    stufe: "EF · Einstieg OOP",
    beschreibung:
      "Objekte erzeugen und platzieren, Methoden aufrufen, eine erste eigene Methode mit Zählschleife (laufeQuadrat).",
    klassen: { MeineWelt: ERSTE_SCHRITTE_WELT, Roboter: ROBOTER_VORLAGE },
    emojis: { Roboter: "🤖" },
  },
  {
    id: "vererbung",
    titel: "Vererbung & Polymorphie",
    stufe: "Q1 · Wiederholung",
    beschreibung:
      "Oberklasse Tier, Unterklassen Hund und Katze überschreiben gibLaut() – Polymorphie zum Anfassen. Läuft auch im Übungsmodus.",
    klassen: { MeineWelt: VERERBUNG_WELT, Tier: TIER, Hund: HUND, Katze: KATZE },
    emojis: { Hund: "🐶", Katze: "🐱", Tier: "🐾" },
  },
  {
    id: "arrays",
    titel: "Arrays & Zählschleifen",
    stufe: "Q1 · Wiederholung",
    beschreibung:
      "Eine Roboter-Gruppe im Array, Durchlauf per Index mit Zählschleife (kein for-each) – wie im Abitur gefordert.",
    hinweis: "läuft nicht im Notbetrieb",
    klassen: { MeineWelt: ARRAYS_WELT, Roboter: ROBOTER_VORLAGE },
    emojis: { Roboter: "🤖" },
  },
  {
    id: "stack",
    titel: "Stack: der Kistenstapel",
    stufe: "Q1 · lineare Strukturen",
    beschreibung:
      "NRW-Klasse Stack<ContentType> (editierbar!) – Kisten stapeln und abbauen macht das LIFO-Prinzip sichtbar.",
    hinweis: "läuft nicht im Notbetrieb",
    klassen: { MeineWelt: STACK_WELT, Kiste: KISTE, Stack: nrwKlasse("Stack") },
    emojis: { Kiste: "📦" },
  },
  {
    id: "queue",
    titel: "Queue: die Warteschlange",
    stufe: "Q1 · lineare Strukturen",
    beschreibung:
      "NRW-Klasse Queue<ContentType> (editierbar!) – ein Kiosk bedient Kunden nach dem FIFO-Prinzip, inkl. Umfüll-Idiom.",
    hinweis: "läuft nicht im Notbetrieb",
    klassen: { MeineWelt: QUEUE_WELT, Kunde: KUNDE, Queue: nrwKlasse("Queue") },
    emojis: { Kunde: "🧍" },
  },
  {
    id: "liste",
    titel: "List: der Zug",
    stufe: "Q1 · lineare Strukturen",
    beschreibung:
      "NRW-Klasse List<ContentType> (editierbar!) – Waggons anhängen, einfügen, entfernen und der klassische Listendurchlauf.",
    hinweis: "läuft nicht im Notbetrieb",
    klassen: { MeineWelt: LIST_WELT, Waggon: WAGGON, List: nrwKlasse("List") },
    emojis: { Waggon: "🚃" },
  },
  {
    id: "datenbank",
    titel: "Datenbank: der Zoo",
    stufe: "Q1 · Datenbanken",
    beschreibung:
      "SQL-Abfragen bevölkern die Welt: SELECT/WHERE/ORDER BY/JOIN auf den Tabellen gehege und tier (NRW-Klassen DatabaseConnector und QueryResult, editierbar). Mit ER-/Normalformen-Aufgabe.",
    hinweis: "läuft nicht im Notbetrieb",
    klassen: {
      MeineWelt: DATENBANK_WELT,
      Zootier: ZOOTIER,
      DatabaseConnector: nrwKlasse("DatabaseConnector"),
      QueryResult: nrwKlasse("QueryResult"),
    },
    emojis: { Zootier: "🦁" },
  },
];

/** Die Klassen des Standard-Szenarios (Erstinstallation). */
export const STANDARD_KLASSEN = SZENARIEN[0].klassen;
export const STANDARD_EMOJIS = SZENARIEN[0].emojis ?? {};
