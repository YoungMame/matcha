import { FastifyRequest, FastifyReply } from 'fastify';
import fastify from '../../app';

export const loginHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const {
        email,
        password
    } = request.body as any

    const jwt:string | undefined = await (fastify as any).userService.login(email, password);

    if (jwt == undefined)
        return reply.status(400).send({ error: 'User creation failed' });

    return reply.code(203).cookie('jwt', jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
}