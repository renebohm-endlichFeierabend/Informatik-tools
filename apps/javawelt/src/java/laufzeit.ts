import { Welt } from "../engine/welt";

/** Funktion, mit der die Laufzeit Text in die Konsole der Oberfläche schreibt. */
export type Ausgabe = (zeile: string) => void;

/**
 * Abstraktion über "Java ausführen". Die Oberfläche kennt CheerpJ NICHT
 * direkt – sie spricht nur dieses Interface an. Dadurch:
 *   - läuft die App sofort im Übungsmodus (kein Download, kein Netz nötig),
 *   - lässt sich die echte CheerpJ-Laufzeit per Schalter zuschalten und
 *     getrennt validieren.
 *
 * Beide Laufzeiten bedienen dieselben Abläufe der Oberfläche:
 * Klassen übernehmen (kompilieren) → Objekte erzeugen/platzieren →
 * Methoden aufrufen → Spiel (Weltklasse) starten/stoppen.
 */
/**
 * Holt aus einem beliebigen geworfenen Wert eine lesbare Meldung heraus.
 * CheerpJ wirft auch Java-Exception-Proxys und andere Nicht-Error-Werte –
 * `(e as Error).message` wäre dann undefined („✗ undefined“ in der Konsole).
 */
export function fehlerText(e: unknown): string {
  const nachricht = (e as { message?: unknown } | null)?.message;
  if (typeof nachricht === "string" && nachricht !== "") return nachricht;
  const text = String(e);
  return text === "[object Object]" || text === "undefined" || text === "null"
    ? "Unerwarteter Fehler (keine Meldung verfügbar)."
    : text;
}

export interface JavaLaufzeit {
  readonly name: string;

  /** Einmalige Initialisierung (CheerpJ laden, Natives registrieren …). */
  init(welt: Welt, ausgabe: Ausgabe): Promise<void>;

  /**
   * Übernimmt die Schülerklassen (Klassenname → Quelltext ohne Paket-Gerüst).
   * Gibt false zurück, wenn die Übersetzung fehlschlägt (Fehler landen in
   * der Konsole). Bestehende Java-Objekte werden dabei verworfen.
   */
  kompiliere(klassen: Record<string, string>): Promise<boolean>;

  /** Erzeugt ein Objekt der Klasse an (x, y); gibt die Engine-Id zurück. */
  erzeugeObjekt(klasse: string, x: number, y: number): Promise<number>;

  /**
   * Ruft eine öffentliche Methode des Objekts auf. Argumente kommen als
   * Text und werden anhand der Parametertypen umgewandelt. Gibt den
   * Rückgabewert als Text zurück ("" bei void).
   */
  rufeMethode(id: number, methode: string, args: string[]): Promise<string>;

  /** Entfernt das Objekt (Java-Seite; die Engine räumt über Natives auf). */
  entferneObjekt(id: number): Promise<void>;

  /** Startet die Weltklasse: bereiteVor(), dann spiele(). */
  starteSpiel(weltKlasse: string): Promise<void>;

  /** Lässt laeuft() false liefern, damit die Spielschleife endet. */
  stoppeSpiel(): void;
}
