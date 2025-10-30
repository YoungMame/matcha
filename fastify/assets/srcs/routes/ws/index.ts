import { FastifyInstance, FastifyPluginOptions } from 'fastify';

export default async function wsRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
    fastify.get('/', { websocket: true }, (socket /* WebSocket */, req /* FastifyRequest */) => {
        console.log('New WebSocket connection established: ', req.ws);
        socket.on('message', (message: string) => {
            // message.toString() === 'hi from client'
            socket.send('hi from server')
        })
        socket.on('close', () => {
            console.log('WebSocket connection closed');
        });
    })
}