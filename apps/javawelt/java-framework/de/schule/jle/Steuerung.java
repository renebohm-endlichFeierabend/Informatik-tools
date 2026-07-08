package de.schule.jle;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

/**
 * Interne Brücke zwischen der Oberfläche (Objektbank) und den Java-Objekten.
 * Nicht für Schülercode gedacht – taucht in der Oberfläche nicht auf.
 *
 * Die Oberfläche erzeugt hierüber per Reflexion Objekte beliebiger
 * Schülerklassen (die von {@link Figur} erben) und ruft deren öffentliche
 * Methoden mit Text-Argumenten auf.
 */
public final class Steuerung {
  /** Engine-Id → Java-Objekt. Jede Figur registriert sich im Konstruktor. */
  private static final Map<Integer, Figur> figuren = new HashMap<>();

  /** Trennzeichen für Argumentlisten, die als ein String übergeben werden. */
  private static final String TRENNER = "\u001F";

  private Steuerung() {
  }

  static void merke(Figur f) {
    figuren.put(f.id, f);
  }

  static void vergiss(Figur f) {
    figuren.remove(f.id);
  }

  /** Vergisst alle Objekte – vor jedem Neu-Kompilieren/Neustart. */
  public static void vergissAlle() {
    figuren.clear();
  }

  /**
   * Sucht die Klasse zum Namen – robust gegenüber der Laufzeitumgebung:
   * {@code Class.forName(String)} nutzt den ClassLoader des Aufrufers, was
   * in der Browser-JVM (CheerpJ) nicht zuverlässig der Loader ist, der die
   * Schülerklassen kennt. Deshalb wird ausdrücklich auch über den Loader
   * dieser Klasse und den Kontext-Loader gesucht – und für Framework-Klassen
   * wie Figur zusätzlich im Paket {@code de.schule.jle}.
   */
  private static Class<?> findeKlasse(String name) throws ClassNotFoundException {
    ClassLoader[] loaders = {
        Steuerung.class.getClassLoader(),
        Thread.currentThread().getContextClassLoader(),
    };
    String[] kandidaten = { name, "de.schule.jle." + name };
    for (String kandidat : kandidaten) {
      try {
        return Class.forName(kandidat);
      } catch (ClassNotFoundException | LinkageError ignoriert) {
        // weiter mit den expliziten Loadern
      }
      for (ClassLoader loader : loaders) {
        if (loader == null) {
          continue;
        }
        try {
          return Class.forName(kandidat, true, loader);
        } catch (ClassNotFoundException | LinkageError ignoriert) {
          // nächster Kandidat
        }
      }
    }
    throw new ClassNotFoundException(name);
  }

  /** Zerlegt die Argumentliste; die Anzahl kommt getrennt mit, weil sich
   *  "keine Argumente" und "ein leerer Text" im String nicht unterscheiden. */
  private static String[] zerlegeArgs(int argAnzahl, String argTexte) throws Exception {
    if (argAnzahl <= 0) {
      return new String[0];
    }
    String[] args = argTexte.split(TRENNER, -1);
    if (args.length != argAnzahl) {
      throw new Exception("Interner Fehler: " + argAnzahl + " Argument(e) erwartet, "
          + args.length + " erhalten.");
    }
    return args;
  }

  /** Macht aus dem Grund eines Reflexions-Fehlers eine verständliche Meldung. */
  private static Exception verstaendlich(Throwable ursache) {
    if (ursache instanceof UnsatisfiedLinkError) {
      return new Exception("Interner Fehler: Die Verbindung zur Welt-Anzeige fehlt ("
          + ursache.getMessage() + "). Bitte die Seite neu laden.");
    }
    String meldung = ursache.getMessage();
    return new Exception(meldung == null || meldung.isEmpty() ? ursache.toString() : meldung);
  }

