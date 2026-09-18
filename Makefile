# Makefile for Employee Attendance System

.PHONY: dev-up dev-down prod-up prod-down db-migrate db-seed logs-backend logs-frontend backup deploy

# ==================== Local Development ====================
dev-up:
	docker compose up -d postgres
	@echo "PostgreSQL is running. Start backend and frontend with npm run dev."

dev-down:
	docker compose down

db-migrate:
	cd backend && npx prisma migrate dev

db-seed:
	cd backend && npx prisma db seed

# ==================== Production ====================
prod-up:
	docker compose -f docker-compose.prod.yml up -d --build

prod-down:
	docker compose -f docker-compose.prod.yml down

logs-backend:
	docker compose -f docker-compose.prod.yml logs -f backend

logs-frontend:
	docker compose -f docker-compose.prod.yml logs -f frontend

backup:
	bash scripts/backup.sh

deploy:
	bash scripts/deploy.sh
