import figurQuelle from "../../java-framework/de/schule/jle/Figur.java?raw";
import weltQuelle from "../../java-framework/de/schule/jle/Welt.java?raw";

interface KlassenInfo {
  /** Voll qualifizierter Name, z. B. "de.schule.jle.Figur". */
  voll: string;
  /** Kurzer Anzeigename, z. B. "Figur". */
  anzeige: string;
  /** Aktueller (ggf. editierter) Java-Quelltext. */
  code: string;
}

/**
 * Verwaltet die editierbaren Quelltexte der Klassen (Figur, Welt …) und
 * stellt das "Klassen-Quelltext"-Fenster unten rechts dar.
 *
 * Die Startwerte stammen direkt aus den echten Framework-Quellen
 * (`?raw`-Import) – es gibt also nur EINE Quelle der Wahrheit. Editierte
 * Quelltexte werden über `quelltexte()` an die Laufzeit weitergereicht und
 * dort beim Ausführen mitkompiliert.
 */
export class KlassenEditor {
  private readonly klassen = new Map<string, KlassenInfo>();
  private aktiv: string;

  constructor(
    private readonly box: HTMLElement,
    private readonly tabsEl: HTMLElement,
    private readonly codeEl: HTMLTextAreaElement,
    private readonly onSichtbarkeit?: (sichtbar: boolean) => void,
  ) {
    this.registriere("de.schule.jle.Figur", "Figur", figurQuelle);
    this.registriere("de.schule.jle.Welt", "Welt", weltQuelle);
    this.aktiv = "de.schule.jle.Figur";

    this.codeEl.addEventListener("input", () => {
      const info = this.klassen.get(this.aktiv);
      if (info) info.code = this.codeEl.value;
    });

    this.zeichneTabs();
    this.codeEl.value = this.klassen.get(this.aktiv)!.code;
  }

  private registriere(voll: string, anzeige: string, code: string): void {
    this.klassen.set(voll, { voll, anzeige, code });
  }

  /** Öffnet den Editor für die Klasse mit diesem Anzeigenamen und zeigt das Fenster. */
  oeffne(anzeige: string): void {
    const info = [...this.klassen.values()].find((k) => k.anzeige === anzeige);
    if (!info) return;
    this.aktiv = info.voll;
    this.zeige(true);
    this.zeichneTabs();
    this.codeEl.value = info.code;
  }

  /** Blendet das Fenster ein/aus (für die optionale Anzeige unten rechts). */
  zeige(sichtbar: boolean): void {
    this.box.hidden = !sichtbar;
    this.onSichtbarkeit?.(sichtbar);
  }

  umschalten(): void {
    this.zeige(this.box.hidden);
  }

  sichtbar(): boolean {
    return !this.box.hidden;
  }

  /** Anzeigenamen aller bekannten Klassen (für die Objektbank). */
  klassenNamen(): string[] {
    return [...this.klassen.values()].map((k) => k.anzeige);
  }

  /** Voll qualifizierter Name → Quelltext, für die Laufzeit. */
  quelltexte(): Record<string, string> {
    const r: Record<string, string> = {};
    for (const k of this.klassen.values()) r[k.voll] = k.code;
    return r;
  }

  private zeichneTabs(): void {
    this.tabsEl.innerHTML = "";
    for (const k of this.klassen.values()) {
      const b = document.createElement("button");
      b.textContent = `${k.anzeige}.java`;
      b.className = "tab" + (k.voll === this.aktiv ? " aktiv" : "");
      b.onclick = () => {
        this.aktiv = k.voll;
        this.codeEl.value = k.code;
        this.zeichneTabs();
      };
      this.tabsEl.appendChild(b);
    }
  }
}
