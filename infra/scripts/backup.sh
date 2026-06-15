#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="$(cd "$(dirname "$0")/../../data/backups" && pwd)"
DB_PATH="$(cd "$(dirname "$0")/../../data" && pwd)/lifebook.db"
DATE=$(date +%Y-%m-%d_%H-%M)
DEST="$BACKUP_DIR/lifebook_$DATE.db"
KEEP_DAYS=30

mkdir -p "$BACKUP_DIR"

if [ ! -f "$DB_PATH" ]; then
  echo "ERR: БД не найдена: $DB_PATH"
  exit 1
fi

sqlite3 "$DB_PATH" ".backup '$DEST'"
echo "OK: Бэкап создан: $DEST"

find "$BACKUP_DIR" -name "lifebook_*.db" -mtime +$KEEP_DAYS -delete
echo "OK: Старые бэкапы (старше $KEEP_DAYS дней) удалены"
