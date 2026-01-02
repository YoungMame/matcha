import { FastifyInstance } from "fastify";
import { AppError, UnauthorizedError } from "../../../../utils/error";

const completeRoute = async (request: any, reply: any) => {
    try {
        const userId = request.user?.id;
        if (!userId)
            throw new UnauthorizedError();
        if (request.body.bornAt)
            request.body.bornAt = new Date(request.body.bornAt);
        const jwt = await request.server.userService.completeProfile(userId, request.body);
        return reply.code(201).setCookie('jwt', jwt, {
            domain: process.env.DOMAIN || 'localhost',
            path: '/',
            signed: true,
            maxAge: 3600 * 24 * 7
        }).send({ message: 'User completed successfully' });
    } catch (error) {
        if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ error: error.message });
        }
        return reply.status(500).send({ error: 'Internal server error' });
    }
};

const completeProfileRoutes = async (fastify: FastifyInstance) => {
    fastify.post('/', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    firstName: { type: 'string', minLength: 1, maxLength: 50, pattern: '[a-zA-Z-\' ]' },
                    lastName: { type: 'string', minLength: 1, maxLength: 50, pattern: '[a-zA-Z-\' ]' },
                    bio: { type: 'string', minLength: 50, maxLength: 500 },
                    tags: { type: 'array', items: { type: 'string', minLength: 1, maxLength: 30 }, minItems: 3 },
                    gender: { type: 'string', enum: ['men', 'women'] },
                    orientation: { type: 'string', enum: ['heterosexual', 'homosexual', 'bisexual', 'other'] },
                    bornAt: { type: 'string', format: 'date-time' },
                },
                additionalProperties: false
            },
            response: {
                201: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                    },
                    additionalProperties: false
                },
                400: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', }
                    },
                    additionalProperties: false
                },
                500: {
                    type: 'object',
                    properties: {
                        error: { type: 'string' }
                    },
                    additionalProperties: false
                }
            }
        },
        handler: completeRoute
    });
};

export default completeProfileRoutes;