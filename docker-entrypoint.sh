#!/bin/sh
set -eu

max_attempts="${DB_INIT_MAX_ATTEMPTS:-20}"
retry_delay_seconds="${DB_INIT_RETRY_DELAY_SECONDS:-5}"
attempt=1

echo "Initializing database schema..."
until ./node_modules/.bin/prisma migrate deploy; do
  if [ "$attempt" -ge "$max_attempts" ]; then
    echo "Database initialization failed after $attempt attempts."
    exit 1
  fi

  echo "Schema initialization failed. Retrying in ${retry_delay_seconds}s... ($attempt/$max_attempts)"
  attempt=$((attempt + 1))
  sleep "$retry_delay_seconds"
done

echo "Seeding tasks..."
node dist/prisma/seed.js

echo "Starting API..."
exec node dist/src/index.js
