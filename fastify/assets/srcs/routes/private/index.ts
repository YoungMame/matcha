import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import chatRoutes from './chat';
import userRoutes from './user';
import wsRoutes from './ws';
import notificationsRoutes from './notifications';
import reportRoutes from './report';
import statics from '@fastify/static';
import path from 'path';



export default async function privateRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.get('/', async () => {
        return { message: 'Available routes', routes: ['/chat', '/user', '/notifications', '/uploads'] };
    });
    fastify.register(chatRoutes, { prefix: '/chat', preHandler: fastify.checkIsCompleted });
    fastify.register(userRoutes, { prefix: '/user' });
    fastify.register(notificationsRoutes, { prefix: '/notifications' });
    fastify.register(reportRoutes, { prefix: '/report', preHandler: fastify.checkIsCompleted });
    fastify.register(wsRoutes, { prefix: '/ws', preHandler: fastify.checkIsCompleted });
    fastify.register(statics, {
        root: path.join(__dirname, '../../../uploads'),
        prefix: '/uploads/',
        decorateReply: false
    });
}
