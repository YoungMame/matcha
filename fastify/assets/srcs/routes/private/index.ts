import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import chatRoutes from './chat';

export default async function privateRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.register(chatRoutes, { prefix: '/chat' });
}
