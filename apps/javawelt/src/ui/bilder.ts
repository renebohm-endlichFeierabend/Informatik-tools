/**
 * Bilder für Klassen: Jede Figuren-Klasse kann ein kleines Bild bekommen
 * (Emoji aus der Auswahl oder eigenes hochgeladenes Bild). Die Engine
 * zeichnet dann das Bild statt des Standardkreises – rotiert mit der
 * Blickrichtung, wie in Greenfoot.
 *
 * Gespeichert wird im localStorage (eigene Bilder verkleinert als PNG),
 * damit auf dem iPad nach einem Neuladen alles erhalten bleibt.
 */

export type BildQuelle = { art: "emoji"; wert: string } | { art: "daten"; wert: string };

/** Was die Engine zum Zeichnen braucht (Bild bereits geladen). */
export type EngineBild = { art: "emoji"; wert: string } | { art: "bild"; element: HTMLImageElement };

const SPEICHER_SCHLUESSEL = "javawelt.bilder.v1";

export const EMOJI_AUSWAHL = [
  "🤖", "🐝", "🐶", "🐱", "🦊", "🐭", "🐢", "🐟",
  "🐸", "🦋", "🐘", "🐞", "🧍", "🧑‍🚀", "🚗", "🚀",
  "🚃", "⛵", "⚽", "🏀", "📦", "🍎", "⭐", "💎",
];

export class BilderVerwaltung {
  private bilder = new Map<string, BildQuelle>();
  private elemente = new Map<string, HTMLImageElement>();

  /** Wird gerufen, wenn sich ein Bild ändert (Engine neu zeichnen lassen). */
  onAenderung: (() => void) | null = null;

  constructor() {
    this.lade();
  }

  gib(klasse: string): BildQuelle | null {
    return this.bilder.get(klasse) ?? null;
  }

  /** Für die Engine: Emoji direkt, eigene Bilder als geladenes Element. */
  fuerEngine(klasse: string): EngineBild | null {
    const quelle = this.bilder.get(klasse);
    if (!quelle) return null;
    if (quelle.art === "emoji") return quelle;
    const element = this.elemente.get(klasse);
    return element && element.complete ? { art: "bild", element } : null;
  }

  setze(klasse: string, quelle: BildQuelle | null): void {
    if (quelle === null) {
      this.bilder.delete(klasse);
      this.elemente.delete(klasse);
    } else {
      this.bilder.set(klasse, quelle);
      if (quelle.art === "daten") this.ladeElement(klasse, quelle.wert);
      else this.elemente.delete(klasse);
    }
    this.speichere();
    this.onAenderung?.();
  }

  /** Setzt Emoji-Vorgaben (z. B. aus einem Szenario) für mehrere Klassen. */
  setzeEmojis(vorgaben: Record<string, string>): void {
    for (const [klasse, emoji] of Object.entries(vorgaben)) {
      this.bilder.set(klasse, { art: "emoji", wert: emoji });
      this.elemente.delete(klasse);
    }
    this.speichere();
    this.onAenderung?.();
  }

  /** Liest eine Bilddatei ein, verkleinert sie und speichert sie für die Klasse. */
  async setzeAusDatei(klasse: string, datei: File): Promise<void> {
    const datenUrl = await verkleinere(datei, 96);
    this.setze(klasse, { art: "daten", wert: datenUrl });
  }

  private ladeElement(klasse: string, datenUrl: string): void {
    const img = new Image();
    img.onload = () => this.onAenderung?.();
    img.src = datenUrl;
    this.elemente.set(klasse, img);
  }

  private speichere(): void {
    try {
      localStorage.setItem(SPEICHER_SCHLUESSEL, JSON.stringify(Object.fromEntries(this.bilder)));
    } catch {
      // Speicher voll → eigene Bilder gehen beim Neuladen ggf. verloren.
    }
  }

