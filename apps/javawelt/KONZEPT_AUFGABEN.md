# Konzept: Aufgaben-Integration in JavaWelt

> **Zweck:** Fachlich-didaktisches Konzept für die Integration von
> Aufgaben direkt in die Lernumgebung (Roadmap-Punkte 3 und 4 in
> `ENTWICKLUNG.md`). Grundlage ist das Kollegen-Feedback (Juli 2026)
> zur Optionen-Diskussion. Dieses Dokument hält die
> Leitentscheidungen fest; die technische Umsetzung folgt in Phasen
> (siehe unten).

**Stand: Juli 2026 — Konzeptphase, noch keine Umsetzung begonnen**

## Bezug: die sechs diskutierten Optionen

Ausgangspunkt war eine Optionen-Liste zur Verzahnung von Aufgaben
(OneNote) und Entwicklungsumgebung:

1. **Aufgaben-Links (Deep-Links)** — `?szenario=…`, `?projekt=<URL>`,
   `#projekt=<komprimiert>` (Hinweg).
2. **Aufgaben in die Umgebung statt daneben** — Aufgaben-Panel als
   Seitenleiste mit abhakbaren Schritten (Hinweg).
3. **„Abgabe erstellen“-Knopf** — Screenshot + Quelltext + Konsole
   über das Share-Sheet (Rückweg).
4. **Projektdatei als „echte“ Abgabe** — lauffähige Abgabe statt
   Code-Foto (Rückweg).
5. **Auto-Checks pro Aufgabe** — Prüfungen gegen Parser + Weltzustand,
   formatives Feedback im Moment des Arbeitens.
6. **Brücke zum KI-Analyse-Tool** — Verhalten prüft die JavaWelt,
   Codequalität/NRW-Konventionen das vorhandene Analyse-Tool.

Das Kollegen-Feedback befürwortet **Option 2 als Kern** (weitergedacht
zu Teilszenarien, die in ein Gesamtszenario einfließen) und sieht
**Option 5 und 6 für bestimmte Aufgabenformate als besonders
passend** — mit den unten festgehaltenen Anforderungen an visuelles
Feedback, Hilfen, Gamification, Reflexion und Lehrkraft-Sicht.
Die Optionen 1, 3 und 4 bleiben davon unberührt (kleine, unabhängige
Bausteine für Hin- und Rückweg) und sind mit dem Konzept kombinierbar:
Deep-Links verteilen Teilszenarien, der Abgabe-Export transportiert
Fortschritt, Hilfe-Nutzung und Reflexion.

## Leitentscheidung: Teilszenarien statt Aufgabenliste

Aufgaben werden nicht als klassische „Aufgabe 1 bis x" neben die
Umgebung gestellt, sondern als **in sich abgeschlossene Teilszenarien
direkt in JavaWelt** bearbeitet. Mehrere Teilszenarien bilden zusammen
ein **übergeordnetes Gesamtszenario**: Ergebnisse oder „erworbene
Elemente" aus einem Teilszenario fließen in das Gesamtszenario ein
(z. B. schaltet ein gelöstes Teilszenario einen Bereich, eine Figur
oder eine Fähigkeit im Gesamtszenario frei).

Konsequenzen für das Datenmodell:

- Ein **Szenario** besteht künftig aus Metadaten (Titel, Stufe,
  Kontext), einer Folge von **Teilszenarien** (je eigener Klassensatz
  bzw. Klassen-Deltas, Aufgabentext, Checks, Hilfen) und optional
  einem Gesamtszenario, das Fortschritt aus den Teilszenarien liest.
- Bestehende Szenarien (`src/ui/szenarien.ts`) bleiben lauffähig;
  AUFGABE-Kommentare werden schrittweise in strukturierte
  Teilszenarien überführt (Pilot: Vererbungs-Szenario).

## Feedback: visuell und fachlich eingebettet

Das unmittelbare Feedback zu einer Lösung kommt **aus der Welt
selbst**, nicht (nur) aus einer Checkliste: die Figur tut das
Richtige, eine Tür öffnet sich, ein Weg wird frei. Richtig/falsch
soll für die Lernenden am Verhalten des Szenarios ablesbar sein.

- **Grüner Haken / rotes Kreuz** ist zulässig als *Abschluss-Anzeige
  eines Teilszenarios* (Aufreihung des Stundenfortschritts), aber
  nicht als primäres Aufgaben-Feedback.
