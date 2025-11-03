import { FastifyInstance } from 'fastify';
import meRoutes from './me';
import likeRoutes from './like';
import viewRoutes from './view';

const userRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/', async () => {
        return { message: 'Available routes', routes: ['/me', '/view/:id'] };
    });
    fastify.register(meRoutes, { prefix: '/me' });
    fastify.register(likeRoutes, { prefix: '/like' });
    fastify.register(viewRoutes, { prefix: '/view' });
}

export default userRoutes;