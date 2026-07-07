import { Figur } from "./figur";

/** Bild einer Klasse: Emoji oder geladenes Bildelement (siehe src/ui/bilder.ts). */
export type FigurBild = { art: "emoji"; wert: string } | { art: "bild"; element: HTMLImageElement };

const FARBEN = ["#4f8cff", "#ff5d73", "#42c98e", "#f5a623", "#a974ff", "#2dd4bf", "#f472b6", "#facc15"];

/**
 * Die Welt ist die Bühne. Diese Klasse ist die "Maschinenseite": Sowohl die
 * interaktive Objektbank (Antippen) als auch der Java-Code (über die
 * CheerpJ-Natives bzw. den Übungsmodus) rufen exakt dieselben Methoden auf.
 */
export class Welt {
  readonly breite: number;
  readonly hoehe: number;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly figuren = new Map<number, Figur>();
  private naechsteId = 1;
  private readonly namenszaehler = new Map<string, number>();
  private letzteZeit = 0;

  /** Beobachter für die UI (z. B. Objektbank), wenn sich Figuren ändern. */
  onAenderung: (() => void) | null = null;

  /** Liefert das Bild für eine Klasse (oder null → Standardkreis). */
  bildFuer: ((klasse: string) => FigurBild | null) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D-Kontext nicht verfügbar");
    this.ctx = ctx;
    this.breite = canvas.width;
    this.hoehe = canvas.height;
    requestAnimationFrame((t) => this.schleife(t));
  }

  // ---- API: identisch für Objektbank und Java-Code -----------------------

  /**
   * Erzeugt eine sichtbare Figur. Ohne `name` (oder wenn er dem Klassennamen
   * entspricht) wird automatisch benannt: roboter1, roboter2, …
   */
  erzeugeFigur(name: string, klasse: string, x = this.breite / 2, y = this.hoehe / 2): number {
    const id = this.naechsteId++;
    if (!name || name === klasse) {
      const n = (this.namenszaehler.get(klasse) ?? 0) + 1;
      this.namenszaehler.set(klasse, n);
      name = klasse.charAt(0).toLowerCase() + klasse.slice(1) + n;
    }
    // Farbe pro Klasse, damit Objekte derselben Klasse zusammengehörig aussehen.
    const farbe = FARBEN[this.farbindex(klasse)];
    this.figuren.set(id, new Figur(id, name, klasse, x, y, farbe));
    this.onAenderung?.();
    return id;
  }

  entferne(id: number): void {
    if (this.figuren.delete(id)) this.onAenderung?.();
  }

  leeren(): void {
    this.figuren.clear();
    this.namenszaehler.clear();
    this.onAenderung?.();
  }

  verschiebe(id: number, dx: number, dy: number): void {
    this.figuren.get(id)?.verschiebe(dx, dy);
  }

  dreheDich(id: number, grad: number): void {
    this.figuren.get(id)?.dreheDich(grad);
  }

  setzePosition(id: number, x: number, y: number): void {
    this.figuren.get(id)?.setzePosition(x, y);
  }

  sage(id: number, text: string): void {
    this.figuren.get(id)?.sage(text);
  }

  benenne(id: number, name: string): void {
    const f = this.figuren.get(id);
    if (f && name) {
      f.name = name;
      this.onAenderung?.();
    }
  }

  gibX(id: number): number {
    return Math.round(this.figuren.get(id)?.logischX ?? 0);
  }

  gibY(id: number): number {
    return Math.round(this.figuren.get(id)?.logischY ?? 0);
  }

  // ---- Zugriff für die UI -------------------------------------------------

  alleFiguren(): Figur[] {
    return [...this.figuren.values()];
  }

  figur(id: number): Figur | null {
    return this.figuren.get(id) ?? null;
  }

  figurBei(px: number, py: number): Figur | null {
    const alle = this.alleFiguren();
    for (let i = alle.length - 1; i >= 0; i--) {
      if (alle[i].trifft(px, py)) return alle[i];
    }
    return null;
  }

  waehle(id: number | null): void {
    for (const f of this.figuren.values()) f.ausgewaehlt = f.id === id;
  }

  private farbindex(klasse: string): number {
    let h = 0;
    for (let i = 0; i < klasse.length; i++) h = (h * 31 + klasse.charCodeAt(i)) | 0;
    return Math.abs(h) % FARBEN.length;
  }

  // ---- Render-Schleife ----------------------------------------------------

  private schleife(t: number): void {
    const dt = this.letzteZeit ? Math.min(t - this.letzteZeit, 100) : 16;
    this.letzteZeit = t;
    for (const f of this.figuren.values()) f.schritt(dt);
    this.zeichne();
    requestAnimationFrame((tt) => this.schleife(tt));
  }

  private zeichne(): void {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.breite, this.hoehe);
    this.zeichneGitter();
    for (const f of this.figuren.values()) this.zeichneFigur(f);
  }

  private zeichneGitter(): void {
    const ctx = this.ctx;
    ctx.fillStyle = "#0f1525";
    ctx.fillRect(0, 0, this.breite, this.hoehe);
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.lineWidth = 1;
    const s = 40;
    for (let x = 0; x <= this.breite; x += s) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.hoehe);
      ctx.stroke();
    }
    for (let y = 0; y <= this.hoehe; y += s) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.breite, y);
      ctx.stroke();
    }
  }

  private zeichneFigur(f: Figur): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(f.x, f.y);

    if (f.ausgewaehlt) {
      ctx.beginPath();
      ctx.arc(0, 0, 28, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.7)";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Körper: Bild der Klasse (Emoji/eigenes Bild) oder Standardkreis.
    ctx.rotate(f.winkelRad);
    const bild = this.bildFuer?.(f.klasse) ?? null;
    if (bild?.art === "emoji") {
      ctx.font = "38px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(bild.wert, 0, 2);
      ctx.textBaseline = "alphabetic";
    } else if (bild?.art === "bild") {
      ctx.drawImage(bild.element, -24, -24, 48, 48);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fillStyle = f.farbe;
      ctx.fill();
      // Blickrichtung (Pfeil)
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(20, 0);
      ctx.lineTo(8, -7);
      ctx.lineTo(8, 7);
      ctx.closePath();
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fill();
    }
    ctx.restore();

    // Name : Klasse
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "12px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(f.name, f.x, f.y + 38);

    // Sprechblase
    if (f.spruch) {
      ctx.font = "13px system-ui, sans-serif";
      const w = ctx.measureText(f.spruch).width + 16;
      const bx = Math.min(f.x + 24, this.breite - w - 4);
      const by = Math.max(f.y - 36, 4);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.roundRect(bx, by, w, 26, 8);
      ctx.fill();
      ctx.fillStyle = "#111";
      ctx.textAlign = "left";
      ctx.fillText(f.spruch, bx + 8, by + 17);
    }
  }
}
