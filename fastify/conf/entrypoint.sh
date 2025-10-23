#!/bin/sh

if [ "$NODE_ENV" = "dev" ]; then
    if [ "$RUN_SEED" = "true" ]; then
        echo "Running database seed..."
        pnpm run seed
    fi
    exec pnpm dev
elif [ "$NODE_ENV" = "test" ]; then
    exec pnpm test
else
    exec pnpm start
fi