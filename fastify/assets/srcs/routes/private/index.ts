import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import chatRoutes from './chat';
import userRoutes from './user';
import statics from '@fastify/static';
import path from 'path';

export default async function privateRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.get('/', async () => {
        return { message: 'Available routes', routes: ['/chat', '/user', '/ws'] };
    });
    fastify.register(chatRoutes, { prefix: '/chat' });
    fastify.register(userRoutes, { prefix: '/user' });
    fastify.register(statics, {
        root: path.join(__dirname, '../../../uploads'),
        prefix: '/uploads', // optional: default '/'
        constraints: { host: process.env.HOST || 'localhost' } // optional: default {}
    });
}
