import { FastifyInstance } from 'fastify';
import meRoutes from './me';

const userRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/', async () => {
        return { message: 'Available routes', routes: ['/me'] };
    });
    fastify.register(meRoutes, { prefix: '/me' });
}

export default userRoutes;