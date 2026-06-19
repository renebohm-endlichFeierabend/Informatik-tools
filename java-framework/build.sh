#!/usr/bin/env bash
# Kompiliert das Java-Framework zu public/framework.jar.
# Wichtig: --release 11, weil CheerpJ 4.3 Java-11-Bytecode ausführt.
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
