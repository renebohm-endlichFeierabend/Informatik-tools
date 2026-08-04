# Pilot: Q1-Wiederholung als Selbstlernstrecke (9 Stunden)

Erster Unterrichtseinsatz des Selbstlernprogramms: die Wiederholung zu
Schuljahresbeginn in der Q1. Konzeptioneller Rahmen:
[`KONZEPT_SELBSTLERNEN.md`](KONZEPT_SELBSTLERNEN.md).

> **Status:** Planung. Zeitrahmen: Beginn in etwa drei Wochen
> (Schuljahresbeginn), 9 Unterrichtsstunden. Stand 04.08.2026.

## 1 Rahmen

| Bedingung | Wert | Konsequenz |
|---|---|---|
| Umfang | 9 Unterrichtsstunden | 9 Bausteine, einer pro Stunde |
| Inhalt | OOP allgemein, Implementationsdiagramme, Vererbung, Arrays | Bausteinfolge in Abschnitt 3 |
| Sozialform | Selbstlernzeit **in der Schule** | keine Hausaufgaben; jede Stunde muss in sich abgeschlossen sein |
| Erreichbarkeit | von zuhause voraussichtlich nicht | kein Nacharbeiten außerhalb; Puffer in der Stunde einplanen |
| Kursgröße | höchstens 12 | Sichtung der Freitexte ist von Hand leistbar |
| Geräte | Schul-iPads, Safari | Werkbank muss im Hochformat bedienbar sein |
| Sitzung | 45 min Arbeitsphase | bei 67,5-Minuten-Stunden bleiben ~20 min für Einstieg und Sicherung im Plenum |

**Zwei Dinge laufen in diesem Piloten ausdrücklich nicht:**

- **kein Server** — Lernstand in `localStorage`, Abgabe als Datei über
  das Share-Sheet nach OneNote. Die Infrastruktur (Technikpapier)
  entsteht parallel und wird hier nicht gebraucht.
- **kein Sprachmodell zur Laufzeit** — alle Hilfen sind statisch im
  Baustein hinterlegt, alle Prüfungen deterministisch. KI wird nur bei
  der *Erstellung* der Aufgaben eingesetzt, also mit Material der
  Lehrkraft. Damit ist die offene Datenschutzfrage
  (`KONZEPT_SELBSTLERNEN.md`, Abschnitt 16) für diesen Piloten
  irrelevant.

Das ist keine Sparversion, sondern der in Etappe D1–D3 vorgesehene
ehrliche Test: Trägt Selbstlernen mit guten Aufgabenformaten, bevor ein
Chat dazukommt?

## 2 Was der Pilot beweisen soll

1. **Tragen die Werkbank-Formate?** Halten Lernende 45 min
   selbstständig durch, wenn die Aufgaben nicht „programmiere X" heißen,
   sondern lesen, verfolgen, entwerfen, erläutern?
2. **Reicht statisches Feedback?** Kommen sie mit Stufe 0 (eingedeutschte
   Fehlermeldung), den Checks und vier statischen Hilfestufen aus — oder
   fehlt der Chat spürbar?
3. **Ist die Sichtung leistbar?** 12 Lernende × 9 Stunden erzeugen
   Freitexte. Wie viel Zeit kostet das Sichten wirklich?
4. **Läuft die Technik im Schulnetz?** Insbesondere CheerpJ auf dem
   iPad — bis heute ungeprüft (`apps/javawelt/ENTWICKLUNG.md`, offener
   Punkt 1).

## 3 Bausteinfolge

Durchgehender Sachkontext: **die Ausleihe der Schulbibliothek** —
Bücher, Ausleihen, Rückgabestapel, Vormerkungen. Ein Kontext für alle
neun Stunden, damit Modell und Diagramm mitwachsen und nicht in jeder
Stunde neu erklärt werden müssen.

