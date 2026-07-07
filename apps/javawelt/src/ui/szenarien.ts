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
            rob.geheVor(25);
            rob.dreheDich(15);
            warte(100);
        }
    }
}
`;

// ---------------------------------------------------------------------------
// Vererbung (Q1, Wiederholung): Oberklasse, Überschreiben, Polymorphie
// ---------------------------------------------------------------------------

const TIER = `public class Tier extends Figur {

    // Jedes Tier kann sich vorstellen. WELCHER Laut dabei herauskommt,
    // entscheidet die Unterklasse: Sie ÜBERSCHREIBT gibLaut().
    public void stelleDichVor() {
        sage(gibLaut());
    }

    public String gibLaut() {
        return "...";
    }
}
`;

const HUND = `public class Hund extends Tier {

    // Überschreibt gibLaut() aus der Oberklasse Tier.
    public String gibLaut() {
        return "Wuff!";
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
    // AUFGABE 2: Erstelle eine eigene Klasse Kuh, die von Tier erbt, und
    //            überschreibe gibLaut(). Platziere eine Kuh auf der Welt
    //            und rufe stelleDichVor() über die Objektbank auf.
    // AUFGABE 3: Gib der Katze eine eigene Methode (z. B. schleiche(int)),
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
}
`;

const STACK_WELT = `public class MeineWelt extends Welt {

    Stack<Kiste> stapel;

    public void bereiteVor() {
        stapel = new Stack<Kiste>();
        // Fünf Kisten werden gestapelt – die zuletzt gestapelte liegt OBEN.
        for (int i = 0; i < 5; i++) {
            Kiste k = new Kiste();
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
            oberste.sage("Ich kam als " + (5 - platz) + ".");
            oberste.setzePosition(520, 400 - platz * 55);
            platz = platz + 1;
            warte(900);
        }
    }

    // AUFGABE 1: Beobachte den neuen Stapel rechts: Warum ist die
    //            Reihenfolge genau umgekehrt? (LIFO-Prinzip)
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
                vorne.sage("Ich bin dran!");
                warte(1000);
                schlange.dequeue();
                vorne.entferne();
                rueckeAuf();
            }
            if (zufallszahl(1, 3) == 1) {
                Kunde neu = new Kunde();
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
    // AUFGABE 2: Warum muss rueckeAuf() die Schlange umfüllen? Welche
    //            Methoden bietet Queue – und welche gerade NICHT?
    // AUFGABE 3 (LK): Öffne Queue.java und erkläre die Rolle von head
    //            und tail bei enqueue() und dequeue().
}
`;

// ---------------------------------------------------------------------------
// List (Q1): Listendurchlauf am Zug
// ---------------------------------------------------------------------------

const WAGGON = `public class Waggon extends Figur {
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
        Waggon speisewagen = new Waggon();
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
    // AUFGABE 2: Schreibe eine Methode zaehleWaggons(): Bestimme die
    //            Zuglänge mit einem Listendurchlauf und lass den ersten
    //            Waggon sagen: "Wir sind N Waggons."
    // AUFGABE 3: Entferne mit toFirst()/next()/remove() gezielt den
    //            DRITTEN Waggon. Was ist danach das aktuelle Objekt?
    // AUFGABE 4 (LK): Öffne List.java. Wie findet remove() den Vorgänger
    //            des aktuellen Objekts? Welche Kosten hat das?
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
];

/** Die Klassen des Standard-Szenarios (Erstinstallation). */
export const STANDARD_KLASSEN = SZENARIEN[0].klassen;
export const STANDARD_EMOJIS = SZENARIEN[0].emojis ?? {};
