#!/bin/sh

# Exit immediately if a command exits with a non-zero status
set -e

# Run migrations if in production/dev
echo "Generating Prisma Client..."
npx prisma generate

echo "Running database migrations..."
npx prisma db push --accept-data-loss # For MVP/Dev speed

# Start the application
echo "Starting application..."
exec "$@"
