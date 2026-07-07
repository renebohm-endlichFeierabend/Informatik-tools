/**
 * Die Klassen der "Materialien für das Zentralabitur Informatik NRW"
 * (lineare Datenstrukturen), wie sie im Unterricht der Q1/Q2 verwendet
 * werden. Die Schnittstellen entsprechen exakt den Abitur-Vorgaben.
 *
 * Über den Bibliothek-Dialog wird eine EDITIERBARE KOPIE ins Projekt
 * übernommen — im LK können die Implementierungen so gelesen, verändert
 * und nachgebaut werden.
 *
 * Hinweis: Diese Klassen nutzen Generics und vollständiges Java — zum
 * Ausführen den Schalter "Echtes Java" (CheerpJ) aktivieren.
 */

export interface BibliothekEintrag {
  name: string;
  titel: string;
  beschreibung: string;
  code: string;
}

const QUEUE_QUELLE = `/**
 * Klasse Queue<ContentType> (NRW-Abiturvorgaben)
 *
 * Objekte der generischen Klasse Queue verwalten beliebige Objekte vom
 * Typ ContentType nach dem First-In-First-Out-Prinzip (FIFO), d. h. das
 * zuerst abgelegte Objekt wird als erstes wieder entnommen.
 */
public class Queue<ContentType> {

    /* --------- Anfang der privaten inneren Klasse QueueNode --------- */

    private class QueueNode {

        private ContentType content = null;
        private QueueNode nextNode = null;

        /**
         * Ein neues Objekt vom Typ QueueNode wird erschaffen.
         * Der Inhalt wird per Parameter gesetzt, der Verweis ist leer.
         */
        public QueueNode(ContentType pContent) {
            content = pContent;
        }

        /** Der Verweis wird auf das Objekt gesetzt, das pNext referenziert. */
        public void setNext(QueueNode pNext) {
            nextNode = pNext;
        }

        /** Liefert das nächste Element des aktuellen Knotens. */
        public QueueNode getNext() {
            return nextNode;
        }

        /** Liefert das Inhaltsobjekt des Knotens vom Typ ContentType. */
        public ContentType getContent() {
            return content;
        }
    }

    /* ---------- Ende der privaten inneren Klasse QueueNode ---------- */

    private QueueNode head;
    private QueueNode tail;

    /** Eine leere Schlange wird erzeugt. */
    public Queue() {
        head = null;
        tail = null;
    }

    /** Die Anfrage liefert den Wert true, wenn die Schlange leer ist. */
    public boolean isEmpty() {
        return head == null;
    }

    /**
     * Das Objekt pContent wird an die Schlange angehängt.
     * Falls pContent gleich null ist, bleibt die Schlange unverändert.
     */
    public void enqueue(ContentType pContent) {
        if (pContent != null) {
            QueueNode newNode = new QueueNode(pContent);
            if (this.isEmpty()) {
                head = newNode;
                tail = newNode;
            } else {
                tail.setNext(newNode);
                tail = newNode;
            }
        }
    }

    /**
     * Das erste Objekt wird aus der Schlange entfernt.
     * Falls die Schlange leer ist, wird sie nicht verändert.
     */
    public void dequeue() {
        if (!this.isEmpty()) {
            head = head.getNext();
            if (head == null) {
                tail = null;
            }
        }
    }

    /**
     * Die Anfrage liefert das erste Objekt der Schlange.
     * Falls die Schlange leer ist, wird null zurückgegeben.
     */
    public ContentType front() {
        if (this.isEmpty()) {
            return null;
        } else {
            return head.getContent();
        }
    }
}
`;

