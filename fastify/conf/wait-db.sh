#!/bin/sh
# Attendre la DB puis lancer la commande passée en argument
set -e
host=${PGHOST:-db}
port=${PGPORT:-5432}

echo "Waiting for $host:$port..."
until nc -z "$host" "$port"; do
  sleep 0.5
done
echo "DB ready — starting app"
exec "$@"