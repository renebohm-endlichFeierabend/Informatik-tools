import { Welt } from "../engine/welt";
import { Figur } from "../engine/figur";
import { JavaLaufzeit } from "../java/laufzeit";
import { KlassenVerwaltung, MethodenSignatur } from "./klassenVerwaltung";

/**
 * Objektbank im Stil von BlueJ: Objekte per Antippen erzeugen und ihre
 * Methoden interaktiv aufrufen – ohne Code zu schreiben. Sie zeigt für
 * JEDE Schülerklasse (die von Figur erbt) die per Parser gefundenen
 * öffentlichen Methoden an; ausgeführt wird über die aktive Laufzeit,
 * damit Knopfdruck und Java-Code garantiert dasselbe tun.
 */
export class Objektbank {
  private aktiv: Figur | null = null;

  /** „Quelltext“-Knopf einer Klasse gedrückt. */
  onKlasseOeffnen: ((name: string) => void) | null = null;
  /** „neu“-Knopf gedrückt → Platzieren-Modus starten/abbrechen. */
  onPlatzieren: ((klasse: string) => void) | null = null;
  /** Bild-Knopf einer Figuren-Klasse gedrückt. */
  onBildWaehlen: ((klasse: string) => void) | null = null;

  constructor(
    private readonly welt: Welt,
    private readonly klassenVerwaltung: KlassenVerwaltung,
    private readonly laufzeit: () => JavaLaufzeit,
    private readonly log: (zeile: string) => void,
    private readonly klassenEl: HTMLElement,
    private readonly objekteEl: HTMLElement,
    private readonly methodenEl: HTMLElement,
    private readonly neueKlasseEl: HTMLElement,
  ) {
    this.welt.onAenderung = () => {
      if (this.aktiv && !this.welt.figur(this.aktiv.id)) this.aktiv = null;
      this.zeichneObjekte();
      this.zeichneMethoden();
    };
    this.baueNeueKlasseZeile();
    this.aktualisiere();
  }

  /** Klassenliste + Objekte + Methoden neu aufbauen (nach Änderungen). */
  aktualisiere(): void {
    this.zeichneKlassen();
    this.zeichneObjekte();
    this.zeichneMethoden();
  }

  waehleAktiv(f: Figur | null): void {
    this.aktiv = f;
    this.zeichneObjekte();
    this.zeichneMethoden();
  }

  // ---- Klassen ---------------------------------------------------------------

  private zeichneKlassen(): void {
    this.klassenEl.innerHTML = "";
    for (const name of this.klassenVerwaltung.platzierbareKlassen()) {
      this.klassenEl.appendChild(this.klassenKarte(name, true));
    }
    const weitere = this.klassenVerwaltung.weitereKlassen();
    if (weitere.length > 0) {
      const trenner = document.createElement("div");
      trenner.className = "klassen-trenner";
      trenner.textContent = "weitere Klassen";
      this.klassenEl.appendChild(trenner);
      for (const name of weitere) {
        this.klassenEl.appendChild(this.klassenKarte(name, false));
      }
    }
  }

  private klassenKarte(name: string, platzierbar: boolean): HTMLElement {
    const karte = document.createElement("div");
    karte.className = "klasse";
    const titel = document.createElement("span");
    titel.className = "klasse-name";
    titel.textContent = name;
    karte.appendChild(titel);

    const aktionen = document.createElement("span");
    aktionen.className = "aktionen";

    if (platzierbar) {
      const neu = document.createElement("button");
      neu.textContent = "neu";
      neu.title = `Ein Objekt der Klasse ${name} auf der Welt platzieren`;
      neu.onclick = () => this.onPlatzieren?.(name);
      aktionen.appendChild(neu);

      const bild = document.createElement("button");
      bild.className = "sekundaer";
      bild.textContent = "🖼";
      bild.title = `Bild für ${name} wählen`;
      bild.onclick = () => this.onBildWaehlen?.(name);
      aktionen.appendChild(bild);
    }

    const quelltext = document.createElement("button");
    quelltext.className = "sekundaer";
    quelltext.textContent = "Quelltext";
    quelltext.onclick = () => this.onKlasseOeffnen?.(name);
    aktionen.appendChild(quelltext);

    karte.appendChild(aktionen);
    return karte;
  }

