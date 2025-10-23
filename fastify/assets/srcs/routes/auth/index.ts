import { FastifyInstance } from 'fastify';
import signupRoutes from './signup';

const authRoutes = async (fastify: FastifyInstance) => {
    fastify.register(signupRoutes, { prefix: '/signup' });
    // fastify.register(await import('./login'), { prefix: '/login' });
    // fastify.register(await import('./logout'), { prefix: '/logout' });
    // fastify.register(await import('./validate'), { prefix: '/login' });
    // fastify.register(await import('./forgot'), { prefix: '/logout' });
    // fastify.register(await import('./reset'), { prefix: '/reset' });
}

export default authRoutes;