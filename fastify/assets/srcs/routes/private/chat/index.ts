import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import chatEventRoutes from "./chatEvent";
import chatMessagesRoutes from "./chatMessages";
import chatDetailsRoutes from "./chatDetails";

export default async function chatRoutes(fastify: FastifyInstance) {
    fastify.get('/', {
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            return { message: 'This is a private chat route' };
        }
    });
    fastify.register(chatEventRoutes, { prefix: '/event' });
    fastify.register(chatMessagesRoutes, { prefix: '/messages' });
    fastify.register(chatDetailsRoutes, { prefix: '/details' });
}