  private lade(): void {
    try {
      const roh = localStorage.getItem(SPEICHER_SCHLUESSEL);
      if (!roh) return;
      const daten = JSON.parse(roh) as Record<string, BildQuelle>;
      for (const [klasse, quelle] of Object.entries(daten)) {
        if (quelle && (quelle.art === "emoji" || quelle.art === "daten")) {
          this.bilder.set(klasse, quelle);
          if (quelle.art === "daten") this.ladeElement(klasse, quelle.wert);
        }
      }
    } catch {
      // kaputter Speicher → ohne Bilder starten
    }
  }
}

/** Verkleinert eine Bilddatei auf maxGroesse Pixel Kantenlänge (PNG-Daten-URL). */
function verkleinere(datei: File, maxGroesse: number): Promise<string> {
  return new Promise((res, rej) => {
    const leser = new FileReader();
    leser.onerror = () => rej(new Error("Die Datei konnte nicht gelesen werden."));
    leser.onload = () => {
      const img = new Image();
      img.onerror = () => rej(new Error("Das ist keine lesbare Bilddatei."));
      img.onload = () => {
        const faktor = Math.min(1, maxGroesse / Math.max(img.width, img.height));
        const b = Math.max(1, Math.round(img.width * faktor));
        const h = Math.max(1, Math.round(img.height * faktor));
        const canvas = document.createElement("canvas");
        canvas.width = b;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, b, h);
        res(canvas.toDataURL("image/png"));
      };
      img.src = String(leser.result);
    };
    leser.readAsDataURL(datei);
  });
}

/**
 * Baut den Bild-Auswahl-Dialog einmalig auf und liefert eine Funktion,
 * die ihn für eine bestimmte Klasse öffnet.
 */
export function erstelleBildDialog(
  bilder: BilderVerwaltung,
  log: (zeile: string) => void,
): (klasse: string) => void {
  const dialog = document.createElement("dialog");
  dialog.id = "bild-dialog";
  dialog.innerHTML = `
    <h2>Bild für <span id="bild-klasse"></span></h2>
    <div class="emoji-gitter"></div>
    <div class="dialog-aktionen">
      <label class="datei-knopf sekundaer">
        Eigenes Bild …
        <input type="file" accept="image/*" hidden />
      </label>
      <button id="bild-ohne" class="sekundaer">Standardkreis</button>
      <button id="bild-zu">Schließen</button>
    </div>`;
  document.body.appendChild(dialog);

  const gitter = dialog.querySelector<HTMLElement>(".emoji-gitter")!;
  const titelKlasse = dialog.querySelector<HTMLElement>("#bild-klasse")!;
  const dateiEingabe = dialog.querySelector<HTMLInputElement>("input[type=file]")!;
  let aktuelleKlasse = "";

  for (const emoji of EMOJI_AUSWAHL) {
    const knopf = document.createElement("button");
    knopf.className = "emoji";
    knopf.type = "button";
    knopf.textContent = emoji;
    knopf.onclick = () => {
      bilder.setze(aktuelleKlasse, { art: "emoji", wert: emoji });
      dialog.close();
    };
    gitter.appendChild(knopf);
  }

  dateiEingabe.addEventListener("change", () => {
    const datei = dateiEingabe.files?.[0];
    dateiEingabe.value = "";
    if (!datei) return;
    void bilder
      .setzeAusDatei(aktuelleKlasse, datei)
      .then(() => dialog.close())
      .catch((e: Error) => log("✗ " + e.message));
  });

  dialog.querySelector<HTMLButtonElement>("#bild-ohne")!.onclick = () => {
    bilder.setze(aktuelleKlasse, null);
    dialog.close();
  };
  dialog.querySelector<HTMLButtonElement>("#bild-zu")!.onclick = () => dialog.close();

  return (klasse: string) => {
    aktuelleKlasse = klasse;
    titelKlasse.textContent = klasse;
    dialog.showModal();
  };
}
