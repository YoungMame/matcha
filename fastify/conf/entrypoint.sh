#!/bin/sh

if [ "$NODE_ENV" = "dev" ]; then
    exec pnpm dev
elif [ "$NODE_ENV" = "test" ]; then
    exec pnpm test
else
    exec pnpm start
fi