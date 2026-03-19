#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Prisma client is pre-generated at build time — no generate needed here.
# Only push the schema to keep the DB in sync with prisma/schema.prisma.
echo "Running database migrations..."
npx prisma db push --accept-data-loss

# Start the application
echo "Starting application..."
exec "$@"