| Std | Baustein-ID | Thema | Formate | Prüfung |
|---|---|---|---|---|
| 1 | `q1w.oop.grundbegriffe` | Objekt, Klasse, Attribut, Methode, Sichtbarkeit an einem gegebenen Modell wiederfinden | F1, F13 | Zuordnung exakt |
| 2 | `q1w.diagramm.lesen` | Implementationsdiagramm analysieren: Assoziationen und Multiplizitäten im Sachkontext erläutern | **F13**, F1 | Zuordnung + Freitext |
| 3 | `q1w.diagramm.ueberfuehren` | Diagramm ↔ Code: aus dem Diagramm Klassenrümpfe erzeugen, aus Code das Diagramm ergänzen | F8, F6 | Parser-Fakten |
| 4 | `q1w.vererbung.modell` | Vererbung modellieren (Spezialisieren/Generalisieren) und implementieren | F10, F9 | Parser + Weltzustand |
| 5 | `q1w.vererbung.polymorphie` | dynamische Bindung: eigene Fassungen überschreiben, Verhalten erklären | F9, Erläuterung | Weltzustand + Freitext |
| 6 | `q1w.arrays.durchlaufen` | Array durchlaufen, Belegung nach einer Ereignisfolge verfolgen | **F3**, F2, F6 | Tabelle exakt, Prüffälle |
| 7 | `q1w.arrays.objektfeld` | Feld von Objekten: undokumentierte Methode analysieren, Rückgabe angeben, Strategie erläutern, Fehlerquelle finden | **F1, F2, F4** | Wert exakt + Zeile exakt + Freitext |
| 8 | `q1w.algorithmus.entwerfen` | Algorithmus umgangssprachlich entwerfen, **dann** implementieren | **F14**, F6 | Schrittfolge + Prüffälle |
| 9 | `q1w.gesamt.bibliothek` | klausurnahe Gesamtaufgabe über alles, mit Beurteilung zweier Verfahren | F13, F3, F6, F12 | gemischt |

**Stunde 7 und 8 sind die Klausurformate im Kleinen.** Sie sind
absichtlich den Teilaufgaben c) und b) der Abiturklausur 2023
nachgebaut — gleiche Tätigkeit, anderer Kontext. Nach Stunde 9 sollten
die Lernenden die Aufgabenanatomie einer Informatik-Klausur kennen:
Kontext, Diagramm, Klassendokumentation, Beispieldaten.

### Pflichtkern und Zusatz

Jeder Baustein hat einen **Pflichtkern** (etwa 25–30 min, alle
erreichen ihn) und einen **Zusatzteil** (10–20 min, für Schnelle). Der
Zusatzteil ist nie Voraussetzung für die nächste Stunde — sonst
entstehen Lücken, die niemand mehr einholt.

Beispiel Stunde 6: Pflicht ist die Zustandstabelle für eine gegebene
Ereignisfolge; Zusatz ist, eine Ereignisfolge zu *finden*, die zu einem
vorgegebenen Endzustand führt (Umkehraufgabe, deutlich schwerer, gleiche
Prüflogik).

## 4 Umgang mit unterschiedlichem Arbeitstempo

Bei 12 Lernenden und 9 Stunden werden die Stände auseinanderlaufen. Das
ist kein Problem, wenn die Struktur es einplant:

- **Der Pflichtkern ist der gemeinsame Takt.** Die Sicherung im Plenum
  bezieht sich immer nur auf ihn. Wer im Zusatzteil ist, hat mehr
  gesehen, aber nichts anderes.
- **Die Sicherung arbeitet mit Freitexten, nicht mit Fortschritt.** Drei
  anonymisierte Schülersätze aus der Stunde an die Tafel — das
  funktioniert unabhängig davon, wer wie weit ist, und ist besser als
  jede vorbereitete Folie.
- **Präsentationen nach dem Expertenprinzip.** In Stunde 9 präsentiert
  nicht jede dieselbe Aufgabe, sondern jede *ihren* Teil: eine erklärt
  das Diagramm, eine den Array-Durchlauf, eine die
  Vererbungsentscheidung, eine die Beurteilung der zwei Verfahren.
  Unterschiedliche Stände werden damit zur Arbeitsteilung statt zum
  Vergleich. Der Kernlehrplan verlangt ohnehin *„präsentieren
  Arbeitsabläufe und -ergebnisse"* (K) — nicht „präsentieren dasselbe".
