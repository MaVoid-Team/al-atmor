# Container Deployment Guide

This repo now ships production-ready Dockerfiles for the backend API and the Next.js frontend, plus a root `docker-compose.yml` that orchestrates both. Nginx is expected to run directly on the VPS host, so the compose stack only contains the app services.

## Prerequisites

- Docker Engine 24+
- Docker Compose V2 (`docker compose` CLI)
- A PostgreSQL instance reachable from the backend container
- Cloudinary + JWT + DB credentials stored outside of source control

## Environment Variables

Create a `backend/.env` file (or update the existing one) with everything the Express app requires, for example:

```
PORT=3000
DB_HOST=postgres.internal
DB_NAME=nojoom
DB_USER=nojoom
DB_PASS=supersecret
JWT_SECRET=change-me
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

The frontend only needs a public API URL. By default the compose file injects the internal service URL (`http://backend:3000/api/v1`). Override it in a host `.env` file placed next to `docker-compose.yml` if you need something else:

```
NEXT_PUBLIC_API_URL=https://api.nojoom.example.com/api/v1
FRONTEND_PORT=8080
BACKEND_PORT=4000
```

## Build & Run

```bash
# from repo root
docker compose build

# run migrations before starting backend
docker compose run --rm backend npx sequelize-cli db:migrate

# start services in detached mode
docker compose up -d
```

- Backend container listens on port `3000` internally and is mapped to `${BACKEND_PORT:-3000}` on the host.
- Frontend container listens on `3000` internally and is mapped to `${FRONTEND_PORT:-3001}` on the host.
- Point your host-level Nginx to these ports for TLS termination / routing.

## Useful Commands

```bash
# View logs
docker compose logs -f backend

docker compose logs -f frontend

# Rebuild after code changes
docker compose build backend

# Stop & remove containers
docker compose down
```

## Notes

- `backend/Dockerfile` compiles TypeScript, installs only production dependencies, and runs `node dist/server.js`.
- `frontend/Dockerfile` builds the Next.js app and serves it via `next start`.
- Make sure the database and any third-party services are accessible from the containers (open firewall, allow hostnames, etc.).
- Always run migrations (`docker compose run --rm backend npx sequelize-cli db:migrate`) before starting or restarting the backend container to keep schema in sync.
