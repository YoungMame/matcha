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
        const data = await request.server.userService.viewUserProfile(user.id, params.id);
        reply.send(data);
    } catch (error) {
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ message: error.message });
        return reply.status(500).send({ message: 'Internal server error' });
    }
};
