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
  /** Klassen, die mitinstalliert werden müssen (z. B. Graph → List). */
  benoetigt?: string[];
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

const COMPARABLE_CONTENT_QUELLE = `/**
 * Interface ComparableContent<ContentType> (NRW-Abiturvorgaben)
 *
 * Damit Objekte in einen binären Suchbaum (BinarySearchTree) eingefügt
 * werden können, muss ihre Klasse dieses Interface implementieren, d. h.
 * die drei Vergleichsmethoden bereitstellen:
 *
 *   public class Schueler implements ComparableContent<Schueler> { ... }
 */
public interface ComparableContent<ContentType> {

    /** true, wenn dieses Objekt größer als pContent ist. */
    public boolean isGreater(ContentType pContent);

    /** true, wenn dieses Objekt gleich pContent ist. */
    public boolean isEqual(ContentType pContent);

    /** true, wenn dieses Objekt kleiner als pContent ist. */
    public boolean isLess(ContentType pContent);
}
`;

const BINARYTREE_QUELLE = `/**
 * Klasse BinaryTree<ContentType> (NRW-Abiturvorgaben)
 *
 * Objekte der generischen Klasse BinaryTree verwalten beliebige Objekte
 * vom Typ ContentType in einem Binärbaum. Ein Binärbaum ist entweder leer
 * oder er besteht aus einer Wurzel mit Inhalt sowie einem linken und einem
 * rechten Teilbaum, die wiederum Binärbäume sind.
 */
public class BinaryTree<ContentType> {

    /* --------- Anfang der privaten inneren Klasse BTNode ------------ */

    private class BTNode<CT> {

        private CT content;
        private BinaryTree<CT> left, right;

        public BTNode(CT pContent) {
            this.content = pContent;
            left = new BinaryTree<CT>();
            right = new BinaryTree<CT>();
        }
    }

    /* ---------- Ende der privaten inneren Klasse BTNode ------------- */

    private BTNode<ContentType> node;

    /** Ein leerer Binärbaum wird erzeugt. */
    public BinaryTree() {
        this.node = null;
    }

    /** Ein Binärbaum mit Wurzelinhalt pContent und leeren Teilbäumen. */
    public BinaryTree(ContentType pContent) {
        if (pContent != null) {
            this.node = new BTNode<ContentType>(pContent);
        } else {
            this.node = null;
        }
    }

    /**
     * Ein Binärbaum mit Wurzelinhalt pContent sowie linkem Teilbaum
     * pLeftTree und rechtem Teilbaum pRightTree wird erzeugt.
     */
    public BinaryTree(ContentType pContent, BinaryTree<ContentType> pLeftTree,
            BinaryTree<ContentType> pRightTree) {
        if (pContent != null) {
            this.node = new BTNode<ContentType>(pContent);
            if (pLeftTree != null) {
                this.node.left = pLeftTree;
            } else {
                this.node.left = new BinaryTree<ContentType>();
            }
            if (pRightTree != null) {
                this.node.right = pRightTree;
            } else {
                this.node.right = new BinaryTree<ContentType>();
            }
        } else {
            this.node = null;
        }
    }

    /** Die Anfrage liefert den Wert true, wenn der Binärbaum leer ist. */
    public boolean isEmpty() {
        return this.node == null;
    }

    /**
     * Falls pContent ungleich null ist, wird der Inhalt der Wurzel auf
     * pContent gesetzt (bei leerem Baum entstehen zwei leere Teilbäume).
     */
    public void setContent(ContentType pContent) {
        if (pContent != null) {
            if (this.isEmpty()) {
                this.node = new BTNode<ContentType>(pContent);
            } else {
                this.node.content = pContent;
            }
        }
    }

    /** Liefert das Inhaltsobjekt der Wurzel (null bei leerem Baum). */
    public ContentType getContent() {
        if (this.isEmpty()) {
            return null;
        } else {
            return this.node.content;
        }
    }

    /** Setzt den linken Teilbaum, falls der Baum nicht leer ist. */
    public void setLeftTree(BinaryTree<ContentType> pTree) {
        if (!this.isEmpty() && pTree != null) {
            this.node.left = pTree;
        }
    }

    /** Setzt den rechten Teilbaum, falls der Baum nicht leer ist. */
    public void setRightTree(BinaryTree<ContentType> pTree) {
        if (!this.isEmpty() && pTree != null) {
            this.node.right = pTree;
        }
    }

    /** Liefert den linken Teilbaum (null bei leerem Baum). */
    public BinaryTree<ContentType> getLeftTree() {
        if (!this.isEmpty()) {
            return this.node.left;
        } else {
            return null;
        }
    }

    /** Liefert den rechten Teilbaum (null bei leerem Baum). */
    public BinaryTree<ContentType> getRightTree() {
        if (!this.isEmpty()) {
            return this.node.right;
        } else {
            return null;
        }
    }
}
`;

