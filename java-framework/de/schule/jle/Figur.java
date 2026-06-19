package de.schule.jle;

/**
 * Eine Figur in der JavaWelt.
 *
 * Bewusst einfach gehalten – und ohne Pflicht-Vererbung (anders als
 * Greenfoots {@code Actor}): Eine Figur ist ein ganz normales Objekt, das
 * man erzeugt und steuert. So lernt man zuerst den Objektbegriff, bevor
 * Vererbung eingeführt wird.
 *
 * <pre>
 *   Figur bello = new Figur("Bello");
 *   bello.geheVor(100);
 *   bello.dreheDich(90);
 * </pre>
 *
 * Die {@code nativ*}-Methoden werden in JavaScript implementiert (CheerpJ)
 * und steuern die sichtbare Figur in der Welt-Engine.
 */
public class Figur {
  private final int id;

  public Figur(String name) {
    this.id = nativErzeuge(name);
  }

  /** Bewegt die Figur {@code pixel} Schritte in Blickrichtung. */
  public void geheVor(int pixel) {
    nativGeheVor(id, pixel);
  }

  /** Dreht die Figur um {@code grad} Grad (im Uhrzeigersinn). */
  public void dreheDich(int grad) {
    nativDreheDich(id, grad);
  }

  /** Setzt die Figur an eine feste Position. */
  public void setzePosition(int x, int y) {
    nativSetzePosition(id, x, y);
  }

  /** Zeigt einen kurzen Text als Sprechblase. */
  public void sage(String text) {
    nativSage(id, text);
  }

  // --- in JavaScript implementiert (CheerpJ-Natives) ---------------------
  private static native int nativErzeuge(String name);

  private static native void nativGeheVor(int id, int pixel);

  private static native void nativDreheDich(int id, int grad);

  private static native void nativSetzePosition(int id, int x, int y);

  private static native void nativSage(int id, String text);
}
