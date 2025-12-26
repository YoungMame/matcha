import { FastifyRequest, FastifyReply, FastifyRequestUser } from 'fastify';
import { AppError, BadRequestError, UnauthorizedError } from '../../../utils/error';

export const getMatchesHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const user = request.user as FastifyRequestUser | undefined;
        const userId = user?.id;
        const { offset, limit } = request.params as { offset: string, limit: string };
        if (!userId)
            throw new UnauthorizedError();
        const nOffset = Number(offset);
        const nLimit = Number(limit);
        if (isNaN(nOffset) || isNaN(nLimit) || nOffset < 0 || nLimit <= 0) {
            throw new BadRequestError();
        }
        const matches = await request.server.userService.getMatches(userId, nOffset, nLimit);
        return reply.code(200).send({ matches });
    } catch (error) {
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ error: error.message });
        return reply.status(500).send({ error: 'Internal server error' });
    }
}
