import { buildApp } from '../srcs/app';
import type { FastifyInstance } from 'fastify';

export let app: FastifyInstance;

before(async function () {
    // augmente le timeout pour CI / containers
    this.timeout(20000);
    process.env.NODE_ENV = 'test';
    app = buildApp();
    await app.ready();
});

// after(async function () {
//     this.timeout(10000);
//     if (app) {
//         await app.close();
//     }
// });