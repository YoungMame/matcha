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
    } = request.body as any

    const user:User | undefined = await (fastify as any).userService.createUser(
        email,
        password,
        username,
        bornAt,
        gender,
        orientation
    );

    if (user == undefined)
        return reply.status(400).send({ error: 'User creation failed' });
    
    const jwt = fastify.jwt.sign({ 
        id: user.id,
        email: user.email,
        username: user.username,
    });
    return ({ jwt });
}