  private baueNeueKlasseZeile(): void {
    this.neueKlasseEl.innerHTML = "";
    const knopf = document.createElement("button");
    knopf.className = "sekundaer";
    knopf.textContent = "＋ Neue Klasse";

    const formular = document.createElement("span");
    formular.className = "neue-klasse-formular";
    formular.hidden = true;
    const eingabe = document.createElement("input");
    eingabe.type = "text";
    eingabe.placeholder = "z. B. Biene";
    eingabe.autocapitalize = "off";
    eingabe.autocomplete = "off";
    eingabe.spellcheck = false;
    const anlegen = document.createElement("button");
    anlegen.textContent = "Anlegen";
    const abbrechen = document.createElement("button");
    abbrechen.className = "sekundaer";
    abbrechen.textContent = "✕";
    abbrechen.title = "abbrechen";
    formular.append(eingabe, anlegen, abbrechen);

    const zeigeFormular = (sichtbar: boolean) => {
      formular.hidden = !sichtbar;
      knopf.hidden = sichtbar;
      if (sichtbar) eingabe.focus();
    };
    knopf.onclick = () => zeigeFormular(true);
    abbrechen.onclick = () => {
      eingabe.value = "";
      zeigeFormular(false);
    };
    const lege = () => {
      const name = eingabe.value.trim();
      if (!name) return;
      const fehler = this.klassenVerwaltung.neueKlasse(name);
      if (fehler) {
        this.log("✗ " + fehler);
        return;
      }
      eingabe.value = "";
      zeigeFormular(false);
      this.onKlasseOeffnen?.(name);
    };
    anlegen.onclick = lege;
    eingabe.addEventListener("keydown", (e) => {
      if (e.key === "Enter") lege();
      if (e.key === "Escape") abbrechen.click();
    });

    this.neueKlasseEl.append(knopf, formular);
  }

  // ---- Objekte -----------------------------------------------------------------

  private zeichneObjekte(): void {
    this.objekteEl.innerHTML = "";
    for (const f of this.welt.alleFiguren()) {
      const el = document.createElement("div");
      el.className = "objekt" + (f === this.aktiv ? " aktiv" : "");
      el.innerHTML = `<span class="punkt" style="background:${f.farbe}"></span>
        <span class="objekt-name">${f.name}</span>
        <span class="objekt-typ">: ${f.klasse}</span>`;
      el.onclick = () => {
        this.welt.waehle(f.id);
        this.waehleAktiv(f);
      };
      this.objekteEl.appendChild(el);
    }
    if (this.welt.alleFiguren().length === 0) {
      this.objekteEl.innerHTML =
        '<p class="leer">Noch keine Objekte. Bei einer Klasse auf „neu“ tippen und auf der Welt platzieren.</p>';
    }
  }

  // ---- Methoden ------------------------------------------------------------------

  private zeichneMethoden(): void {
    this.methodenEl.innerHTML = "";
    const f = this.aktiv;
    if (!f) {
      this.methodenEl.innerHTML = '<p class="leer">Objekt antippen, um seine Methoden aufzurufen.</p>';
      return;
    }
    const kopf = document.createElement("div");
    kopf.className = "methoden-kopf";
    kopf.textContent = `${f.name} : ${f.klasse}`;
    this.methodenEl.appendChild(kopf);

    const methoden = this.klassenVerwaltung.methodenFuer(f.klasse);
    let trennerGesetzt = false;
    for (const m of methoden) {
      if (m.geerbt && !trennerGesetzt && methoden.some((x) => !x.geerbt)) {
        const trenner = document.createElement("div");
        trenner.className = "methoden-trenner";
        trenner.textContent = "geerbt von Figur";
        this.methodenEl.appendChild(trenner);
        trennerGesetzt = true;
      }
      this.methodenEl.appendChild(this.methodenZeile(f, m));
    }

    const del = document.createElement("button");
    del.className = "gefahr";
    del.textContent = "entfernen";
    del.onclick = () => {
      void this.laufzeit()
        .entferneObjekt(f.id)
        .catch((e: Error) => this.log("✗ " + e.message));
      this.waehleAktiv(null);
    };
    this.methodenEl.appendChild(del);
  }

  private methodenZeile(f: Figur, m: MethodenSignatur): HTMLElement {
    const zeile = document.createElement("div");
    zeile.className = "methode";

    const knopf = document.createElement("button");
    const signatur = m.params.map((p) => `${p.typ} ${p.name}`).join(", ");
    knopf.textContent = `${m.name}(${m.params.length > 0 ? "…" : ""})`;
    knopf.title = `${m.name}(${signatur})`;
    zeile.appendChild(knopf);

    const eingaben: HTMLInputElement[] = [];
    for (const p of m.params) {
      const eingabe = document.createElement("input");
      if (p.typ === "int" || p.typ === "double") {
        eingabe.type = "number";
        eingabe.value = p.typ === "int" ? "50" : "1.0";
      } else if (p.typ === "boolean") {
        eingabe.type = "text";
        eingabe.value = "true";
      } else {
        eingabe.type = "text";
        eingabe.value = "Hallo!";
      }
      eingabe.title = `${p.typ} ${p.name}`;
      eingabe.placeholder = p.name;
      eingaben.push(eingabe);
      zeile.appendChild(eingabe);
    }

    knopf.onclick = async () => {
      const args = eingaben.map((e) => e.value);
      const anzeige = `${f.name}.${m.name}(${args.map((a, i) => (m.params[i].typ === "String" ? `"${a}"` : a)).join(", ")})`;
      try {
        const ergebnis = await this.laufzeit().rufeMethode(f.id, m.name, args);
        if (ergebnis !== "") this.log(`${anzeige} → ${ergebnis}`);
      } catch (e) {
        this.log(`✗ ${anzeige}: ${(e as Error).message}`);
      }
    };
    return zeile;
  }
}
