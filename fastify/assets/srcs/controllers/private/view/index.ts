import { FastifyRequest, FastifyReply, FastifyRequestUser } from 'fastify';
import { AppError, UnauthorizedError } from '../../../utils/error';

export const viewProfileHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const params = request.params as { id: number };

    try {
        const user = request.user;
        if (!user || !user.id)
            throw new UnauthorizedError();
        let data = await request.server.userService.getUserPublic(user.id, params.id);
        reply.status(200).send(data);
    } catch (error) {
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ error: error.message });
        return reply.status(500).send({ error: 'Internal server' });
    }
};
