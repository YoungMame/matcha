import { FastifyInstance } from 'fastify';
import authPlugin from './auth';
import authRoutes from './auth';
import privateRoutes from './private';

const indexRoutes = async (fastify: FastifyInstance) => {
    fastify.register(authRoutes, { prefix: '/auth' });
    fastify.register(authPlugin);
    fastify.register(async function(instance) {
        instance.addHook('preHandler', async (request, reply) => {
            await (instance as any).authenticate(request, reply);
        });
        instance.register(privateRoutes, { prefix: '/private' });
    });
    // fastify.register(await import('./users'), { prefix: '/users' });
    // fastify.register(await import('./posts'), { prefix: '/posts' });
    // fastify.register(await import('./comments'), { prefix: '/comments' });
}

export default indexRoutes;