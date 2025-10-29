import { FastifyRequest, FastifyReply, FastifyRequestUser } from 'fastify';
import { AppError, UnauthorizedError, ForbiddenError, NotFoundError, BadRequestError } from '../../../utils/error';

export const setProfileHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const body = request.body as any;
    const updateObject: any = {};
    Object.entries(body).forEach(([key, value]) => {
        if (value !== undefined && key !== 'location') {
            updateObject[key] = value;
        }
    });

    try {
        const user = request.user as FastifyRequestUser | undefined;
        const userId = user?.id;
        if (!userId)
            throw new UnauthorizedError();
        await request.server.userService.updateUserProfile(userId, updateObject);
        if (body.location && body.location.latitude !== undefined && body.location.longitude !== undefined)
            await request.server.userService.updateUserLocation(userId, body.location.latitude, body.location.longitude);
        return reply.code(201).send({ message: 'User profile updated successfully' });
    } catch (error) {
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ error: error.message });
        return reply.status(500).send({ error: 'Internal server error' });
    } 
}

export const getProfileHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    try {
        const user = request.user as FastifyRequestUser | undefined;
        const userId = user?.id;
        if (!userId)
            throw new UnauthorizedError();
        const profile = await request.server.userService.getMe(userId);
        return reply.code(200).send(profile);
    } catch (error) {
        console.error(error);
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ error: error.message });
        return reply.status(500).send({ error: 'Internal server error' });
    }
}