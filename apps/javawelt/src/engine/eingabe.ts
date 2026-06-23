import { Welt } from "./welt";
import { Figur } from "./figur";

/**
 * Maus- und Touch-Steuerung (Pointer Events → funktioniert auf iPad).
 * - Figur antippen/anklicken: auswählen
 * - ziehen: verschieben
 * - im "Platzieren"-Modus ins Leere tippen: neue Figur erzeugen
 */
export class Eingabe {
  platzierenModus = false;
  platzierenName = "Figur";

  onAuswahl: ((f: Figur | null) => void) | null = null;

  private gezogen: Figur | null = null;

  constructor(
    private readonly canvas: HTMLCanvasElement,
    private readonly welt: Welt,
  ) {
    canvas.addEventListener("pointerdown", (e) => this.runter(e));
    canvas.addEventListener("pointermove", (e) => this.bewege(e));
    canvas.addEventListener("pointerup", (e) => this.hoch(e));
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
    const f = this.welt.figurBei(x, y);
    if (f) {
      this.gezogen = f;
      this.welt.waehle(f.id);
      this.onAuswahl?.(f);
      this.canvas.setPointerCapture(e.pointerId);
    } else if (this.platzierenModus) {
      const id = this.welt.erzeugeFigur(this.platzierenName, x, y);
      this.welt.waehle(id);
      this.onAuswahl?.(this.welt.alleFiguren().find((g) => g.id === id) ?? null);
    } else {
      this.welt.waehle(null);
      this.onAuswahl?.(null);
    }
  }

  private bewege(e: PointerEvent): void {
    if (!this.gezogen) return;
    const { x, y } = this.pos(e);
    this.gezogen.x = this.gezogen.zielX = x;
    this.gezogen.y = this.gezogen.zielY = y;
  }

  private hoch(e: PointerEvent): void {
    this.gezogen = null;
    if (this.canvas.hasPointerCapture(e.pointerId))
      this.canvas.releasePointerCapture(e.pointerId);
  }
}
