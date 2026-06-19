import { Welt } from "../engine/welt";

/** Funktion, mit der die Laufzeit Text in die Konsole der Oberfläche schreibt. */
export type Ausgabe = (zeile: string) => void;

/**
 * Abstraktion über "Java ausführen". Die Engine kennt CheerpJ NICHT direkt –
 * sie spricht nur dieses Interface an. Dadurch:
 *   - läuft die App sofort mit der Mock-Laufzeit (kein Download, kein Browser-Risiko),
 *   - lässt sich die echte CheerpJ-Laufzeit per Flag einschalten und getrennt validieren.
 */
export interface JavaLaufzeit {
  readonly name: string;
  /** Einmalige Initialisierung (CheerpJ laden, Natives registrieren ...). */
  init(welt: Welt, ausgabe: Ausgabe): Promise<void>;
  /** Kompiliert und führt den Schüler-Quelltext aus. */
  fuehreAus(quelltext: string): Promise<void>;
}
