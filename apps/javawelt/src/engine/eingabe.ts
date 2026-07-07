import { Welt } from "./welt";
import { Figur } from "./figur";

/**
 * Maus- und Touch-Steuerung (Pointer Events → funktioniert auf dem iPad).
 * - Figur antippen/anklicken: auswählen
 * - ziehen: verschieben
 * - im Platzieren-Modus auf freie Fläche tippen: dort ein Objekt erzeugen
 *   (einmalig; der Modus wird von der Objektbank gesetzt)
 */
export class Eingabe {
  /** Klasse, deren nächstes Objekt per Tipp platziert wird (one-shot). */
  platzierenKlasse: string | null = null;

  onAuswahl: ((f: Figur | null) => void) | null = null;
  /** Tipp auf freie Fläche im Platzieren-Modus. */
  onPlatziere: ((klasse: string, x: number, y: number) => void) | null = null;
  /** Der Platzieren-Modus wurde beendet (platziert oder abgebrochen). */
  onPlatzierenEnde: (() => void) | null = null;

  private gezogen: Figur | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly welt: Welt,
  ) {
    canvas.addEventListener("pointerdown", (e) => this.runter(e));
    canvas.addEventListener("pointermove", (e) => this.bewege(e));
    canvas.addEventListener("pointerup", (e) => this.hoch(e));
  }

  starte(klasse: string): void {
    this.platzierenKlasse = klasse;
  }

  brichAb(): void {
    if (this.platzierenKlasse === null) return;
    this.platzierenKlasse = null;
    this.onPlatzierenEnde?.();
  }

  private pos(e: PointerEvent): { x: number; y: number } {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * this.canvas.width,
      y: ((e.clientY - r.top) / r.height) * this.canvas.height,
    };
  }

  private runter(e: PointerEvent): void {
    const { x, y } = this.pos(e);
    if (this.platzierenKlasse) {
      const klasse = this.platzierenKlasse;
      this.platzierenKlasse = null;
      this.onPlatziere?.(klasse, Math.round(x), Math.round(y));
      this.onPlatzierenEnde?.();
      return;
    }
    const f = this.welt.figurBei(x, y);
    if (f) {
      this.gezogen = f;
      this.welt.waehle(f.id);
      this.onAuswahl?.(f);
      this.canvas.setPointerCapture(e.pointerId);
    } else {
      this.welt.waehle(null);
      this.onAuswahl?.(null);
    }
  }

  private bewege(e: PointerEvent): void {
    if (!this.gezogen) return;
    const { x, y } = this.pos(e);
    this.gezogen.zieheNach(x, y);
  }

  private hoch(e: PointerEvent): void {
    this.gezogen = null;
    if (this.canvas.hasPointerCapture(e.pointerId))
      this.canvas.releasePointerCapture(e.pointerId);
  }
}
