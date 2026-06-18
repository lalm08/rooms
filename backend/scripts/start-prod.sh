#!/bin/sh
set -e

export CI=true

PORT="${PORT:-3000}"
echo "[rooms-api] PORT=$PORT"

if [ -z "$DATABASE_URL" ]; then
  echo "[rooms-api] ERROR: DATABASE_URL is not set."
  exit 1
fi

echo "[rooms-api] Syncing database schema..."
npx prisma db push \
  --schema=./prisma/schema.prisma \
  --skip-generate \
  --accept-data-loss

echo "[rooms-api] Starting server on 0.0.0.0:$PORT..."
exec node dist/src/server.js
