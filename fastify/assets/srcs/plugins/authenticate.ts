import fp from 'fastify-plugin'
import jwt from '@fastify/jwt'
import { FastifyRequest, FastifyReply } from 'fastify'

export default fp(async function(fastify, opts) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('Missing JWT_SECRET environment variable');
    }

    fastify.register(jwt, {
        secret: jwtSecret
    });

    fastify.decorate("authenticate", async function(request: FastifyRequest, reply: FastifyReply) {
        try {
            const cookies = (request as any).cookies;
            const token = cookies && cookies['jwt'];
            console.log('cookies', cookies);
            if (!token) {
                console.log('no token');
                return reply.status(401).send({ error: 'Unauthorized' });
            }

            const payload = fastify.jwt.verify(token) as { id: string, username?: string, email?: string };

            request.user = {
                id: String(payload.id),
                username: payload.username,
                email: payload.email
            };
        } catch (err) {
            return reply.status(401).send({ error: 'Unauthorized' });
        }
    })
})