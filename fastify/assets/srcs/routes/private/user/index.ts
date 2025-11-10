import { FastifyInstance } from 'fastify';
import meRoutes from './me';
import likeRoutes from './like';
import viewRoutes from './view';

const userRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/', async () => {
        return { message: 'Available routes', routes: ['/me', '/like', '/view/:id'] };
    });
    fastify.register(likeRoutes, { prefix: '/like', preHandler: fastify.checkIsCompleted });
    fastify.register(viewRoutes, { prefix: '/view', preHandler: fastify.checkIsCompleted });
    fastify.register(meRoutes, { prefix: '/me' });
}

export default userRoutes;