  /**
   * Erzeugt ein Objekt der Klasse und setzt es an die Position (x, y).
   * Die Konstruktor-Argumente kommen als ein String, getrennt durch
   * {@link #TRENNER}, plus ihre Anzahl (0 = Konstruktor ohne Parameter),
   * und werden anhand der Parametertypen umgewandelt (int, double,
   * boolean, String). Gibt die Engine-Id der sichtbaren Figur zurück.
   */
  public static int erzeuge(String klassenName, int x, int y, int argAnzahl, String argTexte)
      throws Exception {
    Class<?> k;
    try {
      k = findeKlasse(klassenName);
    } catch (ClassNotFoundException e) {
      throw new Exception("Die Klasse " + klassenName
          + " wurde in den übersetzten Klassen nicht gefunden – bitte zuerst ✓ Übernehmen drücken.");
    }
    String[] args = zerlegeArgs(argAnzahl, argTexte);
    Object o = null;
    for (Constructor<?> c : k.getDeclaredConstructors()) {
      if (c.getParameterCount() != args.length) {
        continue;
      }
      Object[] werte = wandleAlle(args, c.getParameterTypes());
      if (werte == null) {
        continue;
      }
      try {
        o = c.newInstance(werte);
      } catch (InvocationTargetException e) {
        throw verstaendlich(e.getCause() == null ? e : e.getCause());
      } catch (InstantiationException e) {
        throw new Exception("Die Klasse " + klassenName
            + " ist abstrakt – platziere ein Objekt einer Unterklasse.");
      }
      break;
    }
    if (o == null) {
      throw new Exception(args.length == 0
          ? "Die Klasse " + klassenName + " braucht einen Konstruktor ohne Parameter."
          : "Die Klasse " + klassenName + " hat keinen passenden Konstruktor mit "
              + args.length + " Parameter(n).");
    }
    if (!(o instanceof Figur)) {
      throw new Exception("Die Klasse " + klassenName + " erbt nicht von Figur.");
    }
    Figur f = (Figur) o;
    f.setzePosition(x, y);
    return f.id;
  }

  /** Entfernt das Objekt mit dieser Engine-Id (falls bekannt). */
  public static void entferne(int id) {
    Figur f = figuren.get(id);
    if (f != null) {
      f.entferne();
    }
  }

  /**
   * Ruft eine öffentliche Methode des Objekts auf. Die Argumente kommen als
   * ein String, getrennt durch {@link #TRENNER}, plus ihre Anzahl, und
   * werden anhand der Parametertypen umgewandelt (int, double, boolean,
   * String). Gibt den Rückgabewert als Text zurück ("" bei void).
   */
  public static String rufe(int id, String methodenName, int argAnzahl, String argTexte)
      throws Exception {
    Figur f = figuren.get(id);
    if (f == null) {
      throw new Exception("Objekt nicht (mehr) bekannt – Welt neu befüllen.");
    }
    String[] args = zerlegeArgs(argAnzahl, argTexte);
    for (Method m : f.getClass().getMethods()) {
      if (!m.getName().equals(methodenName) || m.getParameterCount() != args.length) {
        continue;
      }
      Object[] werte = wandleAlle(args, m.getParameterTypes());
      if (werte == null) {
        continue;
      }
      try {
        Object ergebnis = m.invoke(f, werte);
        return ergebnis == null ? "" : String.valueOf(ergebnis);
      } catch (InvocationTargetException e) {
        throw verstaendlich(e.getCause() == null ? e : e.getCause());
      }
    }
    throw new Exception(
        "Keine passende Methode " + methodenName + " mit " + args.length + " Parameter(n).");
  }

  /** Wandelt alle Argumente; null, wenn eines nicht zum Typ passt. */
  private static Object[] wandleAlle(String[] args, Class<?>[] typen) {
    Object[] werte = new Object[args.length];
    for (int i = 0; i < args.length; i++) {
      werte[i] = wandle(args[i], typen[i]);
      if (werte[i] == null) {
        return null;
      }
    }
    return werte;
  }

  private static Object wandle(String text, Class<?> typ) {
    try {
      if (typ == int.class || typ == Integer.class) {
        return Integer.valueOf(text.trim());
      }
      if (typ == double.class || typ == Double.class) {
        return Double.valueOf(text.trim());
      }
      if (typ == boolean.class || typ == Boolean.class) {
        return Boolean.valueOf(text.trim());
      }
      if (typ == String.class) {
        return text;
      }
    } catch (NumberFormatException e) {
      return null;
    }
    return null;
  }
}
