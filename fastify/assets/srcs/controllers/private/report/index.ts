import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError, UnauthorizedError } from '../../../utils/error';

export const reportUserHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const {
            reportedId
        } = request.params as { reportedId: number };

        if (!request.user?.id)
            throw new UnauthorizedError();
        await request.server.reportService.reportUser(
            reportedId,
            request.user.id
        );
        return reply.status(200).send({ message: 'User reported successfully' });
    } catch (error) {
        if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ error: error.message });
        }
        return reply.status(500).send({ error: 'Internal Server Error' });
    }
}