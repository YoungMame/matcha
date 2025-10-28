#!/bin/sh

if [ "$NODE_ENV" = "dev" ]; then
    if [ "$RUN_SEED" = "true" ]; then
        echo "Running database seed..."
        pnpm run seed
        export RUN_SEED="false"
    fi
    exec pnpm dev
elif [ "$NODE_ENV" = "test" ]; then
    echo "Running unit tests"
    # pnpm test:unit
    echo "Running integration tests"
    pnpm test:integration
else
    exec pnpm start
fi