const STACK_QUELLE = `/**
 * Klasse Stack<ContentType> (NRW-Abiturvorgaben)
 *
 * Objekte der generischen Klasse Stack verwalten beliebige Objekte vom
 * Typ ContentType nach dem Last-In-First-Out-Prinzip (LIFO), d. h. das
 * zuletzt abgelegte Objekt wird als erstes wieder entnommen.
 */
public class Stack<ContentType> {

    /* --------- Anfang der privaten inneren Klasse StackNode --------- */

    private class StackNode {

        private ContentType content = null;
        private StackNode nextNode = null;

        /**
         * Ein neues Objekt vom Typ StackNode wird erschaffen.
         * Der Inhalt wird per Parameter gesetzt, der Verweis ist leer.
         */
        public StackNode(ContentType pContent) {
            content = pContent;
        }

        /** Der Verweis wird auf das Objekt gesetzt, das pNext referenziert. */
        public void setNext(StackNode pNext) {
            nextNode = pNext;
        }

        /** Liefert das nächste Element des aktuellen Knotens. */
        public StackNode getNext() {
            return nextNode;
        }

        /** Liefert das Inhaltsobjekt des Knotens vom Typ ContentType. */
        public ContentType getContent() {
            return content;
        }
    }

    /* ---------- Ende der privaten inneren Klasse StackNode ---------- */

    private StackNode head;

    /** Ein leerer Stapel wird erzeugt. */
    public Stack() {
        head = null;
    }

    /** Die Anfrage liefert den Wert true, wenn der Stapel leer ist. */
    public boolean isEmpty() {
        return head == null;
    }

    /**
     * Das Objekt pContent wird oben auf den Stapel gelegt.
     * Falls pContent gleich null ist, bleibt der Stapel unverändert.
     */
    public void push(ContentType pContent) {
        if (pContent != null) {
            StackNode newNode = new StackNode(pContent);
            newNode.setNext(head);
            head = newNode;
        }
    }

    /**
     * Das oberste Objekt wird vom Stapel entfernt.
     * Falls der Stapel leer ist, wird er nicht verändert.
     */
    public void pop() {
        if (!this.isEmpty()) {
            head = head.getNext();
        }
    }

    /**
     * Die Anfrage liefert das oberste Objekt des Stapels.
     * Falls der Stapel leer ist, wird null zurückgegeben.
     */
    public ContentType top() {
        if (this.isEmpty()) {
            return null;
        } else {
            return head.getContent();
        }
    }
}
`;

