import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from '../../utils/error';

export const signUpHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const {
        email,
        password,
        username,
    } = request.body as any;

    try {
        const jwt: string | undefined = await request.server.userService.createUser(
            email,
            password,
            username,
        );

        if (jwt == undefined) {
            return reply.code(400).send({ error: 'User creation failed' });
        }

        return reply.code(201).setCookie('jwt', jwt, {
            domain: process.env.DOMAIN || 'localhost',
            path: '/',
            signed: true,
            // httpOnly: true,
            // secure: process.env.NODE_ENV === 'production',
            // sameSite: 'lax',
            maxAge: 3600 * 24 * 7
        }).send({ message: 'User created successfully' });
    } catch (error) {
        if (error instanceof AppError) {
            return reply.code(error.statusCode).send({ error: error.message });
        }
        return reply.code(500).send({ error: 'Internal server error' });
    }
}