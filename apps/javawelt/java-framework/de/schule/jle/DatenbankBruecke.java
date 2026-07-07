package de.schule.jle;

/**
 * Interne Brücke zur SQL-Datenbank der JavaWelt (SQLite im Browser).
 * Nicht für Schülercode gedacht – Schülercode benutzt die Klasse
 * DatabaseConnector aus der Bibliothek, die dem NRW-Abitur entspricht.
 *
 * Antwortformat (Teile durch U+001E getrennt, Felder durch U+001F):
 *   "ok"                                Anweisung ohne Ergebnis (INSERT …)
 *   "ok␞spalten␞typen␞zeile1␞zeile2…"   Abfrage-Ergebnis
 *   "fehler␞meldung"                    SQL-Fehler
 */
public final class DatenbankBruecke {

  private DatenbankBruecke() {
  }

  /** Führt ein SQL-Statement aus und liefert die kodierte Antwort. */
  public static String fuehreAus(String sql) {
    return nativFuehreAus(sql);
  }

  // In JavaScript implementiert (CheerpJ-Native → sql.js/SQLite).
  private static native String nativFuehreAus(String sql);
}
