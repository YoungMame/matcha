import { FastifyRequest, FastifyReply, FastifyRequestUser } from 'fastify';
import { AppError, UnauthorizedError } from '../../../utils/error';

export const getNearUsersHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const params = request.query as { level: string, latitude: string, longitude: string, radius: string };
    const level = Number(params.level);
    const latitude = Number(params.latitude);
    const longitude = Number(params.longitude);
    let radius = Number(params.radius);

    try {
        const user = request.user as FastifyRequestUser | undefined;
        const userId = user?.id;
        if (!userId)
            throw new UnauthorizedError();
        const data = await request.server.mapService.getNearUsers(level, latitude, longitude, radius);
        return reply.code(200).send(data);
    } catch (error) {
        console.log(error);
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ error: error.message });
        return reply.status(500).send({ error: 'Internal server error' });
    }
}