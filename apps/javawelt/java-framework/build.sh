#!/usr/bin/env bash
# Kompiliert das Java-Framework zu public/framework.jar.
# Wichtig: --release 8 – passend zu cheerpjInit({ version: 8 }) in
# src/java/cheerpjLaufzeit.ts. Die Java-8-Laufzeit ist Pflicht: Nur dort
# findet der Compiler die JDK-Klassen (unter Java 11 fehlt CheerpJ das
# JRT-Modul-Image → NPE in ECJs JRTUtil). ecj.jar ist deshalb ECJ 3.20
# (läuft auf Java 8). Version hier und dort immer zusammen ändern.
set -euo pipefail

HIER="$(cd "$(dirname "$0")" && pwd)"
OUT="$HIER/out"
ZIEL="$HIER/../public/framework.jar"

rm -rf "$OUT"
mkdir -p "$OUT" "$(dirname "$ZIEL")"

echo "Kompiliere Framework (Java 8) …"
javac --release 8 -d "$OUT" "$HIER"/de/schule/jle/*.java

echo "Baue $ZIEL …"
jar --create --file "$ZIEL" -C "$OUT" .

echo "Fertig: $ZIEL"
