import { radian } from "./vektor";

/**
 * Eine sichtbare Aktion der Figur. Aktionen landen in einer Warteschlange
 * und werden nacheinander animiert – so bleibt z. B. ein Quadrat-Lauf
 * (4 × geheVor + dreheDich) als Bewegung nachvollziehbar, obwohl der
 * Java-Code ihn in einem Wimpernschlag berechnet hat.
 */
type Aktion =
  | { art: "bewege"; dx: number; dy: number; rest: number; laenge: number }
  | { art: "drehe"; rest: number }
  | { art: "springe"; x: number; y: number }
  | { art: "sage"; text: string };

const TEMPO = 220; // Pixel pro Sekunde
const DREHTEMPO = 360; // Grad pro Sekunde
const MAX_SCHLANGE = 400; // Notbremse gegen Endlosschleifen ohne warte()

/**
 * Eine Figur auf der Welt – die sichtbare (Engine-)Repräsentation.
 * Die Logik (Blickrichtung, Trigonometrie) lebt auf der Java-Seite;
 * hier wird nur angezeigt und animiert.
 */
export class Figur {
  readonly id: number;
  readonly klasse: string;
  name: string;
  farbe: string;

  // Ist-Zustand (gerendert)
  x: number;
  y: number;
  winkel: number; // Grad, 0 = nach rechts

  // Logischer Zustand: Position/Winkel NACH allen wartenden Aktionen.
  // Den liest der Java-Code (gibX/gibY), damit Logik und Anzeige
  // nicht auseinanderlaufen.
  logischX: number;
  logischY: number;
  logischWinkel: number;

  spruch: string | null = null;
  spruchBisMs = 0;

  ausgewaehlt = false;

  private schlange: Aktion[] = [];

  constructor(id: number, name: string, klasse: string, x: number, y: number, farbe: string) {
    this.id = id;
    this.name = name;
    this.klasse = klasse;
    this.farbe = farbe;
    this.x = this.logischX = x;
    this.y = this.logischY = y;
    this.winkel = this.logischWinkel = 0;
  }

  // ---- Aktionen einreihen (von Welt-API aufgerufen) ----------------------

  /** Verschiebt die Figur um (dx, dy) – Richtung wurde bereits berechnet. */
  verschiebe(dx: number, dy: number): void {
    this.logischX += dx;
    this.logischY += dy;
    this.reiheEin({ art: "bewege", dx, dy, rest: 1, laenge: Math.hypot(dx, dy) });
  }

  dreheDich(grad: number): void {
    this.logischWinkel += grad;
    this.reiheEin({ art: "drehe", rest: grad });
  }

  setzePosition(x: number, y: number): void {
    this.logischX = x;
    this.logischY = y;
    this.reiheEin({ art: "springe", x, y });
  }

  sage(text: string): void {
    this.reiheEin({ art: "sage", text });
  }

  /** Direktes Setzen beim Ziehen mit dem Finger – verwirft alte Aktionen. */
  zieheNach(x: number, y: number): void {
    this.schlange = [];
    this.x = this.logischX = x;
    this.y = this.logischY = y;
  }

  private reiheEin(a: Aktion): void {
    this.schlange.push(a);
    // Notbremse: Läuft eine Schleife ohne warte(), wächst die Schlange
    // unbegrenzt. Dann Aktionen sofort (unsichtbar schnell) anwenden.
    while (this.schlange.length > MAX_SCHLANGE) {
      this.wendeSofortAn(this.schlange.shift()!);
    }
  }

  private wendeSofortAn(a: Aktion): void {
    switch (a.art) {
      case "bewege":
        this.x += a.dx * a.rest;
        this.y += a.dy * a.rest;
        break;
      case "drehe":
        this.winkel += a.rest;
        break;
      case "springe":
        this.x = a.x;
        this.y = a.y;
        break;
      case "sage":
        this.zeigeSpruch(a.text);
        break;
    }
  }

  // ---- Animation ----------------------------------------------------------

  /** Pro Frame aufgerufen: arbeitet die Aktions-Warteschlange ab. */
  schritt(dtMs: number): void {
    let budget = dtMs / 1000; // Sekunden, die dieser Frame hergibt
    while (budget > 0 && this.schlange.length > 0) {
      const a = this.schlange[0];
      budget = this.animiere(a, budget);
      if (this.istFertig(a)) this.schlange.shift();
    }
    if (this.spruch && performance.now() > this.spruchBisMs) this.spruch = null;
  }

  /** Animiert die Aktion mit dem Zeitbudget; gibt das Restbudget zurück. */
  private animiere(a: Aktion, budget: number): number {
    switch (a.art) {
      case "bewege": {
        if (a.laenge === 0) return budget;
        const dauer = a.laenge / TEMPO; // Gesamtdauer der Bewegung
        const anteil = Math.min(a.rest, budget / dauer);
        this.x += a.dx * anteil;
        this.y += a.dy * anteil;
        a.rest -= anteil;
        return budget - anteil * dauer;
      }
      case "drehe": {
        const schrittGrad = Math.sign(a.rest) * Math.min(Math.abs(a.rest), budget * DREHTEMPO);
        this.winkel += schrittGrad;
        a.rest -= schrittGrad;
        return budget - Math.abs(schrittGrad) / DREHTEMPO;
      }
      case "springe":
        this.x = a.x;
        this.y = a.y;
        return budget;
      case "sage":
        this.zeigeSpruch(a.text);
        return budget;
    }
  }

  private istFertig(a: Aktion): boolean {
    switch (a.art) {
      case "bewege":
        return a.rest <= 0.0001 || a.laenge === 0;
      case "drehe":
        return Math.abs(a.rest) <= 0.01;
      default:
        return true;
    }
  }

  private zeigeSpruch(text: string): void {
    this.spruch = text;
    this.spruchBisMs = performance.now() + 2600;
  }

  // ---- Treffer für Auswahl/Ziehen -----------------------------------------

  trifft(px: number, py: number): boolean {
    const r = 24;
    return (px - this.x) ** 2 + (py - this.y) ** 2 <= r * r;
  }

  /** Für das Zeichnen der Blickrichtung. */
  get winkelRad(): number {
    return radian(this.winkel);
  }
}
