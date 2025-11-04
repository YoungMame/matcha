import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function wsRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.get('/', { websocket: true }, (socket /* WebSocket */, req /* FastifyRequest */) => {
        fastify.log.info(`New WebSocket connection established: ${req.ip}`);
        const userId = req.user?.id;
        if (!userId) {
            fastify.log.warn(`WS: Unauthorized connection attempt from ${req.ip}`);
            socket.close();
            return;
        }
        fastify.userService.setUserConnected(userId);
        fastify.webSocketService.addConnection(userId, socket);
        socket.on('message', (message: string) => {
            fastify.webSocketService.handleClientMessage(userId, message);
            fastify.log.debug(`WS: Received message: ${message}`);
        })
        socket.on('close', () => {
            fastify.webSocketService.removeConnection(userId);
            fastify.userService.setUserDisconnected(userId);
            fastify.log.info(`WS: Connection closed: ${req.ip}`);
        });
    })
}