- Technisch: Checks prüfen Parser-Fakten („Klasse Kuh erbt von
  Tier") **und Weltzustand nach Lauf** („alle Tiere stehen im
  Gehege"). Der Weltzustand ist zugleich das, was die Lernenden
  sehen — Check und visuelles Feedback fallen damit zusammen.
- Aufgaben werden von Anfang an so entworfen, dass ein korrekter
  Lösungsweg eine **sichtbare Konsequenz** in der Welt hat.

## Gamification: Belohnung ja, Bestrafung nie

Für abgeschlossene Teilszenarien können Lernende **Coins, Abzeichen
oder Pins** erhalten (vgl. Orden in Pokémon) — als „Aufgabenhonorar"
und als sichtbarer Fortschritt im Gesamtszenario.

Verbindliche Regeln:

1. **Hilfen kosten nie etwas.** Die Nutzung von Hinweisen, gestuften
   Hilfen oder KI-Unterstützung führt niemals zu Coin-Verlust,
   schlechteren Abzeichen oder anderen Nachteilen — sonst verzichten
   Lernende auf notwendige Unterstützung.
2. Belohnungen honorieren den **Abschluss fachlicher Arbeit**, nicht
   Geschwindigkeit oder Fehlerfreiheit. Kein Ranking zwischen
   Lernenden.
3. Das Sammeln bleibt Beiwerk: Belohnungen schalten höchstens
   kosmetische oder narrative Elemente im Gesamtszenario frei, nie
   fachliche Inhalte, die andere dann nicht bearbeiten können.

## Gestuftes Hilfesystem

Bei Fehlern wird keine Lösung vorgegeben, sondern schrittweise
hingeführt. Stufen (jeweils erst auf Anforderung der Lernenden):

| Stufe | Hilfe | Beispiel |
|---|---|---|
| 0 | **Umgebung fängt ab**: verständliche, deutsche Fehlermeldungen der IDE selbst | übersetzte ECJ-Meldung mit markierter Zeile statt Compiler-Jargon |
| 1 | Aufmerksam machen auf die **problematische Stelle** | „Schau dir die Bedingung deiner Schleife an." |
| 2 | **Denkanstoß / Rückfrage** | „Was passiert, wenn der Stack leer ist?" |
| 3 | **Konkretere Hilfe** | Teillösung des Gedankengangs, Verweis auf ein analoges Beispiel |
| 4 | **Strukturierte Letzthilfe**, je nach Aufgabenformat | vorstrukturierter Lösungsweg, ausgearbeitetes Beispiel oder Lückentext |

Wichtige Präzisierungen:

- **Fehlerart bestimmt Hilfeart.** Ein Syntaxfehler braucht andere
  Unterstützung als eine fachliche Fehlvorstellung oder ein
  ungeeignetes Modell. Das Hilfesystem unterscheidet mindestens:
  Syntax (→ Stufe 0, IDE-Sache), Laufzeit-/Logikfehler (→ Stufen 1–4
  aufgabenbezogen), Modellierungsfehler (→ eher Rückfragen und
  Beispiele als Code-Hinweise).
- **Syntaxfehler sind unterschätzt teuer.** Erfahrung: Sie lenken
  stark ab und kosten Lernenden viel Zeit. Priorität hat deshalb der
  Ausbau von Stufe 0 in der Umgebung selbst (bessere Übersetzung und
  Verortung der ECJ-Meldungen, typische Anfängerfehler gezielt
  erkennen: fehlendes Semikolon, Klammern, Groß-/Kleinschreibung,
  `nenne` vs. Konstruktor), bevor KI-Hilfen ansetzen.
- **Rolle der KI** (über die vorhandene OpenRouter-Brücke,
  `java_analyse_tool.html`): erzeugt bzw. formuliert die Stufen 1–3
  passend zu Aufgabe und konkretem Schülercode; kann außerdem
  Prüffälle, Aufgabenvarianten und gestufte Hilfen **für die
  Lehrkraft generieren**, die diese dann redigiert und statisch im
  Szenario hinterlegt. Statisch hinterlegte Hilfen sind der
  Normalfall (offline-fähig, kontrollierbar); KI ist Zusatzstufe.

## Reflexion nach dem Teilszenario

Nach Abschluss eines Teilszenarios folgt eine **kurze Reflexion**:
Was ist die zentrale Erkenntnis? Welcher Fehler trat auf? Welche
Regel lässt sich ableiten? Die Antwort (1–3 Sätze, Freitext oder
Satzanfänge) wird Teil des Abgabe-Exports und dient als **Übergang
zur abstrahierten Sicherung in OneNote** — sie ersetzt die Sicherung
nicht.

## Kooperative Szenarien (perspektivisch)

Einige Szenarien werden kooperativ angelegt: Lernende erhalten
unterschiedliche **Rollen, Informationen oder Teilaufträge**
(Grundgedanke Modularität/Schnittstellen) und führen ihre Ergebnisse
zusammen. Besonders geeignet für Szenarien mit realem Projekt- oder
Auftraggeber-Rahmen (gemeinsames Programm, Problem eines fiktiven
Kunden, verteilte Verantwortungsbereiche).

Technischer Rahmen ohne Server: Aufteilung über verschiedene
Deep-Links/Projektdateien pro Rolle; Zusammenführung über den
Projektdatei-Austausch (Dateien-App/Teams) und definierte
Schnittstellen zwischen den Klassen der Teilaufträge.

## Lehrkraft-Sicht

Gewünscht ist eine Ansicht zum **Bereitstellen und Konfigurieren**
von Szenarien sowie zur Einsicht in Bearbeitungsstände, Lösungswege,
Fehlversuche, Hilfe-Nutzung und typische Fehlvorstellungen.

Einordnung zur bestehenden Architektur (statisch, GitHub Pages, kein
Server):

- **Ohne Server machbar (zuerst umsetzen):**
  - Bereitstellen/Konfigurieren: Szenario-Editor bzw.
    Szenario-Definition als Datei + Deep-Link (Roadmap-Punkt 1);
    die Lehrkraft verteilt Links über OneNote.
  - Einsicht: der **Abgabe-Export** (Roadmap-Punkt 2) wird um
    Metadaten erweitert — bearbeitete Teilszenarien, Zahl der
    Fehlversuche, genutzte Hilfestufen, Reflexionstext. Die
    Lehrkraft sieht das pro Abgabe, nicht live.
- **Braucht zentrale Datenhaltung (Client-Server) → zurückgestellt**,
  gleiche Begründung wie die OneNote-API in `ENTWICKLUNG.md`
  (Backend, Datenschutz, Admin-Aufwand): Live-Dashboard über die
  Lerngruppe, Synchronisation zwischen Lernenden- und
  Lehrkraft-Ansicht, zentrale Fortschrittsspeicherung. Erst angehen,
  wenn der dateibasierte Weg im Unterricht nachweislich nicht reicht.

## Verschiedene Prüf- und Hilfeformen je Aufgabenformat

Es gibt bewusst **kein einheitliches Prüfverfahren**. Je nach
Aufgabenformat sind unterschiedliche Checks und darauf abgestimmte
Hilfen vorgesehen, z. B.:

| Aufgabenformat | Prüfung | typische Letzthilfe (Stufe 4) |
|---|---|---|
| Klasse/Vererbung modellieren | Parser-Fakten (erbt von, Attribute, Signaturen) | vorstrukturiertes Klassengerüst |
| Verhalten programmieren | Weltzustand nach Lauf, sichtbare Konsequenz | Lückentext im Methodenrumpf |
| Datenstruktur nutzen (Stack/Queue/List) | Prüffälle: Folge von Operationen → erwarteter Zustand/Ausgabe | ausgearbeitetes analoges Beispiel |
| SQL/Datenbank | Ergebnis der Abfrage gegen erwartete Tabelle | Abfragegerüst mit Lücken |
| Modellierung/ER | (zunächst) KI-gestützte Rückmeldung über die Analyse-Brücke | Musterdiskussion statt Musterlösung |

## Umsetzungsphasen

1. **Aufgaben-Panel + Auto-Checks im Pilotszenario (Vererbung):**
   Teilszenarien-Struktur, Checks gegen Parser + Weltzustand,
   visuelles Feedback in der Welt, Abschluss-Haken pro Teilszenario.
2. **Stufe-0-Hilfen ausbauen:** ECJ-Meldungen weiter eindeutschen und
   verorten, typische Anfängerfehler gezielt erkennen.
3. **Gestufte Hilfen (statisch):** Hilfe-Stufen 1–4 pro Aufgabe im
   Szenario hinterlegbar, UI mit „Ich brauche einen Hinweis".
4. **KI-Stufen über die Analyse-Brücke:** Stufen 1–3 dynamisch aus
   Aufgabe + Schülercode; Generator-Werkzeug für Lehrkraft
   (Prüffälle, Varianten, Hilfen).
5. **Fortschritt + Belohnungen:** Teilszenario-Fortschritt im
   Gesamtszenario sichtbar, Coins/Abzeichen nach den obigen Regeln;
   Reflexions-Schritt + erweiterter Abgabe-Export.
6. **Perspektivisch:** kooperative Szenarien (dateibasiert),
   Lehrkraft-Dashboard nur bei nachgewiesenem Bedarf (Server).
