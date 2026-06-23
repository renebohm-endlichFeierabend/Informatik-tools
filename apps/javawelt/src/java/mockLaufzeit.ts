import { JavaLaufzeit, Ausgabe } from "./laufzeit";
import { Welt } from "../engine/welt";

/**
 * Mock-Laufzeit: kompiliert KEIN echtes Java. Sie dient dazu, dass die
 * Lernumgebung sofort lauffähig und vorführbar ist (UX, Objektbank, Welt) –
 * ohne CheerpJ-Download und ohne Browser-/Netz-Abhängigkeit.
 *
 * Der "Ausführen"-Knopf spielt hier eine kleine, klar gekennzeichnete
 * Demo-Animation ab. Echte Kompilierung leistet erst die CheerpJ-Laufzeit.
 */
export class MockLaufzeit implements JavaLaufzeit {
  readonly name = "Mock (ohne echte Kompilierung)";
  private welt!: Welt;
  private ausgabe!: Ausgabe;

  async init(welt: Welt, ausgabe: Ausgabe): Promise<void> {
    this.welt = welt;
    this.ausgabe = ausgabe;
    this.ausgabe("Mock-Laufzeit bereit. (Echtes Java erst mit CheerpJ.)");
  }

  async fuehreAus(_quelltext: string): Promise<void> {
    this.ausgabe("[Mock] Kompiliere … (simuliert)");
    await new Promise((r) => setTimeout(r, 300));
    this.ausgabe("[Mock] Führe Demo-Animation aus.");
    const id = this.welt.erzeugeFigur("Roboter", 120, 200);
    this.welt.waehle(id);
    const schritte = [
      () => this.welt.sage(id, "Hallo Welt!"),
      () => this.welt.geheVor(id, 160),
      () => this.welt.dreheDich(id, 90),
      () => this.welt.geheVor(id, 120),
      () => this.welt.dreheDich(id, 90),
      () => this.welt.geheVor(id, 160),
      () => this.welt.sage(id, "fertig :)"),
    ];
    for (const s of schritte) {
      s();
      await new Promise((r) => setTimeout(r, 700));
    }
    this.ausgabe("[Mock] Fertig.");
  }
}
