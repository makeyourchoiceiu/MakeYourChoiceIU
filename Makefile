.PHONY: up down build restart logs shell-backend shell-db migrate makemigrations seed test lint

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose up -d --build

restart:
	docker compose restart

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

shell-backend:
	docker compose exec backend python manage.py shell

shell-db:
	docker compose exec db psql -U $${DB_USER} -d $${DB_NAME}

migrate:
	docker compose exec backend python manage.py migrate

makemigrations:
	docker compose exec backend python manage.py makemigrations

seed:
	docker compose exec backend python manage.py seed

test:
	docker compose exec backend python manage.py test

lint:
	docker compose exec backend python -m flake8 .
