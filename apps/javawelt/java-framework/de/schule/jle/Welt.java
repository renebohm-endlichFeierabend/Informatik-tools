package de.schule.jle;

/**
 * Die Welt ist die Bühne, auf der die Figuren leben.
 *
 * Wichtiger Unterschied zu Greenfoot: Die Welt EXISTIERT bereits – sie muss
 * NICHT beerbt werden. Du kannst sie hier aber lesen und anpassen, um deine
 * Szene einzurichten.
 *
 * Verwendung aus dem Spielcode:
 * <pre>
 *   Welt welt = new Welt();
 *   welt.bereiteVor();
 * </pre>
 */
public class Welt {

  public Welt() {
  }

  /**
   * Richtet die Welt ein: Hier erzeugst und platzierst du deine Figuren.
   * Ändere diese Methode, um deine eigene Start-Szene zu bauen.
   */
  public void bereiteVor() {
    Figur held = new Figur("Held");
    held.setzePosition(160, 240);
    held.sage("Auf geht's!");
  }
}
