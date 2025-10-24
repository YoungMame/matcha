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
            await request.jwtVerify()
        } catch (err) {
            reply.send(err)
        }
    })
})