- **Wer zurückfällt**, bekommt in der Folgestunde in Phase 1 eine
  gezielte Mikroübung statt des vollen Bausteins. Der Kompetenzgraph
  erlaubt das, weil Stunde 7 nicht Stunde 6 vollständig voraussetzt.
- **Kein Aufholen zuhause** — das Werkzeug ist von außen nicht
  erreichbar. Deshalb Puffer: **Stunde 9 ist zugleich Aufholstunde.**
  Wer alles hat, bearbeitet die Gesamtaufgabe; wer Lücken hat, füllt sie
  und präsentiert dafür einen kleineren Teil.

## 5 Was gebaut werden muss

Reihenfolge nach Risiko, nicht nach Reihenfolge im Unterricht.

### Zuerst: die Werkbank (unabhängig von CheerpJ)

Die Formate **F1, F2, F3, F4, F13, F14** brauchen keinen Compiler —
sie sind Zuordnungen, Wertvergleiche, Tabellen, Schrittfolgen und
Freitext. Sie laufen also auch dann, wenn CheerpJ im Schulnetz
blockiert ist.

Das ist der Grund, sie zuerst zu bauen: Sie tragen laut Klausuranalyse
den größeren Teil der prüfungsrelevanten Tätigkeiten
(`KONZEPT_SELBSTLERNEN.md`, 5.1) **und** sie sind das einzige, was
garantiert funktioniert. Fällt CheerpJ aus, bleiben von neun Stunden
sechs vollständig bearbeitbar.

Umfang: ein Panel mit fünf Aufgabentypen, Prüflogik, Hilfestufen,
Freitextfeld. Kein Projekt, keine Welt, keine Objektbank.

### Danach: Aufgabenpanel in JavaWelt

Roadmap-Punkt 3 aus `ENTWICKLUNG.md`: Teilszenarien mit Aufgabentext,
Checks gegen Parser und Weltzustand, Abschluss pro Teilszenario. Betrifft
die Stunden 3, 4, 5, 8, 9.

### Danach: F6 mit Testgerüst

„Methode schreiben" mit echten Prüffällen über die CheerpJ-Laufzeit
(`KONZEPT_SELBSTLERNEN.md`, 5.2). Setzt den erfolgreichen iPad-Test
voraus. **Wenn das nicht rechtzeitig läuft**, wird F6 im Piloten durch
F5 (Lückentext im Methodenrumpf) ersetzt — didaktisch schwächer, aber
ohne Compiler prüfbar.

### Parallel: Lernstand lokal und Abgabe

Lernstand als versioniertes JSON in `localStorage`, zweiachsig
(Baustein × Operatorgruppe) wie im Konzept — auch ohne Server, damit das
Datenmodell später nur den Speicherort wechselt. Die Abgabe erweitert den
vorhandenen 📤-Export um Fortschritt, genutzte Hilfestufen und
Freitexte.

> **Safari löscht `localStorage` selten genutzter Seiten.** Bei einer
> Stunde pro Woche ist das ein realistisches Risiko
> (`ENTWICKLUNG.md`, offener Punkt 3). Deshalb: Am Ende **jeder** Stunde
> wird die Abgabe erzeugt und in OneNote abgelegt — nicht nur am Ende
> der Reihe. Das ist zugleich die Sicherung.

## 6 Zeitplan bis zum Einsatz

Drei Wochen, in Wochen gerechnet. Der Plan ist ambitioniert; Abschnitt 7
sagt, was zuerst gestrichen wird.

