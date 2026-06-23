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
 * Die <b>Bewegung</b> wird hier in echtem Java berechnet (Trigonometrie!):
 * {@link #geheVor(int)} rechnet aus Blickrichtung und Schrittweite die
 * Verschiebung in x- und y-Richtung aus. Nur das *Anzeigen* übernimmt die
 * Welt-Engine über die {@code nativ*}-Methoden (in JavaScript implementiert).
 * So sehen Schülerinnen und Schüler, wie die Bewegung wirklich funktioniert.
 */
public class Figur {
  /** Verbindung zur sichtbaren Figur in der Welt. */
  private final int id;

  /** Blickrichtung in Grad. 0 = nach rechts, 90 = nach unten. */
  private int winkel = 0;

  public Figur(String name) {
    this.id = nativErzeuge(name);
  }

  /**
   * Bewegt die Figur {@code pixel} Schritte in ihre aktuelle Blickrichtung.
   *
   * Die neue Position entsteht aus etwas Trigonometrie: In Blickrichtung
   * {@code winkel} legt die Figur {@code pixel} Schritte zurück. Wie weit
   * das nach rechts (x) bzw. nach unten (y) ist, liefern Kosinus und Sinus.
   */
  public void geheVor(int pixel) {
    double bogenmass = Math.toRadians(winkel);
    int dx = (int) Math.round(Math.cos(bogenmass) * pixel);
    int dy = (int) Math.round(Math.sin(bogenmass) * pixel);
    nativVerschiebe(id, dx, dy);
  }

  /** Dreht die Figur um {@code grad} Grad (im Uhrzeigersinn). */
  public void dreheDich(int grad) {
    winkel = (winkel + grad) % 360;
    nativDrehe(id, grad);
  }

  /** Gibt die aktuelle Blickrichtung in Grad zurück (0 = nach rechts). */
  public int gibWinkel() {
    return winkel;
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
  // Diese Methoden verbinden die Figur mit der sichtbaren Welt-Engine.
  private static native int nativErzeuge(String name);

  private static native void nativVerschiebe(int id, int dx, int dy);

  private static native void nativDrehe(int id, int grad);

  private static native void nativSetzePosition(int id, int x, int y);

  private static native void nativSage(int id, String text);
}
