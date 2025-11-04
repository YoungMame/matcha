import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError, NotFoundError, UnauthorizedError } from '../../utils/error';

export const loginHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const {
        email,
        password
    } = request.body as any

    try {
        const jwt:string | undefined = await request.server.userService.login(email, password);

        if (jwt == undefined)
            return reply.status(400).send({ error: 'User creation failed' });
        return reply.code(203).setCookie('jwt', jwt, {
            domain: process.env.DOMAIN || 'localhost',
            path: '/',
            signed: true,
            maxAge: 3600 * 24 * 7
        }).send({ message: 'User logged in successfully' });
    } catch (error) {
        if (error instanceof AppError)
        {
            if (error instanceof NotFoundError || error instanceof UnauthorizedError)
                return reply.code(404).send({ error: "Wrong email or password" });
            return reply.code(error.statusCode).send({ error: error.message });
        }
        return reply.code(500).send({ error: 'Internal server error' });
    }
}