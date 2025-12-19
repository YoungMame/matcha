import { FastifyRequest, FastifyReply, FastifyRequestUser } from 'fastify';
import { AppError, UnauthorizedError } from '../../../utils/error';

// matches: { type: 'array', items: { 
//     type: 'object',
//     properties: {
//         id: { type: 'integer' },
//         firstName: { type: 'string' },
//         profilePicture: { type: 'string', nullable: true },
//         age: { type: 'integer' },
//         commonInterests: { type: 'integer' },
//         distance: { type: 'number' },
//         chatId: { type: 'integer', nullable: true }
//     }
// }}

export const getMatchesHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const user = request.user as FastifyRequestUser | undefined;
        const userId = user?.id;
        const { offset, limit } = request.params as { offset: number, limit: number };
        if (!userId)
            throw new UnauthorizedError();
        const matches = await request.server.userService.getMatches(offset, limit, userId);
        return reply.code(200).send({ matches });
    } catch (error) {
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ error: error.message });
        return reply.status(500).send({ error: 'Internal server error' });
    }
}
