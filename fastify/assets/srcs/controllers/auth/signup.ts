import { FastifyRequest, FastifyReply } from 'fastify';
import fastify from '../../app';
import User from "../../classes/User";

export const signUpHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const {
        email,
        password,
        username,
        bornAt,
        gender,
        orientation
    } = request.body as any;

    const jwt:string | undefined = await (fastify as any).userService.createUser(
        email,
        password,
        username,
        bornAt,
        gender,
        orientation
    );

    if (jwt == undefined)
        return reply.status(400).send({ error: 'User creation failed' });

    return reply.code(201).cookie('jwt', jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });
}