const LIST_QUELLE = `/**
 * Klasse List<ContentType> (NRW-Abiturvorgaben)
 *
 * Objekte der generischen Klasse List verwalten beliebig viele, linear
 * angeordnete Objekte vom Typ ContentType. Auf höchstens ein Listenobjekt,
 * das aktuelle Objekt, kann jeweils zugegriffen werden.
 *
 * Wichtig für den Unterricht: Eine NRW-Liste wird IMMER so durchlaufen:
 *   liste.toFirst();
 *   while (liste.hasAccess()) {
 *       ContentType inhalt = liste.getContent();
 *       liste.next();
 *   }
 */
public class List<ContentType> {

    /* ---------- Anfang der privaten inneren Klasse ListNode ---------- */

    private class ListNode {

        private ContentType contentObject;
        private ListNode next;

        /** Ein neues Objekt wird erschaffen; der Verweis ist leer. */
        private ListNode(ContentType pContent) {
            contentObject = pContent;
            next = null;
        }

        /** Liefert das Inhaltsobjekt des Knotens. */
        public ContentType getContentObject() {
            return contentObject;
        }

        /** Setzt das Inhaltsobjekt des Knotens. */
        public void setContentObject(ContentType pContent) {
            contentObject = pContent;
        }

        /** Liefert den Nachfolgeknoten. */
        public ListNode getNextNode() {
            return next;
        }

        /** Setzt den Nachfolgeknoten. */
        public void setNextNode(ListNode pNext) {
            next = pNext;
        }
    }

    /* ----------- Ende der privaten inneren Klasse ListNode ----------- */

    private ListNode first;
    private ListNode last;
    private ListNode current;

    /** Eine leere Liste wird erzeugt. */
    public List() {
        first = null;
        last = null;
        current = null;
    }

    /** Die Anfrage liefert den Wert true, wenn die Liste leer ist. */
    public boolean isEmpty() {
        return first == null;
    }

    /**
     * Die Anfrage liefert den Wert true, wenn es ein aktuelles Objekt gibt,
     * sonst liefert sie den Wert false.
     */
    public boolean hasAccess() {
        return current != null;
    }

    /**
     * Falls die Liste nicht leer ist, es ein aktuelles Objekt gibt und dieses
     * nicht das letzte Objekt der Liste ist, wird das dem aktuellen Objekt
     * folgende Objekt zum aktuellen Objekt, andernfalls gibt es nach Ausführung
     * des Auftrags kein aktuelles Objekt.
     */
    public void next() {
        if (this.hasAccess()) {
            current = current.getNextNode();
        }
    }

    /**
     * Falls die Liste nicht leer ist, wird das erste Objekt der Liste zum
     * aktuellen Objekt, andernfalls gibt es kein aktuelles Objekt.
     */
    public void toFirst() {
        if (!this.isEmpty()) {
            current = first;
        }
    }

    /**
     * Falls die Liste nicht leer ist, wird das letzte Objekt der Liste zum
     * aktuellen Objekt, andernfalls gibt es kein aktuelles Objekt.
     */
    public void toLast() {
        if (!this.isEmpty()) {
            current = last;
        }
    }

    /**
     * Falls es ein aktuelles Objekt gibt, wird das aktuelle Objekt
     * zurückgegeben, andernfalls null.
     */
    public ContentType getContent() {
        if (this.hasAccess()) {
            return current.getContentObject();
        } else {
            return null;
        }
    }

    /**
     * Falls es ein aktuelles Objekt gibt und pContent ungleich null ist,
     * wird das aktuelle Objekt durch pContent ersetzt.
     */
    public void setContent(ContentType pContent) {
        if (pContent != null && this.hasAccess()) {
            current.setContentObject(pContent);
        }
    }

    /**
     * Falls es ein aktuelles Objekt gibt und pContent ungleich null ist, wird
     * ein neues Objekt vor dem aktuellen Objekt in die Liste eingefügt. Das
     * aktuelle Objekt bleibt unverändert. Falls die Liste leer ist, wird
     * pContent eingefügt; es gibt weiterhin kein aktuelles Objekt.
     */
    public void insert(ContentType pContent) {
        if (pContent != null) {
            if (this.hasAccess()) {
                ListNode newNode = new ListNode(pContent);
                if (current != first) {
                    ListNode previous = this.getPrevious(current);
                    newNode.setNextNode(previous.getNextNode());
                    previous.setNextNode(newNode);
                } else {
                    newNode.setNextNode(first);
                    first = newNode;
                }
            } else {
                if (this.isEmpty()) {
                    ListNode newNode = new ListNode(pContent);
                    first = newNode;
                    last = newNode;
                }
            }
        }
    }

    /**
     * Falls pContent ungleich null ist, wird ein neues Objekt mit pContent
     * am Ende der Liste angehängt. Das aktuelle Objekt bleibt unverändert.
     */
    public void append(ContentType pContent) {
        if (pContent != null) {
            if (this.isEmpty()) {
                this.insert(pContent);
            } else {
                ListNode newNode = new ListNode(pContent);
                last.setNextNode(newNode);
                last = newNode;
            }
        }
    }

    /**
     * Falls pList ungleich null und nicht leer ist, wird pList an die Liste
     * angehängt. Anschließend ist pList leer. Das aktuelle Objekt bleibt
     * unverändert.
     */
    public void concat(List<ContentType> pList) {
        if (pList != null && pList != this && !pList.isEmpty()) {
            if (this.isEmpty()) {
                first = pList.first;
                last = pList.last;
            } else {
                last.setNextNode(pList.first);
                last = pList.last;
            }
            pList.first = null;
            pList.last = null;
            pList.current = null;
        }
    }

    /**
     * Falls es ein aktuelles Objekt gibt, wird das aktuelle Objekt gelöscht
     * und das Objekt hinter dem gelöschten Objekt wird zum aktuellen Objekt.
     * Wird das letzte Objekt gelöscht, gibt es kein aktuelles Objekt mehr.
     */
    public void remove() {
        if (this.hasAccess() && !this.isEmpty()) {
            if (current == first) {
                first = first.getNextNode();
            } else {
                ListNode previous = this.getPrevious(current);
                if (current == last) {
                    last = previous;
                }
                previous.setNextNode(current.getNextNode());
            }
            ListNode temp = current.getNextNode();
            current.setContentObject(null);
            current.setNextNode(null);
            current = temp;
            if (this.isEmpty()) {
                last = null;
            }
        }
    }

    /**
     * Liefert den Vorgängerknoten des Knotens pNode. Falls pNode nicht in
     * der Liste oder der erste Knoten ist, wird null zurückgegeben.
     */
    private ListNode getPrevious(ListNode pNode) {
        if (pNode != null && pNode != first && !this.isEmpty()) {
            ListNode temp = first;
            while (temp != null && temp.getNextNode() != pNode) {
                temp = temp.getNextNode();
            }
            return temp;
        } else {
            return null;
        }
    }
}
`;

export const NRW_BIBLIOTHEK: BibliothekEintrag[] = [
  {
    name: "Stack",
    titel: "Stack<ContentType> — Stapel (LIFO)",
    beschreibung: "isEmpty() · push(pContent) · pop() · top(). Lineare Struktur nach dem Last-In-First-Out-Prinzip.",
    code: STACK_QUELLE,
  },
  {
    name: "Queue",
    titel: "Queue<ContentType> — Schlange (FIFO)",
    beschreibung: "isEmpty() · enqueue(pContent) · dequeue() · front(). Lineare Struktur nach dem First-In-First-Out-Prinzip.",
    code: QUEUE_QUELLE,
  },
  {
    name: "List",
    titel: "List<ContentType> — lineare Liste",
    beschreibung:
      "isEmpty() · hasAccess() · next() · toFirst() · toLast() · getContent() · setContent() · insert() · append() · concat() · remove(). Mit interner Positionsanzeige („aktuelles Objekt“).",
    code: LIST_QUELLE,
  },
];
