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
        bornAt,
        gender,
        orientation
    } = request.body as any;

    const bornAtDate = new Date(bornAt);

    try {        
        if (!request.server.userService) {
            throw new Error('UserService not available on server instance');
        }
        
        const jwt: string | undefined = await request.server.userService.createUser(
            email,
            password,
            username,
            bornAtDate,
            gender,
            orientation
        );

        if (jwt == undefined) {
            return reply.code(400).send({ error: 'User creation failed' });
        }

        return reply.code(201).setCookie('jwt', jwt, {
            domain: process.env.DOMAIN || 'localhost',
            path: '/',
            signed: true,
            maxAge: 3600 * 24 * 7
        }).send({ message: 'User created successfully' });
    } catch (error) {
        if (error instanceof AppError) {
            return reply.code(error.statusCode).send({ error: error.message });
        }
        return reply.code(500).send({ error: 'Internal server error' });
    }
}