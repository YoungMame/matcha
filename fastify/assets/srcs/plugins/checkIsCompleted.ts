import fp from 'fastify-plugin'
import { FastifyRequest, FastifyReply } from 'fastify'

export default fp(async function(fastify, opts) {
    fastify.decorate("checkIsCompleted", async function(request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = request.user;
            if (!user || user.isProfileCompleted !== true)
                throw new Error('User profile is not completed');
        } catch (err) {
            return reply.status(401).send({ error: 'Unauthorized' });
        }
    });
    fastify.decorate("checkIsVerified", async function(request: FastifyRequest, reply: FastifyReply) {
        try {
            const user = request.user;
            if (!user || user.isVerified !== true)
                throw new Error('User is not verified');
        } catch (err) {
            return reply.status(401).send({ error: 'Unauthorized' });
        }
    });
})