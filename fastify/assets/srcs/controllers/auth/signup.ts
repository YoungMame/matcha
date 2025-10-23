import { FastifyRequest, FastifyReply } from 'fastify';

export const signUpHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    return ({
        jwt: 'fake-jwt-token'
    });
}