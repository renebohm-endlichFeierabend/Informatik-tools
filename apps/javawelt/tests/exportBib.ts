import { NRW_BIBLIOTHEK } from "../src/java/nrwBibliothek";
import { mkdirSync, writeFileSync } from "node:fs";
mkdirSync("tests/.out/javabib", { recursive: true });
for (const e of NRW_BIBLIOTHEK) {
  writeFileSync(`tests/.out/javabib/${e.name}.java`, "import de.schule.jle.*;\n" + e.code);
}
// Zusätzlich ein Nutzer der Strukturen, um die APIs wirklich auszuüben:
writeFileSync("tests/.out/javabib/Probe.java", `import de.schule.jle.*;
public class Probe implements ComparableContent<Probe> {
    private int wert;
    public Probe(int pWert) { wert = pWert; }
    public boolean isGreater(Probe p) { return wert > p.wert; }
    public boolean isEqual(Probe p) { return wert == p.wert; }
    public boolean isLess(Probe p) { return wert < p.wert; }

    public static void teste() {
        Stack<Probe> s = new Stack<Probe>();
        s.push(new Probe(1)); s.pop(); boolean a = s.isEmpty(); Probe t = s.top();
        Queue<Probe> q = new Queue<Probe>();
        q.enqueue(new Probe(2)); q.dequeue(); Probe f = q.front();
        List<Probe> l = new List<Probe>();
        l.append(new Probe(3)); l.toFirst();
        while (l.hasAccess()) { l.getContent(); l.next(); }
        l.toLast(); l.insert(new Probe(4)); l.remove(); l.concat(new List<Probe>());
        BinaryTree<Probe> b = new BinaryTree<Probe>(new Probe(5),
            new BinaryTree<Probe>(), new BinaryTree<Probe>());
        b.setLeftTree(new BinaryTree<Probe>(new Probe(6)));
        b.getRightTree(); b.getContent(); b.setContent(new Probe(7));
        BinarySearchTree<Probe> bst = new BinarySearchTree<Probe>();
        bst.insert(new Probe(8)); bst.insert(new Probe(3)); bst.insert(new Probe(12));
        bst.search(new Probe(3)); bst.remove(new Probe(8));
        bst.getLeftTree(); bst.getRightTree();
        Graph g = new Graph();
        Vertex v1 = new Vertex("A"); Vertex v2 = new Vertex("B");
        g.addVertex(v1); g.addVertex(v2);
        g.addEdge(new Edge(v1, v2, 4.5));
        List<Vertex> nachbarn = g.getNeighbours(v1);
        g.setAllVertexMarks(false); g.allVerticesMarked();
        g.getEdge(v1, v2).setMark(true);
        g.removeEdge(g.getEdge(v1, v2)); g.removeVertex(v2);
    }
}
`);
console.log("geschrieben:", NRW_BIBLIOTHEK.map((e) => e.name).join(", "));
