import { FastifyInstance } from 'fastify';
import meRoutes from './me';
import likeRoutes from './like';

const userRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/', async () => {
        return { message: 'Available routes', routes: ['/me'] };
    });
    fastify.register(meRoutes, { prefix: '/me' });
    fastify.register(likeRoutes, { prefix: '/like' });
}

export default userRoutes;