const BST_QUELLE = `/**
 * Klasse BinarySearchTree<ContentType> (NRW-Abiturvorgaben)
 *
 * Objekte der Klasse verwalten ihre Inhaltsobjekte in einem binären
 * Suchbaum. Der Inhaltstyp muss das Interface
 * ComparableContent<ContentType> implementieren (isGreater/isEqual/isLess).
 */
public class BinarySearchTree<ContentType extends ComparableContent<ContentType>> {

    /* -------- Anfang der privaten inneren Klasse BSTNode ------------ */

    private class BSTNode<CT extends ComparableContent<CT>> {

        private CT content;
        private BinarySearchTree<CT> left, right;

        public BSTNode(CT pContent) {
            this.content = pContent;
            left = new BinarySearchTree<CT>();
            right = new BinarySearchTree<CT>();
        }
    }

    /* --------- Ende der privaten inneren Klasse BSTNode ------------- */

    private BSTNode<ContentType> node;

    /** Ein leerer Suchbaum wird erzeugt. */
    public BinarySearchTree() {
        this.node = null;
    }

    /** Die Anfrage liefert den Wert true, wenn der Suchbaum leer ist. */
    public boolean isEmpty() {
        return this.node == null;
    }

    /**
     * Falls pContent ungleich null und noch nicht im Baum vorhanden ist,
     * wird pContent entsprechend der Ordnungsrelation einsortiert.
     */
    public void insert(ContentType pContent) {
        if (pContent != null) {
            if (this.isEmpty()) {
                this.node = new BSTNode<ContentType>(pContent);
            } else if (pContent.isLess(this.node.content)) {
                this.node.left.insert(pContent);
            } else if (pContent.isGreater(this.node.content)) {
                this.node.right.insert(pContent);
            }
        }
    }

    /** Liefert das Inhaltsobjekt der Wurzel (null bei leerem Baum). */
    public ContentType getContent() {
        if (this.isEmpty()) {
            return null;
        } else {
            return this.node.content;
        }
    }

    /** Liefert den linken Teilbaum (null bei leerem Baum). */
    public BinarySearchTree<ContentType> getLeftTree() {
        if (this.isEmpty()) {
            return null;
        } else {
            return this.node.left;
        }
    }

    /** Liefert den rechten Teilbaum (null bei leerem Baum). */
    public BinarySearchTree<ContentType> getRightTree() {
        if (this.isEmpty()) {
            return null;
        } else {
            return this.node.right;
        }
    }

    /**
     * Sucht pContent im Suchbaum und liefert das gefundene Inhaltsobjekt
     * zurück (oder null, wenn es nicht vorhanden ist).
     */
    public ContentType search(ContentType pContent) {
        if (this.isEmpty() || pContent == null) {
            return null;
        } else {
            ContentType content = this.getContent();
            if (pContent.isLess(content)) {
                return this.getLeftTree().search(pContent);
            } else if (pContent.isGreater(content)) {
                return this.getRightTree().search(pContent);
            } else if (pContent.isEqual(content)) {
                return content;
            } else {
                return null;
            }
        }
    }

    /**
     * Falls ein zu pContent gleiches Objekt im Baum enthalten ist, wird
     * dieses entfernt; der Baum bleibt dabei ein binärer Suchbaum.
     */
    public void remove(ContentType pContent) {
        if (this.isEmpty() || pContent == null) {
            return;
        }
        if (pContent.isLess(this.node.content)) {
            this.node.left.remove(pContent);
        } else if (pContent.isGreater(this.node.content)) {
            this.node.right.remove(pContent);
        } else {
            if (this.node.left.isEmpty()) {
                if (this.node.right.isEmpty()) {
                    this.node = null;
                } else {
                    this.node = this.getNodeOfRightSuccessor();
                }
            } else if (this.node.right.isEmpty()) {
                this.node = this.getNodeOfLeftSuccessor();
            } else {
                if (this.getNodeOfRightSuccessor().left.isEmpty()) {
                    this.node.content = this.getNodeOfRightSuccessor().content;
                    this.node.right = this.getNodeOfRightSuccessor().right;
                } else {
                    BinarySearchTree<ContentType> previous =
                            this.node.right.ancestorOfSmallRight();
                    BSTNode<ContentType> smallest = previous.node.left.node;
                    this.node.content = smallest.content;
                    previous.remove(smallest.content);
                }
            }
        }
    }

    /**
     * Liefert den Vorgänger-Suchbaum des kleinsten Inhaltsobjekts im
     * rechten Teilbaum (Hilfsmethode für remove).
     */
    private BinarySearchTree<ContentType> ancestorOfSmallRight() {
        if (this.getNodeOfLeftSuccessor().left.isEmpty()) {
            return this;
        } else {
            return this.node.left.ancestorOfSmallRight();
        }
    }

    private BSTNode<ContentType> getNodeOfLeftSuccessor() {
        return this.node.left.node;
    }

    private BSTNode<ContentType> getNodeOfRightSuccessor() {
        return this.node.right.node;
    }
}
`;

