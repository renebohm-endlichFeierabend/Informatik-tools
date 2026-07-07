package de.schule.jle;

/**
 * Die Welt ist die Bühne, auf der die Figuren leben – und zugleich das
 * Programm: In deiner eigenen Weltklasse läuft das Spiel ab.
 *
 * <pre>
 *   public class MeineWelt extends Welt {
 *
 *       public void bereiteVor() {
 *           // Figuren erzeugen und platzieren
 *       }
 *
 *       public void spiele() {
 *           while (laeuft()) {
 *               // ein Spielschritt
 *               warte(100);
 *           }
 *       }
 *   }
 * </pre>
 *
 * Beim Start ruft die Umgebung erst {@link #bereiteVor()} auf (einmal),
 * danach {@link #spiele()} – dort gehört die Spielschleife hin.
 */
public class Welt {
  /** Breite der Welt in Pixeln. */
  public static final int BREITE = 720;

  /** Höhe der Welt in Pixeln. */
  public static final int HOEHE = 480;

  /** Startet die Welt: erst {@link #bereiteVor()}, dann {@link #spiele()}. */
  public final void starte() {
    bereiteVor();
    spiele();
  }

  /** Wird einmal am Anfang aufgerufen: Figuren erzeugen und platzieren. */
  public void bereiteVor() {
  }

  /** Das eigentliche Spiel – hier läuft deine Spielschleife. */
  public void spiele() {
  }

  /**
   * Gibt {@code true} zurück, solange das Spiel läuft (Stopp-Knopf noch
   * nicht gedrückt). Typische Verwendung: {@code while (laeuft()) { ... }}
   */
  public boolean laeuft() {
    return nativLaeuft();
  }

  /** Hält das Programm {@code millis} Millisekunden an (1000 = 1 Sekunde). */
  public void warte(int millis) {
    try {
      Thread.sleep(millis);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
  }

  /** Gibt eine Zufallszahl zwischen {@code von} und {@code bis} zurück (beide inklusive). */
  public int zufallszahl(int von, int bis) {
    return von + (int) (Math.random() * (bis - von + 1));
  }

  // --- in JavaScript implementiert (CheerpJ-Native) -----------------------
  private static native boolean nativLaeuft();
}
