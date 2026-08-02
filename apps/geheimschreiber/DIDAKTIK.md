# Die Gilde der Geheimschreiber — Didaktisches Konzept

Ein Lernspiel zum Inhaltsfeld **„Information und Daten"** für die
Klasse 6 an der Liebfrauenschule Mülhausen.

> **Status:** Konzeptentwurf, noch nicht umgesetzt. Die didaktischen
> Entscheidungen sind Vorschläge zur Diskussion in der Fachschaft.

---

## 1 Ausgangslage

Grundlage ist der schulinterne Lehrplan der LFSM zum Kernlehrplan
Sekundarstufe I – G9 (Stand 07/2021), dort **Kapitel 3 der Klasse 6:
„Informationen und Daten – Codierungen und Kryptologie"**, im Lehrwerk
„Informatik – Nordrhein-Westfalen 5./6. Schuljahr" (Cornelsen)
die Seiten 61–88.

Rahmenbedingungen, die das Konzept prägen:

| Bedingung | Quelle | Konsequenz für das Spiel |
|---|---|---|
| Unterrichtsstunden à **67,5 min** | schulinterner LP, Kap. 2.1 | Kapitel sind in 20–30 min spielbar, mehrere passen in eine Stunde |
| **22,5 min STUDIO** pro Woche, Ziel: selbstständiges Arbeiten | schulinterner LP, Kap. 1 und 2.1 | Kapitel sind auch allein und ohne Lehrkraft durchspielbar |
| Informatik in Kl. 5/6 nur **ein Halbjahr** pro Schuljahr | schulinterner LP, Kap. 2.1 | Das Spiel trägt die Erarbeitung, ersetzt aber nicht den Unterricht |
| **Projektorientiertes Arbeiten auf verschiedenen Niveaus** als Fachprofil | schulinterner LP, Kap. 1 | Differenzierung ist eingebaut, nicht nachgerüstet |
| **Vigenère ausdrücklich als Differenzierung** vereinbart | schulinterner LP, Kap. 3 | Vigenère ist optionales Zusatzkapitel, kein Pflichtweg |
| Ab Klasse 7 Laptops, in 5/6 **noch nicht** | schulinterner LP, Kap. 1 | Zielgeräte sind Schul-iPads (Touch) und PC-Raum (Tastatur) |

Der Kernlehrplan ordnet die Kompetenzerwartungen vier Kompetenzbereichen
zu: **Argumentieren (A)**, **Modellieren und Implementieren (MI)**,
**Darstellen und Interpretieren (DI)**, **Kommunizieren und
Kooperieren (KK)**. Diese Kürzel stehen unten in der Matrix.

---

## 2 Curriculare Verankerung

Alle Kompetenzerwartungen des schulinternen Lehrplans zu Kapitel 3 sind
abgedeckt. Die Formulierungen sind wörtlich übernommen.

| # | Kompetenzerwartung (schulinterner LP) | Bereich | Buch | Kapitel im Spiel |
|---|---|---|---|---|
| K1 | erläutern den Datenbegriff anhand von Beispielen aus ihrer Erfahrungswelt | A | S. 64 | Prolog |
| K2 | erläutern den Zusammenhang und die Bedeutung von Information und Daten | A | S. 64 | Prolog, Kap. 1 |
| K3 | stellen eine ausgewählte Information in geeigneter Form als Daten formalsprachlich oder graphisch dar | DI | S. 65–67 | Kap. 1, Kap. 2 |
| K4 | nennen Beispiele für die Codierung von Daten | DI | S. 64–72 | Prolog, Kap. 1 |
| K5 | codieren und decodieren Daten unter Verwendung des Binärsystems | MI | S. 68–70 | Kap. 2 |
| K6 | setzen eine weitere Codierungsvorschrift aus ihrer Erfahrungswelt ein und vergleichen diese mit der Binärcodierung | MI | S. 88 A7 | Kap. 1 (Morse) ↔ Kap. 2 |
| K7 | interpretieren ausgewählte Daten als Information im gegebenen Kontext | DI | S. 70/71 | Kap. 2, Finale |
| K8 | erläutern Einheiten von Datenmengen | A/KK | S. 72 | Kap. 2 |
| K9 | vergleichen Datenmengen hinsichtlich ihrer Größe mithilfe anschaulicher Beispiele aus ihrer Lebenswelt | DI | S. 72 | Kap. 2 |
| K10 | erläutern ein einfaches Transpositionsverfahren als Möglichkeit der Verschlüsselung | DI | S. 75 | Kap. 3 |
| K11 | bewerten verschiedene Verschlüsselungsverfahren unter Berücksichtigung von Sicherheitsaspekten | DI | S. 74, 77, 80 | Kap. 5, Kap. 8, Finale |

