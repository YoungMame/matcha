import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { AppError, BadRequestError } from "../../utils/error";

const verifyEmailHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    const {
        userId,
        code
    } = request.params as { userId: string; code: string };
    try {
        if (!userId || !code)
            throw new BadRequestError();
        await request.server.userService.verifyEmail(
            Number(userId),
            code
        );
        // TODO return a static page
        return reply.code(200).send({ message: 'Email verified successfully' });
    } catch (error) {
        if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ error: error.message });
        }
        return reply.status(500).send({ error: 'Internal server error' });
    }
};

const verifyEmailRoutes = async (fastify: FastifyInstance) => {
    fastify.post('/:userId/:code', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    userId: { type: 'string', format: 'uuid' },
                    code: { type: 'string', minLength: 6, maxLength: 6 }
                },
                required: ['userId', 'code'],
                additionalProperties: false
            }
        },
        handler: verifyEmailHandler
    });
};

export default verifyEmailRoutes;