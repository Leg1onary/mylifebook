.PHONY: dev build up down restart logs shell backup restore deploy lint test secret

# ── Разработка ────────────────────────────────────────────────────────────────
dev:
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

build:
	docker-compose build --no-cache

up:
	docker-compose up -d

down:
	docker-compose down

restart:
	docker-compose restart

# ── Логи ─────────────────────────────────────────────────────────────────────
logs:
	docker-compose logs -f --tail=100

logs-backend:
	docker-compose logs -f --tail=100 backend

logs-frontend:
	docker-compose logs -f --tail=100 frontend

# ── Шелл ─────────────────────────────────────────────────────────────────────
shell:
	docker-compose exec backend bash

shell-db:
	docker-compose exec backend sqlite3 /data/lifebook.db

# ── Миграции ─────────────────────────────────────────────────────────────────
migrate:
	docker-compose exec backend alembic upgrade head

migration:
	docker-compose exec backend alembic revision --autogenerate -m "$(msg)"

# ── Бэкап и восстановление ────────────────────────────────────────────────────
backup:
	./infra/scripts/backup.sh

restore:
	./infra/scripts/restore.sh $(file)

# ── Деплой ───────────────────────────────────────────────────────────────────
deploy:
	./infra/scripts/deploy.sh

# ── Качество кода ─────────────────────────────────────────────────────────────
lint:
	docker-compose exec backend ruff check app/
	docker-compose exec frontend npm run lint

test:
	docker-compose exec backend pytest tests/ -v

# ── Генерация SECRET_KEY ──────────────────────────────────────────────────────
secret:
	python3 -c "import secrets; print(secrets.token_hex(32))"
