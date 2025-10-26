import Fastify from 'fastify'
import router from './routes'
import services from './services'
import pg from '@fastify/postgres'
import cookies from '@fastify/cookie'
// import routes
// import plugins

const buildApp = () => {
    const app = Fastify({
        logger: true
    });

    app.get('/api/hello', function (request: any, reply: any) {
        reply.send({ hello: 'world', status: 'ok' });
    });

    app.register(router, { prefix: '/api' });

    app.register(services);

    app.register(pg, {
        connectionString: process.env.PG
    });

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