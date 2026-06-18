#!/bin/sh
set -e

PORT="${PORT:-3000}"
echo "[rooms-api] PORT=$PORT"

if [ -z "$DATABASE_URL" ]; then
  echo "[rooms-api] ERROR: DATABASE_URL is not set."
  echo "[rooms-api] Render → ваш Web Service → Environment → добавьте DATABASE_URL из PostgreSQL."
  exit 1
fi

echo "[rooms-api] Syncing database schema..."
npx prisma db push --skip-generate --accept-data-loss

echo "[rooms-api] Starting server on 0.0.0.0:$PORT..."
exec node dist/src/server.js
