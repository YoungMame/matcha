#!/bin/sh

if [ "$NODE_ENV" = "dev" ]; then
    sleep 1 # wait for the database to be ready
    if [ "$RUN_SEED" = "true" ]; then
        echo "Running database seed..."
        pnpm run seed
        export RUN_SEED="false"
    fi
    echo "Starting in development mode"
    exec pnpm dev
elif [ "$NODE_ENV" = "test" ]; then
    sleep 1 # wait for the database to be ready
    echo "Running unit tests"
    # pnpm test:unit
    exec pnpm test:integration
    echo $?
else
    exec pnpm start
fi