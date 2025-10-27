import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import chatRoutes from './chat';
import userRoutes from './user';

export default async function privateRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.get('/', async () => {
        return { message: 'Available routes', routes: ['/chat', '/user'] };
    });
    fastify.register(chatRoutes, { prefix: '/chat' });
    fastify.register(userRoutes, { prefix: '/user' });
}
