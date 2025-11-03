#!/bin/sh

if [ "$NODE_ENV" = "prod" ]; then
    pnpm install --prod;
    pnpm build;
else
    pnpm install;
fi