**Hinweis zur Formulierung von K11:** Der schulinterne Lehrplan schreibt
„bewerten", der Kernlehrplan formuliert an dieser Stelle nach den mir
zugänglichen Quellen „vergleichen … unter Berücksichtigung von
ausgewählten Sicherheitsaspekten". Ich konnte das KLP-PDF in dieser
Umgebung nicht direkt öffnen (`lehrplannavigator.nrw.de` liefert dem
Proxy 403), die Angabe stammt aus Sekundärquellen und sollte am
Original geprüft werden. Für das Spiel ist die Differenz unerheblich —
es deckt beide Anforderungsniveaus ab: erst vergleichen, dann bewerten.

Zusätzlich bedient das Spiel Kompetenzen aus dem Klasse-5-Kapitel
„Informatik, Mensch und Gesellschaft" mit, insbesondere *„beschreiben
Maßnahmen zum Schutz von Daten mithilfe von Informatiksystemen"* — das
Finale greift genau das auf.

---

## 3 Didaktische Leitentscheidungen

**1. Werkzeuge statt Lösungen.** Jedes Kapitel endet nicht mit einer
richtigen Antwort, sondern mit einem **Werkzeug im Gildenbeutel**: der
Skytale, der Cäsar-Scheibe, der Häufigkeits-Lupe. Werkzeuge bleiben
dauerhaft verfügbar und werden in späteren Kapiteln wieder gebraucht.
Das Verfahren ist der Lerngegenstand, nicht das einzelne Rätsel.

**2. Enaktiv vor symbolisch.** Die Chiffrierscheibe wird mit dem Finger
gedreht, der Webstuhl mit gehobenen und gesenkten Fäden bedient, die
Skytale um einen Stab gewickelt. Erst danach kommt die Regel als Text.
Für Zwölfjährige ist das kein Beiwerk, sondern der Zugang.

