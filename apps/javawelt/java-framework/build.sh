#!/usr/bin/env bash
# Kompiliert das Java-Framework zu public/framework.jar.
# Wichtig: --release 11 – passend zu cheerpjInit({ version: 11 }) in
# src/java/cheerpjLaufzeit.ts (CheerpJ kann seit 4.0 Java 11, Standard
# ist aber Java 8; Version hier und dort immer zusammen ändern).
set -euo pipefail

HIER="$(cd "$(dirname "$0")" && pwd)"
OUT="$HIER/out"
ZIEL="$HIER/../public/framework.jar"

rm -rf "$OUT"
mkdir -p "$OUT" "$(dirname "$ZIEL")"

echo "Kompiliere Framework (Java 11) …"
javac --release 11 -d "$OUT" "$HIER"/de/schule/jle/*.java

echo "Baue $ZIEL …"
jar --create --file "$ZIEL" -C "$OUT" .

echo "Fertig: $ZIEL"
