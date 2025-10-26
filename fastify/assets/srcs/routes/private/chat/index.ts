import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export default async function chatRoutes(fastify: FastifyInstance) {
    fastify.get('/chat', {
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            return { message: 'This is a private chat route' };
        }
    });
}