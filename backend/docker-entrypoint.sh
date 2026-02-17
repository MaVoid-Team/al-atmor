#!/bin/sh
set -e

# Run database migrations before starting the server
npm run db:migrate

exec "$@"
