import { FastifyInstance } from "fastify";

export default async function chatRoutes(fastify: FastifyInstance) {
    fastify.get('/chat', {
        handler: async (request, reply) => {
            return { message: 'This is a private chat route' };
        }
    });
}