const VERTEX_QUELLE = `/**
 * Klasse Vertex (NRW-Abiturvorgaben)
 *
 * Objekte der Klasse Vertex sind Knoten eines Graphen mit eindeutiger
 * ID-Bezeichnung. Sie können markiert werden (z. B. für Suchverfahren).
 */
public class Vertex {

    private String id;
    private boolean mark;

    /** Ein Knoten mit der ID pID wird erzeugt; die Markierung ist false. */
    public Vertex(String pID) {
        id = pID;
        mark = false;
    }

    /** Die Anfrage liefert die ID des Knotens. */
    public String getID() {
        return id;
    }

    /** Der Knoten wird markiert (true) bzw. die Markierung entfernt (false). */
    public void setMark(boolean pMark) {
        mark = pMark;
    }

    /** Die Anfrage liefert true, wenn der Knoten markiert ist. */
    public boolean isMarked() {
        return mark;
    }
}
`;

const EDGE_QUELLE = `/**
 * Klasse Edge (NRW-Abiturvorgaben)
 *
 * Objekte der Klasse Edge sind ungerichtete, gewichtete Kanten eines
 * Graphen. Sie verbinden zwei Knoten und können markiert werden.
 */
public class Edge {

    private Vertex[] vertices;
    private double weight;
    private boolean mark;

    /**
     * Eine Kante zwischen pVertex und pAnotherVertex mit dem Gewicht
     * pWeight wird erzeugt; die Markierung ist false.
     */
    public Edge(Vertex pVertex, Vertex pAnotherVertex, double pWeight) {
        vertices = new Vertex[2];
        vertices[0] = pVertex;
        vertices[1] = pAnotherVertex;
        weight = pWeight;
        mark = false;
    }

    /** Liefert die beiden verbundenen Knoten als Feld der Länge 2. */
    public Vertex[] getVertices() {
        return vertices;
    }

    /** Setzt das Gewicht der Kante auf pWeight. */
    public void setWeight(double pWeight) {
        weight = pWeight;
    }

    /** Die Anfrage liefert das Gewicht der Kante. */
    public double getWeight() {
        return weight;
    }

    /** Die Kante wird markiert (true) bzw. die Markierung entfernt (false). */
    public void setMark(boolean pMark) {
        mark = pMark;
    }

    /** Die Anfrage liefert true, wenn die Kante markiert ist. */
    public boolean isMarked() {
        return mark;
    }
}
`;

