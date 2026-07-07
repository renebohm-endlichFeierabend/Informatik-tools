package de.schule.jle;

/**
 * Eine Figur in der JavaWelt.
 *
 * Eigene Klassen erben von Figur – mehr Gerüst braucht es nicht:
 *
 * <pre>
 *   public class Roboter extends Figur {
 *
 *       public void laufeQuadrat(int seite) {
 *           for (int i = 0; i &lt; 4; i++) {
 *               geheVor(seite);
 *               dreheDich(90);
 *           }
 *       }
 *   }
 * </pre>
 *
 * Es ist bewusst KEIN eigener Konstruktor und KEIN super(...)-Aufruf nötig:
 * Figur hat einen parameterlosen Konstruktor, den Java automatisch aufruft.
 *
 * Die <b>Bewegung</b> wird hier in echtem Java berechnet (Trigonometrie!):
 * {@link #geheVor(int)} rechnet aus Blickrichtung und Schrittweite die
 * Verschiebung in x- und y-Richtung aus. Nur das *Anzeigen* übernimmt die
 * Welt-Engine über die {@code nativ*}-Methoden (in JavaScript implementiert).
 */
public class Figur {
  /** Verbindung zur sichtbaren Figur in der Welt (nicht für Schülercode). */
  final int id;

  /** Blickrichtung in Grad. 0 = nach rechts, 90 = nach unten. */
  private int winkel = 0;

  /** Erzeugt eine Figur; der Name wird automatisch vergeben (z. B. "roboter1"). */
  public Figur() {
    this.id = nativErzeuge("", getClass().getSimpleName());
    Steuerung.merke(this);
  }

  /** Erzeugt eine Figur mit eigenem Namen. */
  public Figur(String name) {
    this.id = nativErzeuge(name, getClass().getSimpleName());
    Steuerung.merke(this);
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
    winkel = Math.floorMod(winkel + grad, 360);
    nativDrehe(id, grad);
  }

  /** Setzt die Figur an eine feste Position. */
  public void setzePosition(int x, int y) {
    nativSetzePosition(id, x, y);
  }

  /** Zeigt einen kurzen Text als Sprechblase. */
  public void sage(String text) {
    nativSage(id, text);
  }

  /** Gibt der Figur einen neuen Namen (unter der Figur sichtbar). */
  public void nenne(String name) {
    nativBenenne(id, name);
  }

  /** Gibt die aktuelle Blickrichtung in Grad zurück (0 = nach rechts). */
  public int gibWinkel() {
    return winkel;
  }

  /** Gibt die aktuelle x-Position zurück. */
  public int gibX() {
    return nativGibX(id);
  }

  /** Gibt die aktuelle y-Position zurück. */
  public int gibY() {
    return nativGibY(id);
  }

  /** Entfernt die Figur von der Welt. */
  public void entferne() {
    Steuerung.vergiss(this);
    nativEntferne(id);
  }

  // --- in JavaScript implementiert (CheerpJ-Natives) ---------------------
  // Diese Methoden verbinden die Figur mit der sichtbaren Welt-Engine.
  private static native int nativErzeuge(String name, String klasse);

  private static native void nativVerschiebe(int id, int dx, int dy);

  private static native void nativDrehe(int id, int grad);

  private static native void nativSetzePosition(int id, int x, int y);

  private static native void nativSage(int id, String text);

  private static native void nativBenenne(int id, String name);

  private static native void nativEntferne(int id);

  private static native int nativGibX(int id);

  private static native int nativGibY(int id);
}
