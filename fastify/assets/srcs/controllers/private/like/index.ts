import { FastifyRequest, FastifyReply, FastifyRequestUser } from 'fastify';
import { AppError, UnauthorizedError } from '../../../utils/error';

export const likeProfileHandler = async (
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
        await request.server.userService.sendLike(userId, receiverId);
        return reply.code(201).send({ message: 'Like sended' });
    } catch (error) {
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ error: error.message });
        return reply.status(500).send({ error: 'Internal server error' });
    }
}

export const unlikeProfile = async (
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
        await request.server.userService.sendUnlike(userId, receiverId);
        return reply.code(200).send({ message: 'Like removed' });
    } catch (error) {
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ error: error.message });
        return reply.status(500).send({ error: 'Internal server error' });
    } 
}

export const getLikesHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const user = request.user as FastifyRequestUser | undefined;
        const userId = user?.id;
        if (!userId)
            throw new UnauthorizedError();
        const likes = await request.server.userService.getLikes(userId);
        return reply.code(200).send({ likes });
    } catch (error) {
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ error: error.message });
        return reply.status(500).send({ error: 'Internal server error' });
    }
}
