import { FastifyRequest, FastifyReply, FastifyRequestUser } from 'fastify';
import { AppError, UnauthorizedError } from '../../../utils/error';

export const blockUserHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const params = request.params as { userId: number };
    const receiverId = params.userId;

    try {
        const user = request.user as FastifyRequestUser | undefined;
        const userId = user?.id;
        if (!userId)
            throw new UnauthorizedError();
        await request.server.userService.blockUser(userId, receiverId);
        return reply.code(201).send({ message: 'User blocked' });
    } catch (error) {
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ error: error.message });
        return reply.status(500).send({ error: 'Internal server error' });
    }
}

export const unblockUserHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const params = request.params as { userId: number };
    const receiverId = params.userId;

    try {
        const user = request.user as FastifyRequestUser | undefined;
        const userId = user?.id;
        if (!userId)
            throw new UnauthorizedError();
        await request.server.userService.unblockUser(userId, receiverId);
        return reply.code(200).send({ message: 'User unblocked' });
    } catch (error) {
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ error: error.message });
        return reply.status(500).send({ error: 'Internal server error' });
    } 
}