const GRAPH_QUELLE = `/**
 * Klasse Graph (NRW-Abiturvorgaben)
 *
 * Objekte der Klasse Graph sind ungerichtete, gewichtete Graphen aus
 * Knoten (Vertex) und Kanten (Edge). Die Listen, die der Graph liefert
 * (getVertices, getNeighbours, ...), sind NRW-Listen und werden mit
 * toFirst()/hasAccess()/getContent()/next() durchlaufen.
 */
public class Graph {

    private List<Vertex> vertices;
    private List<Edge> edges;

    /** Ein leerer Graph wird erzeugt. */
    public Graph() {
        vertices = new List<Vertex>();
        edges = new List<Edge>();
    }

    /** Die Anfrage liefert true, wenn der Graph keine Knoten enthält. */
    public boolean isEmpty() {
        return vertices.isEmpty();
    }

    /**
     * Der Knoten pVertex wird dem Graphen hinzugefügt, falls es noch
     * keinen Knoten mit derselben ID gibt.
     */
    public void addVertex(Vertex pVertex) {
        if (pVertex != null && pVertex.getID() != null
                && getVertex(pVertex.getID()) == null) {
            vertices.append(pVertex);
        }
    }

    /**
     * Die Kante pEdge wird dem Graphen hinzugefügt, falls ihre beiden
     * Knoten im Graphen liegen, verschieden sind und es noch keine Kante
     * zwischen ihnen gibt.
     */
    public void addEdge(Edge pEdge) {
        if (pEdge != null) {
            Vertex[] enden = pEdge.getVertices();
            if (enden[0] != null && enden[1] != null && enden[0] != enden[1]
                    && getVertex(enden[0].getID()) == enden[0]
                    && getVertex(enden[1].getID()) == enden[1]
                    && getEdge(enden[0], enden[1]) == null) {
                edges.append(pEdge);
            }
        }
    }

    /** Liefert den Knoten mit der ID pID (oder null). */
    public Vertex getVertex(String pID) {
        Vertex ergebnis = null;
        vertices.toFirst();
        while (vertices.hasAccess() && ergebnis == null) {
            if (vertices.getContent().getID().equals(pID)) {
                ergebnis = vertices.getContent();
            }
            vertices.next();
        }
        return ergebnis;
    }

    /** Entfernt pVertex samt aller Kanten, die zu ihm führen. */
    public void removeVertex(Vertex pVertex) {
        edges.toFirst();
        while (edges.hasAccess()) {
            Vertex[] enden = edges.getContent().getVertices();
            if (enden[0] == pVertex || enden[1] == pVertex) {
                edges.remove();
            } else {
                edges.next();
            }
        }
        vertices.toFirst();
        while (vertices.hasAccess()) {
            if (vertices.getContent() == pVertex) {
                vertices.remove();
            } else {
                vertices.next();
            }
        }
    }

    /** Entfernt die Kante pEdge aus dem Graphen. */
    public void removeEdge(Edge pEdge) {
        edges.toFirst();
        while (edges.hasAccess()) {
            if (edges.getContent() == pEdge) {
                edges.remove();
            } else {
                edges.next();
            }
        }
    }

    /** Liefert eine neue Liste aller Knoten des Graphen. */
    public List<Vertex> getVertices() {
        List<Vertex> ergebnis = new List<Vertex>();
        vertices.toFirst();
        while (vertices.hasAccess()) {
            ergebnis.append(vertices.getContent());
            vertices.next();
        }
        return ergebnis;
    }

    /** Liefert eine neue Liste aller Kanten des Graphen. */
    public List<Edge> getEdges() {
        List<Edge> ergebnis = new List<Edge>();
        edges.toFirst();
        while (edges.hasAccess()) {
            ergebnis.append(edges.getContent());
            edges.next();
        }
        return ergebnis;
    }

    /** Liefert eine neue Liste aller Kanten, die an pVertex hängen. */
    public List<Edge> getEdges(Vertex pVertex) {
        List<Edge> ergebnis = new List<Edge>();
        edges.toFirst();
        while (edges.hasAccess()) {
            Vertex[] enden = edges.getContent().getVertices();
            if (enden[0] == pVertex || enden[1] == pVertex) {
                ergebnis.append(edges.getContent());
            }
            edges.next();
        }
        return ergebnis;
    }

    /** Liefert eine neue Liste aller Nachbarknoten von pVertex. */
    public List<Vertex> getNeighbours(Vertex pVertex) {
        List<Vertex> ergebnis = new List<Vertex>();
        edges.toFirst();
        while (edges.hasAccess()) {
            Vertex[] enden = edges.getContent().getVertices();
            if (enden[0] == pVertex) {
                ergebnis.append(enden[1]);
            } else if (enden[1] == pVertex) {
                ergebnis.append(enden[0]);
            }
            edges.next();
        }
        return ergebnis;
    }

    /** Liefert die Kante zwischen pVertex und pAnotherVertex (oder null). */
    public Edge getEdge(Vertex pVertex, Vertex pAnotherVertex) {
        Edge ergebnis = null;
        edges.toFirst();
        while (edges.hasAccess() && ergebnis == null) {
            Vertex[] enden = edges.getContent().getVertices();
            if ((enden[0] == pVertex && enden[1] == pAnotherVertex)
                    || (enden[0] == pAnotherVertex && enden[1] == pVertex)) {
                ergebnis = edges.getContent();
            }
            edges.next();
        }
        return ergebnis;
    }

    /** Setzt die Markierung ALLER Knoten auf pMark. */
    public void setAllVertexMarks(boolean pMark) {
        vertices.toFirst();
        while (vertices.hasAccess()) {
            vertices.getContent().setMark(pMark);
            vertices.next();
        }
    }

    /** Setzt die Markierung ALLER Kanten auf pMark. */
    public void setAllEdgeMarks(boolean pMark) {
        edges.toFirst();
        while (edges.hasAccess()) {
            edges.getContent().setMark(pMark);
            edges.next();
        }
    }

    /** Die Anfrage liefert true, wenn alle Knoten markiert sind. */
    public boolean allVerticesMarked() {
        boolean ergebnis = true;
        vertices.toFirst();
        while (vertices.hasAccess()) {
            if (!vertices.getContent().isMarked()) {
                ergebnis = false;
            }
            vertices.next();
        }
        return ergebnis;
    }

    /** Die Anfrage liefert true, wenn alle Kanten markiert sind. */
    public boolean allEdgesMarked() {
        boolean ergebnis = true;
        edges.toFirst();
        while (edges.hasAccess()) {
            if (!edges.getContent().isMarked()) {
                ergebnis = false;
            }
            edges.next();
        }
        return ergebnis;
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
  {
    name: "BinaryTree",
    titel: "BinaryTree<ContentType> — Binärbaum",
    beschreibung:
      "Drei Konstruktoren · isEmpty() · getContent() · setContent() · getLeftTree() · getRightTree() · setLeftTree() · setRightTree(). Grundlage für Traversierungen.",
    code: BINARYTREE_QUELLE,
  },
  {
    name: "BinarySearchTree",
    titel: "BinarySearchTree<ContentType> — binärer Suchbaum",
    beschreibung:
      "isEmpty() · insert() · search() · remove() · getContent() · getLeftTree() · getRightTree(). Der Inhaltstyp implementiert ComparableContent (wird mitinstalliert).",
    code: BST_QUELLE,
    benoetigt: ["ComparableContent"],
  },
  {
    name: "ComparableContent",
    titel: "ComparableContent<ContentType> — Interface",
    beschreibung:
      "isGreater() · isEqual() · isLess(). Muss vom Inhaltstyp eines binären Suchbaums implementiert werden.",
    code: COMPARABLE_CONTENT_QUELLE,
  },
  {
    name: "Graph",
    titel: "Graph — ungerichteter, gewichteter Graph",
    beschreibung:
      "addVertex/addEdge · getVertex/getEdge · getVertices/getEdges/getNeighbours (als NRW-List) · Markierungen für Such-/Wegalgorithmen. Vertex, Edge und List werden mitinstalliert.",
    code: GRAPH_QUELLE,
    benoetigt: ["Vertex", "Edge", "List"],
  },
  {
    name: "Vertex",
    titel: "Vertex — Knoten eines Graphen",
    beschreibung: "Vertex(String pID) · getID() · setMark() · isMarked().",
    code: VERTEX_QUELLE,
  },
  {
    name: "Edge",
    titel: "Edge — gewichtete Kante eines Graphen",
    beschreibung: "Edge(v1, v2, gewicht) · getVertices() · getWeight()/setWeight() · setMark()/isMarked().",
    code: EDGE_QUELLE,
  },
];

/** Einen Eintrag samt Name nachschlagen. */
export function bibliothekEintrag(name: string): BibliothekEintrag | null {
  return NRW_BIBLIOTHEK.find((e) => e.name === name) ?? null;
}
