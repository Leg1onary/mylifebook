#!/usr/bin/env bash
set -euo pipefail

echo "DEPLOY: MyLifeBook..."

if [ ! -f ".env" ]; then
  echo "ERR: .env не найден. Скопируй .env.example и заполни."
  exit 1
fi

echo "BACKUP: Создаю бэкап БД..."
./infra/scripts/backup.sh

echo "GIT: git pull..."
git pull --rebase origin main

echo "BUILD: Собираю образы..."
docker-compose build --no-cache

echo "RESTART: backend..."
docker-compose up -d --no-deps backend
sleep 5

echo "RESTART: frontend + nginx..."
docker-compose up -d --no-deps frontend nginx

echo "DONE!"
docker-compose ps
