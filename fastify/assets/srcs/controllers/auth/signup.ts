import { FastifyRequest, FastifyReply } from 'fastify';
import fastify from '../../app';


export const signUpHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    
    return ({
        jwt: 'fake-jwt-token'
    });
}