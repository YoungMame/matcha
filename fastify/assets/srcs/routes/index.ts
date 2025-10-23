import { FastifyInstance } from 'fastify';
import authRoutes from './auth';

const indexRoutes = async (fastify: FastifyInstance) => {
    fastify.register(authRoutes, { prefix: '/auth' });
    // fastify.register(await import('./users'), { prefix: '/users' });
    // fastify.register(await import('./posts'), { prefix: '/posts' });
    // fastify.register(await import('./comments'), { prefix: '/comments' });
}

export default indexRoutes;