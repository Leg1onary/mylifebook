#!/usr/bin/env bash
set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Использование: ./restore.sh <путь_к_бэкапу>"
  echo "Пример:        ./restore.sh data/backups/lifebook_2026-06-15_20-00.db"
  exit 1
fi

BACKUP_FILE="$1"
DB_PATH="$(cd "$(dirname "$0")/../../data" && pwd)/lifebook.db"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERR: Файл не найден: $BACKUP_FILE"
  exit 1
fi

read -r -p "WARN: Заменить текущую БД на $BACKUP_FILE? [y/N] " confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  echo "Отменено."
  exit 0
fi

docker-compose stop backend 2>/dev/null || true

cp "$DB_PATH" "${DB_PATH}.before_restore_$(date +%Y%m%d_%H%M%S)"
cp "$BACKUP_FILE" "$DB_PATH"
echo "OK: БД восстановлена из $BACKUP_FILE"

docker-compose start backend 2>/dev/null || true
