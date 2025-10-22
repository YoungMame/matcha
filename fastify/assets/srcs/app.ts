import Fastify, { fastify } from 'fastify'
// import routes
// import plugins

const buildApp = () => {
    const app = Fastify({
        logger: true
    });

    app.get('/api/hello', function (request: any, reply: any) {
        reply.send({ hello: 'world', status: 'ok' });
    });

    app.register(require('@fastify/postgres'), {
        connectionString: process.env.PG
    });

    return app;
}

export default buildApp;