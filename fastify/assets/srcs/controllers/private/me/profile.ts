import { FastifyRequest, FastifyReply, FastifyRequestUser } from 'fastify';
import { AppError, UnauthorizedError, ForbiddenError, NotFoundError, BadRequestError } from '../../../utils/error';

export const setProfileHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const {
        bio,
        tags,
        gender,
        orientation,
        bornAt,
        location
    } = request.body as any

    try {
        const user = request.user as FastifyRequestUser | undefined;
        const userId = user?.id;
        if (!userId)
            throw new UnauthorizedError();
        await request.server.userService.updateUserProfile(userId, {
            bio,
            tags,
            gender,
            orientation,
            bornAt,
        });
        if (location)
            await request.server.userService.updateUserLocation(userId, location.latitude, location.longitude);
        return reply.code(201).send({ message: 'User profile updated successfully' });
    } catch (error) {
        console.error(error);
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