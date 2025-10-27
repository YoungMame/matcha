import Fastify from 'fastify'
import cookies from '@fastify/cookie'
import pg from '@fastify/postgres'
import jwt from '@fastify/jwt'
import ratelimit from '@fastify/rate-limit'
import websocket from '@fastify/websocket'

// import routes
import router from './routes'
// import services
import services from './services'
import userServicePlugin from './services/UserService'
// import custom plugins
import authenticate from './plugins/authenticate'


const buildApp = () => {
    const app = Fastify({
        logger: true
    });

    app.get('/debug', async () => {
        return { message: 'Debug route working' };
    });

    app.register(router);

    // app.register(services); // TODO fix service index
    app.register(userServicePlugin);

    app.register(pg, {
        connectionString: process.env.PG
    });

    app.register(authenticate);

    app.register(cookies);

    app.setErrorHandler((err, request, reply) => {
        if (err.validation) {
            // err.validation est le tableau d'erreurs Ajv
            const messages = err.validation.map(e => {
            // personnalise ici le message (ou récupère e.message)
            if (e.keyword === 'required') return `${e.params.missingProperty} is missing`;
            return e.message || 'invalid';
            });
            return reply.code(400).send({ error: 'validation_error', messages });
        }
        reply.send(err);
    });

    return app;
}

const app = buildApp();

export default app;