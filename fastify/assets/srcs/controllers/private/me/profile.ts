import { FastifyRequest, FastifyReply, FastifyRequestUser } from 'fastify';
import { AppError, UnauthorizedError, ForbiddenError, NotFoundError, BadRequestError } from '../../../utils/error';

export const setProfileHandler = async (
    request: FastifyRequest,
    reply: FastifyReply
) => {
    const body = request.body as {
        firstName?: string;
        lastName?: string;
        email?: string;
        bio?: string;
        tags?: Array<string>;
        gender?: string;
        orientation?: string;
        bornAt?: string;
        location?: {
            latitude?: number;
            longitude?: number;
        };
    };

    let updateObject: {
        firstName?: string;
        lastName?: string;
        email?: string;
        bio?: string;
        tags?: string[];
        gender?: string;
        orientation?: string;
        bornAt?: Date;
    } = {};

    if (body.firstName !== undefined) updateObject.firstName = body.firstName;
    if (body.lastName !== undefined) updateObject.lastName = body.lastName;
    if (body.email !== undefined) updateObject.email = body.email;
    if (body.bio !== undefined) updateObject.bio = body.bio;
    if (body.tags !== undefined) updateObject.tags = body.tags;
    if (body.gender !== undefined) updateObject.gender = body.gender;
    if (body.orientation !== undefined) updateObject.orientation = body.orientation;
    if (body.bornAt) updateObject.bornAt = new Date(body.bornAt);

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
        if (error instanceof AppError)
            return reply.status(error.statusCode).send({ error: error.message });
        return reply.status(500).send({ error: 'Internal server error' });
    }
}