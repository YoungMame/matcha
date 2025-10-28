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
            const signedToken = request.cookies?.jwt;
            if (!signedToken)
                throw new Error('No token provided');
            const result = reply.unsignCookie(signedToken);
            if (!result?.value || !result?.valid) {
                throw new Error('Token invalid');
            }

            const token = result.value;
            const payload = fastify.jwt.verify(token) as { id: string, username: string, email: string };
            console.log(payload);
            request.user = {
                id: Number(payload.id),
                username: payload.username,
                email: payload.email
            };
        } catch (err) {
            return reply.status(401).send({ error: 'Unauthorized' });
        }
    })
})