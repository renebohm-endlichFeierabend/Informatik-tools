import initSqlJs from "sql.js";
import { Datenbank, ZOO_SEED } from "../src/java/datenbank";

(globalThis as any).initSqlJs = initSqlJs;
// Achtung: import.meta.url zeigt auf das BUNDLE unter tests/.out/
process.chdir(new URL("../../public", import.meta.url).pathname);

const Z = "\u001E";
const F = "\u001F";
let fehler = 0;
const pruefe = (name: string, b: boolean, detail?: unknown) => {
  if (b) console.log("OK  " + name);
  else {
    fehler++;
    console.log("FEHLER  " + name, detail ?? "");
  }
};

const db = new Datenbank(ZOO_SEED);

// SELECT: Spalten, Typen, Zeilen
const alle = (await db.fuehreAus("SELECT name, art, geburtsjahr FROM tier")).split(Z);
pruefe("SELECT ok", alle[0] === "ok");
pruefe("Spaltennamen", alle[1] === ["name", "art", "geburtsjahr"].join(F), alle[1]);
pruefe("Typen erkannt", alle[2] === ["TEXT", "TEXT", "INTEGER"].join(F), alle[2]);
pruefe("10 Tiere", alle.length - 3 === 10, alle.length - 3);
pruefe("Erste Zeile Kibo/Elefant", alle[3] === ["Kibo", "Elefant", "2014"].join(F), alle[3]);

// WHERE + ORDER BY
const pinguine = (await db.fuehreAus("SELECT name FROM tier WHERE art = 'Pinguin' ORDER BY name")).split(Z);
pruefe("WHERE/ORDER BY: Pinga, Waddle", pinguine.slice(3).join(",") === "Pinga,Waddle", pinguine.slice(3));

// JOIN über Fremdschlüssel
const join = (
  await db.fuehreAus(
    "SELECT tier.name, gehege.name FROM tier JOIN gehege ON tier.gehege_id = gehege.id WHERE gehege.klima = 'kalt' ORDER BY tier.name",
  )
).split(Z);
pruefe("JOIN: 3 Tiere in der Polarwelt", join.length - 3 === 3, join.slice(3));
pruefe("JOIN: Frostine zuerst", join[3].startsWith("Frostine"), join[3]);

// INSERT wirkt, "ok" ohne Ergebnis
const einf = await db.fuehreAus(
  "INSERT INTO tier (id, name, art, geburtsjahr, gehege_id) VALUES (11, 'Nemo', 'Fisch', 2024, 3)",
);
pruefe("INSERT liefert ok ohne Daten", einf === "ok", einf);
const nachher = (await db.fuehreAus("SELECT COUNT(*) FROM tier")).split(Z);
pruefe("Jetzt 11 Tiere", nachher[3] === "11", nachher[3]);

// SQL-Fehler wird gemeldet
const kaputt = await db.fuehreAus("SELECT quatsch FROM gibtEsNicht");
pruefe("Fehler wird kodiert gemeldet", kaputt.startsWith("fehler" + Z) && kaputt.includes("gibtEsNicht"), kaputt);

// Reset stellt den Seed wieder her
db.setzeZurueck();
const reset = (await db.fuehreAus("SELECT COUNT(*) FROM tier")).split(Z);
pruefe("Nach Reset wieder 10 Tiere", reset[3] === "10", reset[3]);

// NULL-Werte → leeres Feld
await db.fuehreAus("INSERT INTO tier (id, name, art, geburtsjahr, gehege_id) VALUES (12, 'Rex', 'Dino', NULL, NULL)");
const nullZeile = (await db.fuehreAus("SELECT name, geburtsjahr FROM tier WHERE id = 12")).split(Z);
pruefe("NULL wird zu leerem Feld", nullZeile[3] === "Rex" + F, JSON.stringify(nullZeile[3]));

console.log(fehler === 0 ? "\nAlle Datenbank-Tests bestanden." : `\n${fehler} Fehler`);
process.exit(fehler === 0 ? 0 : 1);