| Woche | Bauen | Inhalte | Deine Aufgabe |
|---|---|---|---|
| 1 | Werkbank mit F1, F2, F3 · Lernstand lokal | Bausteine 1, 2, 6, 7 (die werkbank-basierten) | **CheerpJ-Test auf dem Schul-iPad** · Sachkontext bestätigen · vorhandene Wiederholungsmaterialien schicken |
| 2 | Werkbank F13, F14 · Aufgabenpanel + Checks | Bausteine 3, 4, 5, 8 · Klassendokumentation und Beispieldaten zum Kontext | Bausteine 1–4 gegenlesen und korrigieren |
| 3 | F6 mit Testgerüst (oder F5 als Rückfall) · Abgabe-Erweiterung · iPad-Durchlauf | Baustein 9 · Hilfestufen 1–4 überall · Wiederholungsfragen für Phase 1 | Bausteine 5–9 gegenlesen · eine Stunde selbst durchspielen |

**Vor jedem Push:** `npm test` und `npm run build` grün, neue
Java-Quelltexte durch die javac-Prüfung (`CLAUDE.md`).

## 7 Risiken und was dann passiert

| Risiko | Wahrscheinlichkeit | Reaktion |
|---|---|---|
| **CheerpJ im Schulnetz blockiert** | unklar, ungeprüft | Stunden 3–5, 8, 9 auf Werkbank-Formate umstellen (F5 statt F6, F8 als Zuordnung statt Implementierung). Sechs von neun Stunden bleiben unverändert |
| **Aufgabenpanel wird nicht rechtzeitig fertig** | mittel | Stunden 4, 5 mit den vorhandenen AUFGABE-Kommentaren im Vererbungs-Szenario fahren, Prüfung von Hand im Plenum |
| **Werkbank-Aufgaben zu leicht oder zu schwer** | hoch (kein Erfahrungswert) | Zusatzteile und Mikroübungen sind der Puffer; nach Stunde 2 nachjustieren |
| **`localStorage` verloren** | mittel | Abgabe nach jeder Stunde (Abschnitt 5) |
| **Zu wenig Zeit für alle 9 Bausteine** | mittel | Bausteine 1, 2, 6, 7 sind der Kern (Klausurformate, kein CheerpJ). Gestrichen wird von hinten: 3, dann 9 als Gesamtaufgabe verkürzt |

**Was zuerst gestrichen wird**, wenn die drei Wochen nicht reichen: F14
(Algorithmus entwerfen) als eigenes Format — der Entwurfsschritt wird
dann als Freitextaufgabe ohne Prüfung gestellt. Das kostet
Rückmeldungsqualität, aber keine Inhalte.

## 8 Was der Pilot nicht leistet

- **Keine Bewertung.** Der Lernstand ist Diagnose. Was in die
  „Sonstigen Leistungen" eingeht, entsteht in der Sicherung, in den
  Präsentationen der Stunde 9 und in der Klausur.
- **Keine Lehrkraft-Live-Sicht.** Ohne Server sieht die Lehrkraft die
  Stände über die Abgaben, nicht während der Stunde.
- **Kein Tutor-Gespräch.** Phase 1 und 2 laufen als Kartenabfrage und
  Auswahltext, Phase 5 als Freitextfeld.
- **Keine Partnerarbeit im Werkzeug.** Paaraufträge kommen erst mit dem
  Server (Etappe D6); in Stunde 9 wird die Zusammenarbeit analog
  organisiert.

## 9 Woran wir nach den 9 Stunden weiterentscheiden

Drei Zahlen und eine Frage:

1. Anteil der Bausteine, die im Pflichtkern **ohne Hilfestufe 3/4**
   bestanden wurden.
2. Verhältnis der Operatorgruppen: Fällt „erläutern" gegenüber
   „implementieren" ab? Wenn ja, war die Vermutung hinter dem ganzen
   Konzept richtig — und die Klausurvorbereitung braucht diesen
   Schwerpunkt.
3. Zeit für die Sichtung, pro Stunde und Kurs.
4. Und die Frage an die Lernenden, offen gestellt: Was hat gefehlt?
   Wenn die Antwort „jemand, den ich fragen kann" lautet, ist der
   Tutor-Chat (Etappe D5) begründet — und nicht vorher.