**3. Kein Scheitern, nur Umwege.** Es gibt keine Lebenspunkte, keine
Zeitlimits, kein Game Over. Falsche Eingaben erzeugen eine Reaktion in
der Spielwelt („der Brief kommt zerknittert zurück"), nie eine
Abwertung. Das gestufte Hilfesystem (siehe 7) sorgt dafür, dass niemand
stecken bleibt.

**4. Erklären gehört zum Lösen.** Nach jedem Kapitel formuliert die
Spielfigur den Merksatz im **Gildenbuch** — teils per Auswahl, teils in
eigenen Worten als freier Text. Das bedient die A- und DI-Kompetenzen,
die ein reines Klick-Rätsel nicht erreicht.

**5. Sicherheit ist ein Argument, kein Gefühl.** Ab Kapitel 5 wird jedes
Verfahren gegen den Lauscher getestet. Die Schülerinnen und Schüler
erleben, dass Cäsar an 25 Versuchen scheitert und die Häufigkeitsanalyse
Substitution knackt. Bewerten heißt hier: eine Erfahrung begründen.

**6. Kerckhoffs' Prinzip als roter Faden.** Die Kernbotschaft des ganzen
Spiels, kindgerecht formuliert: **„Das Verfahren darf jeder kennen — der
Schlüssel muss geheim bleiben."** Der Lauscher wird am Ende nicht
besiegt, weil man ihn fängt, sondern weil er mit einem guten Verfahren
nichts mehr anfangen kann.

**7. Das Spiel ist Lernmittel, nicht Prüfung.** Siehe Abschnitt 9.

---

## 4 Die Spielwelt

**Codria** ist eine Hafenstadt auf einer Insel. Früher gingen alle
Briefe offen von Hand zu Hand — bis jemand anfing, sie unterwegs zu
lesen. Die Stadt nennt ihn **den Lauscher**. Seither gibt es die
**Gilde der Geheimschreiber**: Sie sorgt dafür, dass Nachrichten in
Codria ankommen, ohne dass Fremde sie verstehen.

Die Spielfigur ist **neu in der Gilde**. Name und Aussehen sind frei
wählbar (mehrere Hautfarben, Frisuren, Kleidung; keine Geschlechtswahl
nötig, alle Optionen für alle). Begleiter ist **Bit**, eine vorlaute
Brieftaube, die Aufträge bringt, Hinweise gibt — und selbst nicht alles
weiß. Bit fragt oft zurück statt zu erklären.

Jeder Stadtteil hat eine Meisterin oder einen Meister eines Verfahrens.
Wer die Prüfung besteht, bekommt ein **Wachssiegel**. Acht Siegel
öffnen das Rathaus, in dem der Fall des Lauschers aufgeklärt wird.

Die Dramaturgie ist bewusst **nicht bedrohlich**: Der Lauscher taucht
nie als Figur auf, es gibt keine Kämpfe und keine Verfolgung. Was man
von ihm sieht, sind abgefangene Briefe — und die sind das Rätselmaterial.

---

## 5 Kapitelübersicht

| Nr. | Ort | Figur | Thema | Werkzeug | Kompetenzen | ca. |
|---|---|---|---|---|---|---|
| P | Gildenhaus am Hafen | Gildenmeisterin **Ada** | Daten und Information | Gildenbuch | K1, K2, K4 | 15 min |
| 1 | Leuchtturm | Leuchtturmwärter **Morten** | Codes, Morsealphabet | Signallampe | K3, K4, K6 | 25 min |
| 2 | Weberei | Weberin **Bina** | Binärcode, Datenmengen | Bit-Waage | K5, K6, K7, K8, K9 | 30 min |
| 3 | Gärtnerei | Gärtner **Skyt** | Transposition | Skytale | K10 | 25 min |
| 4 | Römisches Theater | Schauspielerin **Livia** | Cäsar-Verschlüsselung | Cäsar-Scheibe | K10, K11 | 25 min |
| 4a | Turm der Zahlen | Meisterin **Vigena** | Vigenère *(optional)* | Vigenère-Tafel | Vertiefung K11 | 25 min |
| 5 | Bibliothek | Archivar **Kindi** | Kryptoanalyse | Häufigkeits-Lupe | K7, K11 | 30 min |
| 6 | Malerviertel | Malerin **Stella** | Steganographie | Zitronen-Feder | K4, K11 | 20 min |
| 7 | Marktplatz | Händler **Quirin** | QR-Code, Fehlerkorrektur | Lesebrille | K4, K7 | 20 min |
| 8 | Schlosserei | Schlosserin **Klara** | Public-Key | Offenes Schloss | K11 | 25 min |
| F | Rathaus | alle | Der Fall des Lauschers | — | K7, K11, Transfer | 30 min |

**Summe:** rund 4,5 Zeitstunden Spielzeit ohne das optionale Kapitel 4a.
Der schulinterne Lehrplan weist für Kapitel 3 keinen festen Zeitraum
aus; bei einem Halbjahr für die Kapitel 3 und 4 bleibt neben dem Spiel
ausreichend Raum für analoge Sicherung, Unterrichtsgespräch und das
Projekt aus Kapitel 4.

---

## 6 Die Kapitel im Einzelnen

### Prolog — Ankunft im Gildenhaus (K1, K2, K4)

Ada nimmt die Spielfigur auf und stellt eine einzige Frage: *„Was steht
eigentlich in einem Brief — und was verstehst du daraus?"* Im Gildenhaus
liegen Dinge herum, die Daten tragen: ein Wetterzettel mit Zahlen, eine
Wanduhr, ein Fahrplan, ein Bild. Die Spielfigur ordnet zu, was **Daten**
sind und welche **Information** man daraus liest — und erlebt am
Wetterzettel, dass dieselben Zahlen ohne Kontext nichts bedeuten
(„17" — Grad? Uhrzeit? Hausnummer?).

*Sicherung:* erster Eintrag im Gildenbuch, Buchbezug S. 64, S. 70/71.

### Kapitel 1 — Der Leuchtturm (K3, K4, K6)

Morten muss nachts Schiffe warnen, kann aber nicht rufen. Er hat nur ein
Licht: kurz oder lang. Die Spielerin baut sich daraus schrittweise ein
Alphabet und stößt selbst auf das Problem der Trennzeichen — woher weiß
man, wo ein Buchstabe endet? Danach wird das echte Morsealphabet
eingeführt und benutzt: Schiffe rufen, Antworten decodieren.

Der Vergleich mit anderen Alltagscodes (Winkeralphabet, Ampel, Braille,
Trikotnummern) sammelt Beispiele für K4.

*Rätseltypen:* Lichtsignale antippen/eingeben, Klopfzeichen hören
(Audio, abschaltbar), Nachricht an ein Schiff senden.
*Buchbezug:* S. 64–67.

### Kapitel 2 — Die Weberei (K5, K6, K7, K8, K9)

Bina webt Muster aus zwei Fadenlagen: oben oder unten. Mehr kann ihr
Webstuhl nicht — und genau das ist der Punkt. Aus **zwei Zuständen**
entsteht durch Kombination alles. Der Webstuhl ist als Bedienelement
eine Reihe von Schaltern, deren Stellungen als Zahl gelesen werden.

Aufbau: 2 Fäden → 4 Muster, 3 Fäden → 8, 8 Fäden → 256. Daraus folgen
Bit und Byte ganz natürlich. Anschließend Datenmengen im
Lebensweltvergleich (K9): Wie viele Fotos passen auf eine Speicherkarte,
wie lang ist ein Lied in Kilobyte, was ist eigentlich ein Gigabyte?

Der Rückbezug auf Morse (K6) ist ein eigener Dialog: Beide Codes kennen
nur zwei Zeichen — warum ist Morse trotzdem etwas anderes als Binär?
(Unterschiedliche Zeichenlängen, Trennzeichen nötig.)

*Rätseltypen:* Schalterstellung zu Zahl, Zahl zu Schalterstellung,
Muster-Bestellungen erfüllen, Speicherkarten-Schätzspiel.
*Buchbezug:* S. 68–72.

### Kapitel 3 — Die Gärtnerei (K10)

Skyt hat ein Problem: Seine Bestellzettel werden gelesen. Seine Lösung
liegt im Garten. Am **Gartenzaun** schreibt er die Buchstaben abwechselnd
oben und unten auf die Latten und liest dann erst die obere, dann die
untere Reihe. Und um einen Spatenstiel gewickelt ergibt ein Lederband
nur dann Sinn, wenn der Stiel die richtige Dicke hat — die **Skytale**.

Der Kern für K10: **Die Buchstaben bleiben, nur ihre Reihenfolge ändert
sich.** Das wird explizit gegen die spätere Substitution abgegrenzt.

*Rätseltypen:* Skytale mit dem Finger drehen/wickeln, Stabdicke wählen,
Gartenzaun-Chiffre mit variabler Zeilenzahl, eine eigene Nachricht für
Bit verschlüsseln.
*Buchbezug:* S. 73–75.

### Kapitel 4 — Das römische Theater (K10, K11)

Livia probt ein Stück über Julius Cäsar und braucht einen Spickzettel,
den die Kollegen nicht lesen können. Die **Cäsar-Scheibe** ist das
zentrale Bedienelement des Kapitels: zwei Ringe mit Alphabet, gegeneinander
verdrehbar. Die Verschiebung ist der **Schlüssel**.

Hier fällt zum ersten Mal die Unterscheidung **Verfahren / Schlüssel**
(Buch S. 73) — und der erste Sicherheitsgedanke: Wie viele Schlüssel gibt
es überhaupt? Die Antwort (25) wird nicht gesagt, sondern ausprobiert:
Der Lauscher knackt eine Cäsar-Nachricht auf offener Bühne, indem er alle
Verschiebungen durchgeht. Das ist der Einstieg in K11.

*Rätseltypen:* Scheibe drehen, Schlüssel aus einem Hinweis erschließen,
Brute-Force-Tabelle selbst durchgehen.
*Buchbezug:* S. 73, S. 76.

### Kapitel 4a — Der Turm der Zahlen *(optional, Differenzierung)*

Entsprechend der Vereinbarung der Fachschaft ist **Vigenère
Zusatzangebot**, nicht Pflicht. Meisterin Vigena zeigt, was passiert,
wenn man nicht *eine* Verschiebung nutzt, sondern für jeden Buchstaben
eine andere, gesteuert durch ein Schlüsselwort.

Das Kapitel ist im Spiel als Turm sichtbar, aber nie blockierend: Wer
ihn auslässt, verpasst nichts, was später gebraucht wird. Wer ihn löst,
bekommt ein eigenes Siegel und im Finale einen alternativen, eleganteren
Lösungsweg.

*Buchbezug:* S. 77.

### Kapitel 5 — Die Bibliothek (K7, K11)

Archivar Kindi — benannt nach al-Kindī, der die Häufigkeitsanalyse im
9. Jahrhundert beschrieb — zeigt den entscheidenden Trick: Man muss den
Schlüssel gar nicht raten, wenn die Sprache selbst verrät, was
dahintersteckt. Das E ist im Deutschen der häufigste Buchstabe, dann N,
I, S, R.

Die **Häufigkeits-Lupe** zählt Buchstaben in einem Geheimtext und zeigt
ein Balkendiagramm — direkt neben dem Diagramm der deutschen Sprache.
Die Schülerinnen und Schüler verschieben, vergleichen, erkennen.

Danach die eigentliche Kompetenz K11: Eine Tabelle im Gildenbuch, in der
die bisherigen Verfahren nach Sicherheit sortiert und die Sortierung
**begründet** wird. Nicht anklicken — schreiben.

*Rätseltypen:* Häufigkeitsdiagramme vergleichen, eine Substitution
Buchstabe für Buchstabe rekonstruieren, kurze vs. lange Texte
(Erkenntnis: bei kurzen Texten hilft die Statistik nicht).
*Buchbezug:* S. 80.

### Kapitel 6 — Das Malerviertel (K4, K11)

Stella verschlüsselt nicht — sie versteckt. Ein Bild mit einer Botschaft
im Rahmenmuster, unsichtbare Tinte aus Zitronensaft, jeder erste
Buchstabe einer Zeile. Der didaktische Kontrast ist der Punkt:
**Verschlüsseln macht unlesbar, Verstecken macht unauffällig.** Und:
Wer ein Versteck einmal kennt, kennt es für immer — Steganographie
allein ist kein Schutz.

*Buchbezug:* S. 82.

### Kapitel 7 — Der Marktplatz (K4, K7)

Quirin druckt Preisschilder mit **QR-Codes**. Warum funktioniert ein
QR-Code noch, wenn ein Fleck drauf ist? Die Schülerinnen und Schüler
bauen einen winzigen QR-artigen Code selbst (stark vereinfacht,
5×5-Raster), erleben Positionsmarken und Fehlerkorrektur und decodieren
Marktschilder.

Rückbezug auf Kapitel 2: Auch hier stecken nur Nullen und Einsen drin —
nur zweidimensional angeordnet.

*Buchbezug:* S. 83.

### Kapitel 8 — Die Schlosserei (K11)

Klara stellt die Frage, an der alle bisherigen Verfahren scheitern:
*„Wie schicke ich dir den Schlüssel, wenn der Lauscher jeden Brief
mitliest?"*

Ihre Lösung ist eine Kiste mit Vorhängeschlössern: Klara verteilt
**offene Schlösser** an alle in der Stadt. Jeder kann eine Kiste
zuschnappen lassen — aufbekommen kann sie nur Klara mit ihrem einen
Schlüssel, den sie nie aus der Hand gibt. Das ist Public-Key auf dem
Niveau, das Klasse 6 wirklich trägt. Anschließend der Bezug zur Realität:
Das Schlosssymbol im Browser bedeutet genau das.

*Rätseltypen:* Schlösser verteilen, Kisten richtig verschließen, den
Fehler finden (jemand verschickt seinen geheimen Schlüssel mit).
*Meisterprüfung (optional):* Klaras Farbenwerkstatt — zwei Malerinnen
mischen jeweils ihre geheime Farbe in dieselbe öffentlich bekannte
Grundfarbe, tauschen die Töpfe und mischen erneut. Beide landen bei
demselben Ton, den der Lauscher aus den getauschten Töpfen nicht
herstellen kann. Der Diffie-Hellman-Gedanke ohne eine einzige Zahl.
*Buchbezug:* S. 85.

### Finale — Der Fall des Lauschers (K7, K11, Transfer)

Im Rathaus liegt die Beweiskette: eine Nachricht, die durch mehrere
Stationen ging und auf jeder Stufe anders behandelt wurde — binär
codiert, transponiert, per Cäsar verschlüsselt, mit einem versteckten
Zusatz. Alle Werkzeuge aus dem Gildenbeutel werden gebraucht, keines
mehrfach. Wer den Vigenère-Turm gelöst hat, findet eine Abkürzung.

Am Ende steht keine Verhaftung, sondern Adas Fazit und der Merksatz des
ganzen Spiels: *Das Verfahren darf jeder kennen — der Schlüssel muss
geheim bleiben.* Und die offene Frage in die Klasse: Was heißt das für
eure eigenen Passwörter?

---

## 7 Lernwege und Differenzierung

**Zwei Zugänge, ein Spielstand.**

- **Gildenweg (Story):** Die Kapitel in Reihenfolge, mit Rahmenhandlung,
  Siegeln und Finale. Der vorgesehene Weg für den durchgehenden Einsatz.
- **Werkstatt (freie Kapitelwahl):** Jedes Kapitel ist einzeln
  anwählbar, auch ohne die vorherigen. Beim Direkteinstieg bekommt die
  Spielfigur automatisch die Werkzeuge und Gildenbuch-Einträge, die das
  Kapitel voraussetzt, und eine kurze Einordnung („Was du bisher wissen
  musst"). Für den Einsatz einzelner Bausteine im Unterricht, zur
  Wiederholung vor der Leistungsüberprüfung und für Vertretungsstunden.

Beide greifen auf denselben Spielstand zu; im Gildenweg gelöste Kapitel
sind in der Werkstatt als erledigt markiert und umgekehrt.

**Gestuftes Hilfesystem.** Bit gibt auf Anfrage drei Stufen:
1. eine Rückfrage, die zum Denken zwingt („Wie viele Möglichkeiten hat
   Livia denn überhaupt?"),
2. ein Teilschritt oder ein aufgedeckter Buchstabe,
3. die Lösung **mit** Erklärung des Weges.

Die Stufen sind frei wählbar, ohne Punktabzug und ohne Wartezeit — eine
künstliche Hürde vor der Hilfe erzeugt bei dieser Altersgruppe nur
Frust oder Raten.

**Nach oben differenzieren.**
- Der Vigenère-Turm als Zusatzkapitel (Fachschaftsvereinbarung).
- **Meisterprüfungen:** pro Kapitel eine optionale Zusatzaufgabe mit
  eigenem Siegelstern, deutlich anspruchsvoller.
- **Eigene Nachrichten:** Ab Kapitel 3 kann jede Schülerin eigene Texte
  mit den freigeschalteten Verfahren verschlüsseln und den erzeugten
  Code als kurze Zeichenfolge an Mitschüler weitergeben — Partnerarbeit
  ohne Chatfunktion (siehe Datenschutz).

**Nach unten absichern.**
- Alle Texte kurz, Hauptsätze, keine Schachtelsätze.
- Vorlesefunktion für alle Dialoge (Sprachausgabe des Geräts).
- Keine Zeitmessung, keine Punktevergleiche, keine Rangliste.
- Alle Rätsel haben eine Variante mit reduziertem Umfang, die
  automatisch angeboten wird, wenn dreimal hintereinander die dritte
  Hilfestufe genutzt wurde.

**Barrierefreiheit.** Information wird nie allein durch Farbe
transportiert (relevant u. a. bei den Häufigkeitsdiagrammen);
Fließtext in gut lesbarer Schrift statt Pixelschrift; Schriftgröße
einstellbar; Bedienelemente mindestens 44 × 44 pt groß.

---

## 8 Einbettung in den Unterricht

Das Spiel ist für **Erarbeitungs- und Übungsphasen** gedacht, nicht als
Ersatz des Unterrichts. Vorschlag für den Ablauf pro Kapitel:

1. **Einstieg im Plenum** (5–10 min): Problemfrage analog, ohne Gerät.
   Etwa: Eine Nachricht soll durch die Klasse wandern, ohne dass die
   mittlere Reihe sie versteht.
2. **Erarbeitung am Gerät** (20–30 min): Einzel- oder Partnerarbeit,
   auch in der STUDIO-Zeit.
3. **Sicherung im Plenum** (10–15 min): Gildenbuch-Einträge vergleichen,
   Begriffe schärfen, Heftaufschrieb.
4. **Transfer analog:** Skytale aus einem Stift und Papierstreifen,
   Cäsar-Scheibe aus Pappe, Klopfzeichen an der Tafel. Die analoge
   Umsetzung ist ausdrücklich Teil des Konzepts — nicht alles gehört
   auf den Bildschirm.

Für die Lehrkraft gibt es eine **Kapitelübersicht** mit Lernzielen,
erwarteten Schwierigkeiten, den Lösungen der Rätsel und Vorschlägen für
das Unterrichtsgespräch. Diese liegt als eigene Seite vor, nicht im
Spiel.

---

## 9 Leistungsbewertung

**Das Spiel bewertet nicht.** Es liefert keine Noten, keine Punktzahlen
und keine Rangfolge. Der Fachschaftsbeschluss zur Leistungsbewertung
(schulinterner LP, Kap. 2.2) stellt auf die Qualität und Kontinuität der
Unterrichtsbeiträge ab — nicht auf Spielfortschritt.

Was der Spielstand leistet, ist **Diagnose**: Die Lehrkraft sieht, wer
wo steht, und kann gezielt nachsteuern. Das ist etwas anderes als
Bewertung, und es muss den Schülerinnen und Schülern auch so gesagt
werden — transparent, zu Beginn der Einheit.

Die Lehrkraft-Ansicht ist deshalb bewusst schmal gehalten: Sie zeigt je
Kind und Kapitel nur **gelöst oder offen**. Keine Bearbeitungszeiten,
keine Zahl der Fehlversuche, keine Hilfenutzung. Was wie eine
Leistungsmessung aussehen könnte, wird gar nicht erst erhoben — das ist
zugleich die datensparsamste Lösung.

Beiträge, die sich aus der Arbeit mit dem Spiel für die „Sonstigen
Leistungen" ergeben, entstehen **außerhalb** des Spiels: im
Unterrichtsgespräch, im Heft, in der Präsentation eines selbst
entwickelten Verfahrens, in der Begründung, welches Verfahren sicherer
ist. Genau dafür sind die Gildenbuch-Einträge als exportierbare und
druckbare Zusammenfassung gedacht.

---

## 10 Datenschutz und Jugendschutz

Für Zwölfjährige mit Serverkonten ist das kein Nebenschauplatz. Die
folgenden Punkte sind **vor** dem ersten Klasseneinsatz zu klären, nicht
danach:

- **Pseudonyme statt Klarnamen.** Der Anmeldename ist ein von der
  Lehrkraft vergebenes Kürzel oder ein frei gewählter Spielname. Keine
  Nachnamen, keine E-Mail-Adressen, keine Geburtsdaten.
- **Keine Selbstregistrierung.** Konten legt ausschließlich die
  Lehrkraft per Namensliste an. Damit gibt es keinen Grund, irgendwelche
  Kontaktdaten zur Bestätigung zu erheben.
- **Datensparsamkeit.** Gespeichert wird ausschließlich, was das Spiel
  zum Funktionieren braucht: Anmeldename, Passwort-Hash, Spielfortschritt.
- **Passwörter nie im Klartext.** Serverseitig nur als Hash mit einem
  aktuellen Verfahren (Argon2id oder bcrypt). Das gilt auch für ein
  reines Schulprojekt — die Kinder benutzen erfahrungsgemäß dasselbe
  Passwort noch woanders. Details im technischen Konzept.
- **Keine Kommunikationsfunktion.** Kein Chat, keine Freundeslisten,
  keine frei eingegebenen Texte, die andere Schülerinnen zu sehen
  bekommen. Der Nachrichtenaustausch aus Abschnitt 7 läuft über kurze
  Codes, die mündlich oder auf Papier weitergegeben werden.
- **Löschkonzept.** Konten werden am Ende des Schuljahres gelöscht; das
  Verfahren wird vorab festgelegt.
- **Freie Texte im Gildenbuch** bleiben auf dem Server, sind aber nur
  für die schreibende Person und die Lehrkraft sichtbar.
- **Zuständigkeiten:** Verantwortlich ist die Schule als Stelle. Bei
  Hosting außerhalb der Schule ist ein Auftragsverarbeitungsvertrag
  nötig; Information der Eltern und die Frage der Einwilligung sind mit
  der Schulleitung und der/dem Datenschutzbeauftragten zu klären. Ich
  kann das Konzept technisch datensparsam auslegen, die rechtliche
  Bewertung kann ich nicht ersetzen.

---

## 11 Getroffene Entscheidungen

Stand 02.08.2026, abgestimmt mit der Fachlehrkraft:

| Frage | Entscheidung |
|---|---|
| Kapitelreihenfolge | Bleibt wie oben: Steganographie → QR-Code → Public-Key, dem Lehrwerk folgend |
| Tiefe beim Public-Key | Die Schloss-Analogie trägt das Kapitel; das Zahlen-/Farbmischungsbeispiel kommt als Meisterprüfung für Schnelle dazu |
| Eigene Nachrichten zwischen Schülern | Ja, in der codebasierten Form ohne Chatfunktion (siehe Abschnitt 7 und 10) |
| Gildenbuch-Export | Als PDF zum Abheften, passend zur Heftführung |
| Erweiterung auf Klasse 5 | Perspektivisch gewünscht. Zuerst wird die Kryptologie fertig; die Architektur wird so gebaut, dass Kapitel 1 der Klasse 5 später ohne Umbau ergänzt werden kann |
| Figurennamen | Bestätigt |
| Umlautbehandlung | Ä→AE, Ö→OE, Ü→UE, ß→SS vor dem Verschlüsseln, im Spiel erklärt |
| Lehrkraft-Ansicht | Ja, bewusst reduziert: nur „Kapitel gelöst / offen", keine Bearbeitungszeiten, keine Fehlversuche |
| Kontenverwaltung | Die Lehrkraft legt Konten per Namensliste an; keine Selbstregistrierung |
| Veröffentlichung | Zunächst nur für die LFSM. Eine spätere Weitergabe an andere Schulen wird offengehalten — deshalb wird bei Grafik und Ton konsequent auf CC0 gesetzt, damit diese Tür nicht zufällt |

## 12 Weiterhin offen

- **Zeithorizont** für den ersten Klasseneinsatz: bewusst offengelassen.
- **Serverumgebung** (Schulserver, VPS, Schulträger): noch nicht
  entschieden. Das Konzept hält beide Betriebsarten offen; die lokale
  Speicherstufe funktioniert unabhängig davon (siehe TECHNIK.md).
- **Herkunft der Charaktergrafik**: CC0-Grundlage steht fest, ein
  begleitender Kunst- oder Wahlpflichtkurs für die Figuren ist
  gewünscht, aber noch nicht organisiert.

---

*Technische Umsetzung: siehe [TECHNIK.md](TECHNIK.md).*
