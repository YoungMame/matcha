#!/bin/sh

if [ "$NODE_ENV" = "dev" ]; then
    exec pnpm dev
else if [ "$NODE_ENV" = "test" ]
    exec pnpm test
else
    pnpm build
    exec pnpm start;
fi