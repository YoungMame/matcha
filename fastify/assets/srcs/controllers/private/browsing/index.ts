import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError, UnauthorizedError } from '../../../utils/error';
import { BrowsingFilter, BrowsingUser, BrowsingSort } from '../../../services/BrowsingService';

export const browseUsersHandler = async (request: FastifyRequest, reply: FastifyReply) => {
    try {
        const {
            minAge,
            maxAge,
            minFame,
            maxFame,
            tags,
            lat,
            lng,
            radius,
            sortBy,
            offset,
            limit
        } = request.params as { minAge: number, maxAge: number, minFame: number, maxFame: number, tags: string, lat: number, lng: number, radius: number, sortBy: string, offset: number, limit: number };
        console.log('Browsing with params:', request.params);
        if (!request.user?.id)
            throw new UnauthorizedError();
        const tagsArray = tags ? tags.split(',') : [];
        let requestFilters: BrowsingFilter = {
            age: { min: minAge, max: maxAge },
            fameRate: { min: minFame, max: maxFame },
            tags: tagsArray
        };
        if (!(lat < -90 || lat > 90 || lng < -180 || lng > 180))
            requestFilters.location = { latitude: lat, longitude: lng };
        const users: BrowsingUser[] = await request.server.browsingService.browseUsers(
            request.user.id,
            limit || 20,
            offset || 0,
            radius,
            requestFilters,
            (sortBy ? sortBy as BrowsingSort : undefined)
        );
        console.log(`Found ${users.length} users for browsing`);
        return reply.status(200).send({ users });
    } catch (error) {
        if (error instanceof AppError) {
            return reply.status(error.statusCode).send({ error: error.message });
        }
        return reply.status(500).send({ error: 'Internal Server Error' });
    }
}