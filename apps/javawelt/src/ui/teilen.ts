// Teilen & Abgeben:
// - Aufgaben-Links: das komplette Projekt komprimiert im Link (#projekt=…),
//   damit eine Aufgabe als ein Tipp in OneNote/Teams verteilt werden kann.
// - Abgabe-Dokument: Screenshot + Quelltext + Konsole als eine HTML-Datei,
//   auf dem iPad direkt über das Share-Sheet teilbar (Web Share API).
//
// Link-Format: #projekt=<art>.<base64url>
//   art "1" = gzip-komprimiert (CompressionStream), art "0" = unkomprimiert.
//   Gelesen werden immer beide Arten; nur sehr alte Browser ohne
//   DecompressionStream können "1."-Links nicht öffnen → klare Meldung.

function nachBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(bin).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function vonBase64Url(text: string): Uint8Array {
  const bin = atob(text.replaceAll("-", "+").replaceAll("_", "/"));
  return Uint8Array.from(bin, (zeichen) => zeichen.charCodeAt(0));
}

async function durchStrom(
  bytes: Uint8Array,
  wandler: CompressionStream | DecompressionStream,
): Promise<Uint8Array> {
  // Casts: die DOM-Typen erlauben pipeThrough(CompressionStream) (noch) nicht direkt.
  const strom = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(wandler as unknown as ReadableWritablePair<Uint8Array, Uint8Array>);
  return new Uint8Array(await new Response(strom).arrayBuffer());
}

/** Verpackt Projektdaten für den Link-Hash (#projekt=…). */
export async function kodiereProjektFuerLink(daten: unknown): Promise<string> {
  const roh = new TextEncoder().encode(JSON.stringify(daten));
  if (typeof CompressionStream === "function") {
    return "1." + nachBase64Url(await durchStrom(roh, new CompressionStream("gzip")));
  }
  return "0." + nachBase64Url(roh);
}

/** Liest Projektdaten aus dem Link-Hash; wirft bei kaputten Links. */
export async function dekodiereProjektAusLink(kode: string): Promise<unknown> {
  const punkt = kode.indexOf(".");
  const art = kode.slice(0, punkt);
  if (punkt < 1 || (art !== "0" && art !== "1")) {
    throw new Error("Das ist kein JavaWelt-Aufgaben-Link.");
  }
  if (art === "1" && typeof DecompressionStream !== "function") {
    throw new Error("Dieser Browser kann komprimierte Aufgaben-Links nicht öffnen (zu alt).");
  }
  try {
    let bytes = vonBase64Url(kode.slice(punkt + 1));
    if (art === "1") bytes = await durchStrom(bytes, new DecompressionStream("gzip"));
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch {
    throw new Error("Der Aufgaben-Link ist beschädigt oder unvollständig.");
  }
}

// ---- Abgabe-Dokument ---------------------------------------------------------

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

/**
 * Baut das Abgabe-Dokument: eine einzelne HTML-Datei mit Welt-Screenshot,
 * allen Schüler-Quelltexten und der Konsolenausgabe – einheitlich fürs
 * Korrigieren, einfügbar in OneNote/Teams.
 */
export function erstelleAbgabeHtml(angaben: {
  datum: Date;
  laufzeit: string;
  bild: string; // PNG als data-URL vom Welt-Canvas
  klassen: Record<string, string>;
  konsole: string;
}): string {
  const datumText = angaben.datum.toLocaleString("de-DE", {
    dateStyle: "full",
    timeStyle: "short",
  });
  const klassenTeile = Object.entries(angaben.klassen)
    .map(
      ([name, code]) =>
        `<h2>${escapeHtml(name)}.java</h2>\n<pre>${escapeHtml(code.trimEnd())}</pre>`,
    )
    .join("\n");
  const konsoleTeil = angaben.konsole.trim()
    ? `<h2>Konsole</h2>\n<pre>${escapeHtml(angaben.konsole.trim())}</pre>`
    : "";
  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>JavaWelt-Abgabe – ${escapeHtml(datumText)}</title>
<style>
  body { font-family: -apple-system, "Segoe UI", sans-serif; margin: 2rem auto; max-width: 52rem; padding: 0 1rem; color: #1c2733; }
  h1 { font-size: 1.4rem; border-bottom: 2px solid #1c2733; padding-bottom: .4rem; }
  h2 { font-size: 1.05rem; margin-top: 1.6rem; }
  .angaben { color: #4a5a68; }
  img.welt { max-width: 100%; border: 1px solid #b8c4cf; border-radius: 6px; }
  pre { background: #f4f6f8; border: 1px solid #d4dce3; border-radius: 6px; padding: .8rem; overflow-x: auto; font-size: .85rem; line-height: 1.45; }
</style>
</head>
<body>
<h1>JavaWelt-Abgabe</h1>
<p class="angaben"><b>Name:</b> _________________________ · <b>Datum:</b> ${escapeHtml(datumText)} · <b>Laufzeit:</b> ${escapeHtml(angaben.laufzeit)}</p>
<h2>Welt</h2>
<img class="welt" src="${angaben.bild}" alt="Screenshot der Welt" />
${konsoleTeil}
${klassenTeile}
</body>
</html>
`;
}

// ---- Teilen (Share-Sheet) oder Herunterladen -----------------------------------

function ladeHerunter(datei: File): void {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(datei);
  a.download = datei.name;
  a.click();
  URL.revokeObjectURL(a.href);
}

/**
 * Bietet Dateien über das Share-Sheet an (iPad: direkt nach OneNote/Teams);
 * wo das nicht geht, werden sie stattdessen heruntergeladen.
 * Muss direkt aus einer Nutzer-Geste heraus aufgerufen werden (Safari).
 */
export async function teileDateien(
  dateien: File[],
  titel: string,
): Promise<"geteilt" | "abgebrochen" | "heruntergeladen"> {
  if (navigator.share && navigator.canShare?.({ files: dateien })) {
    try {
      await navigator.share({ files: dateien, title: titel });
      return "geteilt";
    } catch (e) {
      if ((e as Error).name === "AbortError") return "abgebrochen";
      // NotAllowedError o. Ä. → Herunterladen als Ausweg.
    }
  }
  for (const datei of dateien) ladeHerunter(datei);
  return "heruntergeladen";
}
