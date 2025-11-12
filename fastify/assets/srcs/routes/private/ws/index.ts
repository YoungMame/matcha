import { FastifyInstance, FastifyPluginOptions } from 'fastify';

const setGeoloc = async (fastify: FastifyInstance, userId: number, ip: string) => {
    const user = await fastify.userService.getMe(userId);
    if (!user) {
        return;
    }
    if (!user.location.latitude || !user.location.longitude)
    {
        const apiKey = process.env.IPSTACK_API_KEY;
        if (!apiKey) {
            fastify.log.warn('IPSTACK_API_KEY is not set; skipping geolocation lookup');
            return;
        }
        const response = await fetch(`https://api.ipstack.com/${ip}?access_key=${apiKey}&hostname=1`);
        if (response.ok)
        {
            const data = await response.json();
            if (data.latitude && data.longitude)
                await fastify.userService.updateUserLocation(userId, data.latitude, data.longitude);
        }
    }
}

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
        const ip = process.env.NODE_ENV == 'test' ? '81.255.67.28' : req.ip;
        setGeoloc(fastify, userId, ip );
    })
}